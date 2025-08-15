import React, { createContext, useContext, useEffect, useState } from 'react';
import blockchainService from '../services/blockchain.js';
import toast from 'react-hot-toast';

const BlockchainContext = createContext();

export const useBlockchain = () => {
  const context = useContext(BlockchainContext);
  if (!context) {
    throw new Error('useBlockchain must be used within a BlockchainProvider');
  }
  return context;
};

export const BlockchainProvider = ({ children }) => {
  const [account, setAccount] = useState('');
  const [balance, setBalance] = useState('0');
  const [contracts, setContracts] = useState({});
  const [isConnected, setIsConnected] = useState(false);
  const [isLoading, setIsLoading] = useState(false);
  const [chainId, setChainId] = useState(null);
  const [reports, setReports] = useState([]);
  const [crises, setCrises] = useState([]);

  // Initialize blockchain service
  useEffect(() => {
    const initBlockchain = async () => {
      try {
        await blockchainService.initialize();
        
        // Set up event listeners for real-time updates
        await blockchainService.listenToEvents();
        
        // Listen for custom events
        window.addEventListener('reportSubmitted', handleReportSubmitted);
        window.addEventListener('stakePlaced', handleStakePlaced);
        window.addEventListener('reportFinalized', handleReportFinalized);
        window.addEventListener('donationMade', handleDonationMade);
        
        return () => {
          blockchainService.removeEventListeners();
          window.removeEventListener('reportSubmitted', handleReportSubmitted);
          window.removeEventListener('stakePlaced', handleStakePlaced);
          window.removeEventListener('reportFinalized', handleReportFinalized);
          window.removeEventListener('donationMade', handleDonationMade);
        };
      } catch (error) {
        console.error('Failed to initialize blockchain:', error);
      }
    };

    initBlockchain();
  }, []);

  // Event handlers
  const handleReportSubmitted = (event) => {
    const { id, reporter, cid } = event.detail;
    setReports(prev => [...prev, { id, reporter, cid, timestamp: Date.now() }]);
    toast.success(`New crisis report submitted! ID: ${id}`);
  };

  const handleStakePlaced = (event) => {
    const { id, staker, amount } = event.detail;
    setReports(prev => prev.map(report => 
      report.id === id 
        ? { ...report, stakes: [...(report.stakes || []), { staker, amount }] }
        : report
    ));
    toast.success(`Stake placed on report ${id}: ${amount} MATIC`);
  };

  const handleReportFinalized = (event) => {
    const { id, valid } = event.detail;
    setReports(prev => prev.map(report => 
      report.id === id 
        ? { ...report, finalized: true, valid }
        : report
    ));
    toast.success(`Report ${id} finalized as ${valid ? 'valid' : 'invalid'}`);
  };

  const handleDonationMade = (event) => {
    const { crisisId, donor, amount } = event.detail;
    setCrises(prev => prev.map(crisis => 
      crisis.id === crisisId 
        ? { ...crisis, raisedAmount: (parseFloat(crisis.raisedAmount) + parseFloat(amount)).toString() }
        : crisis
    ));
    toast.success(`Donation received: ${amount} MATIC`);
  };

  // Connect wallet
  const connectWallet = async () => {
    setIsLoading(true);
    try {
      const connectedAccount = await blockchainService.connectWallet();
      setAccount(connectedAccount);
      setIsConnected(true);
      setChainId(blockchainService.chainId);
      setContracts(blockchainService.contracts);
      
      // Get initial balance
      const initialBalance = await blockchainService.getBalance();
      setBalance(initialBalance);
      
      toast.success('Wallet connected successfully!');
      
      // Load initial data
      await loadInitialData();
    } catch (error) {
      console.error('Failed to connect wallet:', error);
      toast.error(error.message || 'Failed to connect wallet');
    } finally {
      setIsLoading(false);
    }
  };

  // Disconnect wallet
  const disconnectWallet = () => {
    blockchainService.disconnect();
    setAccount('');
    setBalance('0');
    setIsConnected(false);
    setChainId(null);
    setContracts({});
    setReports([]);
    setCrises([]);
    toast.success('Wallet disconnected');
  };

  // Load initial data
  const loadInitialData = async () => {
    try {
      // Load reports if WitnessStaking contract is available
      if (contracts.witnessStaking) {
        await loadReports();
      }
      
      // Load crises if CrisisDonation contract is available
      if (contracts.crisisDonation) {
        await loadCrises();
      }
    } catch (error) {
      console.error('Failed to load initial data:', error);
    }
  };

  // Load reports from contract
  const loadReports = async () => {
    try {
      const reportCount = await contracts.witnessStaking.reportCount();
      const reportsData = [];
      
      for (let i = 1; i <= reportCount; i++) {
        try {
          const report = await contracts.witnessStaking.reports(i);
          reportsData.push({
            id: i.toString(),
            reporter: report.reporter,
            cid: report.cid,
            stakeTotal: report.stakeTotal.toString(),
            confirmations: report.confirmations.toString(),
            finalized: report.finalized,
            valid: report.valid,
            timestamp: Date.now() // You might want to get this from events
          });
        } catch (error) {
          console.error(`Failed to load report ${i}:`, error);
        }
      }
      
      setReports(reportsData);
    } catch (error) {
      console.error('Failed to load reports:', error);
    }
  };

  // Load crises from contract
  const loadCrises = async () => {
    try {
      const activeCrises = await contracts.crisisDonation.getActiveCrises();
      const crisesData = [];
      
      for (const crisisId of activeCrises) {
        try {
          const crisis = await contracts.crisisDonation.getCrisis(crisisId);
          crisesData.push({
            id: crisisId.toString(),
            title: crisis.title,
            description: crisis.description,
            location: crisis.location,
            targetAmount: crisis.targetAmount.toString(),
            raisedAmount: crisis.raisedAmount.toString(),
            deadline: crisis.deadline.toString(),
            active: crisis.active,
            verified: crisis.verified,
            organizer: crisis.organizer,
            ipfsHash: crisis.ipfsHash
          });
        } catch (error) {
          console.error(`Failed to load crisis ${crisisId}:`, error);
        }
      }
      
      setCrises(crisesData);
    } catch (error) {
      console.error('Failed to load crises:', error);
    }
  };

  // Update balance periodically
  useEffect(() => {
    if (!isConnected || !account) return;

    const updateBalance = async () => {
      try {
        const newBalance = await blockchainService.getBalance();
        setBalance(newBalance);
      } catch (error) {
        console.error('Failed to update balance:', error);
      }
    };

    updateBalance();
    const interval = setInterval(updateBalance, 30000); // Update every 30 seconds

    return () => clearInterval(interval);
  }, [isConnected, account]);

  // Contract interaction methods
  const submitReport = async (cid) => {
    setIsLoading(true);
    try {
      const tx = await blockchainService.submitReport(cid);
      toast.success('Report submitted successfully!');
      return tx;
    } catch (error) {
      console.error('Failed to submit report:', error);
      toast.error(error.message || 'Failed to submit report');
      throw error;
    } finally {
      setIsLoading(false);
    }
  };

  const stakeOnReport = async (reportId, amount) => {
    setIsLoading(true);
    try {
      const tx = await blockchainService.stakeOnReport(reportId, amount);
      toast.success('Stake placed successfully!');
      return tx;
    } catch (error) {
      console.error('Failed to stake on report:', error);
      toast.error(error.message || 'Failed to place stake');
      throw error;
    } finally {
      setIsLoading(false);
    }
  };

  const finalizeReport = async (reportId, valid) => {
    setIsLoading(true);
    try {
      const tx = await blockchainService.finalizeReport(reportId, valid);
      toast.success('Report finalized successfully!');
      return tx;
    } catch (error) {
      console.error('Failed to finalize report:', error);
      toast.error(error.message || 'Failed to finalize report');
      throw error;
    } finally {
      setIsLoading(false);
    }
  };

  const donate = async (crisisId, message, amount, anonymous = false) => {
    setIsLoading(true);
    try {
      const tx = await blockchainService.donate(crisisId, message, amount, anonymous);
      toast.success('Donation sent successfully!');
      return tx;
    } catch (error) {
      console.error('Failed to donate:', error);
      toast.error(error.message || 'Failed to send donation');
      throw error;
    } finally {
      setIsLoading(false);
    }
  };

  const createCrisis = async (title, description, location, targetAmount, duration, ipfsHash) => {
    setIsLoading(true);
    try {
      const tx = await blockchainService.createCrisis(title, description, location, targetAmount, duration, ipfsHash);
      toast.success('Crisis created successfully!');
      return tx;
    } catch (error) {
      console.error('Failed to create crisis:', error);
      toast.error(error.message || 'Failed to create crisis');
      throw error;
    } finally {
      setIsLoading(false);
    }
  };

  const value = {
    // State
    account,
    balance,
    contracts,
    isConnected,
    isLoading,
    chainId,
    reports,
    crises,
    
    // Methods
    connectWallet,
    disconnectWallet,
    submitReport,
    stakeOnReport,
    finalizeReport,
    donate,
    createCrisis,
    loadReports,
    loadCrises,
    
    // Utility
    formatAddress: blockchainService.formatAddress,
  };

  return (
    <BlockchainContext.Provider value={value}>
      {children}
    </BlockchainContext.Provider>
  );
};

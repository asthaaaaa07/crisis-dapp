import { ethers } from 'ethers';
import { getContractAddresses } from './api.js';

// Mumbai testnet configuration
const MUMBAI_CHAIN_ID = 80001;
const MUMBAI_CHAIN_ID_HEX = '0x13881';

// Contract ABIs
import WitnessStakingABI from '../abis/WitnessStaking.json';
import FactSBTABI from '../abis/FactSBT.json';
import AidVoucherABI from '../abis/AidVoucher.json';
import CrisisDonationABI from '../abis/CrisisDonation.json';
import ImpactNFTABI from '../abis/ImpactNFT.json';
import IdentityManagerABI from '../abis/IdentityManager.json';
import ProofOfHelpABI from '../abis/ProofOfHelp.json';

class BlockchainService {
  constructor() {
    this.provider = null;
    this.signer = null;
    this.contracts = {};
    this.account = null;
    this.chainId = null;
    this.isConnected = false;
  }

  // Initialize provider and check connection
  async initialize() {
    if (typeof window.ethereum === 'undefined') {
      throw new Error('MetaMask is not installed');
    }

    this.provider = new ethers.BrowserProvider(window.ethereum);
    
    // Check if already connected
    const accounts = await this.provider.listAccounts();
    if (accounts.length > 0) {
      await this.connectWallet();
    }

    // Listen for account changes
    window.ethereum.on('accountsChanged', (accounts) => {
      if (accounts.length === 0) {
        this.disconnect();
      } else {
        this.account = accounts[0];
        this.signer = this.provider.getSigner();
      }
    });

    // Listen for chain changes
    window.ethereum.on('chainChanged', (chainId) => {
      window.location.reload();
    });
  }

  // Connect wallet and switch to Mumbai
  async connectWallet() {
    try {
      // Request account access
      const accounts = await window.ethereum.request({
        method: 'eth_requestAccounts',
      });

      this.account = accounts[0];
      this.signer = this.provider.getSigner();

      // Check and switch to Mumbai testnet
      await this.switchToMumbai();

      // Initialize contracts
      await this.initializeContracts();

      this.isConnected = true;
      return this.account;
    } catch (error) {
      console.error('Failed to connect wallet:', error);
      throw error;
    }
  }

  // Switch to Mumbai testnet
  async switchToMumbai() {
    try {
      const chainId = await window.ethereum.request({ method: 'eth_chainId' });
      
      if (chainId !== MUMBAI_CHAIN_ID_HEX) {
        await window.ethereum.request({
          method: 'wallet_switchEthereumChain',
          params: [{ chainId: MUMBAI_CHAIN_ID_HEX }],
        });
      }
      
      this.chainId = MUMBAI_CHAIN_ID;
    } catch (switchError) {
      // If Mumbai is not added, add it
      if (switchError.code === 4902) {
        await window.ethereum.request({
          method: 'wallet_addEthereumChain',
          params: [
            {
              chainId: MUMBAI_CHAIN_ID_HEX,
              chainName: 'Mumbai Testnet',
              nativeCurrency: {
                name: 'MATIC',
                symbol: 'MATIC',
                decimals: 18,
              },
              rpcUrls: ['https://rpc-mumbai.maticvigil.com'],
              blockExplorerUrls: ['https://mumbai.polygonscan.com'],
            },
          ],
        });
      } else {
        throw switchError;
      }
    }
  }

  // Initialize contract instances
  async initializeContracts() {
    try {
      const addresses = await getContractAddresses();
      
      this.contracts = {
        witnessStaking: new ethers.Contract(
          addresses.WitnessStaking,
          WitnessStakingABI,
          this.signer
        ),
        factSBT: new ethers.Contract(
          addresses.FactSBT,
          FactSBTABI,
          this.signer
        ),
        aidVoucher: new ethers.Contract(
          addresses.AidVoucher,
          AidVoucherABI,
          this.signer
        ),
        crisisDonation: new ethers.Contract(
          addresses.CrisisDonation,
          CrisisDonationABI,
          this.signer
        ),
        impactNFT: new ethers.Contract(
          addresses.ImpactNFT,
          ImpactNFTABI,
          this.signer
        ),
        identityManager: new ethers.Contract(
          addresses.IdentityManager,
          IdentityManagerABI,
          this.signer
        ),
        proofOfHelp: new ethers.Contract(
          addresses.ProofOfHelp,
          ProofOfHelpABI,
          this.signer
        ),
      };
    } catch (error) {
      console.error('Failed to initialize contracts:', error);
      throw error;
    }
  }

  // Get account balance
  async getBalance() {
    if (!this.account) return '0';
    const balance = await this.provider.getBalance(this.account);
    return ethers.formatEther(balance);
  }

  // Format address for display
  formatAddress(address) {
    if (!address) return '';
    return `${address.slice(0, 6)}...${address.slice(-4)}`;
  }

  // Disconnect wallet
  disconnect() {
    this.provider = null;
    this.signer = null;
    this.contracts = {};
    this.account = null;
    this.chainId = null;
    this.isConnected = false;
  }

  // Contract interaction methods
  async submitReport(cid) {
    if (!this.contracts.witnessStaking) {
      throw new Error('WitnessStaking contract not initialized');
    }
    
    const tx = await this.contracts.witnessStaking.submitReport(cid);
    return await tx.wait();
  }

  async stakeOnReport(reportId, amount) {
    if (!this.contracts.witnessStaking) {
      throw new Error('WitnessStaking contract not initialized');
    }
    
    const value = ethers.parseEther(amount.toString());
    const tx = await this.contracts.witnessStaking.stakeOnReport(reportId, { value });
    return await tx.wait();
  }

  async finalizeReport(reportId, valid) {
    if (!this.contracts.witnessStaking) {
      throw new Error('WitnessStaking contract not initialized');
    }
    
    const tx = await this.contracts.witnessStaking.finalizeReport(reportId, valid);
    return await tx.wait();
  }

  async donate(crisisId, message, amount, anonymous = false) {
    if (!this.contracts.crisisDonation) {
      throw new Error('CrisisDonation contract not initialized');
    }
    
    const value = ethers.parseEther(amount.toString());
    const tx = await this.contracts.crisisDonation.donate(crisisId, message, anonymous, { value });
    return await tx.wait();
  }

  async createCrisis(title, description, location, targetAmount, duration, ipfsHash) {
    if (!this.contracts.crisisDonation) {
      throw new Error('CrisisDonation contract not initialized');
    }
    
    const targetAmountWei = ethers.parseEther(targetAmount.toString());
    const tx = await this.contracts.crisisDonation.createCrisis(
      title,
      description,
      location,
      targetAmountWei,
      duration,
      ipfsHash
    );
    return await tx.wait();
  }

  async submitProof(beneficiary, helpType, description, location, ipfsHash, value, signature) {
    if (!this.contracts.proofOfHelp) {
      throw new Error('ProofOfHelp contract not initialized');
    }
    
    const valueWei = ethers.parseEther(value.toString());
    const tx = await this.contracts.proofOfHelp.submitProof(
      beneficiary,
      helpType,
      description,
      location,
      ipfsHash,
      valueWei,
      signature
    );
    return await tx.wait();
  }

  // Event listeners
  async listenToEvents() {
    if (!this.contracts.witnessStaking) return;

    // WitnessStaking events
    this.contracts.witnessStaking.on('ReportSubmitted', (id, reporter, cid) => {
      console.log('Report submitted:', { id: id.toString(), reporter, cid });
      // Emit custom event for UI updates
      window.dispatchEvent(new CustomEvent('reportSubmitted', {
        detail: { id: id.toString(), reporter, cid }
      }));
    });

    this.contracts.witnessStaking.on('Staked', (id, staker, amount) => {
      console.log('Stake placed:', { id: id.toString(), staker, amount: ethers.formatEther(amount) });
      window.dispatchEvent(new CustomEvent('stakePlaced', {
        detail: { id: id.toString(), staker, amount: ethers.formatEther(amount) }
      }));
    });

    this.contracts.witnessStaking.on('Finalized', (id, valid) => {
      console.log('Report finalized:', { id: id.toString(), valid });
      window.dispatchEvent(new CustomEvent('reportFinalized', {
        detail: { id: id.toString(), valid }
      }));
    });

    // CrisisDonation events
    if (this.contracts.crisisDonation) {
      this.contracts.crisisDonation.on('DonationMade', (crisisId, donor, amount) => {
        console.log('Donation made:', { crisisId: crisisId.toString(), donor, amount: ethers.formatEther(amount) });
        window.dispatchEvent(new CustomEvent('donationMade', {
          detail: { crisisId: crisisId.toString(), donor, amount: ethers.formatEther(amount) }
        }));
      });
    }
  }

  // Remove event listeners
  removeEventListeners() {
    if (this.contracts.witnessStaking) {
      this.contracts.witnessStaking.removeAllListeners();
    }
    if (this.contracts.crisisDonation) {
      this.contracts.crisisDonation.removeAllListeners();
    }
  }
}

export default new BlockchainService();

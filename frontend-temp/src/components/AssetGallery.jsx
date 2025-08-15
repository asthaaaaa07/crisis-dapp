import React, { useState, useEffect } from 'react';
import { useBlockchain } from '../contexts/BlockchainContext.jsx';
import { 
  UserIcon, 
  TrophyIcon,
  HeartIcon,
  ShieldCheckIcon,
  DocumentTextIcon,
  StarIcon,
  ClockIcon,
  CurrencyDollarIcon
} from '@heroicons/react/24/outline';

const AssetGallery = () => {
  const { account, isConnected, contracts, formatAddress } = useBlockchain();
  const [userNFTs, setUserNFTs] = useState({
    factSBTs: [],
    aidVouchers: [],
    impactNFTs: []
  });
  const [userStats, setUserStats] = useState({
    totalDonations: 0,
    totalStakes: 0,
    reputation: 0,
    reportsSubmitted: 0
  });
  const [isLoading, setIsLoading] = useState(false);

  useEffect(() => {
    if (isConnected && account) {
      loadUserAssets();
    }
  }, [isConnected, account, contracts]);

  const loadUserAssets = async () => {
    setIsLoading(true);
    try {
      // Load FactSBTs
      if (contracts.factSBT) {
        const balance = await contracts.factSBT.balanceOf(account);
        const sbtIds = [];
        for (let i = 0; i < balance; i++) {
          const tokenId = await contracts.factSBT.tokenOfOwnerByIndex(account, i);
          sbtIds.push(tokenId.toString());
        }
        setUserNFTs(prev => ({ ...prev, factSBTs: sbtIds }));
      }

      // Load AidVouchers
      if (contracts.aidVoucher) {
        const balance = await contracts.aidVoucher.balanceOf(account);
        const voucherIds = [];
        for (let i = 0; i < balance; i++) {
          const tokenId = await contracts.aidVoucher.tokenOfOwnerByIndex(account, i);
          voucherIds.push(tokenId.toString());
        }
        setUserNFTs(prev => ({ ...prev, aidVouchers: voucherIds }));
      }

      // Load ImpactNFTs
      if (contracts.impactNFT) {
        const balance = await contracts.impactNFT.balanceOf(account);
        const impactIds = [];
        for (let i = 0; i < balance; i++) {
          const tokenId = await contracts.impactNFT.tokenOfOwnerByIndex(account, i);
          impactIds.push(tokenId.toString());
        }
        setUserNFTs(prev => ({ ...prev, impactNFTs: impactIds }));
      }

      // Load user stats (mock data for now)
      setUserStats({
        totalDonations: 2.5,
        totalStakes: 0.1,
        reputation: 85,
        reportsSubmitted: 3
      });

    } catch (error) {
      console.error('Failed to load user assets:', error);
    } finally {
      setIsLoading(false);
    }
  };

  const getReputationLevel = (reputation) => {
    if (reputation >= 100) return { level: 'Hero', color: 'text-purple-600', bg: 'bg-purple-100' };
    if (reputation >= 75) return { level: 'Champion', color: 'text-blue-600', bg: 'bg-blue-100' };
    if (reputation >= 50) return { level: 'Supporter', color: 'text-green-600', bg: 'bg-green-100' };
    if (reputation >= 25) return { level: 'Helper', color: 'text-yellow-600', bg: 'bg-yellow-100' };
    return { level: 'Newcomer', color: 'text-gray-600', bg: 'bg-gray-100' };
  };

  if (!isConnected) {
    return (
      <div className="text-center py-12">
        <UserIcon className="w-16 h-16 text-gray-400 mx-auto mb-4" />
        <h2 className="text-xl font-bold text-gray-900 mb-2">Connect Your Wallet</h2>
        <p className="text-gray-600">Connect your wallet to view your profile and assets</p>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      {/* User Profile Header */}
      <div className="bg-white rounded-xl shadow-lg p-6">
        <div className="flex items-center space-x-4 mb-6">
          <div className="w-16 h-16 bg-gradient-to-br from-blue-500 to-purple-600 rounded-full flex items-center justify-center">
            <UserIcon className="w-8 h-8 text-white" />
          </div>
          <div className="flex-1">
            <h2 className="text-2xl font-bold text-gray-900">Your Profile</h2>
            <p className="text-gray-600">{formatAddress(account)}</p>
          </div>
          <div className={`px-4 py-2 rounded-full text-sm font-medium ${getReputationLevel(userStats.reputation).bg} ${getReputationLevel(userStats.reputation).color}`}>
            {getReputationLevel(userStats.reputation).level}
          </div>
        </div>

        {/* Stats Grid */}
        <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
          <div className="text-center p-4 bg-gray-50 rounded-lg">
            <div className="flex items-center justify-center w-8 h-8 bg-blue-100 rounded-full mx-auto mb-2">
              <HeartIcon className="w-4 h-4 text-blue-600" />
            </div>
            <p className="text-2xl font-bold text-gray-900">{userStats.totalDonations}</p>
            <p className="text-sm text-gray-600">MATIC Donated</p>
          </div>
          
          <div className="text-center p-4 bg-gray-50 rounded-lg">
            <div className="flex items-center justify-center w-8 h-8 bg-green-100 rounded-full mx-auto mb-2">
              <ShieldCheckIcon className="w-4 h-4 text-green-600" />
            </div>
            <p className="text-2xl font-bold text-gray-900">{userStats.totalStakes}</p>
            <p className="text-sm text-gray-600">MATIC Staked</p>
          </div>
          
          <div className="text-center p-4 bg-gray-50 rounded-lg">
            <div className="flex items-center justify-center w-8 h-8 bg-yellow-100 rounded-full mx-auto mb-2">
              <StarIcon className="w-4 h-4 text-yellow-600" />
            </div>
            <p className="text-2xl font-bold text-gray-900">{userStats.reputation}</p>
            <p className="text-sm text-gray-600">Reputation</p>
          </div>
          
          <div className="text-center p-4 bg-gray-50 rounded-lg">
            <div className="flex items-center justify-center w-8 h-8 bg-red-100 rounded-full mx-auto mb-2">
              <DocumentTextIcon className="w-4 h-4 text-red-600" />
            </div>
            <p className="text-2xl font-bold text-gray-900">{userStats.reportsSubmitted}</p>
            <p className="text-sm text-gray-600">Reports</p>
          </div>
        </div>
      </div>

      {/* NFT Collections */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* FactSBTs */}
        <div className="bg-white rounded-xl shadow-lg p-6">
          <div className="flex items-center space-x-2 mb-4">
            <ShieldCheckIcon className="w-6 h-6 text-blue-600" />
            <h3 className="text-lg font-bold text-gray-900">FactSBTs</h3>
            <span className="bg-blue-100 text-blue-800 text-xs font-medium px-2 py-1 rounded-full">
              {userNFTs.factSBTs.length}
            </span>
          </div>
          
          {userNFTs.factSBTs.length === 0 ? (
            <div className="text-center py-8">
              <ShieldCheckIcon className="w-12 h-12 text-gray-400 mx-auto mb-4" />
              <p className="text-gray-500">No FactSBTs yet</p>
              <p className="text-sm text-gray-400 mt-1">Earn by verifying crisis reports</p>
            </div>
          ) : (
            <div className="space-y-3">
              {userNFTs.factSBTs.map((id) => (
                <div key={id} className="p-3 bg-blue-50 rounded-lg border border-blue-200">
                  <div className="flex items-center justify-between">
                    <span className="font-medium text-blue-900">FactSBT #{id}</span>
                    <div className="w-2 h-2 bg-blue-500 rounded-full"></div>
                  </div>
                  <p className="text-sm text-blue-700 mt-1">Verified Crisis Report</p>
                </div>
              ))}
            </div>
          )}
        </div>

        {/* AidVouchers */}
        <div className="bg-white rounded-xl shadow-lg p-6">
          <div className="flex items-center space-x-2 mb-4">
            <HeartIcon className="w-6 h-6 text-red-600" />
            <h3 className="text-lg font-bold text-gray-900">AidVouchers</h3>
            <span className="bg-red-100 text-red-800 text-xs font-medium px-2 py-1 rounded-full">
              {userNFTs.aidVouchers.length}
            </span>
          </div>
          
          {userNFTs.aidVouchers.length === 0 ? (
            <div className="text-center py-8">
              <HeartIcon className="w-12 h-12 text-gray-400 mx-auto mb-4" />
              <p className="text-gray-500">No AidVouchers yet</p>
              <p className="text-sm text-gray-400 mt-1">Receive for crisis assistance</p>
            </div>
          ) : (
            <div className="space-y-3">
              {userNFTs.aidVouchers.map((id) => (
                <div key={id} className="p-3 bg-red-50 rounded-lg border border-red-200">
                  <div className="flex items-center justify-between">
                    <span className="font-medium text-red-900">AidVoucher #{id}</span>
                    <div className="w-2 h-2 bg-red-500 rounded-full"></div>
                  </div>
                  <p className="text-sm text-red-700 mt-1">Crisis Relief Aid</p>
                </div>
              ))}
            </div>
          )}
        </div>

        {/* ImpactNFTs */}
        <div className="bg-white rounded-xl shadow-lg p-6">
          <div className="flex items-center space-x-2 mb-4">
            <TrophyIcon className="w-6 h-6 text-yellow-600" />
            <h3 className="text-lg font-bold text-gray-900">ImpactNFTs</h3>
            <span className="bg-yellow-100 text-yellow-800 text-xs font-medium px-2 py-1 rounded-full">
              {userNFTs.impactNFTs.length}
            </span>
          </div>
          
          {userNFTs.impactNFTs.length === 0 ? (
            <div className="text-center py-8">
              <TrophyIcon className="w-12 h-12 text-gray-400 mx-auto mb-4" />
              <p className="text-gray-500">No ImpactNFTs yet</p>
              <p className="text-sm text-gray-400 mt-1">Earn for your contributions</p>
            </div>
          ) : (
            <div className="space-y-3">
              {userNFTs.impactNFTs.map((id) => (
                <div key={id} className="p-3 bg-yellow-50 rounded-lg border border-yellow-200">
                  <div className="flex items-center justify-between">
                    <span className="font-medium text-yellow-900">ImpactNFT #{id}</span>
                    <div className="w-2 h-2 bg-yellow-500 rounded-full"></div>
                  </div>
                  <p className="text-sm text-yellow-700 mt-1">Impact Achievement</p>
                </div>
              ))}
            </div>
          )}
        </div>
      </div>

      {/* Recent Activity */}
      <div className="bg-white rounded-xl shadow-lg p-6">
        <h3 className="text-lg font-bold text-gray-900 mb-4">Recent Activity</h3>
        
        <div className="space-y-4">
          <div className="flex items-center space-x-3 p-3 bg-gray-50 rounded-lg">
            <div className="w-8 h-8 bg-green-100 rounded-full flex items-center justify-center">
              <HeartIcon className="w-4 h-4 text-green-600" />
            </div>
            <div className="flex-1">
              <p className="font-medium text-gray-900">Donated 0.5 MATIC</p>
              <p className="text-sm text-gray-600">To Hurricane Relief Fund</p>
            </div>
            <div className="text-xs text-gray-500">
              <ClockIcon className="w-3 h-3 inline mr-1" />
              2 hours ago
            </div>
          </div>
          
          <div className="flex items-center space-x-3 p-3 bg-gray-50 rounded-lg">
            <div className="w-8 h-8 bg-blue-100 rounded-full flex items-center justify-center">
              <ShieldCheckIcon className="w-4 h-4 text-blue-600" />
            </div>
            <div className="flex-1">
              <p className="font-medium text-gray-900">Staked 0.1 MATIC</p>
              <p className="text-sm text-gray-600">On Report #15 verification</p>
            </div>
            <div className="text-xs text-gray-500">
              <ClockIcon className="w-3 h-3 inline mr-1" />
              1 day ago
            </div>
          </div>
          
          <div className="flex items-center space-x-3 p-3 bg-gray-50 rounded-lg">
            <div className="w-8 h-8 bg-red-100 rounded-full flex items-center justify-center">
              <DocumentTextIcon className="w-4 h-4 text-red-600" />
            </div>
            <div className="flex-1">
              <p className="font-medium text-gray-900">Submitted Report</p>
              <p className="text-sm text-gray-600">Infrastructure failure in downtown</p>
            </div>
            <div className="text-xs text-gray-500">
              <ClockIcon className="w-3 h-3 inline mr-1" />
              3 days ago
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default AssetGallery;

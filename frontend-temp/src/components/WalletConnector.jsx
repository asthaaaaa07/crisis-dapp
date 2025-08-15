import React from 'react';
import { useBlockchain } from '../contexts/BlockchainContext.jsx';
import { WalletIcon, ArrowRightOnRectangleIcon } from '@heroicons/react/24/outline';

const WalletConnector = () => {
  const { 
    account, 
    balance, 
    isConnected, 
    isLoading, 
    chainId, 
    connectWallet, 
    disconnectWallet, 
    formatAddress 
  } = useBlockchain();

  const handleConnect = async () => {
    try {
      await connectWallet();
    } catch (error) {
      console.error('Connection failed:', error);
    }
  };

  const handleDisconnect = () => {
    disconnectWallet();
  };

  if (isLoading) {
    return (
      <div className="flex items-center space-x-2 px-4 py-2 bg-gray-100 rounded-lg">
        <div className="animate-spin rounded-full h-4 w-4 border-b-2 border-blue-600"></div>
        <span className="text-sm text-gray-600">Connecting...</span>
      </div>
    );
  }

  if (isConnected && account) {
    return (
      <div className="flex items-center space-x-3">
        {/* Network indicator */}
        <div className="flex items-center space-x-2 px-3 py-1 bg-green-100 rounded-full">
          <div className="w-2 h-2 bg-green-500 rounded-full"></div>
          <span className="text-xs font-medium text-green-700">
            {chainId === 80001 ? 'Mumbai' : 'Connected'}
          </span>
        </div>

        {/* Balance */}
        <div className="flex items-center space-x-2 px-3 py-2 bg-blue-50 rounded-lg">
          <span className="text-sm font-medium text-blue-900">
            {parseFloat(balance).toFixed(4)} MATIC
          </span>
        </div>

        {/* Account */}
        <div className="flex items-center space-x-2 px-3 py-2 bg-gray-100 rounded-lg">
          <WalletIcon className="w-4 h-4 text-gray-600" />
          <span className="text-sm font-medium text-gray-700">
            {formatAddress(account)}
          </span>
        </div>

        {/* Disconnect button */}
        <button
          onClick={handleDisconnect}
          className="flex items-center space-x-1 px-3 py-2 bg-red-50 hover:bg-red-100 text-red-700 rounded-lg transition-colors duration-200"
        >
          <ArrowRightOnRectangleIcon className="w-4 h-4" />
          <span className="text-sm font-medium">Disconnect</span>
        </button>
      </div>
    );
  }

  return (
    <button
      onClick={handleConnect}
      className="flex items-center space-x-2 px-4 py-2 bg-blue-600 hover:bg-blue-700 text-white rounded-lg transition-colors duration-200 shadow-sm"
    >
      <WalletIcon className="w-5 h-5" />
      <span className="font-medium">Connect Wallet</span>
    </button>
  );
};

export default WalletConnector;

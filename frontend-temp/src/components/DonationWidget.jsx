import React, { useState } from 'react';
import { useBlockchain } from '../contexts/BlockchainContext.jsx';
import { 
  HeartIcon, 
  CurrencyDollarIcon,
  ChatBubbleLeftIcon,
  EyeIcon,
  EyeSlashIcon,
  ClockIcon,
  UserIcon
} from '@heroicons/react/24/outline';

const DonationWidget = () => {
  const { crises, donate, isConnected, account, balance } = useBlockchain();
  const [selectedCrisis, setSelectedCrisis] = useState(null);
  const [donationAmount, setDonationAmount] = useState('');
  const [donationMessage, setDonationMessage] = useState('');
  const [isAnonymous, setIsAnonymous] = useState(false);
  const [isDonating, setIsDonating] = useState(false);

  const handleDonate = async () => {
    if (!selectedCrisis || !donationAmount || parseFloat(donationAmount) <= 0) {
      return;
    }

    setIsDonating(true);
    try {
      await donate(selectedCrisis.id, donationMessage, donationAmount, isAnonymous);
      setDonationAmount('');
      setDonationMessage('');
      setSelectedCrisis(null);
    } catch (error) {
      console.error('Failed to donate:', error);
    } finally {
      setIsDonating(false);
    }
  };

  const formatTime = (timestamp) => {
    return new Date(parseInt(timestamp) * 1000).toLocaleDateString();
  };

  const getProgressPercentage = (raised, target) => {
    return Math.min((parseFloat(raised) / parseFloat(target)) * 100, 100);
  };

  const getDaysLeft = (deadline) => {
    const now = Math.floor(Date.now() / 1000);
    const daysLeft = Math.ceil((parseInt(deadline) - now) / (24 * 60 * 60));
    return Math.max(0, daysLeft);
  };

  return (
    <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
      {/* Active Crises */}
      <div className="space-y-6">
        <div className="bg-white rounded-xl shadow-lg p-6">
          <div className="flex items-center space-x-2 mb-4">
            <HeartIcon className="w-6 h-6 text-red-500" />
            <h2 className="text-xl font-bold text-gray-900">Active Crisis Campaigns</h2>
            <span className="bg-red-100 text-red-800 text-xs font-medium px-2 py-1 rounded-full">
              {crises.length}
            </span>
          </div>

          {!isConnected ? (
            <div className="text-center py-8">
              <HeartIcon className="w-12 h-12 text-gray-400 mx-auto mb-4" />
              <p className="text-gray-500">Connect your wallet to view crises</p>
            </div>
          ) : crises.length === 0 ? (
            <div className="text-center py-8">
              <HeartIcon className="w-12 h-12 text-gray-400 mx-auto mb-4" />
              <p className="text-gray-500">No active crisis campaigns</p>
            </div>
          ) : (
            <div className="space-y-4">
              {crises.map((crisis) => (
                <div
                  key={crisis.id}
                  className={`p-4 rounded-lg border cursor-pointer transition-colors ${
                    selectedCrisis?.id === crisis.id
                      ? 'border-red-500 bg-red-50'
                      : 'border-gray-200 hover:border-gray-300 hover:bg-gray-50'
                  }`}
                  onClick={() => setSelectedCrisis(crisis)}
                >
                  <div className="flex items-start justify-between mb-3">
                    <div className="flex-1">
                      <h3 className="font-semibold text-gray-900 mb-1">{crisis.title}</h3>
                      <p className="text-sm text-gray-600 mb-2">{crisis.description}</p>
                      <p className="text-xs text-gray-500 mb-2">{crisis.location}</p>
                    </div>
                    <div className={`inline-flex items-center px-2 py-1 rounded-full text-xs font-medium ${
                      crisis.verified ? 'bg-green-100 text-green-800' : 'bg-yellow-100 text-yellow-800'
                    }`}>
                      {crisis.verified ? 'Verified' : 'Pending'}
                    </div>
                  </div>

                  <div className="space-y-2">
                    <div className="flex items-center justify-between text-sm">
                      <span className="text-gray-600">Progress</span>
                      <span className="font-medium text-gray-900">
                        {parseFloat(crisis.raisedAmount) / 1e18} / {parseFloat(crisis.targetAmount) / 1e18} MATIC
                      </span>
                    </div>
                    
                    <div className="w-full bg-gray-200 rounded-full h-2">
                      <div
                        className="bg-red-500 h-2 rounded-full transition-all duration-300"
                        style={{
                          width: `${getProgressPercentage(crisis.raisedAmount, crisis.targetAmount)}%`
                        }}
                      ></div>
                    </div>

                    <div className="flex items-center justify-between text-xs text-gray-500">
                      <div className="flex items-center space-x-1">
                        <ClockIcon className="w-3 h-3" />
                        <span>{getDaysLeft(crisis.deadline)} days left</span>
                      </div>
                      <div className="flex items-center space-x-1">
                        <UserIcon className="w-3 h-3" />
                        <span>{crisis.organizer.slice(0, 6)}...{crisis.organizer.slice(-4)}</span>
                      </div>
                    </div>
                  </div>
                </div>
              ))}
            </div>
          )}
        </div>
      </div>

      {/* Donation Interface */}
      <div className="space-y-6">
        {selectedCrisis ? (
          <div className="bg-white rounded-xl shadow-lg p-6">
            <h3 className="text-lg font-bold text-gray-900 mb-4">
              Donate to: {selectedCrisis.title}
            </h3>
            
            <div className="space-y-4">
              {/* Amount Input */}
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Donation Amount (MATIC)
                </label>
                <div className="relative">
                  <CurrencyDollarIcon className="absolute left-3 top-1/2 transform -translate-y-1/2 w-5 h-5 text-gray-400" />
                  <input
                    type="number"
                    value={donationAmount}
                    onChange={(e) => setDonationAmount(e.target.value)}
                    placeholder="0.01"
                    min="0.001"
                    step="0.001"
                    className="w-full pl-10 pr-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-red-500 focus:border-red-500"
                  />
                </div>
                <p className="text-xs text-gray-500 mt-1">
                  Your balance: {parseFloat(balance).toFixed(4)} MATIC
                </p>
              </div>

              {/* Message Input */}
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Message (Optional)
                </label>
                <div className="relative">
                  <ChatBubbleLeftIcon className="absolute left-3 top-3 w-5 h-5 text-gray-400" />
                  <textarea
                    value={donationMessage}
                    onChange={(e) => setDonationMessage(e.target.value)}
                    placeholder="Leave a message of support..."
                    rows={3}
                    className="w-full pl-10 pr-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-red-500 focus:border-red-500"
                  />
                </div>
              </div>

              {/* Anonymous Toggle */}
              <div className="flex items-center space-x-2">
                <button
                  onClick={() => setIsAnonymous(!isAnonymous)}
                  className="flex items-center space-x-2 text-sm text-gray-600 hover:text-gray-800"
                >
                  {isAnonymous ? (
                    <EyeSlashIcon className="w-4 h-4" />
                  ) : (
                    <EyeIcon className="w-4 h-4" />
                  )}
                  <span>Donate anonymously</span>
                </button>
              </div>

              {/* Donate Button */}
              <button
                onClick={handleDonate}
                disabled={isDonating || !donationAmount || parseFloat(donationAmount) <= 0}
                className={`w-full py-3 px-4 rounded-lg font-medium transition-colors ${
                  isDonating || !donationAmount || parseFloat(donationAmount) <= 0
                    ? 'bg-gray-300 text-gray-500 cursor-not-allowed'
                    : 'bg-red-600 hover:bg-red-700 text-white'
                }`}
              >
                {isDonating ? (
                  <div className="flex items-center justify-center space-x-2">
                    <div className="animate-spin rounded-full h-4 w-4 border-b-2 border-white"></div>
                    <span>Processing Donation...</span>
                  </div>
                ) : (
                  'Donate MATIC'
                )}
              </button>
            </div>
          </div>
        ) : (
          <div className="bg-white rounded-xl shadow-lg p-6">
            <div className="text-center py-8">
              <HeartIcon className="w-12 h-12 text-gray-400 mx-auto mb-4" />
              <p className="text-gray-500">Select a crisis to donate</p>
            </div>
          </div>
        )}

        {/* Crisis Details */}
        {selectedCrisis && (
          <div className="bg-white rounded-xl shadow-lg p-6">
            <h3 className="text-lg font-bold text-gray-900 mb-4">Crisis Details</h3>
            
            <div className="space-y-3">
              <div>
                <h4 className="font-medium text-gray-900">{selectedCrisis.title}</h4>
                <p className="text-sm text-gray-600 mt-1">{selectedCrisis.description}</p>
              </div>
              
              <div className="grid grid-cols-2 gap-4 text-sm">
                <div>
                  <span className="text-gray-500">Location:</span>
                  <p className="font-medium">{selectedCrisis.location}</p>
                </div>
                <div>
                  <span className="text-gray-500">Organizer:</span>
                  <p className="font-medium">{selectedCrisis.organizer.slice(0, 6)}...{selectedCrisis.organizer.slice(-4)}</p>
                </div>
                <div>
                  <span className="text-gray-500">Target:</span>
                  <p className="font-medium">{parseFloat(selectedCrisis.targetAmount) / 1e18} MATIC</p>
                </div>
                <div>
                  <span className="text-gray-500">Raised:</span>
                  <p className="font-medium">{parseFloat(selectedCrisis.raisedAmount) / 1e18} MATIC</p>
                </div>
              </div>
              
              <div className="pt-3 border-t border-gray-200">
                <div className="flex items-center justify-between text-sm">
                  <span className="text-gray-500">Progress</span>
                  <span className="font-medium">
                    {getProgressPercentage(selectedCrisis.raisedAmount, selectedCrisis.targetAmount).toFixed(1)}%
                  </span>
                </div>
                <div className="w-full bg-gray-200 rounded-full h-2 mt-2">
                  <div
                    className="bg-red-500 h-2 rounded-full"
                    style={{
                      width: `${getProgressPercentage(selectedCrisis.raisedAmount, selectedCrisis.targetAmount)}%`
                    }}
                  ></div>
                </div>
              </div>
            </div>
          </div>
        )}
      </div>
    </div>
  );
};

export default DonationWidget;

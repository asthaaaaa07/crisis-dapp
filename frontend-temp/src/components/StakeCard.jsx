import React, { useState } from 'react';
import { useBlockchain } from '../contexts/BlockchainContext.jsx';
import { 
  ShieldCheckIcon, 
  CurrencyDollarIcon,
  ClockIcon,
  UserIcon,
  CheckCircleIcon,
  XCircleIcon
} from '@heroicons/react/24/outline';

const StakeCard = () => {
  const { reports, stakeOnReport, finalizeReport, isConnected, account, isLoading } = useBlockchain();
  const [selectedReport, setSelectedReport] = useState(null);
  const [stakeAmount, setStakeAmount] = useState('');
  const [isStaking, setIsStaking] = useState(false);
  const [isFinalizing, setIsFinalizing] = useState(false);

  const handleStake = async () => {
    if (!selectedReport || !stakeAmount || parseFloat(stakeAmount) <= 0) {
      return;
    }

    setIsStaking(true);
    try {
      await stakeOnReport(selectedReport.id, stakeAmount);
      setStakeAmount('');
      setSelectedReport(null);
    } catch (error) {
      console.error('Failed to stake:', error);
    } finally {
      setIsStaking(false);
    }
  };

  const handleFinalize = async (reportId, valid) => {
    setIsFinalizing(true);
    try {
      await finalizeReport(reportId, valid);
    } catch (error) {
      console.error('Failed to finalize report:', error);
    } finally {
      setIsFinalizing(false);
    }
  };

  const getStatusColor = (finalized, valid) => {
    if (!finalized) return 'bg-yellow-100 text-yellow-800';
    return valid ? 'bg-green-100 text-green-800' : 'bg-red-100 text-red-800';
  };

  const getStatusText = (finalized, valid) => {
    if (!finalized) return 'Pending Verification';
    return valid ? 'Verified' : 'Invalid';
  };

  const formatTime = (timestamp) => {
    return new Date(timestamp).toLocaleString();
  };

  const pendingReports = reports.filter(report => !report.finalized);
  const finalizedReports = reports.filter(report => report.finalized);

  return (
    <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
      {/* Pending Reports */}
      <div className="space-y-6">
        <div className="bg-white rounded-xl shadow-lg p-6">
          <div className="flex items-center space-x-2 mb-4">
            <ShieldCheckIcon className="w-6 h-6 text-blue-600" />
            <h2 className="text-xl font-bold text-gray-900">Pending Reports</h2>
            <span className="bg-blue-100 text-blue-800 text-xs font-medium px-2 py-1 rounded-full">
              {pendingReports.length}
            </span>
          </div>

          {!isConnected ? (
            <div className="text-center py-8">
              <ShieldCheckIcon className="w-12 h-12 text-gray-400 mx-auto mb-4" />
              <p className="text-gray-500">Connect your wallet to view reports</p>
            </div>
          ) : pendingReports.length === 0 ? (
            <div className="text-center py-8">
              <CheckCircleIcon className="w-12 h-12 text-green-400 mx-auto mb-4" />
              <p className="text-gray-500">No pending reports</p>
            </div>
          ) : (
            <div className="space-y-4">
              {pendingReports.map((report) => (
                <div
                  key={report.id}
                  className={`p-4 rounded-lg border cursor-pointer transition-colors ${
                    selectedReport?.id === report.id
                      ? 'border-blue-500 bg-blue-50'
                      : 'border-gray-200 hover:border-gray-300 hover:bg-gray-50'
                  }`}
                  onClick={() => setSelectedReport(report)}
                >
                  <div className="flex items-start justify-between">
                    <div className="flex-1">
                      <div className="flex items-center space-x-2 mb-2">
                        <span className="font-semibold text-gray-900">
                          Report #{report.id}
                        </span>
                        <div className={`inline-flex items-center px-2 py-1 rounded-full text-xs font-medium ${getStatusColor(report.finalized, report.valid)}`}>
                          {getStatusText(report.finalized, report.valid)}
                        </div>
                      </div>
                      
                      <p className="text-sm text-gray-600 mb-2">
                        {report.crisisType || 'Unknown Type'}
                      </p>
                      
                      <div className="flex items-center space-x-4 text-xs text-gray-500 mb-2">
                        <div className="flex items-center space-x-1">
                          <UserIcon className="w-3 h-3" />
                          <span>{report.reporter ? report.reporter.slice(0, 6) + '...' : 'Anonymous'}</span>
                        </div>
                        <div className="flex items-center space-x-1">
                          <ClockIcon className="w-3 h-3" />
                          <span>{formatTime(report.timestamp)}</span>
                        </div>
                      </div>
                      
                      {report.stakeTotal && (
                        <div className="text-xs text-gray-500">
                          Total staked: {parseFloat(report.stakeTotal) / 1e18} MATIC
                        </div>
                      )}
                    </div>
                  </div>
                </div>
              ))}
            </div>
          )}
        </div>

        {/* Staking Interface */}
        {selectedReport && !selectedReport.finalized && (
          <div className="bg-white rounded-xl shadow-lg p-6">
            <h3 className="text-lg font-bold text-gray-900 mb-4">
              Stake on Report #{selectedReport.id}
            </h3>
            
            <div className="space-y-4">
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Stake Amount (MATIC)
                </label>
                <div className="relative">
                  <CurrencyDollarIcon className="absolute left-3 top-1/2 transform -translate-y-1/2 w-5 h-5 text-gray-400" />
                  <input
                    type="number"
                    value={stakeAmount}
                    onChange={(e) => setStakeAmount(e.target.value)}
                    placeholder="0.01"
                    min="0.001"
                    step="0.001"
                    className="w-full pl-10 pr-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                  />
                </div>
                <p className="text-xs text-gray-500 mt-1">
                  Minimum stake: 0.001 MATIC
                </p>
              </div>
              
              <button
                onClick={handleStake}
                disabled={isStaking || !stakeAmount || parseFloat(stakeAmount) <= 0}
                className={`w-full py-2 px-4 rounded-lg font-medium transition-colors ${
                  isStaking || !stakeAmount || parseFloat(stakeAmount) <= 0
                    ? 'bg-gray-300 text-gray-500 cursor-not-allowed'
                    : 'bg-blue-600 hover:bg-blue-700 text-white'
                }`}
              >
                {isStaking ? (
                  <div className="flex items-center justify-center space-x-2">
                    <div className="animate-spin rounded-full h-4 w-4 border-b-2 border-white"></div>
                    <span>Staking...</span>
                  </div>
                ) : (
                  'Stake MATIC'
                )}
              </button>
            </div>
          </div>
        )}
      </div>

      {/* Finalized Reports & Admin Panel */}
      <div className="space-y-6">
        {/* Finalized Reports */}
        <div className="bg-white rounded-xl shadow-lg p-6">
          <h2 className="text-xl font-bold text-gray-900 mb-4">Finalized Reports</h2>
          
          {finalizedReports.length === 0 ? (
            <div className="text-center py-8">
              <CheckCircleIcon className="w-12 h-12 text-gray-400 mx-auto mb-4" />
              <p className="text-gray-500">No finalized reports yet</p>
            </div>
          ) : (
            <div className="space-y-3 max-h-96 overflow-y-auto">
              {finalizedReports.map((report) => (
                <div key={report.id} className="p-3 rounded-lg border border-gray-200">
                  <div className="flex items-start justify-between">
                    <div className="flex-1">
                      <div className="flex items-center space-x-2 mb-1">
                        <span className="font-semibold text-gray-900">
                          Report #{report.id}
                        </span>
                        <div className={`inline-flex items-center px-2 py-1 rounded-full text-xs font-medium ${getStatusColor(report.finalized, report.valid)}`}>
                          {getStatusText(report.finalized, report.valid)}
                        </div>
                      </div>
                      
                      <p className="text-sm text-gray-600 mb-1">
                        {report.crisisType || 'Unknown Type'}
                      </p>
                      
                      <div className="flex items-center space-x-4 text-xs text-gray-500">
                        <div className="flex items-center space-x-1">
                          <UserIcon className="w-3 h-3" />
                          <span>{report.reporter ? report.reporter.slice(0, 6) + '...' : 'Anonymous'}</span>
                        </div>
                        <div className="flex items-center space-x-1">
                          <ClockIcon className="w-3 h-3" />
                          <span>{formatTime(report.timestamp)}</span>
                        </div>
                      </div>
                      
                      {report.stakeTotal && (
                        <div className="mt-1 text-xs text-gray-500">
                          Total staked: {parseFloat(report.stakeTotal) / 1e18} MATIC
                        </div>
                      )}
                    </div>
                  </div>
                </div>
              ))}
            </div>
          )}
        </div>

        {/* Admin Panel */}
        {account && (
          <div className="bg-white rounded-xl shadow-lg p-6">
            <h2 className="text-xl font-bold text-gray-900 mb-4">Admin Panel</h2>
            <p className="text-sm text-gray-600 mb-4">
              Finalize pending reports (contract owner only)
            </p>
            
            {pendingReports.length === 0 ? (
              <p className="text-sm text-gray-500">No reports to finalize</p>
            ) : (
              <div className="space-y-3">
                {pendingReports.slice(0, 5).map((report) => (
                  <div key={report.id} className="p-3 rounded-lg border border-gray-200">
                    <div className="flex items-center justify-between mb-2">
                      <span className="font-medium text-gray-900">
                        Report #{report.id}
                      </span>
                      <div className="flex space-x-2">
                        <button
                          onClick={() => handleFinalize(report.id, true)}
                          disabled={isFinalizing}
                          className="flex items-center space-x-1 px-3 py-1 bg-green-100 hover:bg-green-200 text-green-800 rounded-lg text-sm font-medium transition-colors"
                        >
                          <CheckCircleIcon className="w-4 h-4" />
                          <span>Valid</span>
                        </button>
                        <button
                          onClick={() => handleFinalize(report.id, false)}
                          disabled={isFinalizing}
                          className="flex items-center space-x-1 px-3 py-1 bg-red-100 hover:bg-red-200 text-red-800 rounded-lg text-sm font-medium transition-colors"
                        >
                          <XCircleIcon className="w-4 h-4" />
                          <span>Invalid</span>
                        </button>
                      </div>
                    </div>
                    <p className="text-xs text-gray-600">
                      {report.crisisType || 'Unknown Type'}
                    </p>
                  </div>
                ))}
              </div>
            )}
          </div>
        )}
      </div>
    </div>
  );
};

export default StakeCard;

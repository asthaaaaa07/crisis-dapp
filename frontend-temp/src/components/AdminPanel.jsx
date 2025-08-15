import React, { useState } from 'react';
import { useBlockchain } from '../contexts/BlockchainContext.jsx';
import { 
  Cog6ToothIcon, 
  ShieldCheckIcon,
  ExclamationTriangleIcon,
  ChartBarIcon,
  UserGroupIcon,
  ClockIcon,
  CheckCircleIcon,
  XCircleIcon
} from '@heroicons/react/24/outline';

const AdminPanel = () => {
  const { reports, crises, isConnected, account, finalizeReport } = useBlockchain();
  const [selectedTab, setSelectedTab] = useState('reports');
  const [isFinalizing, setIsFinalizing] = useState(false);

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
    if (!finalized) return 'Pending';
    return valid ? 'Verified' : 'Invalid';
  };

  const formatTime = (timestamp) => {
    return new Date(timestamp).toLocaleString();
  };

  const pendingReports = reports.filter(report => !report.finalized);
  const finalizedReports = reports.filter(report => report.finalized);
  const verifiedReports = finalizedReports.filter(report => report.valid);
  const invalidReports = finalizedReports.filter(report => !report.valid);

  const stats = {
    totalReports: reports.length,
    pendingReports: pendingReports.length,
    verifiedReports: verifiedReports.length,
    invalidReports: invalidReports.length,
    totalCrises: crises.length,
    activeCrises: crises.filter(crisis => crisis.active).length
  };

  if (!isConnected) {
    return (
      <div className="text-center py-12">
        <Cog6ToothIcon className="w-16 h-16 text-gray-400 mx-auto mb-4" />
        <h2 className="text-xl font-bold text-gray-900 mb-2">Admin Access Required</h2>
        <p className="text-gray-600">Connect your wallet to access admin panel</p>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      {/* Stats Overview */}
      <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
        <div className="bg-white rounded-xl shadow-lg p-4">
          <div className="flex items-center space-x-2 mb-2">
            <ExclamationTriangleIcon className="w-5 h-5 text-red-500" />
            <span className="text-sm font-medium text-gray-600">Total Reports</span>
          </div>
          <p className="text-2xl font-bold text-gray-900">{stats.totalReports}</p>
        </div>
        
        <div className="bg-white rounded-xl shadow-lg p-4">
          <div className="flex items-center space-x-2 mb-2">
            <ClockIcon className="w-5 h-5 text-yellow-500" />
            <span className="text-sm font-medium text-gray-600">Pending</span>
          </div>
          <p className="text-2xl font-bold text-gray-900">{stats.pendingReports}</p>
        </div>
        
        <div className="bg-white rounded-xl shadow-lg p-4">
          <div className="flex items-center space-x-2 mb-2">
            <CheckCircleIcon className="w-5 h-5 text-green-500" />
            <span className="text-sm font-medium text-gray-600">Verified</span>
          </div>
          <p className="text-2xl font-bold text-gray-900">{stats.verifiedReports}</p>
        </div>
        
        <div className="bg-white rounded-xl shadow-lg p-4">
          <div className="flex items-center space-x-2 mb-2">
            <XCircleIcon className="w-5 h-5 text-red-500" />
            <span className="text-sm font-medium text-gray-600">Invalid</span>
          </div>
          <p className="text-2xl font-bold text-gray-900">{stats.invalidReports}</p>
        </div>
      </div>

      {/* Tab Navigation */}
      <div className="bg-white rounded-xl shadow-lg">
        <div className="border-b border-gray-200">
          <nav className="flex space-x-8 px-6">
            <button
              onClick={() => setSelectedTab('reports')}
              className={`py-4 px-1 border-b-2 font-medium text-sm ${
                selectedTab === 'reports'
                  ? 'border-red-500 text-red-600'
                  : 'border-transparent text-gray-500 hover:text-gray-700 hover:border-gray-300'
              }`}
            >
              <div className="flex items-center space-x-2">
                <ExclamationTriangleIcon className="w-4 h-4" />
                <span>Reports Management</span>
              </div>
            </button>
            
            <button
              onClick={() => setSelectedTab('crises')}
              className={`py-4 px-1 border-b-2 font-medium text-sm ${
                selectedTab === 'crises'
                  ? 'border-red-500 text-red-600'
                  : 'border-transparent text-gray-500 hover:text-gray-700 hover:border-gray-300'
              }`}
            >
              <div className="flex items-center space-x-2">
                <ShieldCheckIcon className="w-4 h-4" />
                <span>Crisis Management</span>
              </div>
            </button>
            
            <button
              onClick={() => setSelectedTab('analytics')}
              className={`py-4 px-1 border-b-2 font-medium text-sm ${
                selectedTab === 'analytics'
                  ? 'border-red-500 text-red-600'
                  : 'border-transparent text-gray-500 hover:text-gray-700 hover:border-gray-300'
              }`}
            >
              <div className="flex items-center space-x-2">
                <ChartBarIcon className="w-4 h-4" />
                <span>Analytics</span>
              </div>
            </button>
          </nav>
        </div>

        <div className="p-6">
          {/* Reports Management Tab */}
          {selectedTab === 'reports' && (
            <div className="space-y-6">
              <div>
                <h3 className="text-lg font-bold text-gray-900 mb-4">Pending Reports</h3>
                
                {pendingReports.length === 0 ? (
                  <div className="text-center py-8">
                    <CheckCircleIcon className="w-12 h-12 text-green-400 mx-auto mb-4" />
                    <p className="text-gray-500">No pending reports to review</p>
                  </div>
                ) : (
                  <div className="space-y-4">
                    {pendingReports.map((report) => (
                      <div key={report.id} className="p-4 border border-gray-200 rounded-lg">
                        <div className="flex items-start justify-between mb-3">
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
                            
                            <div className="flex items-center space-x-4 text-xs text-gray-500">
                              <span>Reporter: {report.reporter ? report.reporter.slice(0, 6) + '...' : 'Anonymous'}</span>
                              <span>Time: {formatTime(report.timestamp)}</span>
                              {report.stakeTotal && (
                                <span>Staked: {parseFloat(report.stakeTotal) / 1e18} MATIC</span>
                              )}
                            </div>
                          </div>
                          
                          <div className="flex space-x-2">
                            <button
                              onClick={() => handleFinalize(report.id, true)}
                              disabled={isFinalizing}
                              className="flex items-center space-x-1 px-3 py-1 bg-green-100 hover:bg-green-200 text-green-800 rounded-lg text-sm font-medium transition-colors"
                            >
                              <CheckCircleIcon className="w-4 h-4" />
                              <span>Verify</span>
                            </button>
                            <button
                              onClick={() => handleFinalize(report.id, false)}
                              disabled={isFinalizing}
                              className="flex items-center space-x-1 px-3 py-1 bg-red-100 hover:bg-red-200 text-red-800 rounded-lg text-sm font-medium transition-colors"
                            >
                              <XCircleIcon className="w-4 h-4" />
                              <span>Reject</span>
                            </button>
                          </div>
                        </div>
                      </div>
                    ))}
                  </div>
                )}
              </div>

              <div>
                <h3 className="text-lg font-bold text-gray-900 mb-4">Recently Finalized</h3>
                <div className="space-y-3">
                  {finalizedReports.slice(0, 5).map((report) => (
                    <div key={report.id} className="p-3 border border-gray-200 rounded-lg">
                      <div className="flex items-center justify-between">
                        <div className="flex items-center space-x-2">
                          <span className="font-medium text-gray-900">Report #{report.id}</span>
                          <div className={`inline-flex items-center px-2 py-1 rounded-full text-xs font-medium ${getStatusColor(report.finalized, report.valid)}`}>
                            {getStatusText(report.finalized, report.valid)}
                          </div>
                        </div>
                        <span className="text-xs text-gray-500">{formatTime(report.timestamp)}</span>
                      </div>
                    </div>
                  ))}
                </div>
              </div>
            </div>
          )}

          {/* Crisis Management Tab */}
          {selectedTab === 'crises' && (
            <div className="space-y-6">
              <div>
                <h3 className="text-lg font-bold text-gray-900 mb-4">Active Crisis Campaigns</h3>
                
                {crises.length === 0 ? (
                  <div className="text-center py-8">
                    <ShieldCheckIcon className="w-12 h-12 text-gray-400 mx-auto mb-4" />
                    <p className="text-gray-500">No active crisis campaigns</p>
                  </div>
                ) : (
                  <div className="space-y-4">
                    {crises.map((crisis) => (
                      <div key={crisis.id} className="p-4 border border-gray-200 rounded-lg">
                        <div className="flex items-start justify-between mb-3">
                          <div className="flex-1">
                            <div className="flex items-center space-x-2 mb-2">
                              <h4 className="font-semibold text-gray-900">{crisis.title}</h4>
                              <div className={`inline-flex items-center px-2 py-1 rounded-full text-xs font-medium ${
                                crisis.verified ? 'bg-green-100 text-green-800' : 'bg-yellow-100 text-yellow-800'
                              }`}>
                                {crisis.verified ? 'Verified' : 'Pending'}
                              </div>
                            </div>
                            
                            <p className="text-sm text-gray-600 mb-2">{crisis.description}</p>
                            <p className="text-xs text-gray-500 mb-2">{crisis.location}</p>
                            
                            <div className="flex items-center justify-between text-sm">
                              <span className="text-gray-600">
                                Progress: {parseFloat(crisis.raisedAmount) / 1e18} / {parseFloat(crisis.targetAmount) / 1e18} MATIC
                              </span>
                              <span className="text-gray-500">
                                Organizer: {crisis.organizer.slice(0, 6)}...{crisis.organizer.slice(-4)}
                              </span>
                            </div>
                            
                            <div className="w-full bg-gray-200 rounded-full h-2 mt-2">
                              <div
                                className="bg-red-500 h-2 rounded-full"
                                style={{
                                  width: `${Math.min((parseFloat(crisis.raisedAmount) / parseFloat(crisis.targetAmount)) * 100, 100)}%`
                                }}
                              ></div>
                            </div>
                          </div>
                        </div>
                      </div>
                    ))}
                  </div>
                )}
              </div>
            </div>
          )}

          {/* Analytics Tab */}
          {selectedTab === 'analytics' && (
            <div className="space-y-6">
              <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                <div className="bg-white border border-gray-200 rounded-lg p-6">
                  <h3 className="text-lg font-bold text-gray-900 mb-4">Platform Statistics</h3>
                  <div className="space-y-3">
                    <div className="flex justify-between">
                      <span className="text-gray-600">Total Reports</span>
                      <span className="font-semibold">{stats.totalReports}</span>
                    </div>
                    <div className="flex justify-between">
                      <span className="text-gray-600">Verification Rate</span>
                      <span className="font-semibold">
                        {stats.totalReports > 0 ? Math.round((stats.verifiedReports / stats.totalReports) * 100) : 0}%
                      </span>
                    </div>
                    <div className="flex justify-between">
                      <span className="text-gray-600">Active Crises</span>
                      <span className="font-semibold">{stats.activeCrises}</span>
                    </div>
                  </div>
                </div>
                
                <div className="bg-white border border-gray-200 rounded-lg p-6">
                  <h3 className="text-lg font-bold text-gray-900 mb-4">Recent Activity</h3>
                  <div className="space-y-3">
                    <div className="flex items-center space-x-2">
                      <div className="w-2 h-2 bg-green-500 rounded-full"></div>
                      <span className="text-sm text-gray-600">Report #12 verified</span>
                    </div>
                    <div className="flex items-center space-x-2">
                      <div className="w-2 h-2 bg-blue-500 rounded-full"></div>
                      <span className="text-sm text-gray-600">New crisis campaign created</span>
                    </div>
                    <div className="flex items-center space-x-2">
                      <div className="w-2 h-2 bg-yellow-500 rounded-full"></div>
                      <span className="text-sm text-gray-600">Report #15 submitted</span>
                    </div>
                  </div>
                </div>
              </div>
            </div>
          )}
        </div>
      </div>
    </div>
  );
};

export default AdminPanel;

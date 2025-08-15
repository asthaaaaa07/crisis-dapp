import React from 'react';
import { BrowserRouter as Router, Routes, Route, Link, useLocation } from 'react-router-dom';
import { Toaster } from 'react-hot-toast';
import { BlockchainProvider, useBlockchain } from './contexts/BlockchainContext.jsx';
import WalletConnector from './components/WalletConnector.jsx';
import ReportForm from './components/ReportForm.jsx';
import CrisisMap from './components/CrisisMap.jsx';
import StakeCard from './components/StakeCard.jsx';
import DonationWidget from './components/DonationWidget.jsx';
import AssetGallery from './components/AssetGallery.jsx';
import AdminPanel from './components/AdminPanel.jsx';
import { 
  HomeIcon, 
  ExclamationTriangleIcon, 
  ShieldCheckIcon, 
  HeartIcon, 
  UserIcon, 
  Cog6ToothIcon 
} from '@heroicons/react/24/outline';

// Navigation component
const Navigation = () => {
  const location = useLocation();
  const { isConnected } = useBlockchain();

  const navItems = [
    { path: '/', label: 'Crisis Map', icon: HomeIcon },
    { path: '/submit', label: 'Submit Report', icon: ExclamationTriangleIcon },
    { path: '/verify', label: 'Verify & Stake', icon: ShieldCheckIcon },
    { path: '/donate', label: 'Donate', icon: HeartIcon },
    { path: '/profile', label: 'Profile', icon: UserIcon },
    { path: '/admin', label: 'Admin', icon: Cog6ToothIcon },
  ];

  return (
    <nav className="bg-white shadow-lg border-b">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex justify-between h-16">
          {/* Logo and main nav */}
          <div className="flex items-center space-x-8">
            <Link to="/" className="flex items-center space-x-2">
              <ExclamationTriangleIcon className="w-8 h-8 text-red-500" />
              <span className="text-xl font-bold text-gray-900">CrisisResponse</span>
            </Link>
            
            <div className="hidden md:flex space-x-1">
              {navItems.map((item) => {
                const Icon = item.icon;
                const isActive = location.pathname === item.path;
                return (
                  <Link
                    key={item.path}
                    to={item.path}
                    className={`flex items-center space-x-2 px-3 py-2 rounded-lg text-sm font-medium transition-colors ${
                      isActive
                        ? 'bg-red-50 text-red-700'
                        : 'text-gray-600 hover:text-gray-900 hover:bg-gray-50'
                    }`}
                  >
                    <Icon className="w-4 h-4" />
                    <span>{item.label}</span>
                  </Link>
                );
              })}
            </div>
          </div>

          {/* Wallet connector */}
          <div className="flex items-center">
            <WalletConnector />
          </div>
        </div>
      </div>

      {/* Mobile navigation */}
      <div className="md:hidden border-t">
        <div className="px-2 pt-2 pb-3 space-y-1">
          {navItems.map((item) => {
            const Icon = item.icon;
            const isActive = location.pathname === item.path;
            return (
              <Link
                key={item.path}
                to={item.path}
                className={`flex items-center space-x-2 px-3 py-2 rounded-lg text-sm font-medium transition-colors ${
                  isActive
                    ? 'bg-red-50 text-red-700'
                    : 'text-gray-600 hover:text-gray-900 hover:bg-gray-50'
                }`}
              >
                <Icon className="w-4 h-4" />
                <span>{item.label}</span>
              </Link>
            );
          })}
        </div>
      </div>
    </nav>
  );
};

// Home page with crisis map
const HomePage = () => {
  return (
    <div className="min-h-screen bg-gray-50">
      <div className="max-w-7xl mx-auto py-6 px-4 sm:px-6 lg:px-8">
        <div className="mb-8">
          <h1 className="text-3xl font-bold text-gray-900 mb-2">
            Crisis Response Dashboard
          </h1>
          <p className="text-gray-600">
            Real-time crisis monitoring and response coordination
          </p>
        </div>
        <CrisisMap />
      </div>
    </div>
  );
};

// Submit report page
const SubmitPage = () => {
  return (
    <div className="min-h-screen bg-gray-50 py-8">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <ReportForm />
      </div>
    </div>
  );
};

// Verify and stake page
const VerifyPage = () => {
  return (
    <div className="min-h-screen bg-gray-50 py-8">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="mb-8">
          <h1 className="text-3xl font-bold text-gray-900 mb-2">
            Verify & Stake on Reports
          </h1>
          <p className="text-gray-600">
            Review crisis reports and stake MATIC to verify their validity
          </p>
        </div>
        <StakeCard />
      </div>
    </div>
  );
};

// Donation page
const DonatePage = () => {
  return (
    <div className="min-h-screen bg-gray-50 py-8">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="mb-8">
          <h1 className="text-3xl font-bold text-gray-900 mb-2">
            Crisis Donations
          </h1>
          <p className="text-gray-600">
            Support crisis relief efforts with your donations
          </p>
        </div>
        <DonationWidget />
      </div>
    </div>
  );
};

// Profile page
const ProfilePage = () => {
  return (
    <div className="min-h-screen bg-gray-50 py-8">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="mb-8">
          <h1 className="text-3xl font-bold text-gray-900 mb-2">
            Your Profile & Assets
          </h1>
          <p className="text-gray-600">
            View your impact NFTs, reputation, and contribution history
          </p>
        </div>
        <AssetGallery />
      </div>
    </div>
  );
};

// Admin page
const AdminPage = () => {
  return (
    <div className="min-h-screen bg-gray-50 py-8">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="mb-8">
          <h1 className="text-3xl font-bold text-gray-900 mb-2">
            Admin Panel
          </h1>
          <p className="text-gray-600">
            Manage crisis reports and platform settings
          </p>
        </div>
        <AdminPanel />
      </div>
    </div>
  );
};

// Main App component
const App = () => {
  return (
    <BlockchainProvider>
      <Router>
        <div className="min-h-screen bg-gray-50">
          <Navigation />
          <main>
            <Routes>
              <Route path="/" element={<HomePage />} />
              <Route path="/submit" element={<SubmitPage />} />
              <Route path="/verify" element={<VerifyPage />} />
              <Route path="/donate" element={<DonatePage />} />
              <Route path="/profile" element={<ProfilePage />} />
              <Route path="/admin" element={<AdminPage />} />
            </Routes>
          </main>
          <Toaster 
            position="top-right"
            toastOptions={{
              duration: 4000,
              style: {
                background: '#363636',
                color: '#fff',
              },
              success: {
                duration: 3000,
                iconTheme: {
                  primary: '#10B981',
                  secondary: '#fff',
                },
              },
              error: {
                duration: 5000,
                iconTheme: {
                  primary: '#EF4444',
                  secondary: '#fff',
                },
              },
            }}
          />
        </div>
      </Router>
    </BlockchainProvider>
  );
};

export default App;

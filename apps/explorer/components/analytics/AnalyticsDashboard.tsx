'use client';

/**
 * Analytics Dashboard - Main Component
 * Comprehensive blockchain analytics dashboard with multiple metrics and visualizations
 */

import { useState } from 'react';
import { NetworkPerformance } from '../dashboard/NetworkPerformance';
import { TokenAnalytics } from './TokenAnalytics';
import { GasPriceTracker } from './GasPriceTracker';
import { WalletPortfolioTracker } from './WalletPortfolioTracker';

type DashboardTab = 'overview' | 'tokens' | 'gas' | 'portfolio';

export const AnalyticsDashboard = (): JSX.Element => {
  const [activeTab, setActiveTab] = useState<DashboardTab>('overview');

  const tabs: Array<{ id: DashboardTab; label: string; icon: JSX.Element }> = [
    {
      id: 'overview',
      label: 'Overview',
      icon: (
        <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 19v-6a2 2 0 00-2-2H5a2 2 0 00-2 2v6a2 2 0 002 2h2a2 2 0 002-2zm0 0V9a2 2 0 012-2h2a2 2 0 012 2v10m-6 0a2 2 0 002 2h2a2 2 0 002-2m0 0V5a2 2 0 012-2h2a2 2 0 012 2v14a2 2 0 01-2 2h-2a2 2 0 01-2-2z" />
        </svg>
      ),
    },
    {
      id: 'tokens',
      label: 'Token Analytics',
      icon: (
        <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 8c-1.657 0-3 .895-3 2s1.343 2 3 2 3 .895 3 2-1.343 2-3 2m0-8c1.11 0 2.08.402 2.599 1M12 8V7m0 1v8m0 0v1m0-1c-1.11 0-2.08-.402-2.599-1M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
        </svg>
      ),
    },
    {
      id: 'gas',
      label: 'Gas Tracker',
      icon: (
        <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M13 10V3L4 14h7v7l9-11h-7z" />
        </svg>
      ),
    },
    {
      id: 'portfolio',
      label: 'Portfolio',
      icon: (
        <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M3 10h18M7 15h1m4 0h1m-7 4h12a3 3 0 003-3V8a3 3 0 00-3-3H6a3 3 0 00-3 3v8a3 3 0 003 3z" />
        </svg>
      ),
    },
  ];

  const renderContent = () => {
    switch (activeTab) {
      case 'overview':
        return (
          <div className="space-y-6">
            <NetworkPerformance />

            <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
              <GasPriceTracker />
              <div className="bg-white dark:bg-gradient-dark rounded-2xl shadow-xl border border-gray-200 dark:border-gray-700 p-6">
                <h3 className="text-2xl font-bold text-gray-900 dark:text-white mb-4">Quick Stats</h3>

                <div className="space-y-4">
                  {/* Total Value Locked */}
                  <div className="flex items-center justify-between p-4 bg-gray-50 dark:bg-gray-800/50 rounded-xl border border-gray-200 dark:border-gray-700">
                    <div className="flex items-center gap-3">
                      <div className="h-12 w-12 bg-gradient-to-br from-blue-500 to-purple-600 rounded-lg flex items-center justify-center">
                        <svg className="w-6 h-6 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 15v2m-6 4h12a2 2 0 002-2v-6a2 2 0 00-2-2H6a2 2 0 00-2 2v6a2 2 0 002 2zm10-10V7a4 4 0 00-8 0v4h8z" />
                        </svg>
                      </div>
                      <div>
                        <p className="text-gray-600 dark:text-gray-400 text-sm">Total Value Locked</p>
                        <p className="text-2xl font-bold text-gray-900 dark:text-white">$125.5M</p>
                      </div>
                    </div>
                    <span className="text-green-600 dark:text-green-400 font-semibold">+12.5%</span>
                  </div>

                  {/* Active Validators */}
                  <div className="flex items-center justify-between p-4 bg-gray-50 dark:bg-gray-800/50 rounded-xl border border-gray-200 dark:border-gray-700">
                    <div className="flex items-center gap-3">
                      <div className="h-12 w-12 bg-gradient-to-br from-green-500 to-emerald-600 rounded-lg flex items-center justify-center">
                        <svg className="w-6 h-6 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12l2 2 4-4m5.618-4.016A11.955 11.955 0 0112 2.944a11.955 11.955 0 01-8.618 3.04A12.02 12.02 0 003 9c0 5.591 3.824 10.29 9 11.622 5.176-1.332 9-6.03 9-11.622 0-1.042-.133-2.052-.382-3.016z" />
                        </svg>
                      </div>
                      <div>
                        <p className="text-gray-600 dark:text-gray-400 text-sm">Active Validators</p>
                        <p className="text-2xl font-bold text-gray-900 dark:text-white">5 nodes</p>
                      </div>
                    </div>
                    <span className="text-green-600 dark:text-green-400 font-semibold">100%</span>
                  </div>

                  {/* Daily Transactions */}
                  <div className="flex items-center justify-between p-4 bg-gray-50 dark:bg-gray-800/50 rounded-xl border border-gray-200 dark:border-gray-700">
                    <div className="flex items-center gap-3">
                      <div className="h-12 w-12 bg-gradient-to-br from-yellow-500 to-orange-600 rounded-lg flex items-center justify-center">
                        <svg className="w-6 h-6 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M7 16V4m0 0L3 8m4-4l4 4m6 0v12m0 0l4-4m-4 4l-4-4" />
                        </svg>
                      </div>
                      <div>
                        <p className="text-gray-600 dark:text-gray-400 text-sm">Daily Transactions</p>
                        <p className="text-2xl font-bold text-gray-900 dark:text-white">45.2K</p>
                      </div>
                    </div>
                    <span className="text-green-600 dark:text-green-400 font-semibold">+8.3%</span>
                  </div>
                </div>
              </div>
            </div>
          </div>
        );

      case 'tokens':
        return <TokenAnalytics />;

      case 'gas':
        return <GasPriceTracker />;

      case 'portfolio':
        return <WalletPortfolioTracker />;

      default:
        return null;
    }
  };

  return (
    <div className="min-h-screen bg-gray-50 dark:bg-gray-900">
      {/* Header */}
      <div className="bg-white dark:bg-gray-800 border-b border-gray-200 dark:border-gray-700 sticky top-0 z-10">
        <div className="max-w-7xl mx-auto px-4 py-6">
          <div className="flex items-center justify-between mb-6">
            <div>
              <h1 className="text-3xl font-bold text-gray-900 dark:text-white mb-2">
                Analytics Dashboard
              </h1>
              <p className="text-gray-600 dark:text-gray-400">
                Comprehensive blockchain analytics and insights
              </p>
            </div>

            {/* Export Button */}
            <button
              className="h-12 px-6 bg-blue-600 dark:bg-bnb-yellow text-white dark:text-gray-900 rounded-xl hover:bg-blue-700 dark:hover:bg-bnb-yellow/90 transition-colors font-medium shadow-lg hover:shadow-xl flex items-center gap-2"
              aria-label="Export data"
            >
              <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 16v1a3 3 0 003 3h10a3 3 0 003-3v-1m-4-4l-4 4m0 0l-4-4m4 4V4" />
              </svg>
              Export Data
            </button>
          </div>

          {/* Tabs */}
          <div className="flex gap-2 overflow-x-auto pb-2">
            {tabs.map(tab => (
              <button
                key={tab.id}
                onClick={() => setActiveTab(tab.id)}
                className={`flex items-center gap-2 px-6 py-3 rounded-lg font-medium transition-all whitespace-nowrap ${
                  activeTab === tab.id
                    ? 'bg-blue-600 dark:bg-bnb-yellow text-white dark:text-gray-900 shadow-lg'
                    : 'bg-gray-100 dark:bg-gray-700 text-gray-700 dark:text-gray-300 hover:bg-gray-200 dark:hover:bg-gray-600'
                }`}
                aria-label={`Switch to ${tab.label}`}
              >
                {tab.icon}
                {tab.label}
              </button>
            ))}
          </div>
        </div>
      </div>

      {/* Content */}
      <div className="max-w-7xl mx-auto px-4 py-8">
        {renderContent()}
      </div>
    </div>
  );
};

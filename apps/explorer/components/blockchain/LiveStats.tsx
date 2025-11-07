/**
 * Live Blockchain Stats Component
 * Displays real-time data from https://rpc.norchain.org
 */

'use client';

import React from 'react';
import { useBlockchainStats, useGasPrice } from '@/hooks/useBlockchain';

export const LiveStats = (): JSX.Element => {
  const { stats, loading } = useBlockchainStats(10000); // Update every 10 seconds
  const { gasPrice, loading: gasPriceLoading } = useGasPrice(10000);

  if (loading) {
    return (
      <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
        {[1, 2, 3, 4].map((i) => (
          <div key={i} className="bg-slate-800 rounded-lg p-6 border border-slate-700 animate-pulse">
            <div className="h-4 bg-slate-700 rounded mb-3"></div>
            <div className="h-8 bg-slate-700 rounded mb-2"></div>
            <div className="h-3 bg-slate-700 rounded"></div>
          </div>
        ))}
      </div>
    );
  }

  return (
    <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
      {/* Latest Block */}
      <div className="bg-slate-800 rounded-lg p-6 border border-slate-700 hover:border-slate-600 transition-colors group">
        <div className="flex items-center justify-between mb-3">
          <div className="text-gray-400 text-xs font-medium uppercase tracking-wider">
            Latest Block
          </div>
          <div className="h-2 w-2 bg-green-500 rounded-full animate-pulse"></div>
        </div>
        <div className="text-2xl font-semibold text-white mb-1">
          #{stats?.latestBlock.toLocaleString() || '0'}
        </div>
        <div className="text-sm text-gray-400">
          Live from RPC
        </div>
      </div>

      {/* Gas Price */}
      <div className="bg-slate-800 rounded-lg p-6 border border-slate-700 hover:border-slate-600 transition-colors group">
        <div className="flex items-center justify-between mb-3">
          <div className="text-gray-400 text-xs font-medium uppercase tracking-wider">
            Gas Price
          </div>
          <svg className="h-4 w-4 text-gray-500" fill="none" viewBox="0 0 24 24" stroke="currentColor">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M13 10V3L4 14h7v7l9-11h-7z" />
          </svg>
        </div>
        <div className="text-2xl font-semibold text-white mb-1">
          {gasPriceLoading ? '...' : parseFloat(gasPrice || '0').toFixed(2)}
        </div>
        <div className="text-sm text-gray-400">
          Gwei
        </div>
      </div>

      {/* Chain ID */}
      <div className="bg-slate-800 rounded-lg p-6 border border-slate-700 hover:border-slate-600 transition-colors group">
        <div className="flex items-center justify-between mb-3">
          <div className="text-gray-400 text-xs font-medium uppercase tracking-wider">
            Chain ID
          </div>
          <svg className="h-4 w-4 text-gray-500" fill="none" viewBox="0 0 24 24" stroke="currentColor">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M13.828 10.172a4 4 0 00-5.656 0l-4 4a4 4 0 105.656 5.656l1.102-1.101m-.758-4.899a4 4 0 005.656 0l4-4a4 4 0 00-5.656-5.656l-1.1 1.1" />
          </svg>
        </div>
        <div className="text-2xl font-semibold text-white mb-1">
          {stats?.chainId || '65001'}
        </div>
        <div className="text-sm text-gray-400">
          NorChain
        </div>
      </div>

      {/* Network Status */}
      <div className="bg-slate-800 rounded-lg p-6 border border-slate-700 hover:border-slate-600 transition-colors group">
        <div className="flex items-center justify-between mb-3">
          <div className="text-gray-400 text-xs font-medium uppercase tracking-wider">
            Network Status
          </div>
          <svg className="h-4 w-4 text-green-500" fill="currentColor" viewBox="0 0 20 20">
            <path fillRule="evenodd" d="M10 18a8 8 0 100-16 8 8 0 000 16zm3.707-9.293a1 1 0 00-1.414-1.414L9 10.586 7.707 9.293a1 1 0 00-1.414 1.414l2 2a1 1 0 001.414 0l4-4z" clipRule="evenodd" />
          </svg>
        </div>
        <div className="text-2xl font-semibold text-green-400 mb-1">
          Online
        </div>
        <div className="text-sm text-gray-400">
          rpc.norchain.org
        </div>
      </div>
    </div>
  );
};

export default LiveStats;

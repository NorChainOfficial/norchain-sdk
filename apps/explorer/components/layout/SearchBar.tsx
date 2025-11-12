'use client';

import React, { useState, useEffect } from 'react';
import { getBlockchainService } from '@/lib/blockchain-service';
import { UniversalSearch } from '../search/UniversalSearch';

export const SearchBar = (): JSX.Element => {
  const [gasPrice, setGasPrice] = useState<string>('0');
  const [latestBlock, setLatestBlock] = useState<number>(0);
  const [loading, setLoading] = useState(true);
  const [isUpdating, setIsUpdating] = useState(false);

  // Fetch live blockchain stats
  useEffect(() => {
    const fetchStats = async () => {
      try {
        setIsUpdating(true);
        const service = getBlockchainService();
        const [gas, stats] = await Promise.all([
          service.getGasPrice(),
          service.getBlockchainStats(),
        ]);

        // Animate value changes
        setTimeout(() => {
          setGasPrice(gas);
          setLatestBlock(stats.latestBlock);
          setLoading(false);
          setIsUpdating(false);
        }, 300);
      } catch (error) {
        console.error('Error fetching blockchain stats:', error);
        setLoading(false);
        setIsUpdating(false);
      }
    };

    fetchStats();

    // Update stats every 12 seconds
    const interval = setInterval(fetchStats, 12000);

    return () => clearInterval(interval);
  }, []);

  return (
    <div className="bg-slate-950 border-b border-slate-800">
      <div className="max-w-[1400px] mx-auto px-6 py-3">
        <div className="flex items-center gap-6">
          {/* Universal Search */}
          <div className="flex-1 max-w-2xl">
            <UniversalSearch placeholder="Search by Address / Txn Hash / Block / Token..." />
          </div>

          {/* Live Stats */}
          <div className="hidden lg:flex items-center gap-4">
            {/* Gas Price */}
            <div className={`flex items-center gap-2 px-4 py-2 bg-slate-900/50 border border-slate-700 rounded-lg transition-all duration-300 ${isUpdating ? 'scale-105 border-orange-500/50' : ''}`}>
              <svg className={`w-4 h-4 text-orange-400 transition-transform duration-300 ${isUpdating ? 'rotate-180' : ''}`} fill="none" viewBox="0 0 24 24" stroke="currentColor">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M17.657 18.657A8 8 0 016.343 7.343S7 9 9 10c0-2 .5-5 2.986-7C14 5 16.09 5.777 17.656 7.343A7.975 7.975 0 0120 13a7.975 7.975 0 01-2.343 5.657z" />
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9.879 16.121A3 3 0 1012.015 11L11 14H9c0 .768.293 1.536.879 2.121z" />
              </svg>
              <span className="text-slate-400 text-xs font-medium">Gas:</span>
              {loading ? (
                <div className="h-4 w-12 bg-slate-700 animate-pulse rounded"></div>
              ) : (
                <span className="text-white text-sm font-bold tabular-nums transition-all duration-300">
                  {parseFloat(gasPrice).toFixed(2)} Gwei
                </span>
              )}
            </div>

            {/* Latest Block */}
            <div className={`flex items-center gap-2 px-4 py-2 bg-slate-900/50 border border-slate-700 rounded-lg transition-all duration-300 ${isUpdating ? 'scale-105 border-green-500/50' : ''}`}>
              <div className="relative">
                <div className="w-2 h-2 bg-green-400 rounded-full animate-pulse"></div>
                {isUpdating && (
                  <div className="absolute inset-0 w-2 h-2 bg-green-400 rounded-full animate-ping"></div>
                )}
              </div>
              <span className="text-slate-400 text-xs font-medium">Block:</span>
              {loading ? (
                <div className="h-4 w-16 bg-slate-700 animate-pulse rounded"></div>
              ) : (
                <span className="text-white text-sm font-bold font-mono tabular-nums transition-all duration-300">
                  {latestBlock.toLocaleString('en-US')}
                </span>
              )}
            </div>

            {/* Live Update Indicator */}
            <div className="flex items-center gap-1.5 px-3 py-1.5 bg-slate-900/30 border border-slate-700/50 rounded-lg">
              <div className={`w-1.5 h-1.5 rounded-full transition-all duration-300 ${isUpdating ? 'bg-indigo-400 animate-pulse' : 'bg-slate-600'}`}></div>
              <span className="text-slate-500 text-xs font-medium">
                {isUpdating ? 'Updating...' : 'Live'}
              </span>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

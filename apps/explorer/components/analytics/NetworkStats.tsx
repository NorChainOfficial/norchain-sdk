'use client';

import React, { useState, useEffect } from 'react';
import { apiClient } from '@/lib/api-client';
import { formatNumber, formatTimeAgo } from '@/lib/api-client';

interface NetworkStatsData {
  totalBlocks: number;
  totalTransactions: number;
  totalAccounts: number;
  totalContracts: number;
  totalTokens: number;
  averageBlockTime: number;
  averageGasPrice: string;
  totalGasUsed: string;
  networkHashRate?: string;
  difficulty?: string;
  lastUpdated: number;
}

export function NetworkStats(): JSX.Element {
  const [stats, setStats] = useState<NetworkStatsData | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [timeRange, setTimeRange] = useState<'24h' | '7d' | '30d'>('24h');

  useEffect(() => {
    const fetchStats = async () => {
      try {
        setLoading(true);
        setError(null);
        
        const data = await apiClient.getNetworkStatistics();
        
        // Transform API response to match our interface
        setStats({
          totalBlocks: data.totalBlocks || data.blocks || 0,
          totalTransactions: data.totalTransactions || data.transactions || 0,
          totalAccounts: data.totalAccounts || data.accounts || 0,
          totalContracts: data.totalContracts || data.contracts || 0,
          totalTokens: data.totalTokens || 0,
          averageBlockTime: data.averageBlockTime || data.avgBlockTime || 0,
          averageGasPrice: data.averageGasPrice || data.avgGasPrice || '0',
          totalGasUsed: data.totalGasUsed || data.gasUsed || '0',
          networkHashRate: data.networkHashRate,
          difficulty: data.difficulty,
          lastUpdated: Date.now(),
        });
      } catch (err: any) {
        setError(err.message || 'Failed to load network statistics');
      } finally {
        setLoading(false);
      }
    };

    fetchStats();
    const interval = setInterval(fetchStats, 30000); // Refresh every 30 seconds

    return () => clearInterval(interval);
  }, [timeRange]);

  if (loading && !stats) {
    return (
      <div className="bg-slate-800 rounded-lg border border-slate-700 p-6">
        <div className="animate-pulse space-y-4">
          <div className="h-6 bg-slate-700 rounded w-1/3"></div>
          <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
            {[...Array(4)].map((_, i) => (
              <div key={i} className="h-20 bg-slate-700 rounded"></div>
            ))}
          </div>
        </div>
      </div>
    );
  }

  if (error && !stats) {
    return (
      <div className="bg-red-900/20 border border-red-500/30 rounded-lg p-6">
        <p className="text-red-300">{error}</p>
      </div>
    );
  }

  if (!stats) return null;

  const statCards = [
    {
      label: 'Total Blocks',
      value: formatNumber(stats.totalBlocks),
      icon: (
        <svg className="w-6 h-6" fill="none" viewBox="0 0 24 24" stroke="currentColor">
          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M20 7l-8-4-8 4m16 0l-8 4m8-4v10l-8 4m0-10L4 7m8 4v10M4 7v10l8 4" />
        </svg>
      ),
      color: 'from-blue-500 to-cyan-500',
    },
    {
      label: 'Total Transactions',
      value: formatNumber(stats.totalTransactions),
      icon: (
        <svg className="w-6 h-6" fill="none" viewBox="0 0 24 24" stroke="currentColor">
          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M8 7h12m0 0l-4-4m4 4l-4 4m0 6H4m0 0l4 4m-4-4l4-4" />
        </svg>
      ),
      color: 'from-purple-500 to-pink-500',
    },
    {
      label: 'Total Accounts',
      value: formatNumber(stats.totalAccounts),
      icon: (
        <svg className="w-6 h-6" fill="none" viewBox="0 0 24 24" stroke="currentColor">
          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M17 20h5v-2a3 3 0 00-5.356-1.857M17 20H7m10 0v-2c0-.656-.126-1.283-.356-1.857M7 20H2v-2a3 3 0 015.356-1.857M7 20v-2c0-.656.126-1.283.356-1.857m0 0a5.002 5.002 0 019.288 0M15 7a3 3 0 11-6 0 3 3 0 016 0zm6 3a2 2 0 11-4 0 2 2 0 014 0zM7 10a2 2 0 11-4 0 2 2 0 014 0z" />
        </svg>
      ),
      color: 'from-green-500 to-emerald-500',
    },
    {
      label: 'Total Contracts',
      value: formatNumber(stats.totalContracts),
      icon: (
        <svg className="w-6 h-6" fill="none" viewBox="0 0 24 24" stroke="currentColor">
          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12h6m-6 4h6m2 5H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z" />
        </svg>
      ),
      color: 'from-orange-500 to-red-500',
    },
  ];

  return (
    <div className="bg-slate-800 rounded-lg border border-slate-700 p-6">
      <div className="flex items-center justify-between mb-6">
        <div>
          <h3 className="text-xl font-bold text-white mb-1">Network Statistics</h3>
          <p className="text-sm text-gray-400">
            Last updated {formatTimeAgo(Math.floor(stats.lastUpdated / 1000))}
          </p>
        </div>
        <div className="flex items-center gap-2">
          {(['24h', '7d', '30d'] as const).map((range) => (
            <button
              key={range}
              onClick={() => setTimeRange(range)}
              className={`px-3 py-1.5 rounded-lg text-sm font-medium transition-colors ${
                timeRange === range
                  ? 'bg-blue-600 text-white'
                  : 'bg-slate-700 text-gray-400 hover:bg-slate-600'
              }`}
            >
              {range}
            </button>
          ))}
        </div>
      </div>

      <div className="grid grid-cols-2 md:grid-cols-4 gap-4 mb-6">
        {statCards.map((card, index) => (
          <div
            key={card.label}
            className="bg-slate-900 rounded-lg border border-slate-700 p-4 hover:border-slate-600 transition-colors"
            style={{ animationDelay: `${index * 50}ms` }}
          >
            <div className={`inline-flex p-2 rounded-lg bg-gradient-to-br ${card.color} mb-3`}>
              <div className="text-white">{card.icon}</div>
            </div>
            <p className="text-gray-400 text-sm mb-1">{card.label}</p>
            <p className="text-2xl font-bold text-white">{card.value}</p>
          </div>
        ))}
      </div>

      <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
        <div className="bg-slate-900 rounded-lg border border-slate-700 p-4">
          <p className="text-gray-400 text-sm mb-1">Average Block Time</p>
          <p className="text-xl font-bold text-white">
            {stats.averageBlockTime.toFixed(2)}s
          </p>
        </div>
        <div className="bg-slate-900 rounded-lg border border-slate-700 p-4">
          <p className="text-gray-400 text-sm mb-1">Average Gas Price</p>
          <p className="text-xl font-bold text-white">
            {parseFloat(stats.averageGasPrice).toFixed(2)} Gwei
          </p>
        </div>
        <div className="bg-slate-900 rounded-lg border border-slate-700 p-4">
          <p className="text-gray-400 text-sm mb-1">Total Gas Used</p>
          <p className="text-xl font-bold text-white">
            {formatNumber(parseInt(stats.totalGasUsed) / 1e9)} Gwei
          </p>
        </div>
      </div>
    </div>
  );
}


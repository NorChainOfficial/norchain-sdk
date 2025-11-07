'use client';

import React, { useState, useEffect, useCallback } from 'react';
import Link from 'next/link';
import { ArrowLeft, Activity, TrendingUp, Zap, DollarSign, BarChart3, AlertCircle, CheckCircle2 } from 'lucide-react';

interface ArbitrageStats {
  readonly totalOpportunities: number;
  readonly todayOpportunities: number;
  readonly totalProfitUsd: string;
  readonly isRunning: boolean;
  readonly monitoredPairs: number;
  readonly minProfitThreshold: number;
}

interface ArbitrageOpportunity {
  readonly id: number;
  readonly pairA: string;
  readonly pairB: string;
  readonly pairC?: string;
  readonly priceA: string;
  readonly priceB: string;
  readonly priceC?: string;
  readonly profitPercentage: string;
  readonly estimatedProfitUsd: string;
  readonly arbitrageType: string;
  readonly status: string;
  readonly createdAt: string;
  readonly expiresAt: string;
}

export default function ArbitrageDashboard(): JSX.Element {
  const [stats, setStats] = useState<ArbitrageStats | null>(null);
  const [opportunities, setOpportunities] = useState<readonly ArbitrageOpportunity[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [filter, setFilter] = useState<'all' | 'simple' | 'triangular'>('all');

  const fetchData = useCallback(async () => {
    try {
      setLoading(true);
      setError(null);

      const API_BASE = process.env.NEXT_PUBLIC_API_URL || 'http://localhost:4000';

      const [statsRes, oppsRes] = await Promise.all([
        fetch(`${API_BASE}/api/arbitrage/stats`),
        fetch(`${API_BASE}/api/arbitrage/opportunities?limit=20`)
      ]);

      if (!statsRes.ok || !oppsRes.ok) {
        throw new Error('Failed to fetch arbitrage data');
      }

      const [statsData, oppsData] = await Promise.all([
        statsRes.json(),
        oppsRes.json()
      ]);

      setStats(statsData);
      setOpportunities(oppsData.opportunities || []);
    } catch (err) {
      console.error('Arbitrage data fetch error:', err);
      setError(err instanceof Error ? err.message : 'Failed to load arbitrage data');
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    fetchData();
    const interval = setInterval(fetchData, 15000); // Poll every 15 seconds
    return () => clearInterval(interval);
  }, [fetchData]);

  const getTypeColor = (type: string): string => {
    switch (type) {
      case 'simple':
        return 'text-blue-400 bg-blue-500/10 border-blue-500/20';
      case 'triangular':
        return 'text-purple-400 bg-purple-500/10 border-purple-500/20';
      case 'cross-chain':
        return 'text-green-400 bg-green-500/10 border-green-500/20';
      default:
        return 'text-gray-400 bg-gray-500/10 border-gray-500/20';
    }
  };

  const getStatusIcon = (status: string) => {
    switch (status) {
      case 'detected':
        return <AlertCircle className="h-5 w-5 text-yellow-400" />;
      case 'executed':
        return <CheckCircle2 className="h-5 w-5 text-green-400" />;
      case 'expired':
        return <AlertCircle className="h-5 w-5 text-gray-400" />;
      default:
        return null;
    }
  };

  const formatDate = (dateString: string): string => {
    try {
      const date = new Date(dateString);
      const now = new Date();
      const diff = now.getTime() - date.getTime();
      const minutes = Math.floor(diff / 60000);
      if (minutes < 1) return 'Just now';
      if (minutes < 60) return `${minutes}m ago`;
      const hours = Math.floor(minutes / 60);
      if (hours < 24) return `${hours}h ago`;
      return date.toLocaleDateString();
    } catch {
      return dateString;
    }
  };

  const filteredOpportunities = opportunities.filter(opp => {
    if (filter === 'all') return true;
    return opp.arbitrageType === filter;
  });

  if (loading && !stats) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-slate-950 via-slate-900 to-slate-950 p-8">
        <div className="max-w-7xl mx-auto">
          <div className="flex items-center justify-center h-96">
            <div className="text-center">
              <div className="inline-block h-12 w-12 animate-spin rounded-full border-4 border-solid border-purple-500 border-r-transparent"></div>
              <p className="mt-4 text-gray-400">Loading arbitrage data...</p>
            </div>
          </div>
        </div>
      </div>
    );
  }

  if (error) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-slate-950 via-slate-900 to-slate-950 p-8">
        <div className="max-w-7xl mx-auto">
          <div className="bg-red-500/10 border border-red-500/20 rounded-xl p-6">
            <div className="flex items-center space-x-3">
              <AlertCircle className="h-6 w-6 text-red-400" />
              <div>
                <h3 className="text-lg font-semibold text-red-400">Error Loading Data</h3>
                <p className="text-red-300 mt-1">{error}</p>
                <button
                  onClick={fetchData}
                  className="mt-4 h-10 px-4 bg-red-600 text-white rounded-lg hover:bg-red-700 transition-colors"
                >
                  Retry
                </button>
              </div>
            </div>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-950 via-slate-900 to-slate-950 p-8">
      <div className="max-w-7xl mx-auto">
        {/* Header */}
        <div className="flex items-center justify-between mb-8">
          <div className="flex items-center space-x-4">
            <Link
              href="/"
              className="flex items-center space-x-2 text-gray-400 hover:text-white transition-colors"
              aria-label="Back to home"
            >
              <ArrowLeft className="h-5 w-5" />
              <span>Back</span>
            </Link>
            <h1 className="text-3xl font-bold text-white">Arbitrage Monitor</h1>
          </div>

          {stats && (
            <div className="flex items-center space-x-2">
              <Activity className={`h-5 w-5 ${stats.isRunning ? 'text-green-400' : 'text-red-400'}`} />
              <span className={stats.isRunning ? 'text-green-400' : 'text-red-400'}>
                {stats.isRunning ? 'Scanner Active' : 'Scanner Offline'}
              </span>
            </div>
          )}
        </div>

        {/* Stats Cards */}
        {stats && (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6 mb-8">
            <div className="bg-slate-800/50 border border-slate-700 rounded-xl p-6">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-gray-400 text-sm">Total Opportunities</p>
                  <p className="text-2xl font-bold text-white mt-2">{stats.totalOpportunities}</p>
                </div>
                <Zap className="h-10 w-10 text-purple-400" />
              </div>
            </div>

            <div className="bg-slate-800/50 border border-slate-700 rounded-xl p-6">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-gray-400 text-sm">Today's Opportunities</p>
                  <p className="text-2xl font-bold text-blue-400 mt-2">{stats.todayOpportunities}</p>
                </div>
                <TrendingUp className="h-10 w-10 text-blue-400" />
              </div>
            </div>

            <div className="bg-slate-800/50 border border-slate-700 rounded-xl p-6">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-gray-400 text-sm">Total Profit (USD)</p>
                  <p className="text-2xl font-bold text-green-400 mt-2">
                    ${parseFloat(stats.totalProfitUsd || '0').toFixed(2)}
                  </p>
                </div>
                <DollarSign className="h-10 w-10 text-green-400" />
              </div>
            </div>

            <div className="bg-slate-800/50 border border-slate-700 rounded-xl p-6">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-gray-400 text-sm">Monitored Pairs</p>
                  <p className="text-2xl font-bold text-white mt-2">{stats.monitoredPairs}</p>
                </div>
                <BarChart3 className="h-10 w-10 text-yellow-400" />
              </div>
            </div>
          </div>
        )}

        {/* Filter Tabs */}
        <div className="bg-slate-800/50 border border-slate-700 rounded-xl p-4 mb-6">
          <div className="flex items-center space-x-4">
            <span className="text-gray-400 text-sm font-medium">Filter:</span>
            <button
              onClick={() => setFilter('all')}
              className={`px-4 py-2 rounded-lg font-medium transition-colors ${
                filter === 'all'
                  ? 'bg-purple-600 text-white'
                  : 'bg-slate-700 text-gray-300 hover:bg-slate-600'
              }`}
            >
              All ({opportunities.length})
            </button>
            <button
              onClick={() => setFilter('simple')}
              className={`px-4 py-2 rounded-lg font-medium transition-colors ${
                filter === 'simple'
                  ? 'bg-blue-600 text-white'
                  : 'bg-slate-700 text-gray-300 hover:bg-slate-600'
              }`}
            >
              Simple
            </button>
            <button
              onClick={() => setFilter('triangular')}
              className={`px-4 py-2 rounded-lg font-medium transition-colors ${
                filter === 'triangular'
                  ? 'bg-purple-600 text-white'
                  : 'bg-slate-700 text-gray-300 hover:bg-slate-600'
              }`}
            >
              Triangular
            </button>
          </div>
        </div>

        {/* Opportunities Table */}
        <div className="bg-slate-800/50 border border-slate-700 rounded-xl p-6">
          <div className="flex items-center justify-between mb-6">
            <h2 className="text-xl font-bold text-white">Active Opportunities</h2>
            <button
              onClick={fetchData}
              className="text-sm text-purple-400 hover:text-purple-300 transition-colors"
              aria-label="Refresh opportunities"
            >
              Refresh
            </button>
          </div>

          {filteredOpportunities.length === 0 ? (
            <div className="text-center py-12">
              <Zap className="h-12 w-12 text-gray-600 mx-auto mb-4" />
              <p className="text-gray-400">No active opportunities</p>
              <p className="text-gray-500 text-sm mt-2">Scanner is monitoring for profitable trades</p>
            </div>
          ) : (
            <div className="overflow-x-auto">
              <table className="w-full">
                <thead>
                  <tr className="border-b border-slate-700">
                    <th className="text-left py-3 px-4 text-gray-400 font-medium">Status</th>
                    <th className="text-left py-3 px-4 text-gray-400 font-medium">Type</th>
                    <th className="text-left py-3 px-4 text-gray-400 font-medium">Pairs</th>
                    <th className="text-left py-3 px-4 text-gray-400 font-medium">Profit %</th>
                    <th className="text-left py-3 px-4 text-gray-400 font-medium">Est. Profit (USD)</th>
                    <th className="text-left py-3 px-4 text-gray-400 font-medium">Detected</th>
                  </tr>
                </thead>
                <tbody>
                  {filteredOpportunities.map((opp) => (
                    <tr
                      key={opp.id}
                      className="border-b border-slate-700/50 hover:bg-slate-700/30 transition-colors"
                    >
                      <td className="py-4 px-4">
                        <div className="flex items-center space-x-2">
                          {getStatusIcon(opp.status)}
                          <span className="text-gray-300 capitalize">{opp.status}</span>
                        </div>
                      </td>
                      <td className="py-4 px-4">
                        <span className={`px-3 py-1 rounded-full text-xs font-semibold border ${getTypeColor(opp.arbitrageType)}`}>
                          {opp.arbitrageType}
                        </span>
                      </td>
                      <td className="py-4 px-4">
                        <div className="text-sm">
                          <span className="text-blue-400">{opp.pairA}</span>
                          <span className="text-gray-500"> → </span>
                          <span className="text-purple-400">{opp.pairB}</span>
                          {opp.pairC && (
                            <>
                              <span className="text-gray-500"> → </span>
                              <span className="text-green-400">{opp.pairC}</span>
                            </>
                          )}
                        </div>
                      </td>
                      <td className="py-4 px-4">
                        <span className="text-green-400 font-bold">
                          +{parseFloat(opp.profitPercentage).toFixed(2)}%
                        </span>
                      </td>
                      <td className="py-4 px-4 text-white font-semibold">
                        ${parseFloat(opp.estimatedProfitUsd).toFixed(2)}
                      </td>
                      <td className="py-4 px-4 text-gray-400 text-sm">{formatDate(opp.createdAt)}</td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          )}
        </div>

        {/* Info Banner */}
        <div className="mt-6 bg-purple-500/10 border border-purple-500/20 rounded-xl p-4">
          <div className="flex items-start space-x-3">
            <Zap className="h-5 w-5 text-purple-400 mt-0.5" />
            <div>
              <h3 className="text-purple-400 font-semibold">Automated Arbitrage Detection</h3>
              <p className="text-purple-300/80 text-sm mt-1">
                The scanner continuously monitors price differences across trading pairs to identify profitable arbitrage opportunities in real-time.
              </p>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}

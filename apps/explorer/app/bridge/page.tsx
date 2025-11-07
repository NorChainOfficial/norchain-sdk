'use client';

import React, { useState, useEffect, useCallback } from 'react';
import Link from 'next/link';
import { ArrowLeft, Activity, CheckCircle, XCircle, Clock, TrendingUp, ArrowRightLeft } from 'lucide-react';

interface RelayerStatus {
  readonly isRunning: boolean;
  readonly monitoredChains: readonly string[];
  readonly lastCheck: string;
}

interface BridgeStats {
  readonly totalTransfers: number;
  readonly pendingTransfers: number;
  readonly confirmedTransfers: number;
  readonly failedTransfers: number;
  readonly totalVolume: string;
  readonly successRate: number;
}

interface BridgeTransfer {
  readonly id: string;
  readonly fillId: string;
  readonly chainId: number;
  readonly trader: string;
  readonly norDelta: string;
  readonly status: 'pending' | 'confirmed' | 'failed';
  readonly blockNumber: string;
  readonly transactionHash: string;
  readonly createdAt: string;
}

export default function BridgeMonitorPage(): JSX.Element {
  const [status, setStatus] = useState<RelayerStatus | null>(null);
  const [stats, setStats] = useState<BridgeStats | null>(null);
  const [transfers, setTransfers] = useState<readonly BridgeTransfer[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  const fetchBridgeData = useCallback(async () => {
    try {
      setLoading(true);
      setError(null);

      const API_BASE = process.env.NEXT_PUBLIC_API_URL || 'http://localhost:4000';

      // Fetch all data in parallel
      const [statusRes, statsRes, transfersRes] = await Promise.all([
        fetch(`${API_BASE}/api/bridge/status`),
        fetch(`${API_BASE}/api/bridge/stats`),
        fetch(`${API_BASE}/api/bridge/transfers?limit=10`)
      ]);

      if (!statusRes.ok || !statsRes.ok || !transfersRes.ok) {
        throw new Error('Failed to fetch bridge data');
      }

      const [statusData, statsData, transfersData] = await Promise.all([
        statusRes.json(),
        statsRes.json(),
        transfersRes.json()
      ]);

      setStatus(statusData);
      setStats(statsData);
      setTransfers(transfersData.transfers || []);
    } catch (err) {
      console.error('Bridge data fetch error:', err);
      setError(err instanceof Error ? err.message : 'Failed to load bridge data');
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    fetchBridgeData();

    // Poll for updates every 30 seconds
    const interval = setInterval(fetchBridgeData, 30000);
    return () => clearInterval(interval);
  }, [fetchBridgeData]);

  const getStatusColor = (status: string): string => {
    switch (status) {
      case 'confirmed':
        return 'text-green-400';
      case 'pending':
        return 'text-yellow-400';
      case 'failed':
        return 'text-red-400';
      default:
        return 'text-gray-400';
    }
  };

  const getStatusIcon = (transferStatus: string) => {
    switch (transferStatus) {
      case 'confirmed':
        return <CheckCircle className="h-5 w-5 text-green-400" />;
      case 'pending':
        return <Clock className="h-5 w-5 text-yellow-400" />;
      case 'failed':
        return <XCircle className="h-5 w-5 text-red-400" />;
      default:
        return null;
    }
  };

  const formatAddress = (address: string): string => {
    return `${address.slice(0, 6)}...${address.slice(-4)}`;
  };

  const formatAmount = (amount: string): string => {
    try {
      const value = BigInt(amount);
      const formatted = (Number(value) / 1e18).toFixed(4);
      return formatted;
    } catch {
      return '0.0000';
    }
  };

  const formatDate = (dateString: string): string => {
    try {
      return new Date(dateString).toLocaleString();
    } catch {
      return dateString;
    }
  };

  if (loading && !status) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-slate-950 via-slate-900 to-slate-950 p-8">
        <div className="max-w-7xl mx-auto">
          <div className="flex items-center justify-center h-96">
            <div className="text-center">
              <div className="inline-block h-12 w-12 animate-spin rounded-full border-4 border-solid border-blue-500 border-r-transparent"></div>
              <p className="mt-4 text-gray-400">Loading bridge data...</p>
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
              <XCircle className="h-6 w-6 text-red-400" />
              <div>
                <h3 className="text-lg font-semibold text-red-400">Error Loading Bridge Data</h3>
                <p className="text-red-300 mt-1">{error}</p>
                <button
                  onClick={fetchBridgeData}
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
            <h1 className="text-3xl font-bold text-white">Bridge Monitor</h1>
          </div>

          {status && (
            <div className="flex items-center space-x-2">
              <Activity className={`h-5 w-5 ${status.isRunning ? 'text-green-400' : 'text-red-400'}`} />
              <span className={status.isRunning ? 'text-green-400' : 'text-red-400'}>
                {status.isRunning ? 'Relayer Active' : 'Relayer Offline'}
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
                  <p className="text-gray-400 text-sm">Total Transfers</p>
                  <p className="text-2xl font-bold text-white mt-2">{stats.totalTransfers}</p>
                </div>
                <ArrowRightLeft className="h-10 w-10 text-blue-400" />
              </div>
            </div>

            <div className="bg-slate-800/50 border border-slate-700 rounded-xl p-6">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-gray-400 text-sm">Success Rate</p>
                  <p className="text-2xl font-bold text-green-400 mt-2">{stats.successRate.toFixed(1)}%</p>
                </div>
                <TrendingUp className="h-10 w-10 text-green-400" />
              </div>
            </div>

            <div className="bg-slate-800/50 border border-slate-700 rounded-xl p-6">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-gray-400 text-sm">Pending</p>
                  <p className="text-2xl font-bold text-yellow-400 mt-2">{stats.pendingTransfers}</p>
                </div>
                <Clock className="h-10 w-10 text-yellow-400" />
              </div>
            </div>

            <div className="bg-slate-800/50 border border-slate-700 rounded-xl p-6">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-gray-400 text-sm">Total Volume</p>
                  <p className="text-2xl font-bold text-white mt-2">{formatAmount(stats.totalVolume)} NOR</p>
                </div>
                <ArrowRightLeft className="h-10 w-10 text-purple-400" />
              </div>
            </div>
          </div>
        )}

        {/* Relayer Status */}
        {status && (
          <div className="bg-slate-800/50 border border-slate-700 rounded-xl p-6 mb-8">
            <h2 className="text-xl font-bold text-white mb-4">Relayer Status</h2>
            <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
              <div>
                <p className="text-gray-400 text-sm mb-2">Status</p>
                <div className="flex items-center space-x-2">
                  <div className={`h-3 w-3 rounded-full ${status.isRunning ? 'bg-green-400' : 'bg-red-400'}`} />
                  <span className="text-white">{status.isRunning ? 'Running' : 'Stopped'}</span>
                </div>
              </div>
              <div>
                <p className="text-gray-400 text-sm mb-2">Monitored Chains</p>
                <p className="text-white">{status.monitoredChains.length} chains</p>
              </div>
              <div>
                <p className="text-gray-400 text-sm mb-2">Last Check</p>
                <p className="text-white">{formatDate(status.lastCheck)}</p>
              </div>
            </div>
          </div>
        )}

        {/* Recent Transfers */}
        <div className="bg-slate-800/50 border border-slate-700 rounded-xl p-6">
          <div className="flex items-center justify-between mb-6">
            <h2 className="text-xl font-bold text-white">Recent Transfers</h2>
            <button
              onClick={fetchBridgeData}
              className="text-sm text-blue-400 hover:text-blue-300 transition-colors"
              aria-label="Refresh transfers"
            >
              Refresh
            </button>
          </div>

          {transfers.length === 0 ? (
            <div className="text-center py-12">
              <ArrowRightLeft className="h-12 w-12 text-gray-600 mx-auto mb-4" />
              <p className="text-gray-400">No transfers yet</p>
            </div>
          ) : (
            <div className="overflow-x-auto">
              <table className="w-full">
                <thead>
                  <tr className="border-b border-slate-700">
                    <th className="text-left py-3 px-4 text-gray-400 font-medium">Status</th>
                    <th className="text-left py-3 px-4 text-gray-400 font-medium">Chain</th>
                    <th className="text-left py-3 px-4 text-gray-400 font-medium">Trader</th>
                    <th className="text-left py-3 px-4 text-gray-400 font-medium">Amount</th>
                    <th className="text-left py-3 px-4 text-gray-400 font-medium">Tx Hash</th>
                    <th className="text-left py-3 px-4 text-gray-400 font-medium">Time</th>
                  </tr>
                </thead>
                <tbody>
                  {transfers.map((transfer) => (
                    <tr
                      key={transfer.id}
                      className="border-b border-slate-700/50 hover:bg-slate-700/30 transition-colors"
                    >
                      <td className="py-4 px-4">
                        <div className="flex items-center space-x-2">
                          {getStatusIcon(transfer.status)}
                          <span className={getStatusColor(transfer.status)}>{transfer.status}</span>
                        </div>
                      </td>
                      <td className="py-4 px-4 text-white">{transfer.chainId}</td>
                      <td className="py-4 px-4">
                        <code className="text-blue-400 text-sm">{formatAddress(transfer.trader)}</code>
                      </td>
                      <td className="py-4 px-4 text-white">{formatAmount(transfer.norDelta)} NOR</td>
                      <td className="py-4 px-4">
                        <code className="text-purple-400 text-sm">{formatAddress(transfer.transactionHash)}</code>
                      </td>
                      <td className="py-4 px-4 text-gray-400 text-sm">{formatDate(transfer.createdAt)}</td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          )}
        </div>
      </div>
    </div>
  );
}

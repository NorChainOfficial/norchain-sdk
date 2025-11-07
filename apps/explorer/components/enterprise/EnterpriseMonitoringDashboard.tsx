'use client';

import React, { useState, useEffect, useCallback } from 'react';
import { getApiClient } from '@/lib/api-client-v2';
import type { CircuitBreakerStats, CacheStats, RetryStats } from '@/lib/types/api';

export const EnterpriseMonitoringDashboard = (): JSX.Element => {
  const [stats, setStats] = useState<{
    circuitBreaker: CircuitBreakerStats;
    cache: CacheStats;
    retry: RetryStats;
  } | null>(null);
  const [loading, setLoading] = useState(true);
  const [autoRefresh, setAutoRefresh] = useState(true);

  const api = getApiClient();

  const loadStats = useCallback(() => {
    try {
      const currentStats = api.getStats();
      setStats(currentStats as any); // TODO: Fix type mismatch between stats interfaces
      setLoading(false);
    } catch (err) {
      console.error('Failed to load stats:', err);
      setLoading(false);
    }
  }, [api]);

  useEffect(() => {
    loadStats();

    if (autoRefresh) {
      const interval = setInterval(loadStats, 2000);
      return () => clearInterval(interval);
    }
  }, [loadStats, autoRefresh]);

  const getStateColor = (state: string): string => {
    switch (state) {
      case 'CLOSED':
        return 'bg-green-100 text-green-800 border-green-300';
      case 'HALF_OPEN':
        return 'bg-yellow-100 text-yellow-800 border-yellow-300';
      case 'OPEN':
        return 'bg-red-100 text-red-800 border-red-300';
      default:
        return 'bg-gray-100 text-gray-800 border-gray-300';
    }
  };

  const getSuccessRateColor = (rate: number): string => {
    if (rate >= 95) return 'text-green-600';
    if (rate >= 80) return 'text-yellow-600';
    return 'text-red-600';
  };

  const getHitRateColor = (rate: number): string => {
    if (rate >= 70) return 'text-green-600';
    if (rate >= 40) return 'text-yellow-600';
    return 'text-red-600';
  };

  if (loading || !stats) {
    return (
      <div className="p-8 bg-white rounded-xl shadow-lg">
        <div className="flex items-center justify-center py-12">
          <div className="text-center">
            <svg className="animate-spin h-16 w-16 mx-auto text-blue-600" viewBox="0 0 24 24">
              <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4" fill="none" />
              <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z" />
            </svg>
            <p className="mt-4 text-xl font-semibold text-gray-900">Loading monitoring data...</p>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="p-6 bg-gradient-to-r from-indigo-600 to-purple-600 rounded-xl shadow-lg text-white">
        <div className="flex items-center justify-between">
          <div>
            <h2 className="text-2xl font-bold">Enterprise Monitoring Dashboard</h2>
            <p className="text-indigo-100 mt-1">Real-time infrastructure health & performance metrics</p>
          </div>
          <div className="flex items-center space-x-4">
            <button
              onClick={() => setAutoRefresh(!autoRefresh)}
              className={`h-12 px-6 ${autoRefresh ? 'bg-white bg-opacity-20' : 'bg-white bg-opacity-10'} hover:bg-opacity-30 text-white font-medium rounded-lg transition-all backdrop-blur-sm flex items-center space-x-2`}
            >
              <div className={`h-2 w-2 rounded-full ${autoRefresh ? 'bg-green-400 animate-pulse' : 'bg-gray-400'}`} />
              <span>{autoRefresh ? 'Auto-refresh ON' : 'Auto-refresh OFF'}</span>
            </button>
            <button
              onClick={loadStats}
              className="h-12 px-6 bg-white bg-opacity-20 hover:bg-opacity-30 text-white font-medium rounded-lg transition-all backdrop-blur-sm"
              aria-label="Refresh stats"
            >
              <svg className="h-5 w-5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 4v5h.582m15.356 2A8.001 8.001 0 004.582 9m0 0H9m11 11v-5h-.581m0 0a8.003 8.003 0 01-15.357-2m15.357 2H15" />
              </svg>
            </button>
          </div>
        </div>
      </div>

      {/* Circuit Breaker Status */}
      <div className="bg-white rounded-xl shadow-lg overflow-hidden">
        <div className="p-6 bg-gradient-to-r from-blue-50 to-indigo-50 border-b-2 border-indigo-200">
          <div className="flex items-center justify-between">
            <div className="flex items-center space-x-4">
              <div className="h-14 w-14 bg-gradient-to-br from-blue-600 to-indigo-600 rounded-xl flex items-center justify-center text-white shadow-md">
                <svg className="h-8 w-8" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12l2 2 4-4m5.618-4.016A11.955 11.955 0 0112 2.944a11.955 11.955 0 01-8.618 3.04A12.02 12.02 0 003 9c0 5.591 3.824 10.29 9 11.622 5.176-1.332 9-6.03 9-11.622 0-1.042-.133-2.052-.382-3.016z" />
                </svg>
              </div>
              <div>
                <h3 className="text-xl font-bold text-gray-900">Circuit Breaker</h3>
                <p className="text-gray-600">Failure protection & automatic recovery</p>
              </div>
            </div>
            <div className={`px-6 py-3 rounded-xl border-2 font-bold text-xl ${getStateColor(stats.circuitBreaker.state)}`}>
              {stats.circuitBreaker.state}
            </div>
          </div>
        </div>

        <div className="p-6">
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
            <div className="p-4 bg-gray-50 rounded-lg">
              <div className="text-sm text-gray-600 mb-2">Success Rate</div>
              <div className={`text-3xl font-bold ${getSuccessRateColor(stats.circuitBreaker.success_rate)}`}>
                {stats.circuitBreaker.success_rate.toFixed(1)}%
              </div>
            </div>

            <div className="p-4 bg-gray-50 rounded-lg">
              <div className="text-sm text-gray-600 mb-2">Total Requests</div>
              <div className="text-3xl font-bold text-gray-900">
                {stats.circuitBreaker.total_requests.toLocaleString()}
              </div>
            </div>

            <div className="p-4 bg-gray-50 rounded-lg">
              <div className="text-sm text-gray-600 mb-2">Successful</div>
              <div className="text-3xl font-bold text-green-600">
                {stats.circuitBreaker.success_count.toLocaleString()}
              </div>
            </div>

            <div className="p-4 bg-gray-50 rounded-lg">
              <div className="text-sm text-gray-600 mb-2">Failures</div>
              <div className="text-3xl font-bold text-red-600">
                {stats.circuitBreaker.failure_count.toLocaleString()}
              </div>
            </div>
          </div>

          {stats.circuitBreaker.last_failure_time && (
            <div className="mt-4 p-4 bg-red-50 border-2 border-red-200 rounded-lg">
              <div className="text-sm text-red-600 font-medium">Last Failure</div>
              <div className="text-sm text-red-800 mt-1">
                {new Date(stats.circuitBreaker.last_failure_time).toLocaleString()}
              </div>
            </div>
          )}

          {stats.circuitBreaker.next_attempt_time && (
            <div className="mt-4 p-4 bg-yellow-50 border-2 border-yellow-200 rounded-lg">
              <div className="text-sm text-yellow-600 font-medium">Next Attempt</div>
              <div className="text-sm text-yellow-800 mt-1">
                {new Date(stats.circuitBreaker.next_attempt_time).toLocaleString()}
              </div>
            </div>
          )}
        </div>
      </div>

      {/* Cache Statistics */}
      <div className="bg-white rounded-xl shadow-lg overflow-hidden">
        <div className="p-6 bg-gradient-to-r from-purple-50 to-pink-50 border-b-2 border-purple-200">
          <div className="flex items-center space-x-4">
            <div className="h-14 w-14 bg-gradient-to-br from-purple-600 to-pink-600 rounded-xl flex items-center justify-center text-white shadow-md">
              <svg className="h-8 w-8" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 8h14M5 8a2 2 0 110-4h14a2 2 0 110 4M5 8v10a2 2 0 002 2h10a2 2 0 002-2V8m-9 4h4" />
              </svg>
            </div>
            <div className="flex-1">
              <h3 className="text-xl font-bold text-gray-900">Cache Manager</h3>
              <p className="text-gray-600">Response caching & performance optimization</p>
            </div>
            <div className="text-right">
              <div className="text-sm text-gray-600">Cache Size</div>
              <div className="text-2xl font-bold text-purple-600">
                {stats.cache.size} / {stats.cache.max_size}
              </div>
            </div>
          </div>
        </div>

        <div className="p-6">
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
            <div className="p-4 bg-gray-50 rounded-lg">
              <div className="text-sm text-gray-600 mb-2">Hit Rate</div>
              <div className={`text-3xl font-bold ${getHitRateColor(stats.cache.hit_rate)}`}>
                {stats.cache.hit_rate.toFixed(1)}%
              </div>
            </div>

            <div className="p-4 bg-gray-50 rounded-lg">
              <div className="text-sm text-gray-600 mb-2">Cache Hits</div>
              <div className="text-3xl font-bold text-green-600">
                {stats.cache.hits.toLocaleString()}
              </div>
            </div>

            <div className="p-4 bg-gray-50 rounded-lg">
              <div className="text-sm text-gray-600 mb-2">Cache Misses</div>
              <div className="text-3xl font-bold text-yellow-600">
                {stats.cache.misses.toLocaleString()}
              </div>
            </div>

            <div className="p-4 bg-gray-50 rounded-lg">
              <div className="text-sm text-gray-600 mb-2">Evictions</div>
              <div className="text-3xl font-bold text-red-600">
                {stats.cache.evictions.toLocaleString()}
              </div>
            </div>
          </div>

          {/* Cache utilization bar */}
          <div className="mt-6">
            <div className="flex items-center justify-between mb-2">
              <span className="text-sm text-gray-600">Cache Utilization</span>
              <span className="text-sm font-semibold text-gray-900">
                {((stats.cache.size / stats.cache.max_size) * 100).toFixed(1)}%
              </span>
            </div>
            <div className="h-4 bg-gray-200 rounded-full overflow-hidden">
              <div
                className="h-full bg-gradient-to-r from-purple-600 to-pink-600 transition-all"
                style={{ width: `${(stats.cache.size / stats.cache.max_size) * 100}%` }}
              />
            </div>
          </div>
        </div>
      </div>

      {/* Retry Handler Statistics */}
      <div className="bg-white rounded-xl shadow-lg overflow-hidden">
        <div className="p-6 bg-gradient-to-r from-green-50 to-teal-50 border-b-2 border-green-200">
          <div className="flex items-center space-x-4">
            <div className="h-14 w-14 bg-gradient-to-br from-green-600 to-teal-600 rounded-xl flex items-center justify-center text-white shadow-md">
              <svg className="h-8 w-8" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 4v5h.582m15.356 2A8.001 8.001 0 004.582 9m0 0H9m11 11v-5h-.581m0 0a8.003 8.003 0 01-15.357-2m15.357 2H15" />
              </svg>
            </div>
            <div>
              <h3 className="text-xl font-bold text-gray-900">Retry Handler</h3>
              <p className="text-gray-600">Automatic retry with exponential backoff</p>
            </div>
          </div>
        </div>

        <div className="p-6">
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
            <div className="p-4 bg-gray-50 rounded-lg">
              <div className="text-sm text-gray-600 mb-2">Avg Attempts</div>
              <div className="text-3xl font-bold text-blue-600">
                {stats.retry.average_attempts.toFixed(2)}
              </div>
            </div>

            <div className="p-4 bg-gray-50 rounded-lg">
              <div className="text-sm text-gray-600 mb-2">Total Attempts</div>
              <div className="text-3xl font-bold text-gray-900">
                {stats.retry.total_attempts.toLocaleString()}
              </div>
            </div>

            <div className="p-4 bg-gray-50 rounded-lg">
              <div className="text-sm text-gray-600 mb-2">Successful Retries</div>
              <div className="text-3xl font-bold text-green-600">
                {stats.retry.successful_retries.toLocaleString()}
              </div>
            </div>

            <div className="p-4 bg-gray-50 rounded-lg">
              <div className="text-sm text-gray-600 mb-2">Failed Retries</div>
              <div className="text-3xl font-bold text-red-600">
                {stats.retry.failed_retries.toLocaleString()}
              </div>
            </div>
          </div>

          {/* Success rate visualization */}
          {stats.retry.total_attempts > 0 && (
            <div className="mt-6">
              <div className="flex items-center justify-between mb-2">
                <span className="text-sm text-gray-600">Retry Success Rate</span>
                <span className="text-sm font-semibold text-gray-900">
                  {((stats.retry.successful_retries / (stats.retry.successful_retries + stats.retry.failed_retries)) * 100).toFixed(1)}%
                </span>
              </div>
              <div className="h-4 bg-gray-200 rounded-full overflow-hidden flex">
                <div
                  className="h-full bg-green-600"
                  style={{
                    width: `${(stats.retry.successful_retries / (stats.retry.successful_retries + stats.retry.failed_retries)) * 100}%`,
                  }}
                />
                <div
                  className="h-full bg-red-600"
                  style={{
                    width: `${(stats.retry.failed_retries / (stats.retry.successful_retries + stats.retry.failed_retries)) * 100}%`,
                  }}
                />
              </div>
            </div>
          )}
        </div>
      </div>

      {/* Quick Actions */}
      <div className="bg-white p-6 rounded-xl shadow-lg">
        <h3 className="text-lg font-bold text-gray-900 mb-4">Quick Actions</h3>
        <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
          <button
            onClick={() => {
              api.clearCache();
              loadStats();
            }}
            className="h-14 px-6 bg-purple-600 text-white font-medium rounded-lg hover:bg-purple-700 focus:outline-none focus:ring-2 focus:ring-purple-500 focus:ring-offset-2 transition-colors shadow-md flex items-center justify-center space-x-2"
          >
            <svg className="h-5 w-5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 7l-.867 12.142A2 2 0 0116.138 21H7.862a2 2 0 01-1.995-1.858L5 7m5 4v6m4-6v6m1-10V4a1 1 0 00-1-1h-4a1 1 0 00-1 1v3M4 7h16" />
            </svg>
            <span>Clear Cache</span>
          </button>

          <button
            onClick={() => {
              api.resetCircuitBreaker();
              loadStats();
            }}
            className="h-14 px-6 bg-blue-600 text-white font-medium rounded-lg hover:bg-blue-700 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:ring-offset-2 transition-colors shadow-md flex items-center justify-center space-x-2"
          >
            <svg className="h-5 w-5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 4v5h.582m15.356 2A8.001 8.001 0 004.582 9m0 0H9m11 11v-5h-.581m0 0a8.003 8.003 0 01-15.357-2m15.357 2H15" />
            </svg>
            <span>Reset Circuit Breaker</span>
          </button>

          <button
            onClick={() => {
              api.forceCircuitBreakerOpen();
              loadStats();
            }}
            className="h-14 px-6 bg-red-600 text-white font-medium rounded-lg hover:bg-red-700 focus:outline-none focus:ring-2 focus:ring-red-500 focus:ring-offset-2 transition-colors shadow-md flex items-center justify-center space-x-2"
          >
            <svg className="h-5 w-5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 9v2m0 4h.01m-6.938 4h13.856c1.54 0 2.502-1.667 1.732-3L13.732 4c-.77-1.333-2.694-1.333-3.464 0L3.34 16c-.77 1.333.192 3 1.732 3z" />
            </svg>
            <span>Force Open (Maintenance)</span>
          </button>
        </div>
      </div>
    </div>
  );
};

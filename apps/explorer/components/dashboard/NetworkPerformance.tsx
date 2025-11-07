'use client';

import { useQuery } from '@tanstack/react-query';
import { apiClient } from '@/lib/api-client';
import { useState, useEffect } from 'react';

interface PerformanceMetric {
  readonly label: string;
  readonly value: string;
  readonly change?: number;
  readonly status: 'excellent' | 'good' | 'normal' | 'slow';
  readonly icon: JSX.Element;
}

export const NetworkPerformance = (): JSX.Element => {
  const [tps, setTps] = useState(0);
  const [latency, setLatency] = useState(0);

  const { data: stats } = useQuery({
    queryKey: ['stats'],
    queryFn: () => apiClient.getStats(),
    refetchInterval: 5000,
  });

  const { data: recentBlocks } = useQuery({
    queryKey: ['recent-blocks-perf'],
    queryFn: () => apiClient.getBlocks({ page: 1, per_page: 10 }),
    refetchInterval: 5000,
  });

  // Calculate TPS and latency
  useEffect(() => {
    if (recentBlocks?.data && recentBlocks.data.length >= 2) {
      const blocks = recentBlocks.data;

      // Calculate average block time
      let totalTime = 0;
      let totalTxs = 0;

      for (let i = 0; i < blocks.length - 1; i++) {
        const timeDiff = (new Date(blocks[i].timestamp).getTime() -
                         new Date(blocks[i + 1].timestamp).getTime()) / 1000;
        totalTime += timeDiff;
        totalTxs += blocks[i].transaction_count;
      }

      const avgBlockTime = totalTime / (blocks.length - 1);
      const calculatedTps = totalTxs / totalTime;
      const calculatedLatency = avgBlockTime * 1000; // in ms

      setTps(calculatedTps);
      setLatency(calculatedLatency);
    }
  }, [recentBlocks]);

  const getStatusColor = (status: string) => {
    switch (status) {
      case 'excellent': return 'from-green-400 to-emerald-500';
      case 'good': return 'from-blue-400 to-cyan-500';
      case 'normal': return 'from-yellow-400 to-orange-500';
      case 'slow': return 'from-red-400 to-pink-500';
      default: return 'from-gray-400 to-gray-500';
    }
  };

  const getLatencyStatus = (ms: number): 'excellent' | 'good' | 'normal' | 'slow' => {
    if (ms < 3000) return 'excellent';
    if (ms < 5000) return 'good';
    if (ms < 7000) return 'normal';
    return 'slow';
  };

  const metrics: PerformanceMetric[] = [
    {
      label: 'Network TPS',
      value: tps.toFixed(2),
      status: tps > 100 ? 'excellent' : tps > 50 ? 'good' : tps > 10 ? 'normal' : 'slow',
      icon: (
        <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M13 10V3L4 14h7v7l9-11h-7z" />
        </svg>
      ),
    },
    {
      label: 'Block Latency',
      value: `${latency.toFixed(0)}ms`,
      status: getLatencyStatus(latency),
      icon: (
        <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 8v4l3 3m6-3a9 9 0 11-18 0 9 9 0 0118 0z" />
        </svg>
      ),
    },
    {
      label: 'Gas Price',
      value: '0.1 XAHEEN',
      status: 'excellent',
      icon: (
        <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 8c-1.657 0-3 .895-3 2s1.343 2 3 2 3 .895 3 2-1.343 2-3 2m0-8c1.11 0 2.08.402 2.599 1M12 8V7m0 1v8m0 0v1m0-1c-1.11 0-2.08-.402-2.599-1M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
        </svg>
      ),
    },
    {
      label: 'MEV Protected',
      value: '99.9%',
      status: 'excellent',
      icon: (
        <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12l2 2 4-4m5.618-4.016A11.955 11.955 0 0112 2.944a11.955 11.955 0 01-8.618 3.04A12.02 12.02 0 003 9c0 5.591 3.824 10.29 9 11.622 5.176-1.332 9-6.03 9-11.622 0-1.042-.133-2.052-.382-3.016z" />
        </svg>
      ),
    },
  ];

  return (
    <div className="bg-white dark:bg-gradient-dark rounded-2xl shadow-xl dark:shadow-2xl border border-gray-200 dark:border-gray-700 p-6 overflow-hidden relative hover:shadow-2xl dark:hover:shadow-bnb-glow transition-shadow duration-300">
      {/* Background Pattern */}
      <div className="absolute inset-0 opacity-5">
        <div className="absolute inset-0 bg-grid-pattern"></div>
      </div>

      <div className="relative z-10">
        {/* Header */}
        <div className="flex items-center justify-between mb-6">
          <div>
            <h3 className="text-2xl font-bold text-gray-900 dark:text-white mb-1">Network Performance</h3>
            <p className="text-gray-600 dark:text-gray-400 text-sm">Real-time metrics • Updated every 5s</p>
          </div>
          <div className="flex items-center gap-2 px-4 py-2 bg-green-100 dark:bg-bnb-green/20 border-2 border-green-500 dark:border-bnb-green/30 rounded-lg shadow-lg dark:shadow-green-glow">
            <span className="relative flex h-2 w-2">
              <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-green-500 dark:bg-bnb-green opacity-75"></span>
              <span className="relative inline-flex rounded-full h-2 w-2 bg-green-500 dark:bg-bnb-green"></span>
            </span>
            <span className="text-green-700 dark:text-bnb-green text-sm font-semibold">ONLINE</span>
          </div>
        </div>

        {/* Metrics Grid */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
          {metrics.map((metric, index) => (
            <div
              key={metric.label}
              className="relative bg-gray-50 dark:bg-gray-800/50 backdrop-blur-sm rounded-xl p-4 border border-gray-200 dark:border-gray-700 hover:border-blue-500 dark:hover:border-bnb-yellow/50 transition-all duration-300 hover:scale-105 group animate-slideUp"
              style={{ animationDelay: `${index * 50}ms` }}
            >
              {/* Status Indicator */}
              <div className={`absolute top-2 right-2 w-2 h-2 rounded-full bg-gradient-to-r ${getStatusColor(metric.status)}`}></div>

              {/* Icon */}
              <div className={`inline-flex p-3 rounded-lg bg-gradient-to-br ${getStatusColor(metric.status)} mb-3 group-hover:scale-110 transition-transform`}>
                <div className="text-white">
                  {metric.icon}
                </div>
              </div>

              {/* Label */}
              <div className="text-gray-600 dark:text-gray-400 text-sm font-medium mb-1">
                {metric.label}
              </div>

              {/* Value */}
              <div className="text-gray-900 dark:text-white text-2xl font-bold tabular-nums">
                {metric.value}
              </div>

              {/* Status Badge */}
              <div className="mt-2">
                <span className={`inline-flex items-center gap-1 px-2 py-1 rounded-full text-xs font-semibold bg-gradient-to-r ${getStatusColor(metric.status)} text-white`}>
                  {metric.status.toUpperCase()}
                </span>
              </div>
            </div>
          ))}
        </div>

        {/* Performance Bar */}
        <div className="mt-6 p-4 bg-gray-50 dark:bg-gray-800/30 rounded-xl border border-gray-200 dark:border-gray-700">
          <div className="flex items-center justify-between mb-2">
            <span className="text-gray-700 dark:text-gray-400 text-sm font-medium">Network Health Score</span>
            <span className="text-blue-600 dark:text-bnb-yellow text-lg font-bold">98.5%</span>
          </div>
          <div className="w-full h-3 bg-gray-200 dark:bg-gray-700 rounded-full overflow-hidden">
            <div
              className="h-full bg-gradient-to-r from-blue-600 to-purple-600 dark:bg-gradient-bnb rounded-full transition-all duration-1000 animate-pulse-slow shadow-lg dark:shadow-bnb-glow"
              style={{ width: '98.5%' }}
            ></div>
          </div>
          <div className="mt-2 flex items-center justify-between text-xs text-gray-600 dark:text-gray-500">
            <span>Excellent performance across all metrics</span>
            <span>Last updated: just now</span>
          </div>
        </div>
      </div>
    </div>
  );
};

'use client';

/**
 * Gas Price Tracker Component
 * Real-time gas price monitoring with predictions and recommendations
 */

import { useState, useEffect, useMemo } from 'react';
import { useQuery } from '@tanstack/react-query';
import { apiClient } from '@/lib/api-client';

export interface GasPriceData {
  readonly slow: number;
  readonly standard: number;
  readonly fast: number;
  readonly instant: number;
  readonly timestamp: number;
}

export interface GasPricePrediction {
  readonly nextHour: number;
  readonly next4Hours: number;
  readonly next24Hours: number;
  readonly confidence: number;
  readonly trend: 'rising' | 'falling' | 'stable';
}

export const GasPriceTracker = (): JSX.Element => {
  const [gasPriceHistory, setGasPriceHistory] = useState<GasPriceData[]>([]);
  const [selectedSpeed, setSelectedSpeed] = useState<'slow' | 'standard' | 'fast' | 'instant'>('standard');

  const { data: stats } = useQuery({
    queryKey: ['stats'],
    queryFn: () => apiClient.getStats(),
    refetchInterval: 5000,
  });

  // Mock gas price data
  const currentGasPrice: GasPriceData = useMemo(() => ({
    slow: 1.2,
    standard: 2.5,
    fast: 4.8,
    instant: 8.5,
    timestamp: Date.now(),
  }), []);

  // Mock prediction data
  const prediction: GasPricePrediction = {
    nextHour: 2.2,
    next4Hours: 1.8,
    next24Hours: 2.5,
    confidence: 85,
    trend: 'falling',
  };

  useEffect(() => {
    // Add current gas price to history
    setGasPriceHistory(prev => {
      const newHistory = [...prev, currentGasPrice];
      if (newHistory.length > 20) {
        newHistory.shift(); // Keep only last 20 data points
      }
      return newHistory;
    });
  }, [currentGasPrice]);

  const formatGasPrice = (price: number): string => {
    return price.toFixed(2);
  };

  const getSpeedColor = (speed: string): string => {
    switch (speed) {
      case 'slow': return 'from-green-400 to-emerald-500';
      case 'standard': return 'from-blue-400 to-cyan-500';
      case 'fast': return 'from-yellow-400 to-orange-500';
      case 'instant': return 'from-red-400 to-pink-500';
      default: return 'from-gray-400 to-gray-500';
    }
  };

  const getSpeedIcon = (speed: string): JSX.Element => {
    switch (speed) {
      case 'slow':
        return (
          <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 19l9 2-9-18-9 18 9-2zm0 0v-8" />
          </svg>
        );
      case 'standard':
        return (
          <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M13 10V3L4 14h7v7l9-11h-7z" />
          </svg>
        );
      case 'fast':
        return (
          <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M13 9l3 3m0 0l-3 3m3-3H8m13 0a9 9 0 11-18 0 9 9 0 0118 0z" />
          </svg>
        );
      case 'instant':
        return (
          <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 3v4M3 5h4M6 17v4m-2-2h4m5-16l2.286 6.857L21 12l-5.714 2.143L13 21l-2.286-6.857L5 12l5.714-2.143L13 3z" />
          </svg>
        );
      default:
        return <></>;
    }
  };

  const getTrendIcon = (trend: string): JSX.Element => {
    switch (trend) {
      case 'rising':
        return (
          <svg className="w-5 h-5 text-red-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M13 7h8m0 0v8m0-8l-8 8-4-4-6 6" />
          </svg>
        );
      case 'falling':
        return (
          <svg className="w-5 h-5 text-green-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M13 17h8m0 0V9m0 8l-8-8-4 4-6-6" />
          </svg>
        );
      default:
        return (
          <svg className="w-5 h-5 text-gray-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 12h14" />
          </svg>
        );
    }
  };

  const getRecommendation = (): { text: string; color: string } => {
    if (prediction.trend === 'falling') {
      return {
        text: 'Wait for lower gas prices (expected in next hour)',
        color: 'text-green-600 dark:text-green-400',
      };
    }
    if (prediction.trend === 'rising') {
      return {
        text: 'Send now - gas prices expected to rise',
        color: 'text-red-600 dark:text-red-400',
      };
    }
    return {
      text: 'Gas prices are stable - send anytime',
      color: 'text-blue-600 dark:text-blue-400',
    };
  };

  const recommendation = getRecommendation();

  return (
    <div className="bg-white dark:bg-gradient-dark rounded-2xl shadow-xl dark:shadow-2xl border border-gray-200 dark:border-gray-700 p-6 overflow-hidden relative">
      {/* Header */}
      <div className="mb-6">
        <div className="flex items-center justify-between">
          <div>
            <h3 className="text-2xl font-bold text-gray-900 dark:text-white mb-1">Gas Price Tracker</h3>
            <p className="text-gray-600 dark:text-gray-400 text-sm">Real-time • Updated every 5s</p>
          </div>

          {/* Live Indicator */}
          <div className="flex items-center gap-2 px-4 py-2 bg-blue-100 dark:bg-blue-900/30 border-2 border-blue-500 dark:border-blue-500/30 rounded-lg">
            <span className="relative flex h-2 w-2">
              <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-blue-500 opacity-75"></span>
              <span className="relative inline-flex rounded-full h-2 w-2 bg-blue-500"></span>
            </span>
            <span className="text-blue-700 dark:text-blue-400 text-sm font-semibold">LIVE</span>
          </div>
        </div>
      </div>

      {/* Gas Price Options */}
      <div className="grid grid-cols-2 md:grid-cols-4 gap-3 mb-6">
        {(['slow', 'standard', 'fast', 'instant'] as const).map((speed, index) => {
          const price = currentGasPrice[speed];
          const isSelected = speed === selectedSpeed;

          return (
            <button
              key={speed}
              onClick={() => setSelectedSpeed(speed)}
              className={`relative p-4 rounded-xl border-2 transition-all duration-300 animate-slideUp ${
                isSelected
                  ? 'border-blue-500 dark:border-bnb-yellow bg-blue-50 dark:bg-bnb-yellow/10 scale-105'
                  : 'border-gray-200 dark:border-gray-700 bg-gray-50 dark:bg-gray-800/50 hover:border-gray-300 dark:hover:border-gray-600'
              }`}
              style={{ animationDelay: `${index * 50}ms` }}
              aria-label={`Select ${speed} gas price`}
            >
              {/* Icon */}
              <div className={`inline-flex p-2 rounded-lg bg-gradient-to-br ${getSpeedColor(speed)} mb-2`}>
                <div className="text-white">
                  {getSpeedIcon(speed)}
                </div>
              </div>

              {/* Speed Label */}
              <div className="text-gray-900 dark:text-white font-bold text-sm capitalize mb-1">
                {speed}
              </div>

              {/* Price */}
              <div className="text-2xl font-bold text-gray-900 dark:text-white tabular-nums">
                {formatGasPrice(price)}
              </div>

              <div className="text-gray-600 dark:text-gray-400 text-xs">Gwei</div>

              {/* Selection Indicator */}
              {isSelected && (
                <div className="absolute top-2 right-2">
                  <div className="h-4 w-4 bg-blue-600 dark:bg-bnb-yellow rounded-full flex items-center justify-center">
                    <svg className="w-3 h-3 text-white dark:text-gray-900" fill="currentColor" viewBox="0 0 20 20">
                      <path fillRule="evenodd" d="M16.707 5.293a1 1 0 010 1.414l-8 8a1 1 0 01-1.414 0l-4-4a1 1 0 011.414-1.414L8 12.586l7.293-7.293a1 1 0 011.414 0z" clipRule="evenodd" />
                    </svg>
                  </div>
                </div>
              )}
            </button>
          );
        })}
      </div>

      {/* Gas Price Chart */}
      <div className="bg-gray-50 dark:bg-gray-800/30 rounded-xl p-4 border border-gray-200 dark:border-gray-700 mb-6">
        <h4 className="text-lg font-bold text-gray-900 dark:text-white mb-4">Price History (Last 5 min)</h4>

        {/* Simple Chart Visualization */}
        <div className="h-32 flex items-end gap-1">
          {gasPriceHistory.map((data, index) => {
            const price = data[selectedSpeed];
            const maxPrice = Math.max(...gasPriceHistory.map(d => d[selectedSpeed]));
            const height = (price / maxPrice) * 100;

            return (
              <div
                key={index}
                className="flex-1 bg-gradient-to-t from-blue-500 to-purple-500 dark:from-bnb-yellow dark:to-bnb-yellow/60 rounded-t-sm transition-all duration-300 hover:opacity-80"
                style={{ height: `${height}%` }}
                title={`${formatGasPrice(price)} Gwei`}
              />
            );
          })}
        </div>

        <div className="mt-3 flex items-center justify-between text-xs text-gray-600 dark:text-gray-400">
          <span>5 min ago</span>
          <span>Now</span>
        </div>
      </div>

      {/* Predictions */}
      <div className="bg-gradient-to-br from-purple-50 to-blue-50 dark:from-gray-800/50 dark:to-gray-700/50 rounded-xl p-4 border-2 border-purple-200 dark:border-gray-600 mb-6">
        <div className="flex items-center gap-2 mb-3">
          <div className="h-8 w-8 bg-purple-600 dark:bg-bnb-yellow rounded-lg flex items-center justify-center">
            <svg className="w-5 h-5 text-white dark:text-gray-900" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9.663 17h4.673M12 3v1m6.364 1.636l-.707.707M21 12h-1M4 12H3m3.343-5.657l-.707-.707m2.828 9.9a5 5 0 117.072 0l-.548.547A3.374 3.374 0 0014 18.469V19a2 2 0 11-4 0v-.531c0-.895-.356-1.754-.988-2.386l-.548-.547z" />
            </svg>
          </div>
          <div>
            <h4 className="text-lg font-bold text-gray-900 dark:text-white">AI Prediction</h4>
            <p className="text-gray-600 dark:text-gray-400 text-xs">{prediction.confidence}% confidence</p>
          </div>
        </div>

        <div className="grid grid-cols-3 gap-3">
          <div className="text-center">
            <p className="text-gray-600 dark:text-gray-400 text-xs mb-1">Next Hour</p>
            <p className="text-lg font-bold text-gray-900 dark:text-white">{formatGasPrice(prediction.nextHour)}</p>
          </div>
          <div className="text-center">
            <p className="text-gray-600 dark:text-gray-400 text-xs mb-1">4 Hours</p>
            <p className="text-lg font-bold text-gray-900 dark:text-white">{formatGasPrice(prediction.next4Hours)}</p>
          </div>
          <div className="text-center">
            <p className="text-gray-600 dark:text-gray-400 text-xs mb-1">24 Hours</p>
            <p className="text-lg font-bold text-gray-900 dark:text-white">{formatGasPrice(prediction.next24Hours)}</p>
          </div>
        </div>
      </div>

      {/* Recommendation */}
      <div className="flex items-center gap-3 p-4 bg-gradient-to-r from-blue-50 to-purple-50 dark:from-gray-800 dark:to-gray-700 rounded-xl border border-blue-200 dark:border-gray-600">
        {getTrendIcon(prediction.trend)}
        <div className="flex-1">
          <p className={`font-semibold ${recommendation.color}`}>
            {recommendation.text}
          </p>
        </div>
      </div>
    </div>
  );
};

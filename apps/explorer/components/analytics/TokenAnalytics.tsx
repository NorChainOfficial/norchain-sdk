'use client';

/**
 * Token Analytics Component
 * Displays comprehensive token metrics including price, volume, holders, and transfers
 */

import { useQuery } from '@tanstack/react-query';
import { useState, useMemo } from 'react';
import { apiClient } from '@/lib/api-client';

export interface TokenMetrics {
  readonly address: string;
  readonly symbol: string;
  readonly name: string;
  readonly totalSupply: string;
  readonly holders: number;
  readonly transfers24h: number;
  readonly volume24h: string;
  readonly price: string;
  readonly priceChange24h: number;
  readonly marketCap: string;
}

interface TokenAnalyticsProps {
  readonly tokenAddress?: string;
}

export const TokenAnalytics = ({ tokenAddress }: TokenAnalyticsProps): JSX.Element => {
  const [selectedToken, setSelectedToken] = useState(tokenAddress || '');

  // Mock data - in production, fetch from API
  const mockTokens: TokenMetrics[] = [
    {
      address: '0x0cF8e180350253271f4b917CcFb0aCCc4862F262',
      symbol: 'BTCBR',
      name: 'BitcoinBR Token',
      totalSupply: '21000000',
      holders: 15234,
      transfers24h: 8456,
      volume24h: '2345678',
      price: '1.25',
      priceChange24h: 12.5,
      marketCap: '26250000',
    },
    {
      address: '0xCDd022f86D85Af364982A8339257FB93b2478998',
      symbol: 'WBTCBR',
      name: 'Wrapped BTCBR',
      totalSupply: '5000000',
      holders: 8945,
      transfers24h: 4567,
      volume24h: '1234567',
      price: '1.25',
      priceChange24h: 12.5,
      marketCap: '6250000',
    },
  ];

  const currentToken = useMemo(
    () => mockTokens.find(t => t.address === selectedToken) || mockTokens[0],
    [selectedToken]
  );

  const formatNumber = (value: string | number): string => {
    const num = typeof value === 'string' ? parseFloat(value) : value;
    if (num >= 1000000) {
      return `${(num / 1000000).toFixed(2)}M`;
    }
    if (num >= 1000) {
      return `${(num / 1000).toFixed(2)}K`;
    }
    return num.toFixed(2);
  };

  const formatPrice = (price: string): string => {
    return `$${parseFloat(price).toFixed(4)}`;
  };

  return (
    <div className="bg-white dark:bg-gradient-dark rounded-2xl shadow-xl dark:shadow-2xl border border-gray-200 dark:border-gray-700 p-6 overflow-hidden relative">
      {/* Header */}
      <div className="mb-6">
        <div className="flex items-center justify-between mb-4">
          <h3 className="text-2xl font-bold text-gray-900 dark:text-white">Token Analytics</h3>

          {/* Token Selector */}
          <select
            value={selectedToken || mockTokens[0].address}
            onChange={(e) => setSelectedToken(e.target.value)}
            className="h-12 px-4 bg-gray-50 dark:bg-gray-800 border-2 border-gray-300 dark:border-gray-600 rounded-lg focus:border-blue-500 dark:focus:border-bnb-yellow focus:ring-2 focus:ring-blue-200 dark:focus:ring-bnb-yellow/20 text-gray-900 dark:text-white font-medium transition-colors"
            aria-label="Select token"
          >
            {mockTokens.map(token => (
              <option key={token.address} value={token.address}>
                {token.symbol} - {token.name}
              </option>
            ))}
          </select>
        </div>

        {/* Token Header */}
        <div className="flex items-center gap-4">
          <div className="h-16 w-16 bg-gradient-to-br from-blue-500 to-purple-600 dark:from-bnb-yellow dark:to-bnb-yellow/60 rounded-full flex items-center justify-center text-white font-bold text-xl shadow-lg">
            {currentToken.symbol.slice(0, 2)}
          </div>
          <div>
            <h4 className="text-xl font-bold text-gray-900 dark:text-white">{currentToken.name}</h4>
            <p className="text-gray-600 dark:text-gray-400">{currentToken.symbol}</p>
          </div>
        </div>
      </div>

      {/* Price Section */}
      <div className="bg-gradient-to-br from-blue-50 to-purple-50 dark:from-gray-800/50 dark:to-gray-700/50 rounded-xl p-6 mb-6 border-2 border-blue-200 dark:border-gray-600">
        <div className="flex items-center justify-between">
          <div>
            <p className="text-gray-600 dark:text-gray-400 text-sm font-medium mb-1">Current Price</p>
            <div className="flex items-baseline gap-3">
              <span className="text-4xl font-bold text-gray-900 dark:text-white">
                {formatPrice(currentToken.price)}
              </span>
              <span className={`text-lg font-semibold ${
                currentToken.priceChange24h >= 0
                  ? 'text-green-600 dark:text-green-400'
                  : 'text-red-600 dark:text-red-400'
              }`}>
                {currentToken.priceChange24h >= 0 ? '+' : ''}{currentToken.priceChange24h.toFixed(2)}%
              </span>
            </div>
          </div>

          {/* 24h Price Chart Icon */}
          <div className="text-gray-400">
            <svg className="w-24 h-16" viewBox="0 0 100 50" fill="none" xmlns="http://www.w3.org/2000/svg">
              <path
                d="M 0 40 Q 20 35, 30 25 T 60 20 T 100 10"
                stroke={currentToken.priceChange24h >= 0 ? '#10b981' : '#ef4444'}
                strokeWidth="2"
                fill="none"
              />
            </svg>
          </div>
        </div>
      </div>

      {/* Metrics Grid */}
      <div className="grid grid-cols-2 md:grid-cols-4 gap-4 mb-6">
        {/* Market Cap */}
        <div className="bg-gray-50 dark:bg-gray-800/50 rounded-xl p-4 border border-gray-200 dark:border-gray-700 hover:border-blue-500 dark:hover:border-bnb-yellow/50 transition-all hover:scale-105">
          <div className="flex items-center gap-2 mb-2">
            <svg className="w-5 h-5 text-blue-600 dark:text-bnb-yellow" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 8c-1.657 0-3 .895-3 2s1.343 2 3 2 3 .895 3 2-1.343 2-3 2m0-8c1.11 0 2.08.402 2.599 1M12 8V7m0 1v8m0 0v1m0-1c-1.11 0-2.08-.402-2.599-1M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
            </svg>
            <span className="text-gray-600 dark:text-gray-400 text-sm font-medium">Market Cap</span>
          </div>
          <p className="text-2xl font-bold text-gray-900 dark:text-white">
            ${formatNumber(currentToken.marketCap)}
          </p>
        </div>

        {/* Total Supply */}
        <div className="bg-gray-50 dark:bg-gray-800/50 rounded-xl p-4 border border-gray-200 dark:border-gray-700 hover:border-purple-500 dark:hover:border-bnb-yellow/50 transition-all hover:scale-105">
          <div className="flex items-center gap-2 mb-2">
            <svg className="w-5 h-5 text-purple-600 dark:text-bnb-yellow" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M20 7l-8-4-8 4m16 0l-8 4m8-4v10l-8 4m0-10L4 7m8 4v10M4 7v10l8 4" />
            </svg>
            <span className="text-gray-600 dark:text-gray-400 text-sm font-medium">Total Supply</span>
          </div>
          <p className="text-2xl font-bold text-gray-900 dark:text-white">
            {formatNumber(currentToken.totalSupply)}
          </p>
        </div>

        {/* Holders */}
        <div className="bg-gray-50 dark:bg-gray-800/50 rounded-xl p-4 border border-gray-200 dark:border-gray-700 hover:border-green-500 dark:hover:border-bnb-yellow/50 transition-all hover:scale-105">
          <div className="flex items-center gap-2 mb-2">
            <svg className="w-5 h-5 text-green-600 dark:text-bnb-yellow" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M17 20h5v-2a3 3 0 00-5.356-1.857M17 20H7m10 0v-2c0-.656-.126-1.283-.356-1.857M7 20H2v-2a3 3 0 015.356-1.857M7 20v-2c0-.656.126-1.283.356-1.857m0 0a5.002 5.002 0 019.288 0M15 7a3 3 0 11-6 0 3 3 0 016 0zm6 3a2 2 0 11-4 0 2 2 0 014 0zM7 10a2 2 0 11-4 0 2 2 0 014 0z" />
            </svg>
            <span className="text-gray-600 dark:text-gray-400 text-sm font-medium">Holders</span>
          </div>
          <p className="text-2xl font-bold text-gray-900 dark:text-white">
            {formatNumber(currentToken.holders)}
          </p>
        </div>

        {/* 24h Volume */}
        <div className="bg-gray-50 dark:bg-gray-800/50 rounded-xl p-4 border border-gray-200 dark:border-gray-700 hover:border-yellow-500 dark:hover:border-bnb-yellow/50 transition-all hover:scale-105">
          <div className="flex items-center gap-2 mb-2">
            <svg className="w-5 h-5 text-yellow-600 dark:text-bnb-yellow" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M13 7h8m0 0v8m0-8l-8 8-4-4-6 6" />
            </svg>
            <span className="text-gray-600 dark:text-gray-400 text-sm font-medium">24h Volume</span>
          </div>
          <p className="text-2xl font-bold text-gray-900 dark:text-white">
            ${formatNumber(currentToken.volume24h)}
          </p>
        </div>
      </div>

      {/* Recent Activity */}
      <div className="bg-gray-50 dark:bg-gray-800/30 rounded-xl p-4 border border-gray-200 dark:border-gray-700">
        <h4 className="text-lg font-bold text-gray-900 dark:text-white mb-4">24h Activity</h4>

        <div className="grid grid-cols-2 gap-4">
          <div className="flex items-center justify-between">
            <span className="text-gray-600 dark:text-gray-400 text-sm">Transfers</span>
            <span className="text-gray-900 dark:text-white font-bold">
              {formatNumber(currentToken.transfers24h)}
            </span>
          </div>

          <div className="flex items-center justify-between">
            <span className="text-gray-600 dark:text-gray-400 text-sm">Avg Transfer Size</span>
            <span className="text-gray-900 dark:text-white font-bold">
              {formatNumber(parseFloat(currentToken.volume24h) / currentToken.transfers24h)}
            </span>
          </div>
        </div>

        {/* Activity Bar */}
        <div className="mt-4">
          <div className="flex items-center justify-between mb-2">
            <span className="text-gray-600 dark:text-gray-400 text-sm">Network Activity</span>
            <span className="text-green-600 dark:text-green-400 text-sm font-semibold">High</span>
          </div>
          <div className="w-full h-2 bg-gray-200 dark:bg-gray-700 rounded-full overflow-hidden">
            <div
              className="h-full bg-gradient-to-r from-green-500 to-emerald-500 rounded-full animate-pulse-slow"
              style={{ width: '85%' }}
            ></div>
          </div>
        </div>
      </div>

      {/* Contract Address */}
      <div className="mt-4 p-3 bg-blue-50 dark:bg-gray-800/50 rounded-lg border border-blue-200 dark:border-gray-600">
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-2">
            <span className="text-gray-600 dark:text-gray-400 text-sm font-medium">Contract:</span>
            <code className="text-blue-600 dark:text-bnb-yellow text-sm font-mono">
              {currentToken.address.slice(0, 6)}...{currentToken.address.slice(-4)}
            </code>
          </div>
          <button
            onClick={() => navigator.clipboard.writeText(currentToken.address)}
            className="h-8 px-3 bg-blue-600 dark:bg-bnb-yellow text-white dark:text-gray-900 rounded-lg hover:bg-blue-700 dark:hover:bg-bnb-yellow/90 transition-colors text-sm font-medium"
            aria-label="Copy contract address"
          >
            Copy
          </button>
        </div>
      </div>
    </div>
  );
};

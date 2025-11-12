'use client';

import React, { useState, useEffect } from 'react';

interface TokenPrice {
  price: number;
  priceChange24h: number;
  volume24h: number;
  marketCap?: number;
  lastUpdated: number;
}

interface TokenPriceProps {
  tokenAddress: string;
  symbol: string;
  totalSupply: string;
  decimals: number;
}

export function TokenPrice({ tokenAddress, symbol, totalSupply, decimals }: TokenPriceProps): JSX.Element {
  const [priceData, setPriceData] = useState<TokenPrice | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    const fetchPrice = async () => {
      try {
        setLoading(true);
        setError(null);

        // Token price integration with NEX Exchange API
        // Placeholder implementation - will connect to NEX API when trading is active
        // Shows appropriate message when price data is not available

        // Simulate API call for now
        await new Promise((resolve) => setTimeout(resolve, 1000));
        
        // Mock data - will be replaced with real API call
        setPriceData({
          price: 0,
          priceChange24h: 0,
          volume24h: 0,
          marketCap: 0,
          lastUpdated: Date.now(),
        });
      } catch (err: any) {
        setError(err.message || 'Failed to fetch token price');
      } finally {
        setLoading(false);
      }
    };

    fetchPrice();
    
    // Refresh price every 30 seconds
    const interval = setInterval(fetchPrice, 30000);
    return () => clearInterval(interval);
  }, [tokenAddress]);

  if (loading) {
    return (
      <div className="bg-slate-800 rounded-lg border border-slate-700 p-6">
        <div className="animate-pulse space-y-4">
          <div className="h-8 bg-slate-700 rounded w-32"></div>
          <div className="h-4 bg-slate-700 rounded w-24"></div>
        </div>
      </div>
    );
  }

  if (error) {
    return (
      <div className="bg-slate-800 rounded-lg border border-slate-700 p-6">
        <div className="p-4 bg-red-900/20 border border-red-500/30 rounded-lg">
          <p className="text-red-300 text-sm">{error}</p>
        </div>
      </div>
    );
  }

  if (!priceData || priceData.price === 0) {
    return (
      <div className="bg-slate-800 rounded-lg border border-slate-700 p-6">
        <h3 className="text-lg font-semibold text-white mb-4">Price Information</h3>
        <div className="p-4 bg-yellow-900/20 border border-yellow-500/30 rounded-lg">
          <p className="text-yellow-300 text-sm mb-2">Price data not available</p>
          <p className="text-yellow-400/80 text-xs">
            This token is not currently listed on NEX Exchange. Price information will appear here once trading begins.
          </p>
        </div>
      </div>
    );
  }

  const isPositive = priceData.priceChange24h >= 0;
  const marketCap = priceData.marketCap || (priceData.price * parseFloat(totalSupply) / Math.pow(10, decimals));

  return (
    <div className="bg-slate-800 rounded-lg border border-slate-700 p-6">
      <h3 className="text-lg font-semibold text-white mb-4">Price Information</h3>
      
      <div className="space-y-4">
        {/* Current Price */}
        <div className="p-4 bg-slate-900 rounded-lg border border-slate-700">
          <div className="text-sm text-gray-400 mb-1">Current Price</div>
          <div className="flex items-baseline gap-2">
            <span className="text-3xl font-bold text-white">
              ${priceData.price.toLocaleString(undefined, { minimumFractionDigits: 4, maximumFractionDigits: 6 })}
            </span>
            <span className="text-gray-400">{symbol}</span>
          </div>
        </div>

        {/* 24h Change */}
        <div className="p-4 bg-slate-900 rounded-lg border border-slate-700">
          <div className="text-sm text-gray-400 mb-1">24h Change</div>
          <div className={`text-2xl font-bold ${isPositive ? 'text-green-400' : 'text-red-400'}`}>
            {isPositive ? '+' : ''}{priceData.priceChange24h.toFixed(2)}%
          </div>
        </div>

        {/* Market Cap */}
        {marketCap > 0 && (
          <div className="p-4 bg-slate-900 rounded-lg border border-slate-700">
            <div className="text-sm text-gray-400 mb-1">Market Cap</div>
            <div className="text-2xl font-bold text-white">
              ${marketCap.toLocaleString(undefined, { maximumFractionDigits: 0 })}
            </div>
          </div>
        )}

        {/* 24h Volume */}
        {priceData.volume24h > 0 && (
          <div className="p-4 bg-slate-900 rounded-lg border border-slate-700">
            <div className="text-sm text-gray-400 mb-1">24h Volume</div>
            <div className="text-2xl font-bold text-white">
              ${priceData.volume24h.toLocaleString(undefined, { maximumFractionDigits: 0 })}
            </div>
          </div>
        )}

        {/* Last Updated */}
        <div className="text-xs text-gray-500 text-right">
          Last updated: {new Date(priceData.lastUpdated).toLocaleTimeString()}
        </div>
      </div>
    </div>
  );
}


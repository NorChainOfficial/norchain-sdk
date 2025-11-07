'use client';

import React, { useState, useEffect } from 'react';
import { useRouter } from 'next/navigation';
import { getBlockchainService } from '@/lib/blockchain-service';
import { dexService } from '@/lib/dex-service';

export const SearchBar = (): JSX.Element => {
  const router = useRouter();
  const [searchQuery, setSearchQuery] = useState('');
  const [gasPrice, setGasPrice] = useState<string>('0');
  const [latestBlock, setLatestBlock] = useState<number>(0);
  const [xhtPrice, setXhtPrice] = useState<number>(0);
  const [priceChange, setPriceChange] = useState<number>(0);
  const [loading, setLoading] = useState(true);
  const [isUpdating, setIsUpdating] = useState(false);

  // Fetch live blockchain stats and DEX price
  useEffect(() => {
    const fetchStats = async () => {
      try {
        setIsUpdating(true);
        const service = getBlockchainService();
        const [gas, stats, price, priceChange24h] = await Promise.all([
          service.getGasPrice(),
          service.getBlockchainStats(),
          dexService.getNORPrice(),
          dexService.get24hPriceChange(),
        ]);

        // Animate value changes
        setTimeout(() => {
          setGasPrice(gas);
          setLatestBlock(stats.latestBlock);

          // Use real DEX price data
          if (price?.priceInUSD) {
            setXhtPrice(price.priceInUSD);
          } else if (price?.priceInUSDT) {
            // Use USDT price as USD equivalent
            setXhtPrice(price.priceInUSDT);
          }

          if (priceChange24h !== null) {
            setPriceChange(priceChange24h);
          }

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

  const handleSearch = (e: React.FormEvent) => {
    e.preventDefault();
    if (!searchQuery.trim()) return;

    // Detect what type of search this is
    const query = searchQuery.trim();

    if (query.startsWith('0x')) {
      if (query.length === 66) {
        // Transaction hash
        router.push(`/tx/${query}`);
      } else if (query.length === 42) {
        // Address (could be contract or account)
        router.push(`/address/${query}`);
      }
    } else if (!isNaN(Number(query))) {
      // Block number
      router.push(`/block/${query}`);
    }

    setSearchQuery('');
  };

  return (
    <div className="bg-slate-950 border-b border-slate-800">
      <div className="max-w-[1400px] mx-auto px-6 py-3">
        <div className="flex items-center gap-6">
          {/* Search Form */}
          <form onSubmit={handleSearch} className="flex-1 max-w-2xl">
            <div className="relative">
              <input
                type="text"
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                placeholder="Search by Address / Txn Hash / Block / Token..."
                className="w-full h-12 pl-12 pr-24 bg-slate-900 border border-slate-700 rounded-lg text-white placeholder-slate-400 focus:border-indigo-500 focus:ring-2 focus:ring-indigo-500/20 transition-all text-sm"
                aria-label="Search the blockchain"
              />
              <svg
                className="absolute left-4 top-1/2 -translate-y-1/2 w-5 h-5 text-slate-400"
                fill="none"
                viewBox="0 0 24 24"
                stroke="currentColor"
              >
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z" />
              </svg>
              <button
                type="submit"
                className="absolute right-1.5 top-1/2 -translate-y-1/2 px-4 py-1.5 bg-gradient-to-r from-indigo-600 to-violet-600 hover:from-indigo-700 hover:to-violet-700 text-white text-sm font-semibold rounded-md transition-all shadow-md hover:shadow-lg"
              >
                Search
              </button>
            </div>
          </form>

          {/* Live Stats */}
          <div className="hidden lg:flex items-center gap-4">
            {/* NOR Price */}
            <div className={`flex items-center gap-2 px-4 py-2 bg-slate-900/50 border border-slate-700 rounded-lg transition-all duration-300 ${isUpdating ? 'scale-105 border-indigo-500/50' : ''}`}>
              <span className="text-slate-400 text-xs font-medium">NOR:</span>
              <span className={`text-sm font-bold transition-all duration-300 ${priceChange >= 0 ? 'text-green-400' : 'text-red-400'}`}>
                ${xhtPrice.toFixed(4)}
              </span>
              <span className={`text-xs font-semibold transition-all duration-300 ${priceChange >= 0 ? 'text-green-400' : 'text-red-400'}`}>
                {priceChange >= 0 ? '↑' : '↓'}{Math.abs(priceChange).toFixed(1)}%
              </span>
            </div>

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

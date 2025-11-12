'use client';

import React, { useState, useEffect } from 'react';
import Link from 'next/link';
import { formatAddress, formatNumber } from '@/lib/api-client';

interface TokenHolder {
  address: string;
  balance: string;
  percentage: number;
  rank: number;
}

interface TokenHoldersProps {
  tokenAddress: string;
  totalSupply: string;
  decimals: number;
}

export function TokenHolders({ tokenAddress, totalSupply, decimals }: TokenHoldersProps): JSX.Element {
  const [holders, setHolders] = useState<TokenHolder[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [page, setPage] = useState(1);
  const perPage = 20;

  useEffect(() => {
    const fetchHolders = async () => {
      try {
        setLoading(true);
        setError(null);

        const { apiClient } = await import('@/lib/api-client');
        const data = await apiClient.getTokenHolders(tokenAddress, { page, per_page: perPage });
        
        const holdersData = Array.isArray(data) ? data : (data.data || []);
        setHolders(holdersData.map((holder: any, index: number) => ({
          address: holder.address || holder.holderAddress,
          balance: holder.balance || '0',
          percentage: holder.percentage || 0,
          rank: holder.rank || (page - 1) * perPage + index + 1,
        })));
      } catch (err: any) {
        setError(err.message || 'Failed to fetch token holders');
      } finally {
        setLoading(false);
      }
    };

    fetchHolders();
  }, [tokenAddress, page]);

  const formatBalance = (balance: string) => {
    const num = parseFloat(balance) / Math.pow(10, decimals);
    return num.toLocaleString(undefined, { maximumFractionDigits: 4 });
  };

  if (loading) {
    return (
      <div className="space-y-4">
        {Array.from({ length: 5 }).map((_, i) => (
          <div key={i} className="animate-pulse p-4 border border-gray-200 dark:border-gray-700 rounded-lg">
            <div className="h-4 bg-gray-200 dark:bg-gray-700 rounded w-3/4 mb-3"></div>
            <div className="h-4 bg-gray-200 dark:bg-gray-700 rounded w-1/2"></div>
          </div>
        ))}
      </div>
    );
  }

  if (error) {
    return (
      <div className="p-6 bg-red-900/20 border border-red-500/30 rounded-lg">
        <p className="text-red-300">{error}</p>
      </div>
    );
  }

  if (holders.length === 0) {
    return (
      <div className="text-center text-gray-500 dark:text-gray-400 py-12">
        <svg className="w-16 h-16 mx-auto mb-4 text-gray-400 dark:text-gray-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M17 20h5v-2a3 3 0 00-5.356-1.857M17 20H7m10 0v-2c0-.656-.126-1.283-.356-1.857M7 20H2v-2a3 3 0 015.356-1.857M7 20v-2c0-.656.126-1.283.356-1.857m0 0a5.002 5.002 0 019.288 0M15 7a3 3 0 11-6 0 3 3 0 016 0zm6 3a2 2 0 11-4 0 2 2 0 014 0zM7 10a2 2 0 11-4 0 2 2 0 014 0z" />
        </svg>
        <p className="text-lg font-medium">No holders found</p>
        <p className="text-sm mt-1">Token holder data will appear here when available</p>
      </div>
    );
  }

  return (
    <div className="space-y-4">
      <div className="flex items-center justify-between mb-4">
        <h3 className="text-lg font-semibold text-white">Top Holders</h3>
        <span className="text-sm text-gray-400">Total: {formatNumber(holders.length)} holders</span>
      </div>

      <div className="bg-slate-800 rounded-lg border border-slate-700 overflow-hidden">
        <div className="overflow-x-auto">
          <table className="w-full">
            <thead className="bg-slate-900 border-b border-slate-700">
              <tr>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-400 uppercase tracking-wider">Rank</th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-400 uppercase tracking-wider">Address</th>
                <th className="px-6 py-3 text-right text-xs font-medium text-gray-400 uppercase tracking-wider">Balance</th>
                <th className="px-6 py-3 text-right text-xs font-medium text-gray-400 uppercase tracking-wider">Percentage</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-700">
              {holders.map((holder) => (
                <tr key={holder.address} className="hover:bg-slate-700 transition-colors">
                  <td className="px-6 py-4 whitespace-nowrap">
                    <span className="text-gray-300 font-semibold">#{holder.rank}</span>
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap">
                    <Link
                      href={`/accounts/${holder.address}`}
                      className="text-blue-400 hover:text-blue-300 font-mono text-sm transition-colors"
                    >
                      {formatAddress(holder.address)}
                    </Link>
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap text-right">
                    <span className="text-white font-medium">{formatBalance(holder.balance)}</span>
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap text-right">
                    <div className="flex items-center justify-end gap-2">
                      <div className="w-24 bg-slate-700 rounded-full h-2">
                        <div
                          className="bg-blue-500 h-2 rounded-full"
                          style={{ width: `${holder.percentage}%` }}
                        />
                      </div>
                      <span className="text-gray-300 text-sm w-16 text-right">{holder.percentage.toFixed(2)}%</span>
                    </div>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>

      {/* Pagination */}
      {holders.length >= perPage && (
        <div className="flex items-center justify-between">
          <button
            onClick={() => setPage((p) => Math.max(1, p - 1))}
            disabled={page === 1}
            className="px-4 py-2 bg-slate-700 hover:bg-slate-600 disabled:bg-slate-800 disabled:text-gray-600 disabled:cursor-not-allowed text-white rounded-lg transition-colors"
          >
            Previous
          </button>
          <span className="text-gray-400 text-sm">Page {page}</span>
          <button
            onClick={() => setPage((p) => p + 1)}
            disabled={holders.length < perPage}
            className="px-4 py-2 bg-blue-600 hover:bg-blue-700 disabled:bg-slate-800 disabled:text-gray-600 disabled:cursor-not-allowed text-white rounded-lg transition-colors"
          >
            Next
          </button>
        </div>
      )}
    </div>
  );
}


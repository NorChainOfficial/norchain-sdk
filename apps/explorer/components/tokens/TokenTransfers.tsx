'use client';

import React, { useState, useEffect } from 'react';
import Link from 'next/link';
import { formatAddress, formatHash, formatTimeAgo, formatNumber } from '@/lib/api-client';

interface TokenTransfer {
  hash: string;
  from: string;
  to: string;
  value: string;
  timestamp: number;
  blockHeight: number;
}

interface TokenTransfersProps {
  tokenAddress: string;
  decimals: number;
  symbol: string;
}

export function TokenTransfers({ tokenAddress, decimals, symbol }: TokenTransfersProps): JSX.Element {
  const [transfers, setTransfers] = useState<TokenTransfer[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [page, setPage] = useState(1);
  const perPage = 20;

  useEffect(() => {
    const fetchTransfers = async () => {
      try {
        setLoading(true);
        setError(null);

        const { apiClient } = await import('@/lib/api-client');
        const data = await apiClient.getTokenTransfers(tokenAddress, { page, per_page: perPage });
        
        const transfersData = Array.isArray(data) ? data : (data.transfers || data.data || []);
        setTransfers(transfersData.map((transfer: any) => ({
          hash: transfer.hash || transfer.transactionHash,
          from: transfer.from || transfer.fromAddress,
          to: transfer.to || transfer.toAddress,
          value: transfer.value || '0',
          timestamp: transfer.timestamp || 0,
          blockHeight: transfer.blockHeight || transfer.blockNumber || 0,
        })));
      } catch (err: any) {
        setError(err.message || 'Failed to fetch token transfers');
      } finally {
        setLoading(false);
      }
    };

    fetchTransfers();
  }, [tokenAddress, page]);

  const formatValue = (value: string) => {
    const num = parseFloat(value) / Math.pow(10, decimals);
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

  if (transfers.length === 0) {
    return (
      <div className="text-center text-gray-500 dark:text-gray-400 py-12">
        <svg className="w-16 h-16 mx-auto mb-4 text-gray-400 dark:text-gray-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M8 7h12m0 0l-4-4m4 4l-4 4m0 6H4m0 0l4 4m-4-4l4-4" />
        </svg>
        <p className="text-lg font-medium">No transfers found</p>
        <p className="text-sm mt-1">Token transfer history will appear here when available</p>
      </div>
    );
  }

  return (
    <div className="space-y-4">
      <div className="flex items-center justify-between mb-4">
        <h3 className="text-lg font-semibold text-white">Recent Transfers</h3>
        <span className="text-sm text-gray-400">Page {page}</span>
      </div>

      <div className="bg-slate-800 rounded-lg border border-slate-700 overflow-hidden">
        <div className="overflow-x-auto">
          <table className="w-full">
            <thead className="bg-slate-900 border-b border-slate-700">
              <tr>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-400 uppercase tracking-wider">Tx Hash</th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-400 uppercase tracking-wider">From</th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-400 uppercase tracking-wider">To</th>
                <th className="px-6 py-3 text-right text-xs font-medium text-gray-400 uppercase tracking-wider">Amount</th>
                <th className="px-6 py-3 text-right text-xs font-medium text-gray-400 uppercase tracking-wider">Time</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-700">
              {transfers.map((transfer) => (
                <tr key={transfer.hash} className="hover:bg-slate-700 transition-colors">
                  <td className="px-6 py-4 whitespace-nowrap">
                    <Link
                      href={`/tx/${transfer.hash}`}
                      className="text-purple-400 hover:text-purple-300 font-mono text-sm transition-colors"
                    >
                      {formatHash(transfer.hash)}
                    </Link>
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap">
                    <Link
                      href={`/accounts/${transfer.from}`}
                      className="text-blue-400 hover:text-blue-300 font-mono text-sm transition-colors"
                    >
                      {formatAddress(transfer.from)}
                    </Link>
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap">
                    <Link
                      href={`/accounts/${transfer.to}`}
                      className="text-blue-400 hover:text-blue-300 font-mono text-sm transition-colors"
                    >
                      {formatAddress(transfer.to)}
                    </Link>
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap text-right">
                    <span className="text-white font-medium">{formatValue(transfer.value)} {symbol}</span>
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap text-right">
                    <span className="text-gray-400 text-sm">{formatTimeAgo(transfer.timestamp)}</span>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>

      {/* Pagination */}
      {transfers.length >= perPage && (
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
            disabled={transfers.length < perPage}
            className="px-4 py-2 bg-blue-600 hover:bg-blue-700 disabled:bg-slate-800 disabled:text-gray-600 disabled:cursor-not-allowed text-white rounded-lg transition-colors"
          >
            Next
          </button>
        </div>
      )}
    </div>
  );
}


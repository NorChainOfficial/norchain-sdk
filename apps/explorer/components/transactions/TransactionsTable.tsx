'use client';

import React, { useMemo, useState } from 'react';
import Link from 'next/link';
import { formatTimeAgo, formatAddress, formatNumber, formatHash, weiToXhn } from '@/lib/api-client';
import { TransactionFilters } from './TransactionFilters';

interface Transaction {
  hash: string;
  blockHeight: number;
  status: boolean | string;
  fromAddress: string;
  toAddress?: string;
  value: string | number;
  gasUsed?: string | number;
  timestamp: number | string;
}

interface TransactionsTableProps {
  initialTransactions: Transaction[];
  stats: {
    totalTransactions?: number;
    blockHeight?: number;
  };
}

export function TransactionsTable({ initialTransactions, stats }: TransactionsTableProps): JSX.Element {
  const [transactions] = useState<Transaction[]>(initialTransactions);
  const [filters, setFilters] = useState<TransactionFilters>({});

  // Apply client-side filtering
  const filteredTransactions = useMemo(() => {
    return transactions.filter((tx) => {
      // From address filter
      if (filters.fromAddress) {
        const fromLower = filters.fromAddress.toLowerCase();
        if (!tx.fromAddress.toLowerCase().includes(fromLower)) {
          return false;
        }
      }

      // To address filter
      if (filters.toAddress) {
        const toLower = filters.toAddress.toLowerCase();
        if (!tx.toAddress?.toLowerCase().includes(toLower)) {
          return false;
        }
      }

      // Block height filter
      if (filters.blockHeight !== undefined && tx.blockHeight !== filters.blockHeight) {
        return false;
      }

      // Status filter
      if (filters.status) {
        if (filters.status === 'success' && tx.status !== true && tx.status !== 'success') {
          return false;
        }
        if (filters.status === 'failed' && tx.status !== false && tx.status !== 'failed') {
          return false;
        }
        if (filters.status === 'pending' && tx.status !== 'pending') {
          return false;
        }
      }

      // Value range filter
      const txValue = typeof tx.value === 'string' ? parseFloat(weiToXhn(tx.value)) : tx.value / 1e18;
      if (filters.minValue !== undefined && txValue < filters.minValue) {
        return false;
      }
      if (filters.maxValue !== undefined && txValue > filters.maxValue) {
        return false;
      }

      // Gas range filter
      const txGas = parseInt(String(tx.gasUsed || '0'));
      if (filters.minGas !== undefined && txGas < filters.minGas) {
        return false;
      }
      if (filters.maxGas !== undefined && txGas > filters.maxGas) {
        return false;
      }

      // Date range filter
      if (filters.dateFrom || filters.dateTo) {
        const txTimestamp = typeof tx.timestamp === 'string' 
          ? new Date(tx.timestamp).getTime() 
          : tx.timestamp * 1000;
        
        if (filters.dateFrom) {
          const fromDate = new Date(filters.dateFrom).getTime();
          if (txTimestamp < fromDate) {
            return false;
          }
        }
        
        if (filters.dateTo) {
          const toDate = new Date(filters.dateTo).getTime() + 86400000; // Add 1 day
          if (txTimestamp > toDate) {
            return false;
          }
        }
      }

      return true;
    });
  }, [transactions, filters]);

  const handleExport = (format: 'csv' | 'json') => {
    const data = filteredTransactions.map((tx) => {
      const isSuccess = tx.status === true || tx.status === 'success';
      const isFailed = tx.status === false || tx.status === 'failed';
      const status = isSuccess ? 'Success' : isFailed ? 'Failed' : 'Pending';
      
      return {
        Hash: tx.hash,
        Block: tx.blockHeight,
        Status: status,
        From: tx.fromAddress,
        To: tx.toAddress || 'Contract Creation',
        Value: typeof tx.value === 'string' ? weiToXhn(tx.value) : (tx.value / 1e18).toFixed(4),
        'Gas Used': tx.gasUsed || '0',
        Timestamp: typeof tx.timestamp === 'string' 
          ? tx.timestamp 
          : new Date(tx.timestamp * 1000).toISOString(),
      };
    });

    if (format === 'csv') {
      // Convert to CSV
      const headers = Object.keys(data[0] || {});
      const csvRows = [
        headers.join(','),
        ...data.map((row) =>
          headers.map((header) => {
            const value = row[header as keyof typeof row];
            return typeof value === 'string' && value.includes(',')
              ? `"${value.replace(/"/g, '""')}"`
              : value;
          }).join(',')
        ),
      ];
      const csv = csvRows.join('\n');
      const blob = new Blob([csv], { type: 'text/csv' });
      const url = URL.createObjectURL(blob);
      const a = document.createElement('a');
      a.href = url;
      a.download = `transactions-export-${new Date().toISOString().split('T')[0]}.csv`;
      a.click();
      URL.revokeObjectURL(url);
    } else {
      // Export as JSON
      const json = JSON.stringify(data, null, 2);
      const blob = new Blob([json], { type: 'application/json' });
      const url = URL.createObjectURL(blob);
      const a = document.createElement('a');
      a.href = url;
      a.download = `transactions-export-${new Date().toISOString().split('T')[0]}.json`;
      a.click();
      URL.revokeObjectURL(url);
    }
  };

  return (
    <div>
      {/* Filters and Export */}
      <TransactionFilters onFilterChange={setFilters} onExport={handleExport} />

      {/* Stats Cards */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-4 mb-6">
        <div className="bg-slate-800 rounded-lg p-6 border border-slate-700">
          <div className="flex items-center justify-between mb-2">
            <div className="text-gray-400 text-sm uppercase tracking-wider">Total Transactions</div>
            <svg className="h-5 w-5 text-gray-500" fill="none" viewBox="0 0 24 24" stroke="currentColor">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M8 7h12m0 0l-4-4m4 4l-4 4m0 6H4m0 0l4 4m-4-4l4-4" />
            </svg>
          </div>
          <div className="text-2xl font-bold text-white">{formatNumber(stats?.totalTransactions || 0)}</div>
        </div>

        <div className="bg-slate-800 rounded-lg p-6 border border-slate-700">
          <div className="flex items-center justify-between mb-2">
            <div className="text-gray-400 text-sm uppercase tracking-wider">Current Block</div>
            <svg className="h-5 w-5 text-gray-500" fill="none" viewBox="0 0 24 24" stroke="currentColor">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 11H5m14 0a2 2 0 012 2v6a2 2 0 01-2 2H5a2 2 0 01-2-2v-6a2 2 0 012-2m14 0V9a2 2 0 00-2-2M5 11V9a2 2 0 012-2m0 0V5a2 2 0 012-2h6a2 2 0 012 2v2M7 7h10" />
            </svg>
          </div>
          <div className="text-2xl font-bold text-white">#{formatNumber(stats?.blockHeight || 0)}</div>
        </div>

        <div className="bg-slate-800 rounded-lg p-6 border border-slate-700">
          <div className="flex items-center justify-between mb-2">
            <div className="text-gray-400 text-sm uppercase tracking-wider">Filtered Results</div>
            <div className="h-2 w-2 rounded-full bg-green-500 animate-pulse" />
          </div>
          <div className="text-2xl font-bold text-green-400">
            {filteredTransactions.length} {filteredTransactions.length !== transactions.length && `of ${transactions.length}`}
          </div>
        </div>
      </div>

      {/* Transactions Table */}
      <div className="bg-slate-800 rounded-xl border border-slate-700 overflow-hidden">
        <div className="overflow-x-auto">
          <table className="w-full">
            <thead className="bg-slate-900 border-b border-slate-700">
              <tr>
                <th className="px-6 py-4 text-left text-xs font-medium text-gray-400 uppercase tracking-wider">Tx Hash</th>
                <th className="px-6 py-4 text-left text-xs font-medium text-gray-400 uppercase tracking-wider">Block</th>
                <th className="px-6 py-4 text-left text-xs font-medium text-gray-400 uppercase tracking-wider">Status</th>
                <th className="px-6 py-4 text-left text-xs font-medium text-gray-400 uppercase tracking-wider">From</th>
                <th className="px-6 py-4 text-left text-xs font-medium text-gray-400 uppercase tracking-wider">To</th>
                <th className="px-6 py-4 text-right text-xs font-medium text-gray-400 uppercase tracking-wider">Value</th>
                <th className="px-6 py-4 text-right text-xs font-medium text-gray-400 uppercase tracking-wider">Gas</th>
                <th className="px-6 py-4 text-right text-xs font-medium text-gray-400 uppercase tracking-wider">Time</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-700">
              {filteredTransactions.length > 0 ? filteredTransactions.map((tx) => {
                const isSuccess = tx.status === true || tx.status === 'success';
                const isFailed = tx.status === false || tx.status === 'failed';
                return (
                  <tr key={tx.hash} className="hover:bg-slate-700 transition-colors">
                    <td className="px-6 py-4 whitespace-nowrap">
                      <Link
                        href={`/tx/${tx.hash}`}
                        className="text-purple-400 hover:text-purple-300 font-mono text-sm transition-colors"
                      >
                        {formatHash(tx.hash)}
                      </Link>
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap">
                      <Link
                        href={`/blocks/${tx.blockHeight}`}
                        className="text-blue-400 hover:text-blue-300 font-semibold transition-colors"
                      >
                        #{formatNumber(tx.blockHeight)}
                      </Link>
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap">
                      {isSuccess && (
                        <span className="inline-flex items-center px-2.5 py-0.5 rounded-md text-xs font-medium bg-green-500/20 text-green-400 border border-green-500/30">
                          Success
                        </span>
                      )}
                      {isFailed && (
                        <span className="inline-flex items-center px-2.5 py-0.5 rounded-md text-xs font-medium bg-red-500/20 text-red-400 border border-red-500/30">
                          Failed
                        </span>
                      )}
                      {!isSuccess && !isFailed && (
                        <span className="inline-flex items-center px-2.5 py-0.5 rounded-md text-xs font-medium bg-yellow-500/20 text-yellow-400 border border-yellow-500/30">
                          Pending
                        </span>
                      )}
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap">
                      <Link
                        href={`/accounts/${tx.fromAddress}`}
                        className="text-gray-300 hover:text-blue-400 transition-colors"
                      >
                        <code className="text-sm font-mono">{formatAddress(tx.fromAddress)}</code>
                      </Link>
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap">
                      {tx.toAddress ? (
                        <Link
                          href={`/accounts/${tx.toAddress}`}
                          className="text-gray-300 hover:text-blue-400 transition-colors"
                        >
                          <code className="text-sm font-mono">{formatAddress(tx.toAddress)}</code>
                        </Link>
                      ) : (
                        <span className="text-emerald-400 text-sm">Contract Creation</span>
                      )}
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap text-right">
                      <span className="text-white font-medium">
                        {typeof tx.value === 'string' ? weiToXhn(tx.value) : (tx.value / 1e18).toFixed(4)} NOR
                      </span>
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap text-right">
                      <span className="text-gray-300">{formatNumber(parseInt(String(tx.gasUsed || '0')))}</span>
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap text-right">
                      <span className="text-gray-400 text-sm">
                        {formatTimeAgo(typeof tx.timestamp === 'string' ? undefined : tx.timestamp)}
                      </span>
                    </td>
                  </tr>
                );
              }) : (
                <tr>
                  <td colSpan={8} className="px-6 py-12 text-center text-gray-400">
                    {transactions.length === 0 ? (
                      <div className="flex flex-col items-center space-y-3">
                        <svg className="h-16 w-16 text-gray-600" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1} d="M8 7h12m0 0l-4-4m4 4l-4 4m0 6H4m0 0l4 4m-4-4l4-4" />
                        </svg>
                        <p className="text-lg">No transactions found</p>
                        <p className="text-sm text-gray-500">Transactions will appear here as they occur on the network</p>
                      </div>
                    ) : (
                      'No transactions match the current filters'
                    )}
                  </td>
                </tr>
              )}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  );
}


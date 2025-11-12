'use client';

import React from 'react';
import Link from 'next/link';
import { formatAddress, formatHash, formatTimeAgo, weiToXhn } from '@/lib/api-client';

interface InternalTransaction {
  hash: string;
  from: string;
  to: string;
  value: string;
  timestamp: number;
  type: 'call' | 'create' | 'selfdestruct' | 'delegatecall';
}

interface InternalTransactionsProps {
  address: string;
  internalTransactions?: InternalTransaction[];
  isLoading?: boolean;
}

export function InternalTransactions({ address, internalTransactions = [], isLoading = false }: InternalTransactionsProps): JSX.Element {
  if (isLoading) {
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

  if (!internalTransactions || internalTransactions.length === 0) {
    return (
      <div className="text-center text-gray-500 dark:text-gray-400 py-12">
        <svg className="w-16 h-16 mx-auto mb-4 text-gray-400 dark:text-gray-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M9 12h6m-6 4h6m2 5H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z" />
        </svg>
        <p className="text-lg font-medium">No internal transactions found</p>
        <p className="text-sm mt-1">Internal transactions (contract calls) will appear here when available</p>
      </div>
    );
  }

  const getTypeBadge = (type: string) => {
    const badges = {
      call: { label: 'Call', color: 'bg-blue-100 dark:bg-blue-900/30 text-blue-700 dark:text-blue-300' },
      create: { label: 'Create', color: 'bg-green-100 dark:bg-green-900/30 text-green-700 dark:text-green-300' },
      selfdestruct: { label: 'Selfdestruct', color: 'bg-red-100 dark:bg-red-900/30 text-red-700 dark:text-red-300' },
      delegatecall: { label: 'Delegate', color: 'bg-purple-100 dark:bg-purple-900/30 text-purple-700 dark:text-purple-300' },
    };
    const badge = badges[type as keyof typeof badges] || badges.call;
    return (
      <span className={`px-2 py-0.5 text-xs rounded-full ${badge.color}`}>
        {badge.label}
      </span>
    );
  };

  return (
    <div className="space-y-3">
      {internalTransactions.map((itx) => (
        <div
          key={itx.hash}
          className="p-4 border border-gray-200 dark:border-gray-700 rounded-lg hover:border-blue-500 dark:hover:border-blue-500 transition-colors"
        >
          <div className="flex items-center justify-between mb-2">
            <div className="flex items-center gap-2">
              <Link
                href={`/transactions/${itx.hash}`}
                className="font-mono text-sm text-blue-600 dark:text-blue-400 hover:underline"
              >
                {formatHash(itx.hash)}
              </Link>
              {getTypeBadge(itx.type)}
            </div>
            <span className="text-sm text-gray-600 dark:text-gray-400">
              {formatTimeAgo(itx.timestamp)}
            </span>
          </div>
          <div className="flex items-center justify-between text-sm">
            <div className="flex items-center gap-2">
              <span className="text-gray-600 dark:text-gray-400">From:</span>
              <Link
                href={`/accounts/${itx.from}`}
                className="text-gray-900 dark:text-white hover:text-blue-600 dark:hover:text-blue-400 font-mono"
              >
                {formatAddress(itx.from)}
              </Link>
              <span className="text-gray-400">→</span>
              <span className="text-gray-600 dark:text-gray-400">To:</span>
              <Link
                href={`/accounts/${itx.to}`}
                className="text-gray-900 dark:text-white hover:text-blue-600 dark:hover:text-blue-400 font-mono"
              >
                {formatAddress(itx.to)}
              </Link>
            </div>
            <span className="text-gray-900 dark:text-white font-medium">
              {weiToXhn(itx.value)} NOR
            </span>
          </div>
        </div>
      ))}
    </div>
  );
}


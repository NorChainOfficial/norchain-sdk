import React from 'react';
import Link from 'next/link';
import { apiClient, formatTimeAgo, formatAddress, formatNumber, formatHash, weiToXhn } from '@/lib/api-client';

export const revalidate = 3; // Revalidate every 3 seconds for live data

interface PageProps {
  searchParams: { page?: string };
}

export default async function TransactionsPage({ searchParams }: PageProps): Promise<JSX.Element> {
  const currentPage = parseInt(searchParams.page || '1', 10);
  const perPage = 20;

  // Fetch transactions data
  let transactionsData, stats;

  try {
    [transactionsData, stats] = await Promise.all([
      apiClient.getTransactions({ page: currentPage, per_page: perPage }),
      apiClient.getStats(),
    ]);
  } catch (error) {
    console.error('Failed to fetch transactions:', error);
    return (
      <div className="max-w-[1400px] mx-auto px-6 py-8">
        <div className="bg-red-900/20 border border-red-800 rounded-lg p-6">
          <h2 className="text-xl font-bold text-red-100 mb-2">Error Loading Transactions</h2>
          <p className="text-red-300">Failed to load transactions data</p>
        </div>
      </div>
    );
  }

  const transactions = transactionsData?.transactions || [];
  const pagination = transactionsData?.pagination;
  const totalPages = pagination?.totalPages || 1;

  return (
    <div className="max-w-[1400px] mx-auto px-6 py-8">
      {/* Header */}
      <div className="mb-8">
        <div className="flex items-center space-x-4 mb-6">
          <div className="h-14 w-14 bg-purple-600 rounded-xl flex items-center justify-center">
            <svg className="h-8 w-8 text-white" fill="none" viewBox="0 0 24 24" stroke="currentColor">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M8 7h12m0 0l-4-4m4 4l-4 4m0 6H4m0 0l4 4m-4-4l4-4" />
            </svg>
          </div>
          <div>
            <h1 className="text-3xl font-bold text-white">Transactions</h1>
            <p className="text-gray-400 mt-1">Recent transaction activity on Nor Chain</p>
          </div>
        </div>

        {/* Stats Cards */}
        <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
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
              <div className="text-gray-400 text-sm uppercase tracking-wider">Status</div>
              <div className="h-2 w-2 rounded-full bg-green-500 animate-pulse" />
            </div>
            <div className="text-2xl font-bold text-green-400">LIVE</div>
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
              {transactions.length > 0 ? transactions.map((tx: any) => {
                const isSuccess = tx.status === true;
                const isFailed = tx.status === false;
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
                    <code className="text-sm text-gray-300 font-mono">{formatAddress(tx.fromAddress)}</code>
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap">
                    <code className="text-sm text-gray-300 font-mono">
                      {tx.toAddress ? formatAddress(tx.toAddress) : <span className="text-emerald-400">Contract Creation</span>}
                    </code>
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap text-right">
                    <span className="text-white font-medium">{weiToXhn(tx.value)} NOR</span>
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap text-right">
                    <span className="text-gray-300">{formatNumber(parseInt(tx.gasUsed || '0'))}</span>
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap text-right">
                    <span className="text-gray-400 text-sm">{formatTimeAgo(tx.timestamp)}</span>
                  </td>
                </tr>
                );
              }) : (
                <tr>
                  <td colSpan={8} className="px-6 py-12 text-center text-gray-400">
                    <div className="flex flex-col items-center space-y-3">
                      <svg className="h-16 w-16 text-gray-600" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1} d="M8 7h12m0 0l-4-4m4 4l-4 4m0 6H4m0 0l4 4m-4-4l4-4" />
                      </svg>
                      <p className="text-lg">No transactions found</p>
                      <p className="text-sm text-gray-500">Transactions will appear here as they occur on the network</p>
                    </div>
                  </td>
                </tr>
              )}
            </tbody>
          </table>
        </div>
      </div>

      {/* Pagination */}
      {pagination && totalPages > 1 && (
        <div className="mt-6 flex items-center justify-between">
          <div className="text-sm text-gray-400">
            Page <span className="text-white font-semibold">{currentPage}</span> of <span className="text-white font-semibold">{totalPages}</span>
            <span className="ml-4">
              Total: <span className="text-white font-semibold">{formatNumber(pagination.totalCount)}</span> transactions
            </span>
          </div>
          <div className="flex space-x-2">
            {currentPage > 1 ? (
              <Link
                href={`/transactions?page=${currentPage - 1}`}
                className="px-4 py-2 bg-slate-700 hover:bg-slate-600 text-white rounded-lg transition-colors font-medium"
              >
                ← Previous
              </Link>
            ) : (
              <button
                disabled
                className="px-4 py-2 bg-slate-900 text-gray-600 rounded-lg cursor-not-allowed font-medium"
              >
                ← Previous
              </button>
            )}

            {currentPage < totalPages ? (
              <Link
                href={`/transactions?page=${currentPage + 1}`}
                className="px-4 py-2 bg-purple-600 hover:bg-purple-700 text-white rounded-lg transition-colors font-medium"
              >
                Next →
              </Link>
            ) : (
              <button
                disabled
                className="px-4 py-2 bg-slate-900 text-gray-600 rounded-lg cursor-not-allowed font-medium"
              >
                Next →
              </button>
            )}
          </div>
        </div>
      )}
    </div>
  );
}

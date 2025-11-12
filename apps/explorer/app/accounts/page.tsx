import React from 'react';
import Link from 'next/link';
import { apiClient, formatTimeAgo, formatAddress, formatNumber, weiToXhn } from '@/lib/api-client';

export const revalidate = 3; // Revalidate every 3 seconds for live data

interface PageProps {
  searchParams: { page?: string };
}

export default async function AccountsPage({ searchParams }: PageProps): Promise<JSX.Element> {
  const currentPage = parseInt(searchParams.page || '1', 10);
  const perPage = 20;

  // Fetch accounts data
  let accountsData, stats;

  try {
    [accountsData, stats] = await Promise.all([
      apiClient.getAccounts({ page: currentPage, per_page: perPage }),
      apiClient.getStats(),
    ]);
  } catch (error) {
    console.error('Failed to fetch accounts:', error);
    return (
      <div className="max-w-[1400px] mx-auto px-6 py-8">
        <div className="bg-red-900/20 border border-red-800 rounded-lg p-6">
          <h2 className="text-xl font-bold text-red-100 mb-2">Error Loading Accounts</h2>
          <p className="text-red-300">Failed to load accounts data</p>
        </div>
      </div>
    );
  }

  const accounts = accountsData?.accounts || [];
  const pagination = accountsData?.pagination;
  const totalPages = pagination?.totalPages || 1;

  return (
    <div className="max-w-[1400px] mx-auto px-6 py-8">
      {/* Header */}
      <div className="mb-8">
        <div className="flex items-center space-x-4 mb-6">
          <div className="h-14 w-14 bg-emerald-600 rounded-xl flex items-center justify-center">
            <svg className="h-8 w-8 text-white" fill="none" viewBox="0 0 24 24" stroke="currentColor">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M17 20h5v-2a3 3 0 00-5.356-1.857M17 20H7m10 0v-2c0-.656-.126-1.283-.356-1.857M7 20H2v-2a3 3 0 015.356-1.857M7 20v-2c0-.656.126-1.283.356-1.857m0 0a5.002 5.002 0 019.288 0M15 7a3 3 0 11-6 0 3 3 0 016 0zm6 3a2 2 0 11-4 0 2 2 0 014 0zM7 10a2 2 0 11-4 0 2 2 0 014 0z" />
            </svg>
          </div>
          <div>
            <h1 className="text-3xl font-bold text-white">Accounts</h1>
            <p className="text-gray-400 mt-1">All accounts on Nor Chain</p>
          </div>
        </div>

        {/* Stats Cards */}
        <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
          <div className="bg-slate-800 rounded-lg p-6 border border-slate-700">
            <div className="flex items-center justify-between mb-2">
              <div className="text-gray-400 text-sm uppercase tracking-wider">Total Accounts</div>
              <svg className="h-5 w-5 text-gray-500" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M17 20h5v-2a3 3 0 00-5.356-1.857M17 20H7m10 0v-2c0-.656-.126-1.283-.356-1.857M7 20H2v-2a3 3 0 015.356-1.857M7 20v-2c0-.656.126-1.283.356-1.857m0 0a5.002 5.002 0 019.288 0M15 7a3 3 0 11-6 0 3 3 0 016 0zm6 3a2 2 0 11-4 0 2 2 0 014 0zM7 10a2 2 0 11-4 0 2 2 0 014 0z" />
              </svg>
            </div>
            <div className="text-2xl font-bold text-white">{formatNumber(pagination?.totalCount || 0)}</div>
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

      {/* Accounts Table */}
      <div className="bg-slate-800 rounded-xl border border-slate-700 overflow-hidden">
        <div className="overflow-x-auto">
          <table className="w-full">
            <thead className="bg-slate-900 border-b border-slate-700">
              <tr>
                <th className="px-3 md:px-6 py-4 text-left text-xs font-medium text-gray-400 uppercase tracking-wider">Address</th>
                <th className="px-3 md:px-6 py-4 text-right text-xs font-medium text-gray-400 uppercase tracking-wider">Balance</th>
                <th className="hidden md:table-cell px-6 py-4 text-right text-xs font-medium text-gray-400 uppercase tracking-wider">Transactions</th>
                <th className="hidden lg:table-cell px-6 py-4 text-right text-xs font-medium text-gray-400 uppercase tracking-wider">Last Active</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-700">
              {accounts.length > 0 ? accounts.map((account: any) => (
                <tr key={account.address} className="hover:bg-slate-700 transition-colors">
                  <td className="px-3 md:px-6 py-4 whitespace-nowrap">
                    <Link
                      href={`/address/${account.address}`}
                      className="text-emerald-400 hover:text-emerald-300 font-mono text-xs md:text-sm transition-colors"
                    >
                      {account.address}
                    </Link>
                  </td>
                  <td className="px-3 md:px-6 py-4 whitespace-nowrap text-right">
                    <span className="text-white font-medium text-xs md:text-sm">{weiToXhn(account.balance)} NOR</span>
                  </td>
                  <td className="hidden md:table-cell px-6 py-4 whitespace-nowrap text-right">
                    <span className="text-gray-300 text-sm">{formatNumber(account.transactionCount || 0)}</span>
                  </td>
                  <td className="hidden lg:table-cell px-6 py-4 whitespace-nowrap text-right">
                    <span className="text-gray-400 text-sm">
                      {account.updatedAt ? formatTimeAgo(Math.floor(new Date(account.updatedAt).getTime() / 1000)) : 'Never'}
                    </span>
                  </td>
                </tr>
              )) : (
                <tr>
                  <td colSpan={4} className="px-3 md:px-6 py-12 text-center text-gray-400">
                    <div className="flex flex-col items-center space-y-3">
                      <svg className="h-16 w-16 text-gray-600" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1} d="M17 20h5v-2a3 3 0 00-5.356-1.857M17 20H7m10 0v-2c0-.656-.126-1.283-.356-1.857M7 20H2v-2a3 3 0 015.356-1.857M7 20v-2c0-.656.126-1.283.356-1.857m0 0a5.002 5.002 0 019.288 0M15 7a3 3 0 11-6 0 3 3 0 016 0zm6 3a2 2 0 11-4 0 2 2 0 014 0zM7 10a2 2 0 11-4 0 2 2 0 014 0z" />
                      </svg>
                      <p className="text-lg">No accounts found</p>
                      <p className="text-sm text-gray-500">Accounts will appear here as they interact with the network</p>
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
              Total: <span className="text-white font-semibold">{formatNumber(pagination.total)}</span> accounts
            </span>
          </div>
          <div className="flex space-x-2">
            {currentPage > 1 ? (
              <Link
                href={`/accounts?page=${currentPage - 1}`}
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
                href={`/accounts?page=${currentPage + 1}`}
                className="px-4 py-2 bg-emerald-600 hover:bg-emerald-700 text-white rounded-lg transition-colors font-medium"
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

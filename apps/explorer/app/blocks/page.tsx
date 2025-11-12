import React from 'react';
import Link from 'next/link';
import { apiClient, formatTimeAgo, formatAddress, formatNumber, formatHash } from '@/lib/api-client';

export const revalidate = 3; // Revalidate every 3 seconds for live data

interface PageProps {
  searchParams: { page?: string };
}

export default async function BlocksPage({ searchParams }: PageProps): Promise<JSX.Element> {
  const currentPage = parseInt(searchParams.page || '1', 10);
  const perPage = 20;

  // Fetch blocks data
  let blocksData, stats;

  try {
    [blocksData, stats] = await Promise.all([
      apiClient.getBlocks({ page: currentPage, per_page: perPage }),
      apiClient.getStats(),
    ]);
  } catch (error) {
    console.error('Failed to fetch blocks:', error);
    return (
      <div className="max-w-[1400px] mx-auto px-6 py-8">
        <div className="bg-red-900/20 border border-red-800 rounded-lg p-6">
          <h2 className="text-xl font-bold text-red-100 mb-2">Error Loading Blocks</h2>
          <p className="text-red-300">Failed to load blocks data</p>
        </div>
      </div>
    );
  }

  const blocks = blocksData?.data || [];
  const pagination = blocksData?.pagination;
  const totalPages = pagination?.totalPages || 1;

  return (
    <div className="max-w-[1400px] mx-auto px-6 py-8">
      {/* Header */}
      <div className="mb-8">
        <div className="flex items-center space-x-4 mb-6">
          <div className="h-14 w-14 bg-blue-600 rounded-xl flex items-center justify-center">
            <svg className="h-8 w-8 text-white" fill="none" viewBox="0 0 24 24" stroke="currentColor">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 11H5m14 0a2 2 0 012 2v6a2 2 0 01-2 2H5a2 2 0 01-2-2v-6a2 2 0 012-2m14 0V9a2 2 0 00-2-2M5 11V9a2 2 0 012-2m0 0V5a2 2 0 012-2h6a2 2 0 012 2v2M7 7h10" />
            </svg>
          </div>
          <div>
            <h1 className="text-3xl font-bold text-white">Blocks</h1>
            <p className="text-gray-400 mt-1">Real-time block data on Nor Chain</p>
          </div>
        </div>

        {/* Stats Cards */}
        <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
          <div className="bg-slate-800 rounded-lg p-6 border border-slate-700">
            <div className="flex items-center justify-between mb-2">
              <div className="text-gray-400 text-sm uppercase tracking-wider">Total Blocks</div>
              <svg className="h-5 w-5 text-gray-500" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 11H5m14 0a2 2 0 012 2v6a2 2 0 01-2 2H5a2 2 0 01-2-2v-6a2 2 0 012-2m14 0V9a2 2 0 00-2-2M5 11V9a2 2 0 012-2m0 0V5a2 2 0 012-2h6a2 2 0 012 2v2M7 7h10" />
              </svg>
            </div>
            <div className="text-2xl font-bold text-white">#{formatNumber(stats?.blockHeight || 0)}</div>
          </div>

          <div className="bg-slate-800 rounded-lg p-6 border border-slate-700">
            <div className="flex items-center justify-between mb-2">
              <div className="text-gray-400 text-sm uppercase tracking-wider">Avg Block Time</div>
              <svg className="h-5 w-5 text-gray-500" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 8v4l3 3m6-3a9 9 0 11-18 0 9 9 0 0118 0z" />
              </svg>
            </div>
            <div className="text-2xl font-bold text-white">{stats?.averageBlockTime || 3}s</div>
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

      {/* Blocks Table */}
      <div className="bg-slate-800 rounded-xl border border-slate-700 overflow-hidden">
        <div className="overflow-x-auto">
          <table className="w-full">
            <thead className="bg-slate-900 border-b border-slate-700">
              <tr>
                <th className="px-6 py-4 text-left text-xs font-medium text-gray-400 uppercase tracking-wider">Block</th>
                <th className="px-6 py-4 text-left text-xs font-medium text-gray-400 uppercase tracking-wider">Hash</th>
                <th className="px-6 py-4 text-left text-xs font-medium text-gray-400 uppercase tracking-wider">Validator</th>
                <th className="px-6 py-4 text-right text-xs font-medium text-gray-400 uppercase tracking-wider">Txns</th>
                <th className="px-6 py-4 text-right text-xs font-medium text-gray-400 uppercase tracking-wider">Gas Used</th>
                <th className="px-6 py-4 text-right text-xs font-medium text-gray-400 uppercase tracking-wider">Time</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-700">
              {blocks.length > 0 ? blocks.map((block: any) => (
                <tr key={block.height} className="hover:bg-slate-700 transition-colors">
                  <td className="px-6 py-4 whitespace-nowrap">
                    <Link
                      href={`/blocks/${block.height}`}
                      className="text-blue-400 hover:text-blue-300 font-semibold font-mono transition-colors"
                    >
                      #{formatNumber(block.height)}
                    </Link>
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap">
                    <code className="text-sm text-gray-300 font-mono">{formatHash(block.hash)}</code>
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap">
                    <code className="text-sm text-gray-300 font-mono">{formatAddress(block.validator)}</code>
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap text-right">
                    <span className="text-white font-medium">{block.transactions}</span>
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap text-right">
                    <span className="text-gray-300">{formatNumber(parseInt(block.gasUsed))}</span>
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap text-right">
                    <span className="text-gray-400 text-sm">{formatTimeAgo(block.timestamp)}</span>
                  </td>
                </tr>
              )) : (
                <tr>
                  <td colSpan={6} className="px-6 py-12 text-center text-gray-400">
                    No blocks found
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
              Total: <span className="text-white font-semibold">{formatNumber(pagination.total)}</span> blocks
            </span>
          </div>
          <div className="flex space-x-2">
            {currentPage > 1 ? (
              <Link
                href={`/blocks?page=${currentPage - 1}`}
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
                href={`/blocks?page=${currentPage + 1}`}
                className="px-4 py-2 bg-blue-600 hover:bg-blue-700 text-white rounded-lg transition-colors font-medium"
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

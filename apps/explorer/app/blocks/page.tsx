import React from 'react';
import Link from 'next/link';
import { apiClient, formatNumber } from '@/lib/api-client';
import { BlocksTable } from '@/components/blocks/BlocksTable';

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
      </div>

      {/* Enhanced Blocks Table with Filters */}
      <BlocksTable initialBlocks={blocks} stats={stats || {}} />

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

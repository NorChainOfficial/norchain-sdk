import React from 'react';
import Link from 'next/link';
import { apiClient, formatTimeAgo, formatAddress, formatNumber, formatHash } from '@/lib/api-client';
import { notFound } from 'next/navigation';

export const revalidate = 3; // Revalidate every 3 seconds for live data

interface PageProps {
  params: { height: string };
}

export default async function BlockDetailPage({ params }: PageProps): Promise<JSX.Element> {
  const height = parseInt(params.height, 10);

  if (isNaN(height)) {
    notFound();
  }

  // Fetch block data
  let block, transactions;

  try {
    [block, transactions] = await Promise.all([
      apiClient.getBlock(height),
      apiClient.getTransactions({ block_height: height, per_page: 100 }),
    ]);
  } catch (error) {
    console.error('Failed to fetch block:', error);
    notFound();
  }

  if (!block) {
    notFound();
  }

  const txList = transactions?.data || [];

  return (
    <div className="max-w-[1400px] mx-auto px-6 py-8">
      {/* Breadcrumb */}
      <div className="mb-6 flex items-center space-x-2 text-sm text-gray-400">
        <Link href="/" className="hover:text-white transition-colors">
          Home
        </Link>
        <span>/</span>
        <Link href="/blocks" className="hover:text-white transition-colors">
          Blocks
        </Link>
        <span>/</span>
        <span className="text-white">#{formatNumber(block.height)}</span>
      </div>

      {/* Block Header */}
      <div className="mb-8 bg-gradient-to-r from-blue-600 to-blue-700 rounded-xl p-8 text-white">
        <div className="flex items-start justify-between mb-6">
          <div className="flex items-center space-x-4">
            <div className="h-16 w-16 bg-white/20 rounded-xl flex items-center justify-center">
              <svg className="h-10 w-10" fill="currentColor" viewBox="0 0 20 20">
                <path d="M3 4a1 1 0 011-1h12a1 1 0 011 1v2a1 1 0 01-1 1H4a1 1 0 01-1-1V4zM3 10a1 1 0 011-1h6a1 1 0 011 1v6a1 1 0 01-1 1H4a1 1 0 01-1-1v-6zM14 9a1 1 0 00-1 1v6a1 1 0 001 1h2a1 1 0 001-1v-6a1 1 0 00-1-1h-2z" />
              </svg>
            </div>
            <div>
              <h1 className="text-4xl font-bold">Block #{formatNumber(block.height)}</h1>
              <p className="text-blue-100 mt-2">{formatTimeAgo(block.timestamp)}</p>
            </div>
          </div>

          <div className="px-4 py-2 bg-green-500/20 rounded-lg border border-green-400/30 flex items-center space-x-2">
            <div className="h-2 w-2 rounded-full bg-green-400 animate-pulse" />
            <span className="text-sm font-medium">Confirmed</span>
          </div>
        </div>

        {/* Block Hash */}
        <div className="bg-white/10 rounded-lg p-4 border border-white/20">
          <div className="text-sm text-blue-100 mb-2">Block Hash</div>
          <code className="font-mono text-sm break-all">{block.hash}</code>
        </div>
      </div>

      {/* Block Navigation */}
      <div className="mb-8 flex items-center justify-between">
        {height > 0 ? (
          <Link
            href={`/blocks/${height - 1}`}
            className="flex items-center space-x-2 px-4 py-2 bg-slate-800 hover:bg-slate-700 text-white rounded-lg transition-colors border border-slate-700"
          >
            <svg className="h-5 w-5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 19l-7-7 7-7" />
            </svg>
            <span>Previous Block</span>
          </Link>
        ) : (
          <div />
        )}

        <Link
          href={`/blocks/${height + 1}`}
          className="flex items-center space-x-2 px-4 py-2 bg-blue-600 hover:bg-blue-700 text-white rounded-lg transition-colors"
        >
          <span>Next Block</span>
          <svg className="h-5 w-5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 5l7 7-7 7" />
          </svg>
        </Link>
      </div>

      {/* Block Details Grid */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6 mb-8">
        <div className="bg-slate-800 rounded-lg p-6 border border-slate-700">
          <div className="text-gray-400 text-sm uppercase tracking-wider mb-2">Height</div>
          <div className="text-2xl font-bold text-white">{formatNumber(block.height)}</div>
        </div>

        <div className="bg-slate-800 rounded-lg p-6 border border-slate-700">
          <div className="text-gray-400 text-sm uppercase tracking-wider mb-2">Transactions</div>
          <div className="text-2xl font-bold text-white">{block.transactions}</div>
        </div>

        <div className="bg-slate-800 rounded-lg p-6 border border-slate-700">
          <div className="text-gray-400 text-sm uppercase tracking-wider mb-2">Gas Used</div>
          <div className="text-2xl font-bold text-white">{formatNumber(parseInt(block.gasUsed))}</div>
          <div className="text-sm text-gray-400 mt-1">
            {((parseInt(block.gasUsed) / parseInt(block.gasLimit)) * 100).toFixed(2)}% of {formatNumber(parseInt(block.gasLimit))}
          </div>
        </div>

        <div className="bg-slate-800 rounded-lg p-6 border border-slate-700">
          <div className="text-gray-400 text-sm uppercase tracking-wider mb-2">Block Size</div>
          <div className="text-2xl font-bold text-white">{formatNumber(block.size)}</div>
          <div className="text-sm text-gray-400 mt-1">bytes</div>
        </div>
      </div>

      {/* Additional Details */}
      <div className="bg-slate-800 rounded-xl border border-slate-700 overflow-hidden mb-8">
        <div className="p-6 border-b border-slate-700">
          <h2 className="text-xl font-bold text-white">Block Details</h2>
        </div>
        <div className="divide-y divide-slate-700">
          <div className="p-6 grid grid-cols-1 md:grid-cols-3 gap-4">
            <div className="text-gray-400 text-sm uppercase tracking-wider">Timestamp</div>
            <div className="md:col-span-2">
              <div className="text-white font-mono">{new Date(block.timestamp * 1000).toUTCString()}</div>
              <div className="text-sm text-gray-400 mt-1">{formatTimeAgo(block.timestamp)}</div>
            </div>
          </div>

          <div className="p-6 grid grid-cols-1 md:grid-cols-3 gap-4">
            <div className="text-gray-400 text-sm uppercase tracking-wider">Validator</div>
            <div className="md:col-span-2">
              <code className="text-white font-mono text-sm">{block.validator}</code>
            </div>
          </div>

          <div className="p-6 grid grid-cols-1 md:grid-cols-3 gap-4">
            <div className="text-gray-400 text-sm uppercase tracking-wider">Gas Limit</div>
            <div className="md:col-span-2 text-white">{formatNumber(parseInt(block.gasLimit))}</div>
          </div>

          <div className="p-6 grid grid-cols-1 md:grid-cols-3 gap-4">
            <div className="text-gray-400 text-sm uppercase tracking-wider">Gas Used</div>
            <div className="md:col-span-2 text-white">{formatNumber(parseInt(block.gasUsed))}</div>
          </div>
        </div>
      </div>

      {/* Transactions */}
      <div className="bg-slate-800 rounded-xl border border-slate-700 overflow-hidden">
        <div className="p-6 border-b border-slate-700">
          <h2 className="text-xl font-bold text-white">Transactions ({txList.length})</h2>
        </div>

        {txList.length === 0 ? (
          <div className="p-12 text-center text-gray-400">
            <svg className="h-16 w-16 mx-auto mb-4 text-gray-600" fill="none" viewBox="0 0 24 24" stroke="currentColor">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1} d="M8 7h12m0 0l-4-4m4 4l-4 4m0 6H4m0 0l4 4m-4-4l4-4" />
            </svg>
            <p className="text-lg">No transactions in this block</p>
          </div>
        ) : (
          <div className="divide-y divide-slate-700">
            {txList.map((tx: any) => (
              <Link
                key={tx.hash}
                href={`/tx/${tx.hash}`}
                className="flex items-center justify-between p-6 hover:bg-slate-700 transition-colors"
              >
                <div className="flex items-center space-x-4">
                  <div className="h-10 w-10 bg-purple-600/10 rounded-lg flex items-center justify-center">
                    <svg className="h-5 w-5 text-purple-500" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M8 7h12m0 0l-4-4m4 4l-4 4m0 6H4m0 0l4 4m-4-4l4-4" />
                    </svg>
                  </div>
                  <div>
                    <code className="text-purple-400 font-mono text-sm">{formatHash(tx.hash)}</code>
                    <div className="text-sm text-gray-400 mt-1">
                      From: {formatAddress(tx.from)} → To: {formatAddress(tx.to || 'Contract')}
                    </div>
                  </div>
                </div>
                <div className="text-right">
                  <div className="text-white font-medium">{formatTimeAgo(tx.timestamp)}</div>
                  <div className="text-sm text-gray-400">Gas: {formatNumber(parseInt(tx.gasUsed || '0'))}</div>
                </div>
              </Link>
            ))}
          </div>
        )}
      </div>
    </div>
  );
}

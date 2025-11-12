import React from 'react';
import Link from 'next/link';
import { apiClient, formatTimeAgo, formatAddress, formatHash, formatNumber, weiToXhn } from '@/lib/api-client';
import { WalletConnector } from '@/components/wallet/WalletConnector';

export const revalidate = 3; // Revalidate every 3 seconds for live data

export default async function HomePage(): Promise<JSX.Element> {
  // Fetch live data from API
  let stats, latestBlocks, latestTransactions;

  try {
    [stats, latestBlocks, latestTransactions] = await Promise.all([
      apiClient.getStats(),
      apiClient.getBlocks({ page: 1, per_page: 5 }),
      apiClient.getTransactions({ page: 1, per_page: 5 }),
    ]);
  } catch (error) {
    console.error('Failed to fetch data:', error);
    // Use fallback data
    stats = {
      blockHeight: 0,
      totalTransactions: 0,
      totalAccounts: 0,
      gasPrice: '1000000000',
      activeValidators: 5,
    };
    latestBlocks = { data: [] };
    latestTransactions = { data: [] };
  }

  const blocks = latestBlocks?.data || [];
  const transactions = latestTransactions?.transactions || [];
  return (
    <div className="max-w-[1400px] mx-auto px-6 py-8">
        {/* Network Stats Banner - PROFESSIONAL */}
        <div className="grid grid-cols-2 md:grid-cols-4 gap-4 mb-8">
          <div className="bg-slate-800 rounded-lg p-6 border border-slate-700 hover:border-slate-600 transition-colors">
            <div className="flex items-center justify-between mb-3">
              <div className="text-gray-400 text-xs font-medium uppercase tracking-wider">Latest Block</div>
              <svg className="h-4 w-4 text-gray-500" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 11H5m14 0a2 2 0 012 2v6a2 2 0 01-2 2H5a2 2 0 01-2-2v-6a2 2 0 012-2m14 0V9a2 2 0 00-2-2M5 11V9a2 2 0 012-2m0 0V5a2 2 0 012-2h6a2 2 0 012 2v2M7 7h10" />
              </svg>
            </div>
            <div className="text-2xl font-semibold text-white mb-1">#{formatNumber(stats?.blockHeight || 0)}</div>
            <div className="text-sm text-gray-400">{stats?.activeValidators || 0} validators</div>
          </div>

          <div className="bg-slate-800 rounded-lg p-6 border border-slate-700 hover:border-slate-600 transition-colors">
            <div className="flex items-center justify-between mb-3">
              <div className="text-gray-400 text-xs font-medium uppercase tracking-wider">Transactions</div>
              <svg className="h-4 w-4 text-gray-500" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M8 7h12m0 0l-4-4m4 4l-4 4m0 6H4m0 0l4 4m-4-4l4-4" />
              </svg>
            </div>
            <div className="text-2xl font-semibold text-white mb-1">{formatNumber(stats?.totalTransactions || 0)}</div>
            <div className="text-sm text-gray-400">Total TXs</div>
          </div>

          <div className="bg-slate-800 rounded-lg p-6 border border-slate-700 hover:border-slate-600 transition-colors">
            <div className="flex items-center justify-between mb-3">
              <div className="text-gray-400 text-xs font-medium uppercase tracking-wider">Total Accounts</div>
              <svg className="h-4 w-4 text-gray-500" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M17 20h5v-2a3 3 0 00-5.356-1.857M17 20H7m10 0v-2c0-.656-.126-1.283-.356-1.857M7 20H2v-2a3 3 0 015.356-1.857M7 20v-2c0-.656.126-1.283.356-1.857m0 0a5.002 5.002 0 019.288 0M15 7a3 3 0 11-6 0 3 3 0 016 0zm6 3a2 2 0 11-4 0 2 2 0 014 0zM7 10a2 2 0 11-4 0 2 2 0 014 0z" />
              </svg>
            </div>
            <div className="text-2xl font-semibold text-white mb-1">{formatNumber(stats?.totalAccounts || 0)}</div>
            <div className="text-sm text-gray-400">Addresses</div>
          </div>

          <div className="bg-slate-800 rounded-lg p-6 border border-slate-700 hover:border-slate-600 transition-colors">
            <div className="flex items-center justify-between mb-3">
              <div className="text-gray-400 text-xs font-medium uppercase tracking-wider">Gas Price</div>
              <svg className="h-4 w-4 text-gray-500" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M13 10V3L4 14h7v7l9-11h-7z" />
              </svg>
            </div>
            <div className="text-2xl font-semibold text-white mb-1">{(Number(stats?.gasPrice || 0) / 1e9).toFixed(2)} Gwei</div>
            <div className="text-sm text-gray-400">Current gas</div>
          </div>
        </div>

        {/* Main Content Grid - FULL WIDTH */}
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-6 mb-8">
          {/* Latest Blocks */}
          <div className="bg-slate-800 rounded-xl border border-slate-700 overflow-hidden">
            <div className="p-6 border-b border-slate-700 flex items-center justify-between">
              <div>
                <h2 className="text-xl font-bold text-white">Latest Blocks</h2>
                <p className="text-sm text-gray-400 mt-1">Real-time block updates</p>
              </div>
              <Link href="/blocks" className="px-4 py-2 bg-blue-600 hover:bg-blue-700 text-white rounded-lg text-sm font-medium transition-colors">
                View All
              </Link>
            </div>

            <div className="divide-y divide-slate-700">
              {blocks.length > 0 ? blocks.map((block: any) => (
                <Link
                  key={block.height}
                  href={`/blocks/${block.height}`}
                  className="flex items-center justify-between p-4 hover:bg-slate-700 transition-colors"
                >
                  <div className="flex items-center space-x-4">
                    <div className="h-12 w-12 bg-blue-600/10 rounded-lg flex items-center justify-center">
                      <svg className="h-6 w-6 text-blue-500" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 11H5m14 0a2 2 0 012 2v6a2 2 0 01-2 2H5a2 2 0 01-2-2v-6a2 2 0 012-2m14 0V9a2 2 0 00-2-2M5 11V9a2 2 0 012-2m0 0V5a2 2 0 012-2h6a2 2 0 012 2v2M7 7h10" />
                      </svg>
                    </div>
                    <div>
                      <div className="text-white font-semibold">#{formatNumber(block.height)}</div>
                      <div className="text-sm text-gray-400">Validator: {formatAddress(block.validator)}</div>
                    </div>
                  </div>
                  <div className="text-right">
                    <div className="text-white font-medium">{block.transactions} txs</div>
                    <div className="text-sm text-gray-400">{formatTimeAgo(block.timestamp)}</div>
                  </div>
                </Link>
              )) : (
                <div className="p-8 text-center text-gray-400">
                  No blocks available
                </div>
              )}
            </div>
          </div>

          {/* Latest Transactions */}
          <div className="bg-slate-800 rounded-xl border border-slate-700 overflow-hidden">
            <div className="p-6 border-b border-slate-700 flex items-center justify-between">
              <div>
                <h2 className="text-xl font-bold text-white">Latest Transactions</h2>
                <p className="text-sm text-gray-400 mt-1">Recent network activity</p>
              </div>
              <Link href="/transactions" className="px-4 py-2 bg-purple-600 hover:bg-purple-700 text-white rounded-lg text-sm font-medium transition-colors">
                View All
              </Link>
            </div>

            <div className="divide-y divide-slate-700">
              {transactions.length > 0 ? transactions.map((tx: any) => (
                <Link
                  key={tx.hash}
                  href={`/tx/${tx.hash}`}
                  className="flex items-center justify-between p-4 hover:bg-slate-700 transition-colors"
                >
                  <div className="flex items-center space-x-4">
                    <div className="h-12 w-12 bg-purple-600/10 rounded-lg flex items-center justify-center">
                      <svg className="h-6 w-6 text-purple-500" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M8 7h12m0 0l-4-4m4 4l-4 4m0 6H4m0 0l4 4m-4-4l4-4" />
                      </svg>
                    </div>
                    <div>
                      <div className="text-white font-mono text-sm">{formatHash(tx.hash)}</div>
                      <div className="text-sm text-gray-400">
                        From: {formatAddress(tx.fromAddress)} → To: {formatAddress(tx.toAddress || 'Contract Creation')}
                      </div>
                    </div>
                  </div>
                  <div className="text-right">
                    <div className="text-white font-medium">{weiToXhn(tx.value)} NOR</div>
                    <div className="text-sm text-gray-400">{formatTimeAgo(tx.timestamp)}</div>
                  </div>
                </Link>
              )) : (
                <div className="p-8 text-center text-gray-400">
                  No recent transactions
                </div>
              )}
            </div>
          </div>
        </div>

        {/* Feature Cards Grid - PROFESSIONAL */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6 mb-8">
          {/* Verified Contracts - REAL DATA */}
          <Link
            href="/contracts/verified"
            className="group bg-slate-800 rounded-lg p-6 border border-slate-700 hover:border-emerald-600 transition-all"
          >
            <div className="flex items-center justify-between mb-4">
              <div className="h-12 w-12 flex-shrink-0 bg-emerald-600/10 rounded-lg flex items-center justify-center">
                <svg className="h-6 w-6 text-emerald-500" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12l2 2 4-4m6 2a9 9 0 11-18 0 9 9 0 0118 0z" />
                </svg>
              </div>
            </div>
            <h3 className="text-lg font-semibold text-white mb-2">Verified Contracts</h3>
            <p className="text-gray-400 mb-4 text-sm">Browse verified smart contracts</p>
            <div className="flex items-baseline space-x-2">
              <div className="text-3xl font-semibold text-white">{formatNumber(stats?.totalContracts || 0)}</div>
              <div className="text-sm text-gray-500">contracts</div>
            </div>
          </Link>

          {/* Total Accounts - REAL DATA */}
          <Link
            href="/accounts"
            className="group bg-slate-800 rounded-lg p-6 border border-slate-700 hover:border-blue-600 transition-all"
          >
            <div className="flex items-center justify-between mb-4">
              <div className="h-12 w-12 flex-shrink-0 bg-blue-600/10 rounded-lg flex items-center justify-center">
                <svg className="h-6 w-6 text-blue-500" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M17 20h5v-2a3 3 0 00-5.356-1.857M17 20H7m10 0v-2c0-.656-.126-1.283-.356-1.857M7 20H2v-2a3 3 0 015.356-1.857M7 20v-2c0-.656.126-1.283.356-1.857m0 0a5.002 5.002 0 019.288 0M15 7a3 3 0 11-6 0 3 3 0 016 0zm6 3a2 2 0 11-4 0 2 2 0 014 0zM7 10a2 2 0 11-4 0 2 2 0 014 0z" />
                </svg>
              </div>
            </div>
            <h3 className="text-lg font-semibold text-white mb-2">Total Accounts</h3>
            <p className="text-gray-400 mb-4 text-sm">Active blockchain accounts</p>
            <div className="flex items-baseline space-x-2">
              <div className="text-3xl font-semibold text-white">{formatNumber(stats?.totalAccounts || 0)}</div>
              <div className="text-sm text-gray-500">accounts</div>
            </div>
          </Link>

          {/* Tokens - REAL DATA */}
          <Link
            href="/tokens"
            className="group bg-slate-800 rounded-lg p-6 border border-slate-700 hover:border-purple-600 transition-all"
          >
            <div className="flex items-center justify-between mb-4">
              <div className="h-12 w-12 flex-shrink-0 bg-purple-600/10 rounded-lg flex items-center justify-center">
                <svg className="h-6 w-6 text-purple-500" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 8c-1.657 0-3 .895-3 2s1.343 2 3 2 3 .895 3 2-1.343 2-3 2m0-8c1.11 0 2.08.402 2.599 1M12 8V7m0 1v8m0 0v1m0-1c-1.11 0-2.08-.402-2.599-1M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
                </svg>
              </div>
            </div>
            <h3 className="text-lg font-semibold text-white mb-2">Tokens</h3>
            <p className="text-gray-400 mb-4 text-sm">Browse all tokens</p>
            <div className="flex items-baseline space-x-2">
              <div className="text-3xl font-semibold text-white">{formatNumber(stats?.totalTokens || 0)}</div>
              <div className="text-sm text-gray-500">tokens</div>
            </div>
          </Link>

          {/* Analytics - REAL DATA */}
          <Link
            href="/analytics"
            className="group bg-slate-800 rounded-lg p-6 border border-slate-700 hover:border-orange-600 transition-all"
          >
            <div className="flex items-center justify-between mb-4">
              <div className="h-12 w-12 flex-shrink-0 bg-orange-600/10 rounded-lg flex items-center justify-center">
                <svg className="h-6 w-6 text-orange-500" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 19v-6a2 2 0 00-2-2H5a2 2 0 00-2 2v6a2 2 0 002 2h2a2 2 0 002-2zm0 0V9a2 2 0 012-2h2a2 2 0 012 2v10m-6 0a2 2 0 002 2h2a2 2 0 002-2m0 0V5a2 2 0 012-2h2a2 2 0 012 2v14a2 2 0 01-2 2h-2a2 2 0 01-2-2z" />
                </svg>
              </div>
            </div>
            <h3 className="text-lg font-semibold text-white mb-2">Network Analytics</h3>
            <p className="text-gray-400 mb-4 text-sm">Real-time insights</p>
            <div className="flex items-baseline space-x-2">
              <div className="text-3xl font-semibold text-white">{formatNumber(stats?.totalTransactions || 0)}</div>
              <div className="text-sm text-gray-500">total txs</div>
            </div>
          </Link>
        </div>

        {/* Quick Actions - FULL WIDTH */}
        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
          {/* Verify Contract */}
          <div className="bg-slate-800 rounded-lg border border-slate-700 p-6 hover:border-emerald-600 transition-all">
            <div className="flex items-center space-x-4 mb-6">
              <div className="h-12 w-12 flex-shrink-0 bg-emerald-600/10 rounded-lg flex items-center justify-center">
                <svg className="h-6 w-6 text-emerald-500" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M10 20l4-16m4 4l4 4-4 4M6 16l-4-4 4-4" />
                </svg>
              </div>
              <div>
                <h3 className="text-lg font-semibold text-white">Verify Contract</h3>
                <p className="text-sm text-gray-400">Submit source code</p>
              </div>
            </div>
            <Link
              href="/contracts/verify"
              className="block w-full h-12 bg-emerald-600 hover:bg-emerald-700 text-white font-medium rounded-lg flex items-center justify-center transition-colors"
            >
              Verify Now
            </Link>
          </div>

          {/* Transaction Decoder */}
          <div className="bg-slate-800 rounded-lg border border-slate-700 p-6 hover:border-purple-600 transition-all">
            <div className="flex items-center space-x-4 mb-6">
              <div className="h-12 w-12 flex-shrink-0 bg-purple-600/10 rounded-lg flex items-center justify-center">
                <svg className="h-6 w-6 text-purple-500" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9.663 17h4.673M12 3v1m6.364 1.636l-.707.707M21 12h-1M4 12H3m3.343-5.657l-.707-.707m2.828 9.9a5 5 0 117.072 0l-.548.547A3.374 3.374 0 0014 18.469V19a2 2 0 11-4 0v-.531c0-.895-.356-1.754-.988-2.386l-.548-.547z" />
                </svg>
              </div>
              <div>
                <h3 className="text-lg font-semibold text-white">Transaction Decoder</h3>
                <p className="text-sm text-gray-400">Decode and analyze transactions</p>
              </div>
            </div>
            <Link
              href="/ai-decoder"
              className="block w-full h-12 bg-purple-600 hover:bg-purple-700 text-white font-medium rounded-lg flex items-center justify-center transition-colors"
            >
              Decode Now
            </Link>
          </div>
        </div>

        {/* Wallet Configuration Section */}
        <div className="mt-8">
          <WalletConnector />
        </div>
    </div>
  );
}

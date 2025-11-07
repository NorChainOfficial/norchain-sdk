import React from 'react';
import Link from 'next/link';
import { apiClient, formatTimeAgo, formatAddress, formatNumber, formatHash, weiToXhn } from '@/lib/api-client';
import { notFound } from 'next/navigation';

export const revalidate = 3; // Revalidate every 3 seconds for live data

interface PageProps {
  params: { hash: string };
}

export default async function TransactionDetailPage({ params }: PageProps): Promise<JSX.Element> {
  const { hash } = params;

  if (!hash || hash.length < 10) {
    notFound();
  }

  // Fetch transaction data
  let transaction, events;

  try {
    [transaction, events] = await Promise.all([
      apiClient.getTransaction(hash),
      apiClient.getTransactionEvents(hash).catch(() => ({ data: [] })), // Events might not exist
    ]);
  } catch (error) {
    console.error('Failed to fetch transaction:', error);
    notFound();
  }

  if (!transaction) {
    notFound();
  }

  const eventList = events?.data || [];

  // Calculate transaction status
  // Database stores status as boolean: true = success, false = failed, null = pending
  const isSuccess = transaction.status === true || transaction.status === 'success' || transaction.status === 1 || transaction.status === '0x1';
  const isFailed = transaction.status === false || transaction.status === 'failed' || transaction.status === 0 || transaction.status === '0x0';

  return (
    <div className="max-w-[1400px] mx-auto px-6 py-8">
      {/* Breadcrumb */}
      <div className="mb-6 flex items-center space-x-2 text-sm text-gray-400">
        <Link href="/" className="hover:text-white transition-colors">
          Home
        </Link>
        <span>/</span>
        <Link href="/transactions" className="hover:text-white transition-colors">
          Transactions
        </Link>
        <span>/</span>
        <span className="text-white">{formatHash(transaction.hash)}</span>
      </div>

      {/* Transaction Header */}
      <div className="mb-8 bg-gradient-to-r from-purple-600 to-purple-700 rounded-xl p-8 text-white">
        <div className="flex items-start justify-between mb-6">
          <div className="flex items-center space-x-4">
            <div className="h-16 w-16 bg-white/20 rounded-xl flex items-center justify-center">
              <svg className="h-10 w-10" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M8 7h12m0 0l-4-4m4 4l-4 4m0 6H4m0 0l4 4m-4-4l4-4" />
              </svg>
            </div>
            <div>
              <h1 className="text-4xl font-bold">Transaction Details</h1>
              <p className="text-purple-100 mt-2">{formatTimeAgo(transaction.timestamp)}</p>
            </div>
          </div>

          {/* Status Badge */}
          {isSuccess && (
            <div className="px-4 py-2 bg-green-500/20 rounded-lg border border-green-400/30 flex items-center space-x-2">
              <div className="h-2 w-2 rounded-full bg-green-400" />
              <span className="text-sm font-medium">Success</span>
            </div>
          )}
          {isFailed && (
            <div className="px-4 py-2 bg-red-500/20 rounded-lg border border-red-400/30 flex items-center space-x-2">
              <div className="h-2 w-2 rounded-full bg-red-400" />
              <span className="text-sm font-medium">Failed</span>
            </div>
          )}
          {!isSuccess && !isFailed && (
            <div className="px-4 py-2 bg-yellow-500/20 rounded-lg border border-yellow-400/30 flex items-center space-x-2">
              <div className="h-2 w-2 rounded-full bg-yellow-400 animate-pulse" />
              <span className="text-sm font-medium">Pending</span>
            </div>
          )}
        </div>

        {/* Transaction Hash */}
        <div className="bg-white/10 rounded-lg p-4 border border-white/20">
          <div className="text-sm text-purple-100 mb-2">Transaction Hash</div>
          <code className="font-mono text-sm break-all">{transaction.hash}</code>
        </div>
      </div>

      {/* Overview Stats */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6 mb-8">
        <div className="bg-slate-800 rounded-lg p-6 border border-slate-700">
          <div className="text-gray-400 text-sm uppercase tracking-wider mb-2">Value</div>
          <div className="text-2xl font-bold text-white">{weiToXhn(transaction.value)} NOR</div>
        </div>

        <div className="bg-slate-800 rounded-lg p-6 border border-slate-700">
          <div className="text-gray-400 text-sm uppercase tracking-wider mb-2">Gas Used</div>
          <div className="text-2xl font-bold text-white">{formatNumber(parseInt(transaction.gasUsed || '0'))}</div>
          {transaction.gasLimit && (
            <div className="text-sm text-gray-400 mt-1">
              of {formatNumber(parseInt(transaction.gasLimit))} limit
            </div>
          )}
        </div>

        <div className="bg-slate-800 rounded-lg p-6 border border-slate-700">
          <div className="text-gray-400 text-sm uppercase tracking-wider mb-2">Gas Price</div>
          <div className="text-2xl font-bold text-white">
            {transaction.gasPrice ? formatNumber(parseInt(transaction.gasPrice)) : 'N/A'}
          </div>
          <div className="text-sm text-gray-400 mt-1">wei</div>
        </div>

        <div className="bg-slate-800 rounded-lg p-6 border border-slate-700">
          <div className="text-gray-400 text-sm uppercase tracking-wider mb-2">Block</div>
          <Link
            href={`/blocks/${transaction.blockHeight}`}
            className="text-2xl font-bold text-blue-400 hover:text-blue-300 transition-colors"
          >
            #{formatNumber(transaction.blockHeight)}
          </Link>
        </div>
      </div>

      {/* Transaction Details */}
      <div className="bg-slate-800 rounded-xl border border-slate-700 overflow-hidden mb-8">
        <div className="p-6 border-b border-slate-700">
          <h2 className="text-xl font-bold text-white">Transaction Details</h2>
        </div>
        <div className="divide-y divide-slate-700">
          <div className="p-6 grid grid-cols-1 md:grid-cols-3 gap-4">
            <div className="text-gray-400 text-sm uppercase tracking-wider">Timestamp</div>
            <div className="md:col-span-2">
              <div className="text-white font-mono">{new Date(transaction.timestamp * 1000).toUTCString()}</div>
              <div className="text-sm text-gray-400 mt-1">{formatTimeAgo(transaction.timestamp)}</div>
            </div>
          </div>

          <div className="p-6 grid grid-cols-1 md:grid-cols-3 gap-4">
            <div className="text-gray-400 text-sm uppercase tracking-wider">From</div>
            <div className="md:col-span-2">
              <Link
                href={`/address/${transaction.fromAddress}`}
                className="text-blue-400 hover:text-blue-300 font-mono text-sm transition-colors break-all"
              >
                {transaction.fromAddress}
              </Link>
            </div>
          </div>

          <div className="p-6 grid grid-cols-1 md:grid-cols-3 gap-4">
            <div className="text-gray-400 text-sm uppercase tracking-wider">To</div>
            <div className="md:col-span-2">
              {transaction.toAddress ? (
                <Link
                  href={`/address/${transaction.toAddress}`}
                  className="text-blue-400 hover:text-blue-300 font-mono text-sm transition-colors break-all"
                >
                  {transaction.toAddress}
                </Link>
              ) : (
                <span className="text-emerald-400 font-medium">Contract Creation</span>
              )}
            </div>
          </div>

          <div className="p-6 grid grid-cols-1 md:grid-cols-3 gap-4">
            <div className="text-gray-400 text-sm uppercase tracking-wider">Value</div>
            <div className="md:col-span-2 text-white font-mono">
              {weiToXhn(transaction.value)} NOR
            </div>
          </div>

          <div className="p-6 grid grid-cols-1 md:grid-cols-3 gap-4">
            <div className="text-gray-400 text-sm uppercase tracking-wider">Transaction Fee</div>
            <div className="md:col-span-2">
              {transaction.gasUsed && transaction.gasPrice ? (
                <div className="text-white font-mono">
                  {weiToXhn((BigInt(transaction.gasUsed) * BigInt(transaction.gasPrice)).toString())} NOR
                </div>
              ) : (
                <div className="text-gray-400">N/A</div>
              )}
            </div>
          </div>

          <div className="p-6 grid grid-cols-1 md:grid-cols-3 gap-4">
            <div className="text-gray-400 text-sm uppercase tracking-wider">Gas Used</div>
            <div className="md:col-span-2 text-white">{formatNumber(parseInt(transaction.gasUsed || '0'))}</div>
          </div>

          <div className="p-6 grid grid-cols-1 md:grid-cols-3 gap-4">
            <div className="text-gray-400 text-sm uppercase tracking-wider">Gas Limit</div>
            <div className="md:col-span-2 text-white">
              {transaction.gasLimit ? formatNumber(parseInt(transaction.gasLimit)) : 'N/A'}
            </div>
          </div>

          <div className="p-6 grid grid-cols-1 md:grid-cols-3 gap-4">
            <div className="text-gray-400 text-sm uppercase tracking-wider">Gas Price</div>
            <div className="md:col-span-2 text-white font-mono">
              {transaction.gasPrice ? `${formatNumber(parseInt(transaction.gasPrice))} wei` : 'N/A'}
            </div>
          </div>

          <div className="p-6 grid grid-cols-1 md:grid-cols-3 gap-4">
            <div className="text-gray-400 text-sm uppercase tracking-wider">Nonce</div>
            <div className="md:col-span-2 text-white">
              {transaction.nonce !== undefined ? transaction.nonce : 'N/A'}
            </div>
          </div>

          <div className="p-6 grid grid-cols-1 md:grid-cols-3 gap-4">
            <div className="text-gray-400 text-sm uppercase tracking-wider">Position in Block</div>
            <div className="md:col-span-2 text-white">
              {transaction.transactionIndex !== undefined ? transaction.transactionIndex : 'N/A'}
            </div>
          </div>
        </div>
      </div>

      {/* Input Data */}
      {transaction.input && transaction.input !== '0x' && (
        <div className="bg-slate-800 rounded-xl border border-slate-700 overflow-hidden mb-8">
          <div className="p-6 border-b border-slate-700">
            <h2 className="text-xl font-bold text-white">Input Data</h2>
          </div>
          <div className="p-6">
            <div className="bg-slate-900 rounded-lg p-4 border border-slate-700">
              <code className="text-sm text-gray-300 font-mono break-all">{transaction.input}</code>
            </div>
          </div>
        </div>
      )}

      {/* Events / Logs */}
      {eventList.length > 0 && (
        <div className="bg-slate-800 rounded-xl border border-slate-700 overflow-hidden">
          <div className="p-6 border-b border-slate-700">
            <h2 className="text-xl font-bold text-white">Events ({eventList.length})</h2>
          </div>
          <div className="divide-y divide-slate-700">
            {eventList.map((event: any, index: number) => (
              <div key={index} className="p-6">
                <div className="flex items-start space-x-4">
                  <div className="h-10 w-10 bg-orange-600/10 rounded-lg flex items-center justify-center flex-shrink-0">
                    <svg className="h-5 w-5 text-orange-500" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M13 10V3L4 14h7v7l9-11h-7z" />
                    </svg>
                  </div>
                  <div className="flex-1">
                    <div className="text-white font-medium mb-2">{event.event || `Event #${index}`}</div>
                    {event.address && (
                      <div className="text-sm text-gray-400 mb-2">
                        Contract: <code className="text-blue-400 font-mono">{formatAddress(event.address)}</code>
                      </div>
                    )}
                    {event.args && Object.keys(event.args).length > 0 && (
                      <div className="bg-slate-900 rounded-lg p-4 border border-slate-700 mt-3">
                        <div className="text-sm text-gray-400 mb-2">Arguments:</div>
                        <div className="space-y-1">
                          {Object.entries(event.args).map(([key, value]: [string, any]) => (
                            <div key={key} className="text-sm">
                              <span className="text-gray-400">{key}:</span>{' '}
                              <span className="text-white font-mono">{String(value)}</span>
                            </div>
                          ))}
                        </div>
                      </div>
                    )}
                  </div>
                </div>
              </div>
            ))}
          </div>
        </div>
      )}

      {/* No Events Message */}
      {eventList.length === 0 && (
        <div className="bg-slate-800 rounded-xl border border-slate-700 overflow-hidden">
          <div className="p-6 border-b border-slate-700">
            <h2 className="text-xl font-bold text-white">Events</h2>
          </div>
          <div className="p-12 text-center text-gray-400">
            <svg className="h-16 w-16 mx-auto mb-4 text-gray-600" fill="none" viewBox="0 0 24 24" stroke="currentColor">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1} d="M13 10V3L4 14h7v7l9-11h-7z" />
            </svg>
            <p className="text-lg">No events emitted</p>
          </div>
        </div>
      )}
    </div>
  );
}

'use client';

import { useQuery } from '@tanstack/react-query';
import { apiClient } from '@/lib/api-client';
import { useParams } from 'next/navigation';
import Link from 'next/link';
import { formatDistanceToNow, format } from 'date-fns';
import { formatXAHEEN, truncateHash } from '@/lib/utils';
import { CopyButton } from '@/components/ui/CopyButton';

export default function TransactionDetailPage(): JSX.Element {
  const params = useParams();
  const hash = params.hash as string;

  const { data: txData, isLoading, error } = useQuery({
    queryKey: ['transaction', hash],
    queryFn: () => apiClient.getTransaction(hash),
    enabled: !!hash,
  });

  const { data: statsData } = useQuery({
    queryKey: ['stats'],
    queryFn: () => apiClient.getStats(),
    refetchInterval: 10000,
  });

  if (error) {
    return (
      <div className="min-h-screen bg-gray-50 dark:bg-bnb-dark-secondary p-6">
        <div className="max-w-7xl mx-auto">
          <div className="bg-red-50 dark:bg-red-900/20 border-2 border-red-200 dark:border-red-800 rounded-xl p-6">
            <div className="flex items-center gap-3 mb-2">
              <svg className="w-6 h-6 text-red-600 dark:text-red-400" fill="currentColor" viewBox="0 0 20 20">
                <path fillRule="evenodd" d="M10 18a8 8 0 100-16 8 8 0 000 16zM8.707 7.293a1 1 0 00-1.414 1.414L8.586 10l-1.293 1.293a1 1 0 101.414 1.414L10 11.414l1.293 1.293a1 1 0 001.414-1.414L11.414 10l1.293-1.293a1 1 0 00-1.414-1.414L10 8.586 8.707 7.293z" clipRule="evenodd" />
              </svg>
              <h2 className="text-xl font-bold text-red-900 dark:text-red-100">Transaction Not Found</h2>
            </div>
            <p className="text-red-700 dark:text-red-300">
              {error instanceof Error ? error.message : 'The transaction you are looking for does not exist or has not been indexed yet.'}
            </p>
          </div>
        </div>
      </div>
    );
  }

  if (isLoading || !txData?.data) {
    return (
      <div className="min-h-screen bg-gray-50 dark:bg-bnb-dark-secondary p-6">
        <div className="max-w-7xl mx-auto">
          <div className="animate-pulse space-y-6">
            <div className="h-8 bg-gray-200 dark:bg-gray-700 rounded w-1/3"></div>
            <div className="bg-white dark:bg-gradient-dark rounded-2xl p-6 space-y-4">
              <div className="h-6 bg-gray-200 dark:bg-gray-700 rounded w-1/4"></div>
              <div className="h-4 bg-gray-200 dark:bg-gray-700 rounded w-full"></div>
              <div className="h-4 bg-gray-200 dark:bg-gray-700 rounded w-3/4"></div>
            </div>
          </div>
        </div>
      </div>
    );
  }

  const tx = txData.data;
  const latestBlockHeight = statsData?.latest_block?.height || tx.block_height;
  const confirmations = latestBlockHeight - tx.block_height + 1;
  const gasUsedPercentage = ((tx.gas_used / tx.gas_wanted) * 100).toFixed(2);

  return (
    <div className="min-h-screen bg-gray-50 dark:bg-bnb-dark-secondary p-6">
      <div className="max-w-7xl mx-auto">
        {/* Header */}
        <div className="mb-8">
          <h1 className="text-3xl font-bold text-gray-900 dark:text-white mb-2">Transaction Details</h1>
          <p className="text-gray-600 dark:text-gray-400">
            Complete information about this transaction
          </p>
        </div>

        {/* Status Badge */}
        <div className="mb-6">
          {tx.status === 'success' ? (
            <div className="inline-flex items-center gap-2 px-4 py-2 bg-green-100 dark:bg-green-900/30 border-2 border-green-500 dark:border-green-700 rounded-lg">
              <svg className="w-5 h-5 text-green-600 dark:text-green-400" fill="currentColor" viewBox="0 0 20 20">
                <path fillRule="evenodd" d="M10 18a8 8 0 100-16 8 8 0 000 16zm3.707-9.293a1 1 0 00-1.414-1.414L9 10.586 7.707 9.293a1 1 0 00-1.414 1.414l2 2a1 1 0 001.414 0l4-4z" clipRule="evenodd" />
              </svg>
              <span className="text-green-700 dark:text-green-300 font-semibold">Success</span>
              <span className="text-green-600 dark:text-green-400 text-sm">({confirmations} Block Confirmations)</span>
            </div>
          ) : (
            <div className="inline-flex items-center gap-2 px-4 py-2 bg-red-100 dark:bg-red-900/30 border-2 border-red-500 dark:border-red-700 rounded-lg">
              <svg className="w-5 h-5 text-red-600 dark:text-red-400" fill="currentColor" viewBox="0 0 20 20">
                <path fillRule="evenodd" d="M10 18a8 8 0 100-16 8 8 0 000 16zM8.707 7.293a1 1 0 00-1.414 1.414L8.586 10l-1.293 1.293a1 1 0 101.414 1.414L10 11.414l1.293 1.293a1 1 0 001.414-1.414L11.414 10l1.293-1.293a1 1 0 00-1.414-1.414L10 8.586 8.707 7.293z" clipRule="evenodd" />
              </svg>
              <span className="text-red-700 dark:text-red-300 font-semibold">Failed</span>
              {tx.error_message && (
                <span className="text-red-600 dark:text-red-400 text-sm">({tx.error_message})</span>
              )}
            </div>
          )}
        </div>

        {/* Main Transaction Info */}
        <div className="bg-white dark:bg-gradient-dark rounded-2xl shadow-xl dark:shadow-2xl border border-gray-200 dark:border-gray-700 overflow-hidden">
          {/* Transaction Hash */}
          <div className="border-b border-gray-200 dark:border-gray-700 p-6">
            <div className="flex items-start justify-between gap-4">
              <div className="flex-1">
                <label className="text-sm font-medium text-gray-600 dark:text-gray-400 mb-2 block">
                  Transaction Hash
                </label>
                <div className="flex items-center gap-3">
                  <code className="text-lg font-mono text-gray-900 dark:text-white break-all">
                    {tx.hash}
                  </code>
                  <CopyButton value={tx.hash} />
                </div>
              </div>
            </div>
          </div>

          {/* Details Grid */}
          <div className="p-6 space-y-4">
            {/* Block Height */}
            <div className="flex items-center justify-between py-3 border-b border-gray-100 dark:border-gray-800">
              <span className="text-sm font-medium text-gray-600 dark:text-gray-400">Block Height</span>
              <Link
                href={`/blocks/${tx.block_height}`}
                className="text-blue-600 dark:text-bnb-yellow hover:underline font-semibold"
              >
                {tx.block_height.toLocaleString()}
              </Link>
            </div>

            {/* Timestamp */}
            <div className="flex items-center justify-between py-3 border-b border-gray-100 dark:border-gray-800">
              <span className="text-sm font-medium text-gray-600 dark:text-gray-400">Timestamp</span>
              <div className="text-right">
                <div className="text-gray-900 dark:text-white font-semibold">
                  {formatDistanceToNow(new Date(tx.timestamp), { addSuffix: true })}
                </div>
                <div className="text-xs text-gray-500 dark:text-gray-500">
                  {format(new Date(tx.timestamp), 'MMM dd, yyyy HH:mm:ss')} UTC
                </div>
              </div>
            </div>

            {/* Transaction Type */}
            <div className="flex items-center justify-between py-3 border-b border-gray-100 dark:border-gray-800">
              <span className="text-sm font-medium text-gray-600 dark:text-gray-400">Type</span>
              <span className="px-3 py-1 bg-blue-100 dark:bg-blue-900/30 text-blue-700 dark:text-blue-300 rounded-lg text-sm font-medium">
                {tx.type}
              </span>
            </div>

            {/* From Address */}
            <div className="flex items-center justify-between py-3 border-b border-gray-100 dark:border-gray-800">
              <span className="text-sm font-medium text-gray-600 dark:text-gray-400">From</span>
              <div className="flex items-center gap-2">
                <Link
                  href={`/accounts/${tx.sender}`}
                  className="font-mono text-blue-600 dark:text-bnb-yellow hover:underline"
                >
                  {truncateHash(tx.sender, 16)}
                </Link>
                <CopyButton value={tx.sender} />
              </div>
            </div>

            {/* To Address */}
            {tx.receiver && (
              <div className="flex items-center justify-between py-3 border-b border-gray-100 dark:border-gray-800">
                <span className="text-sm font-medium text-gray-600 dark:text-gray-400">To</span>
                <div className="flex items-center gap-2">
                  <Link
                    href={`/accounts/${tx.receiver}`}
                    className="font-mono text-blue-600 dark:text-bnb-yellow hover:underline"
                  >
                    {truncateHash(tx.receiver, 16)}
                  </Link>
                  <CopyButton value={tx.receiver} />
                </div>
              </div>
            )}

            {/* Amount */}
            {tx.amount && (
              <div className="flex items-center justify-between py-3 border-b border-gray-100 dark:border-gray-800">
                <span className="text-sm font-medium text-gray-600 dark:text-gray-400">Value</span>
                <div className="text-right">
                  <div className="text-gray-900 dark:text-white font-bold text-lg">
                    {formatXAHEEN(tx.amount)}
                  </div>
                  {/* Placeholder for USD value - can be added later with price oracle */}
                  {/* <div className="text-xs text-gray-500">$0.00 USD</div> */}
                </div>
              </div>
            )}

            {/* Transaction Fee */}
            {tx.fee && (
              <div className="flex items-center justify-between py-3 border-b border-gray-100 dark:border-gray-800">
                <span className="text-sm font-medium text-gray-600 dark:text-gray-400">Transaction Fee</span>
                <div className="text-gray-900 dark:text-white font-semibold">
                  {formatXAHEEN(tx.fee)}
                </div>
              </div>
            )}

            {/* Gas Used */}
            <div className="flex items-center justify-between py-3 border-b border-gray-100 dark:border-gray-800">
              <span className="text-sm font-medium text-gray-600 dark:text-gray-400">Gas Used</span>
              <div className="text-right">
                <div className="text-gray-900 dark:text-white font-semibold">
                  {tx.gas_used.toLocaleString()} / {tx.gas_wanted.toLocaleString()}
                </div>
                <div className="text-xs text-gray-600 dark:text-gray-400">
                  ({gasUsedPercentage}% utilized)
                </div>
              </div>
            </div>

            {/* Gas Usage Visualization */}
            <div className="py-3 border-b border-gray-100 dark:border-gray-800">
              <div className="flex items-center justify-between mb-2">
                <span className="text-sm font-medium text-gray-600 dark:text-gray-400">Gas Usage</span>
                <span className="text-sm font-semibold text-gray-700 dark:text-gray-300">{gasUsedPercentage}%</span>
              </div>
              <div className="w-full h-3 bg-gray-200 dark:bg-gray-700 rounded-full overflow-hidden">
                <div
                  className={`h-full rounded-full transition-all duration-500 ${
                    parseFloat(gasUsedPercentage) > 90
                      ? 'bg-red-500 dark:bg-red-400'
                      : parseFloat(gasUsedPercentage) > 70
                      ? 'bg-yellow-500 dark:bg-yellow-400'
                      : 'bg-green-500 dark:bg-green-400'
                  }`}
                  style={{ width: `${gasUsedPercentage}%` }}
                ></div>
              </div>
            </div>

            {/* Memo */}
            {tx.memo && (
              <div className="flex items-start justify-between py-3 border-b border-gray-100 dark:border-gray-800">
                <span className="text-sm font-medium text-gray-600 dark:text-gray-400">Memo</span>
                <div className="text-right max-w-md">
                  <code className="text-sm text-gray-900 dark:text-white break-all">
                    {tx.memo}
                  </code>
                </div>
              </div>
            )}

            {/* Block Hash */}
            <div className="flex items-start justify-between py-3">
              <span className="text-sm font-medium text-gray-600 dark:text-gray-400">Block Hash</span>
              <div className="flex items-center gap-2">
                <Link
                  href={`/blocks/${tx.block_height}`}
                  className="font-mono text-sm text-blue-600 dark:text-bnb-yellow hover:underline break-all text-right"
                >
                  {truncateHash(tx.block_hash, 16)}
                </Link>
                <CopyButton value={tx.block_hash} />
              </div>
            </div>
          </div>
        </div>

        {/* Additional Information (Future: Input Data, Event Logs, etc.) */}
        <div className="mt-6 bg-white dark:bg-gradient-dark rounded-2xl shadow-xl dark:shadow-2xl border border-gray-200 dark:border-gray-700 p-6">
          <h3 className="text-lg font-bold text-gray-900 dark:text-white mb-4">Additional Information</h3>

          {/* Input Data - Placeholder for future implementation */}
          <div className="mb-4">
            <label className="text-sm font-medium text-gray-600 dark:text-gray-400 mb-2 block">
              Input Data
            </label>
            <div className="bg-gray-50 dark:bg-gray-800 rounded-lg p-4 border border-gray-200 dark:border-gray-700">
              <code className="text-sm text-gray-600 dark:text-gray-400 font-mono">
                {tx.type} - Decoding coming soon
              </code>
            </div>
          </div>

          {/* Event Logs - Placeholder */}
          <div>
            <label className="text-sm font-medium text-gray-600 dark:text-gray-400 mb-2 block">
              Event Logs
            </label>
            <div className="bg-gray-50 dark:bg-gray-800 rounded-lg p-4 border border-gray-200 dark:border-gray-700">
              <p className="text-sm text-gray-600 dark:text-gray-400">
                Event log parsing coming soon
              </p>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}

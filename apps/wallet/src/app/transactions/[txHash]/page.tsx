'use client';

import React from 'react';
import { useRouter, useParams } from 'next/navigation';
import { ProtectedRoute } from '@/components/ProtectedRoute';
import { useTransactionStatus } from '@/hooks/useTransactionStatus';
import { formatAddress } from '@/lib/utils';

function TransactionDetailsPageContent() {
  const router = useRouter();
  const params = useParams();
  const txHash = params.txHash as string;
  const {
    transaction,
    isLoading,
    isPending,
    isConfirmed,
    isFailed,
    refetch,
  } = useTransactionStatus(txHash);

  const getStatusColor = () => {
    if (isConfirmed) return 'text-green-400';
    if (isFailed) return 'text-red-400';
    return 'text-yellow-400';
  };

  const getStatusIcon = () => {
    if (isConfirmed) return '✓';
    if (isFailed) return '✗';
    return '⏳';
  };

  const explorerUrl = `https://etherscan.io/tx/${txHash}`;

  return (
    <div className="min-h-screen bg-gradient-primary">
      <header className="px-6 py-4 flex items-center gap-4">
        <button
          onClick={() => router.back()}
          className="w-11 h-11 rounded-full bg-white/10 flex items-center justify-center hover:bg-white/15 transition-colors"
        >
          <svg
            className="w-6 h-6 text-white"
            fill="none"
            stroke="currentColor"
            viewBox="0 0 24 24"
          >
            <path
              strokeLinecap="round"
              strokeLinejoin="round"
              strokeWidth={2}
              d="M15 19l-7-7 7-7"
            />
          </svg>
        </button>
        <div className="flex-1">
          <h1 className="text-2xl font-bold text-white">Transaction Details</h1>
        </div>
        <button
          onClick={refetch}
          disabled={isLoading}
          className="w-11 h-11 rounded-full bg-white/10 flex items-center justify-center hover:bg-white/15 transition-colors disabled:opacity-50"
        >
          <svg
            className="w-6 h-6 text-white"
            fill="none"
            stroke="currentColor"
            viewBox="0 0 24 24"
          >
            <path
              strokeLinecap="round"
              strokeLinejoin="round"
              strokeWidth={2}
              d="M4 4v5h.582m15.356 2A8.001 8.001 0 004.582 9m0 0H9m11 11v-5h-.581m0 0a8.003 8.003 0 01-15.357-2m15.357 2H15"
            />
          </svg>
        </button>
      </header>

      <div className="px-6 pb-8">
        {isLoading && !transaction ? (
          <div className="glass-card p-8 rounded-2xl text-center">
            <p className="text-white/60">Loading transaction details...</p>
          </div>
        ) : transaction ? (
          <>
            {/* Status Card */}
            <div className="glass-card p-6 rounded-2xl mb-6">
              <div className="flex items-center justify-between mb-4">
                <div className="flex items-center gap-3">
                  <div className={`text-3xl ${getStatusColor()}`}>
                    {getStatusIcon()}
                  </div>
                  <div>
                    <p className="text-white font-semibold text-lg">
                      {transaction.status === 'confirmed'
                        ? 'Confirmed'
                        : transaction.status === 'failed'
                        ? 'Failed'
                        : 'Pending'}
                    </p>
                    {transaction.blockNumber && (
                      <p className="text-white/60 text-sm">
                        Block #{transaction.blockNumber}
                      </p>
                    )}
                  </div>
                </div>
                {transaction.confirmations && (
                  <div className="text-right">
                    <p className="text-white/60 text-sm">Confirmations</p>
                    <p className="text-white font-semibold">
                      {transaction.confirmations}
                    </p>
                  </div>
                )}
              </div>
            </div>

            {/* Transaction Info */}
            <div className="glass-card p-6 rounded-2xl mb-6 space-y-4">
              <div>
                <p className="text-white/60 text-sm mb-2">Transaction Hash</p>
                <div className="flex items-center gap-2">
                  <code className="text-white font-mono text-sm break-all">
                    {transaction.hash}
                  </code>
                  <button
                    onClick={() => navigator.clipboard.writeText(transaction.hash)}
                    className="w-8 h-8 rounded-lg bg-white/10 hover:bg-white/15 flex items-center justify-center transition-colors"
                  >
                    <svg
                      className="w-4 h-4 text-white"
                      fill="none"
                      stroke="currentColor"
                      viewBox="0 0 24 24"
                    >
                      <path
                        strokeLinecap="round"
                        strokeLinejoin="round"
                        strokeWidth={2}
                        d="M8 16H6a2 2 0 01-2-2V6a2 2 0 012-2h8a2 2 0 012 2v2m-6 12h8a2 2 0 002-2v-8a2 2 0 00-2-2h-8a2 2 0 00-2 2v8a2 2 0 002 2z"
                      />
                    </svg>
                  </button>
                </div>
              </div>

              <div>
                <p className="text-white/60 text-sm mb-2">From</p>
                <p className="text-white font-mono text-sm">
                  {formatAddress(transaction.from)}
                </p>
              </div>

              <div>
                <p className="text-white/60 text-sm mb-2">To</p>
                <p className="text-white font-mono text-sm">
                  {formatAddress(transaction.to)}
                </p>
              </div>

              <div>
                <p className="text-white/60 text-sm mb-2">Amount</p>
                <p className="text-white font-semibold text-lg">
                  {transaction.value} ETH
                </p>
              </div>
            </div>

            {/* Actions */}
            <div className="space-y-3">
              <a
                href={explorerUrl}
                target="_blank"
                rel="noopener noreferrer"
                className="block w-full py-3 rounded-xl bg-primary-light hover:bg-primary transition-colors text-white font-semibold text-center"
              >
                View on Explorer
              </a>
              <button
                onClick={() => router.push('/transactions')}
                className="block w-full py-3 rounded-xl bg-white/10 border border-white/20 text-white font-semibold hover:bg-white/15 transition-colors"
              >
                Back to Transactions
              </button>
            </div>
          </>
        ) : (
          <div className="glass-card p-8 rounded-2xl text-center">
            <p className="text-white/60 mb-4">Transaction not found</p>
            <button
              onClick={() => router.push('/transactions')}
              className="px-6 py-3 rounded-xl bg-primary-light hover:bg-primary transition-colors text-white font-semibold"
            >
              Back to Transactions
            </button>
          </div>
        )}
      </div>
    </div>
  );
}

export default function TransactionDetailsPage() {
  return (
    <ProtectedRoute>
      <TransactionDetailsPageContent />
    </ProtectedRoute>
  );
}


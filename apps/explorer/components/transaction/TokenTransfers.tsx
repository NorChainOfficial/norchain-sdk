'use client';

import Link from 'next/link';
import { formatXAHEEN } from '@/lib/utils';
import { CopyButton } from '../ui/CopyButton';

export interface TokenTransfer {
  readonly token_address: string;
  readonly token_symbol: string;
  readonly from_address: string;
  readonly to_address: string;
  readonly amount: string;
  readonly decimals: number;
}

interface TokenTransfersProps {
  readonly transfers: TokenTransfer[];
  readonly isLoading?: boolean;
}

export const TokenTransfers = ({ transfers, isLoading = false }: TokenTransfersProps): JSX.Element => {
  if (isLoading) {
    return (
      <div className="space-y-3">
        {[1, 2].map((i) => (
          <div key={i} className="animate-pulse bg-gray-50 dark:bg-gray-800 rounded-lg p-4 border border-gray-200 dark:border-gray-700">
            <div className="flex items-center gap-3">
              <div className="h-10 w-10 bg-gray-200 dark:bg-gray-700 rounded-full"></div>
              <div className="flex-1">
                <div className="h-4 bg-gray-200 dark:bg-gray-700 rounded w-1/3 mb-2"></div>
                <div className="h-3 bg-gray-200 dark:bg-gray-700 rounded w-2/3"></div>
              </div>
            </div>
          </div>
        ))}
      </div>
    );
  }

  if (transfers.length === 0) {
    return (
      <div className="bg-gray-50 dark:bg-gray-800 rounded-lg p-6 border border-gray-200 dark:border-gray-700 text-center">
        <svg className="w-12 h-12 mx-auto mb-3 text-gray-400 dark:text-gray-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M20 13V6a2 2 0 00-2-2H6a2 2 0 00-2 2v7m16 0v5a2 2 0 01-2 2H6a2 2 0 01-2-2v-5m16 0h-2.586a1 1 0 00-.707.293l-2.414 2.414a1 1 0 01-.707.293h-3.172a1 1 0 01-.707-.293l-2.414-2.414A1 1 0 006.586 13H4" />
        </svg>
        <p className="text-gray-600 dark:text-gray-400 text-sm">
          No token transfers detected
        </p>
        <p className="text-xs text-gray-500 dark:text-gray-500 mt-1">
          Token transfer parsing coming soon
        </p>
      </div>
    );
  }

  return (
    <div className="space-y-3">
      {transfers.map((transfer, index) => (
        <div
          key={index}
          className="bg-white dark:bg-gray-800 rounded-lg p-4 border border-gray-200 dark:border-gray-700 hover:border-blue-500 dark:hover:border-bnb-yellow transition-colors"
        >
          <div className="flex items-start gap-4">
            {/* Token Icon */}
            <div className="flex-shrink-0">
              <div className="h-10 w-10 bg-gradient-to-br from-purple-500 to-pink-500 rounded-full flex items-center justify-center text-white font-bold text-sm">
                {transfer.token_symbol.slice(0, 2).toUpperCase()}
              </div>
            </div>

            {/* Transfer Details */}
            <div className="flex-1 min-w-0">
              {/* Token & Amount */}
              <div className="flex items-center gap-2 mb-2">
                <Link
                  href={`/tokens/${transfer.token_address}`}
                  className="text-lg font-bold text-gray-900 dark:text-white hover:text-blue-600 dark:hover:text-bnb-yellow transition-colors"
                >
                  {transfer.token_symbol}
                </Link>
                <span className="px-2 py-0.5 bg-purple-100 dark:bg-purple-900/30 text-purple-700 dark:text-purple-300 rounded text-xs font-medium">
                  Token
                </span>
              </div>

              {/* Amount */}
              <div className="mb-3">
                <span className="text-2xl font-bold text-gray-900 dark:text-white">
                  {formatXAHEEN(transfer.amount)}
                </span>
              </div>

              {/* From → To */}
              <div className="space-y-2">
                <div className="flex items-center gap-2 text-sm">
                  <span className="text-gray-600 dark:text-gray-400 font-medium min-w-[50px]">From:</span>
                  <Link
                    href={`/accounts/${transfer.from_address}`}
                    className="font-mono text-blue-600 dark:text-bnb-yellow hover:underline truncate"
                  >
                    {transfer.from_address}
                  </Link>
                  <CopyButton value={transfer.from_address} />
                </div>

                <div className="flex items-center gap-2 text-sm">
                  <span className="text-gray-600 dark:text-gray-400 font-medium min-w-[50px]">To:</span>
                  <Link
                    href={`/accounts/${transfer.to_address}`}
                    className="font-mono text-blue-600 dark:text-bnb-yellow hover:underline truncate"
                  >
                    {transfer.to_address}
                  </Link>
                  <CopyButton value={transfer.to_address} />
                </div>
              </div>
            </div>

            {/* Transfer Arrow */}
            <div className="flex-shrink-0 flex items-center">
              <svg className="w-6 h-6 text-gray-400 dark:text-gray-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M13 7l5 5m0 0l-5 5m5-5H6" />
              </svg>
            </div>
          </div>
        </div>
      ))}
    </div>
  );
};

/**
 * Parse token transfer events from Cosmos SDK transaction events
 * This is a placeholder - will be implemented when event indexing is ready
 */
export function parseTokenTransfers(events: any[]): TokenTransfer[] {
  // Placeholder implementation
  // In Phase 1, this will parse actual Cosmos SDK events like:
  // {
  //   type: "transfer",
  //   attributes: [
  //     {key: "recipient", value: "btcbr1..."},
  //     {key: "sender", value: "btcbr1..."},
  //     {key: "amount", value: "1000000btcbr"}
  //   ]
  // }

  return [];
}

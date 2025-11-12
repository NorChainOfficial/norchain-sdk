'use client';

import React from 'react';
import Link from 'next/link';
import { formatAddress, weiToXhn } from '@/lib/api-client';

interface TokenHolding {
  contractAddress: string;
  symbol: string;
  name: string;
  balance: string;
  decimals: number;
  logo?: string;
}

interface TokenHoldingsProps {
  address: string;
  nativeBalance: string;
  tokenHoldings?: TokenHolding[];
  isLoading?: boolean;
}

export function TokenHoldings({ address, nativeBalance, tokenHoldings = [], isLoading = false }: TokenHoldingsProps): JSX.Element {
  if (isLoading) {
    return (
      <div className="space-y-4">
        {Array.from({ length: 3 }).map((_, i) => (
          <div key={i} className="animate-pulse p-4 border border-gray-200 dark:border-gray-700 rounded-lg">
            <div className="h-4 bg-gray-200 dark:bg-gray-700 rounded w-32 mb-3"></div>
            <div className="h-6 bg-gray-200 dark:bg-gray-700 rounded w-48"></div>
          </div>
        ))}
      </div>
    );
  }

  return (
    <div className="space-y-4">
      {/* Native Token (NOR) */}
      <div className="p-6 border-2 border-blue-200 dark:border-blue-800 rounded-xl bg-blue-50 dark:bg-blue-900/20">
        <div className="flex items-center justify-between mb-4">
          <div className="flex items-center gap-3">
            <div className="flex items-center justify-center w-12 h-12 rounded-full bg-blue-600">
              <span className="text-white font-bold text-lg">N</span>
            </div>
            <div>
              <h3 className="text-lg font-bold text-gray-900 dark:text-white">NOR</h3>
              <p className="text-sm text-gray-600 dark:text-gray-400">NorChain Native Token</p>
            </div>
          </div>
          <span className="px-3 py-1 text-xs font-medium rounded-full bg-blue-100 dark:bg-blue-900/50 text-blue-700 dark:text-blue-300">
            Native
          </span>
        </div>
        <div>
          <p className="text-sm text-gray-600 dark:text-gray-400 mb-1">Balance</p>
          <p className="text-3xl font-bold text-blue-600 dark:text-blue-400">
            {weiToXhn(nativeBalance)}
            <span className="text-lg ml-2 text-gray-600 dark:text-gray-400">NOR</span>
          </p>
        </div>
      </div>

      {/* ERC-20 Tokens */}
      {tokenHoldings.length > 0 && (
        <div className="space-y-3">
          <h4 className="text-md font-semibold text-gray-900 dark:text-white mb-3">ERC-20 Tokens</h4>
          {tokenHoldings.map((token) => (
            <div
              key={token.contractAddress}
              className="p-4 border border-gray-200 dark:border-gray-700 rounded-lg hover:border-blue-500 dark:hover:border-blue-500 transition-colors"
            >
              <div className="flex items-center justify-between">
                <div className="flex items-center gap-3">
                  {token.logo ? (
                    <img src={token.logo} alt={token.symbol} className="w-10 h-10 rounded-full" />
                  ) : (
                    <div className="w-10 h-10 bg-gradient-to-br from-purple-500 to-pink-600 rounded-full flex items-center justify-center">
                      <span className="text-white font-bold text-sm">
                        {token.symbol.substring(0, 2).toUpperCase()}
                      </span>
                    </div>
                  )}
                  <div>
                    <div className="flex items-center gap-2">
                      <h5 className="text-md font-semibold text-gray-900 dark:text-white">{token.name}</h5>
                      <span className="text-sm text-gray-500 dark:text-gray-400">({token.symbol})</span>
                    </div>
                    <Link
                      href={`/contracts/${token.contractAddress}`}
                      className="text-xs text-blue-600 dark:text-blue-400 hover:underline font-mono"
                    >
                      {formatAddress(token.contractAddress)}
                    </Link>
                  </div>
                </div>
                <div className="text-right">
                  <p className="text-lg font-bold text-gray-900 dark:text-white">
                    {(parseFloat(token.balance) / Math.pow(10, token.decimals)).toLocaleString(undefined, {
                      maximumFractionDigits: 4,
                    })}
                  </p>
                  <p className="text-sm text-gray-500 dark:text-gray-400">{token.symbol}</p>
                </div>
              </div>
            </div>
          ))}
        </div>
      )}

      {/* Info Message */}
      <div className="p-4 bg-gray-50 dark:bg-gray-800 border border-gray-200 dark:border-gray-700 rounded-lg">
        <div className="flex items-start gap-3">
          <svg className="w-5 h-5 text-blue-600 dark:text-blue-400 mt-0.5" fill="currentColor" viewBox="0 0 20 20">
            <path fillRule="evenodd" d="M18 10a8 8 0 11-16 0 8 8 0 0116 0zm-7-4a1 1 0 11-2 0 1 1 0 012 0zM9 9a1 1 0 000 2v3a1 1 0 001 1h1a1 1 0 100-2v-3a1 1 0 00-1-1H9z" clipRule="evenodd" />
          </svg>
          <div>
            <p className="text-sm font-medium text-gray-900 dark:text-white mb-1">Token Information</p>
            <p className="text-sm text-gray-600 dark:text-gray-400">
              {tokenHoldings.length === 0
                ? 'This address currently only holds the native NOR token. ERC-20 token balances will appear here when tokens are held.'
                : `This address holds ${tokenHoldings.length} ERC-20 token${tokenHoldings.length > 1 ? 's' : ''} in addition to NOR.`}
            </p>
          </div>
        </div>
      </div>
    </div>
  );
}


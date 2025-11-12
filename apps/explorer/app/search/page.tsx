'use client';

import React, { useState, useEffect } from 'react';
import Link from 'next/link';
import { useSearchParams } from 'next/navigation';
import { UniversalSearch } from '@/components/search/UniversalSearch';
import { formatAddress, formatHash, formatNumber } from '@/lib/api-client';

interface SearchResult {
  type: 'block' | 'transaction' | 'account' | 'contract' | 'token';
  value: string;
  label: string;
  description?: string;
  data?: any;
}

export default function SearchPage(): JSX.Element {
  const searchParams = useSearchParams();
  const query = searchParams.get('q') || '';
  const [results, setResults] = useState<SearchResult[]>([]);
  const [isLoading, setIsLoading] = useState(false);
  const [searchQuery, setSearchQuery] = useState(query);

  useEffect(() => {
    if (query) {
      performSearch(query);
    }
  }, [query]);

  const performSearch = async (searchQuery: string) => {
    if (!searchQuery || searchQuery.length < 2) {
      setResults([]);
      return;
    }

    setIsLoading(true);

    try {
      const searchResults: SearchResult[] = [];
      const trimmedQuery = searchQuery.trim();

      // Detect search type and format results
      if (/^\d+$/.test(trimmedQuery)) {
        // Block height
        searchResults.push({
          type: 'block',
          value: trimmedQuery,
          label: `Block #${trimmedQuery}`,
          description: 'View block details and transactions',
        });
      } else if (/^0x[a-fA-F0-9]{40}$/.test(trimmedQuery)) {
        // Address - could be account, contract, or token
        searchResults.push({
          type: 'account',
          value: trimmedQuery,
          label: `Account ${formatAddress(trimmedQuery)}`,
          description: 'View account balance and transactions',
        });
        searchResults.push({
          type: 'contract',
          value: trimmedQuery,
          label: `Contract ${formatAddress(trimmedQuery)}`,
          description: 'View contract source code and ABI',
        });
        searchResults.push({
          type: 'token',
          value: trimmedQuery,
          label: `Token ${formatAddress(trimmedQuery)}`,
          description: 'View token details and holders',
        });
      } else if (/^0x[a-fA-F0-9]{64}$/.test(trimmedQuery)) {
        // Transaction hash
        searchResults.push({
          type: 'transaction',
          value: trimmedQuery,
          label: `Transaction ${formatHash(trimmedQuery)}`,
          description: 'View transaction details and events',
        });
      } else {
        // Text search - full-text search API endpoint will be implemented for advanced search capabilities
        searchResults.push({
          type: 'token',
          value: trimmedQuery,
          label: `Search for "${trimmedQuery}"`,
          description: 'Search tokens, contracts, and addresses',
        });
      }

      setResults(searchResults);
    } catch (error) {
      console.error('Search error:', error);
      setResults([]);
    } finally {
      setIsLoading(false);
    }
  };

  const handleSearch = (result: SearchResult) => {
    setSearchQuery(result.value);
    // Navigation is handled by UniversalSearch component
  };

  const getResultUrl = (result: SearchResult): string => {
    switch (result.type) {
      case 'block':
        return `/blocks/${result.value}`;
      case 'transaction':
        return `/tx/${result.value}`;
      case 'account':
        return `/accounts/${result.value}`;
      case 'contract':
        return `/contracts/${result.value}`;
      case 'token':
        return `/tokens?address=${result.value}`;
      default:
        return '/';
    }
  };

  const getTypeIcon = (type: string) => {
    const icons = {
      block: '📦',
      transaction: '💸',
      account: '👤',
      contract: '📜',
      token: '🪙',
    };
    return icons[type as keyof typeof icons] || '🔍';
  };

  const getTypeColor = (type: string) => {
    const colors = {
      block: 'bg-blue-500/20 text-blue-400 border-blue-500/30',
      transaction: 'bg-purple-500/20 text-purple-400 border-purple-500/30',
      account: 'bg-green-500/20 text-green-400 border-green-500/30',
      contract: 'bg-orange-500/20 text-orange-400 border-orange-500/30',
      token: 'bg-yellow-500/20 text-yellow-400 border-yellow-500/30',
    };
    return colors[type as keyof typeof colors] || colors.account;
  };

  return (
    <div className="max-w-[1400px] mx-auto px-6 py-8">
      {/* Header */}
      <div className="mb-8">
        <h1 className="text-3xl font-bold text-white mb-4">Search</h1>
        <div className="max-w-2xl">
          <UniversalSearch
            onResultSelect={handleSearch}
            placeholder="Search by address, transaction hash, block height, token symbol..."
          />
        </div>
      </div>

      {/* Search Results */}
      {query && (
        <div>
          <div className="mb-6">
            <h2 className="text-xl font-semibold text-white mb-2">
              Search Results for "{query}"
            </h2>
            {isLoading && (
              <div className="flex items-center gap-2 text-gray-400">
                <div className="w-5 h-5 border-2 border-blue-500 border-t-transparent rounded-full animate-spin"></div>
                <span>Searching...</span>
              </div>
            )}
          </div>

          {!isLoading && results.length > 0 && (
            <div className="space-y-4">
              {results.map((result, index) => (
                <Link
                  key={`${result.type}-${result.value}-${index}`}
                  href={getResultUrl(result)}
                  className="block p-6 bg-slate-800 rounded-lg border border-slate-700 hover:border-blue-500 transition-colors"
                >
                  <div className="flex items-start gap-4">
                    <div className={`flex-shrink-0 w-12 h-12 rounded-lg border flex items-center justify-center text-2xl ${getTypeColor(result.type)}`}>
                      {getTypeIcon(result.type)}
                    </div>
                    <div className="flex-1 min-w-0">
                      <div className="flex items-center gap-3 mb-2">
                        <h3 className="text-lg font-semibold text-white">{result.label}</h3>
                        <span className={`px-2 py-1 text-xs font-semibold rounded border ${getTypeColor(result.type)}`}>
                          {result.type}
                        </span>
                      </div>
                      {result.description && (
                        <p className="text-gray-400 text-sm">{result.description}</p>
                      )}
                    </div>
                    <div className="flex-shrink-0">
                      <svg className="w-6 h-6 text-gray-400" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 5l7 7-7 7" />
                      </svg>
                    </div>
                  </div>
                </Link>
              ))}
            </div>
          )}

          {!isLoading && results.length === 0 && (
            <div className="text-center py-12">
              <svg className="w-16 h-16 mx-auto mb-4 text-gray-600" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z" />
              </svg>
              <p className="text-lg text-gray-400 mb-2">No results found</p>
              <p className="text-sm text-gray-500">
                Try searching by:
              </p>
              <ul className="mt-4 text-sm text-gray-400 space-y-1">
                <li>• Block height (e.g., 12345)</li>
                <li>• Transaction hash (0x...)</li>
                <li>• Address (0x...)</li>
                <li>• Token symbol or name</li>
              </ul>
            </div>
          )}
        </div>
      )}

      {/* Search Tips */}
      {!query && (
        <div className="mt-12 grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
          <div className="p-6 bg-slate-800 rounded-lg border border-slate-700">
            <div className="text-3xl mb-3">📦</div>
            <h3 className="text-lg font-semibold text-white mb-2">Search Blocks</h3>
            <p className="text-sm text-gray-400">
              Enter a block height number to view block details, transactions, and validator information.
            </p>
          </div>

          <div className="p-6 bg-slate-800 rounded-lg border border-slate-700">
            <div className="text-3xl mb-3">💸</div>
            <h3 className="text-lg font-semibold text-white mb-2">Search Transactions</h3>
            <p className="text-sm text-gray-400">
              Enter a transaction hash (0x...) to view transaction details, events, and logs.
            </p>
          </div>

          <div className="p-6 bg-slate-800 rounded-lg border border-slate-700">
            <div className="text-3xl mb-3">👤</div>
            <h3 className="text-lg font-semibold text-white mb-2">Search Addresses</h3>
            <p className="text-sm text-gray-400">
              Enter an address (0x...) to view account balance, transactions, and token holdings.
            </p>
          </div>

          <div className="p-6 bg-slate-800 rounded-lg border border-slate-700">
            <div className="text-3xl mb-3">🪙</div>
            <h3 className="text-lg font-semibold text-white mb-2">Search Tokens</h3>
            <p className="text-sm text-gray-400">
              Enter a token symbol, name, or contract address to view token details and analytics.
            </p>
          </div>
        </div>
      )}
    </div>
  );
}


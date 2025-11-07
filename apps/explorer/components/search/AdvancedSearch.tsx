'use client';

import { useState, useRef, useEffect, useCallback } from 'react';
import { useRouter } from 'next/navigation';
import { apiClient } from '@/lib/api-client';

type SearchType = 'block' | 'transaction' | 'account' | 'all';

interface SearchResult {
  readonly type: SearchType;
  readonly label: string;
  readonly value: string;
  readonly description?: string;
  readonly icon: JSX.Element;
}

export const AdvancedSearch = (): JSX.Element => {
  const [query, setQuery] = useState('');
  const [searchType, setSearchType] = useState<SearchType>('all');
  const [isOpen, setIsOpen] = useState(false);
  const [results, setResults] = useState<SearchResult[]>([]);
  const [recentSearches, setRecentSearches] = useState<SearchResult[]>([]);
  const [selectedIndex, setSelectedIndex] = useState(0);
  const [isSearching, setIsSearching] = useState(false);
  const inputRef = useRef<HTMLInputElement>(null);
  const dropdownRef = useRef<HTMLDivElement>(null);
  const router = useRouter();

  // Load recent searches from localStorage
  useEffect(() => {
    try {
      const stored = localStorage.getItem('recentSearches');
      if (stored) {
        setRecentSearches(JSON.parse(stored));
      }
    } catch (error) {
      console.error('Failed to load recent searches:', error);
    }
  }, []);

  // Save recent search
  const saveRecentSearch = useCallback((result: SearchResult) => {
    try {
      const updated = [result, ...recentSearches.filter(r => r.value !== result.value)].slice(0, 10);
      setRecentSearches(updated);
      localStorage.setItem('recentSearches', JSON.stringify(updated));
    } catch (error) {
      console.error('Failed to save recent search:', error);
    }
  }, [recentSearches]);

  // Clear recent searches
  const clearRecentSearches = useCallback(() => {
    setRecentSearches([]);
    localStorage.removeItem('recentSearches');
  }, []);

  // Auto-detect search type
  const detectSearchType = useCallback((searchQuery: string): SearchType => {
    const trimmed = searchQuery.trim();

    // Check if it's a number (block height)
    if (/^\d+$/.test(trimmed)) {
      return 'block';
    }

    // Check if it's a hex hash (64 characters for block/tx hash)
    if (/^[A-Fa-f0-9]{64}$/.test(trimmed)) {
      return searchType === 'all' ? 'block' : searchType;
    }

    // Check if it's an address (starts with btcbr)
    if (trimmed.startsWith('btcbr')) {
      return 'account';
    }

    return 'all';
  }, [searchType]);

  // Search function with debounce
  useEffect(() => {
    if (!query || query.length < 2) {
      setResults([]);
      setIsOpen(false);
      return;
    }

    const searchTimeout = setTimeout(async () => {
      setIsSearching(true);
      const detectedType = detectSearchType(query);
      const searchResults: SearchResult[] = [];

      try {
        // Search blocks
        if (detectedType === 'all' || detectedType === 'block') {
          // Try searching by height if it's a number
          if (/^\d+$/.test(query.trim())) {
            try {
              const blockHeight = parseInt(query.trim(), 10);
              const block = await apiClient.getBlock(blockHeight);
              if (block) {
                searchResults.push({
                  type: 'block',
                  label: `Block #${blockHeight}`,
                  value: blockHeight.toString(),
                  description: `${block.transaction_count} transactions`,
                  icon: (
                    <svg className="w-5 h-5" fill="currentColor" viewBox="0 0 20 20">
                      <path d="M3 4a1 1 0 011-1h12a1 1 0 011 1v2a1 1 0 01-1 1H4a1 1 0 01-1-1V4z" />
                    </svg>
                  ),
                });
              }
            } catch (error) {
              // Block not found, continue
            }
          }
        }

        // Search transactions
        if (detectedType === 'all' || detectedType === 'transaction') {
          try {
            const txResponse = await apiClient.getTransactions({ page: 1, per_page: 5 });
            const matchingTxs = txResponse.data.filter((tx: any) =>
              tx.hash.toLowerCase().includes(query.toLowerCase())
            );

            matchingTxs.forEach((tx: any) => {
              searchResults.push({
                type: 'transaction',
                label: `Transaction ${tx.hash.slice(0, 16)}...`,
                value: tx.hash,
                description: `Block #${tx.block_height}`,
                icon: (
                  <svg className="w-5 h-5" fill="currentColor" viewBox="0 0 20 20">
                    <path d="M8.433 7.418c.155-.103.346-.196.567-.267v1.698a2.305 2.305 0 01-.567-.267C8.07 8.34 8 8.114 8 8c0-.114.07-.34.433-.582z" />
                  </svg>
                ),
              });
            });
          } catch (error) {
            // Continue
          }
        }

        // Search accounts
        if (detectedType === 'all' || detectedType === 'account') {
          try {
            const accountsResponse = await apiClient.getAccounts({ page: 1, per_page: 5 });
            const matchingAccounts = accountsResponse.data.filter((account: any) =>
              account.address.toLowerCase().includes(query.toLowerCase())
            );

            matchingAccounts.forEach((account: any) => {
              searchResults.push({
                type: 'account',
                label: account.address,
                value: account.address,
                description: `Balance: ${account.balance || '0'} XAHEEN`,
                icon: (
                  <svg className="w-5 h-5" fill="currentColor" viewBox="0 0 20 20">
                    <path d="M10 9a3 3 0 100-6 3 3 0 000 6zm-7 9a7 7 0 1114 0H3z" />
                  </svg>
                ),
              });
            });
          } catch (error) {
            // Continue
          }
        }
      } catch (error) {
        console.error('Search error:', error);
      }

      setResults(searchResults);
      setIsOpen(searchResults.length > 0);
      setIsSearching(false);
    }, 300);

    return () => clearTimeout(searchTimeout);
  }, [query, detectSearchType]);

  // Handle result selection
  const handleSelect = useCallback((result: SearchResult) => {
    saveRecentSearch(result);
    setQuery('');
    setIsOpen(false);

    switch (result.type) {
      case 'block':
        router.push(`/blocks/${result.value}`);
        break;
      case 'transaction':
        router.push(`/transactions/${result.value}`);
        break;
      case 'account':
        router.push(`/accounts/${result.value}`);
        break;
    }
  }, [router, saveRecentSearch]);

  // Keyboard navigation
  const handleKeyDown = useCallback((e: React.KeyboardEvent) => {
    if (!isOpen) return;

    switch (e.key) {
      case 'ArrowDown':
        e.preventDefault();
        setSelectedIndex((prev) => Math.min(prev + 1, results.length - 1));
        break;
      case 'ArrowUp':
        e.preventDefault();
        setSelectedIndex((prev) => Math.max(prev - 1, 0));
        break;
      case 'Enter':
        e.preventDefault();
        if (results[selectedIndex]) {
          handleSelect(results[selectedIndex]);
        }
        break;
      case 'Escape':
        e.preventDefault();
        setIsOpen(false);
        inputRef.current?.blur();
        break;
    }
  }, [isOpen, results, selectedIndex, handleSelect]);

  // Close dropdown when clicking outside
  useEffect(() => {
    const handleClickOutside = (event: MouseEvent) => {
      if (
        dropdownRef.current &&
        !dropdownRef.current.contains(event.target as Node) &&
        inputRef.current &&
        !inputRef.current.contains(event.target as Node)
      ) {
        setIsOpen(false);
      }
    };

    document.addEventListener('mousedown', handleClickOutside);
    return () => document.removeEventListener('mousedown', handleClickOutside);
  }, []);

  const getTypeColor = (type: SearchType): string => {
    switch (type) {
      case 'block':
        return 'text-blue-600 dark:text-blue-400 bg-blue-100 dark:bg-blue-900/30';
      case 'transaction':
        return 'text-purple-600 dark:text-purple-400 bg-purple-100 dark:bg-purple-900/30';
      case 'account':
        return 'text-green-600 dark:text-green-400 bg-green-100 dark:bg-green-900/30';
      default:
        return 'text-gray-600 dark:text-gray-400 bg-gray-100 dark:bg-gray-900/30';
    }
  };

  return (
    <div className="relative w-full max-w-2xl">
      {/* Search Input */}
      <div className="relative">
        <div className="absolute inset-y-0 left-0 pl-4 flex items-center pointer-events-none">
          {isSearching ? (
            <div className="animate-spin rounded-full h-5 w-5 border-2 border-gray-300 border-t-blue-600"></div>
          ) : (
            <svg className="h-5 w-5 text-gray-400" fill="currentColor" viewBox="0 0 20 20">
              <path fillRule="evenodd" d="M8 4a4 4 0 100 8 4 4 0 000-8zM2 8a6 6 0 1110.89 3.476l4.817 4.817a1 1 0 01-1.414 1.414l-4.816-4.816A6 6 0 012 8z" clipRule="evenodd" />
            </svg>
          )}
        </div>

        <input
          ref={inputRef}
          type="text"
          value={query}
          onChange={(e) => setQuery(e.target.value)}
          onKeyDown={handleKeyDown}
          onFocus={() => setIsOpen(true)}
          placeholder="Search by block height, transaction hash, or account address..."
          className="w-full pl-12 pr-24 py-4 bg-white dark:bg-gray-800 border-2 border-gray-300 dark:border-gray-600 rounded-xl text-gray-900 dark:text-white placeholder-gray-500 dark:placeholder-gray-400 focus:border-blue-500 dark:focus:border-blue-400 focus:ring-4 focus:ring-blue-100 dark:focus:ring-blue-900/30 transition-all shadow-lg"
        />

        {query && (
          <button
            onClick={() => {
              setQuery('');
              setIsOpen(false);
              inputRef.current?.focus();
            }}
            className="absolute inset-y-0 right-4 flex items-center text-gray-400 hover:text-gray-600 dark:hover:text-gray-300"
          >
            <svg className="w-5 h-5" fill="currentColor" viewBox="0 0 20 20">
              <path fillRule="evenodd" d="M10 18a8 8 0 100-16 8 8 0 000 16zM8.707 7.293a1 1 0 00-1.414 1.414L8.586 10l-1.293 1.293a1 1 0 101.414 1.414L10 11.414l1.293 1.293a1 1 0 001.414-1.414L11.414 10l1.293-1.293a1 1 0 00-1.414-1.414L10 8.586 8.707 7.293z" clipRule="evenodd" />
            </svg>
          </button>
        )}
      </div>

      {/* Search Type Filter */}
      <div className="mt-3 flex items-center gap-2">
        <span className="text-sm text-gray-500 dark:text-gray-400">Filter:</span>
        {(['all', 'block', 'transaction', 'account'] as SearchType[]).map((type) => (
          <button
            key={type}
            onClick={() => setSearchType(type)}
            className={`px-3 py-1 rounded-lg text-xs font-medium transition-all ${
              searchType === type
                ? 'bg-blue-600 text-white shadow-md'
                : 'bg-gray-100 dark:bg-gray-700 text-gray-600 dark:text-gray-400 hover:bg-gray-200 dark:hover:bg-gray-600'
            }`}
          >
            {type.charAt(0).toUpperCase() + type.slice(1)}
          </button>
        ))}
      </div>

      {/* Recent Searches (shown when no query) */}
      {isOpen && !query && recentSearches.length > 0 && (
        <div
          ref={dropdownRef}
          className="absolute z-50 w-full mt-2 bg-white dark:bg-gray-800 border border-gray-200 dark:border-gray-700 rounded-xl shadow-2xl overflow-hidden animate-slideIn"
        >
          <div className="px-4 py-2 bg-gray-50 dark:bg-gray-900 border-b border-gray-200 dark:border-gray-700 flex items-center justify-between">
            <span className="text-sm font-medium text-gray-700 dark:text-gray-300">Recent Searches</span>
            <button
              onClick={clearRecentSearches}
              className="text-xs text-blue-600 dark:text-blue-400 hover:text-blue-700 dark:hover:text-blue-300 font-medium"
            >
              Clear All
            </button>
          </div>
          <div className="max-h-80 overflow-y-auto custom-scrollbar">
            {recentSearches.map((result, index) => (
              <button
                key={`recent-${result.type}-${result.value}`}
                onClick={() => handleSelect(result)}
                onMouseEnter={() => setSelectedIndex(index)}
                className={`w-full flex items-center gap-4 px-4 py-3 text-left transition-colors ${
                  index === selectedIndex
                    ? 'bg-blue-50 dark:bg-blue-900/20'
                    : 'hover:bg-gray-50 dark:hover:bg-gray-700'
                }`}
              >
                <div className={`p-2 rounded-lg ${getTypeColor(result.type)}`}>
                  {result.icon}
                </div>

                <div className="flex-1 min-w-0">
                  <div className="flex items-center gap-2 mb-1">
                    <span className="font-medium text-gray-900 dark:text-white truncate">
                      {result.label}
                    </span>
                    <span className={`text-xs px-2 py-0.5 rounded-full ${getTypeColor(result.type)}`}>
                      {result.type}
                    </span>
                  </div>
                  {result.description && (
                    <div className="text-sm text-gray-500 dark:text-gray-400">
                      {result.description}
                    </div>
                  )}
                </div>

                <svg className="w-4 h-4 text-gray-400" fill="currentColor" viewBox="0 0 20 20">
                  <path fillRule="evenodd" d="M10 18a8 8 0 100-16 8 8 0 000 16zm1-11a1 1 0 10-2 0v3.586L7.707 9.293a1 1 0 00-1.414 1.414l3 3a1 1 0 001.414 0l3-3a1 1 0 00-1.414-1.414L11 10.586V7z" clipRule="evenodd" />
                </svg>
              </button>
            ))}
          </div>
        </div>
      )}

      {/* Search Results Dropdown */}
      {isOpen && query && results.length > 0 && (
        <div
          ref={dropdownRef}
          className="absolute z-50 w-full mt-2 bg-white dark:bg-gray-800 border border-gray-200 dark:border-gray-700 rounded-xl shadow-2xl overflow-hidden animate-slideIn"
        >
          <div className="max-h-96 overflow-y-auto custom-scrollbar">
            {results.map((result, index) => (
              <button
                key={`${result.type}-${result.value}`}
                onClick={() => handleSelect(result)}
                onMouseEnter={() => setSelectedIndex(index)}
                className={`w-full flex items-center gap-4 px-4 py-3 text-left transition-colors ${
                  index === selectedIndex
                    ? 'bg-blue-50 dark:bg-blue-900/20'
                    : 'hover:bg-gray-50 dark:hover:bg-gray-700'
                }`}
              >
                <div className={`p-2 rounded-lg ${getTypeColor(result.type)}`}>
                  {result.icon}
                </div>

                <div className="flex-1 min-w-0">
                  <div className="flex items-center gap-2 mb-1">
                    <span className="font-medium text-gray-900 dark:text-white truncate">
                      {result.label}
                    </span>
                    <span className={`text-xs px-2 py-0.5 rounded-full ${getTypeColor(result.type)}`}>
                      {result.type}
                    </span>
                  </div>
                  {result.description && (
                    <div className="text-sm text-gray-500 dark:text-gray-400">
                      {result.description}
                    </div>
                  )}
                </div>

                <svg className="w-5 h-5 text-gray-400" fill="currentColor" viewBox="0 0 20 20">
                  <path fillRule="evenodd" d="M7.293 14.707a1 1 0 010-1.414L10.586 10 7.293 6.707a1 1 0 011.414-1.414l4 4a1 1 0 010 1.414l-4 4a1 1 0 01-1.414 0z" clipRule="evenodd" />
                </svg>
              </button>
            ))}
          </div>

          {/* Keyboard Hints */}
          <div className="px-4 py-2 bg-gray-50 dark:bg-gray-900 border-t border-gray-200 dark:border-gray-700 flex items-center justify-between text-xs text-gray-500 dark:text-gray-400">
            <div className="flex items-center gap-4">
              <span className="flex items-center gap-1">
                <kbd className="px-2 py-0.5 bg-white dark:bg-gray-800 border border-gray-300 dark:border-gray-600 rounded">↑↓</kbd>
                Navigate
              </span>
              <span className="flex items-center gap-1">
                <kbd className="px-2 py-0.5 bg-white dark:bg-gray-800 border border-gray-300 dark:border-gray-600 rounded">Enter</kbd>
                Select
              </span>
              <span className="flex items-center gap-1">
                <kbd className="px-2 py-0.5 bg-white dark:bg-gray-800 border border-gray-300 dark:border-gray-600 rounded">Esc</kbd>
                Close
              </span>
            </div>
            <span>{results.length} result{results.length !== 1 ? 's' : ''}</span>
          </div>
        </div>
      )}

      {/* No Results */}
      {isOpen && !isSearching && query.length >= 2 && results.length === 0 && (
        <div className="absolute z-50 w-full mt-2 bg-white dark:bg-gray-800 border border-gray-200 dark:border-gray-700 rounded-xl shadow-2xl p-8 text-center animate-slideIn">
          <svg className="w-12 h-12 mx-auto mb-4 text-gray-400" fill="currentColor" viewBox="0 0 20 20">
            <path fillRule="evenodd" d="M8 4a4 4 0 100 8 4 4 0 000-8zM2 8a6 6 0 1110.89 3.476l4.817 4.817a1 1 0 01-1.414 1.414l-4.816-4.816A6 6 0 012 8z" clipRule="evenodd" />
          </svg>
          <p className="text-gray-600 dark:text-gray-400 font-medium mb-1">No results found</p>
          <p className="text-sm text-gray-500 dark:text-gray-500">
            Try searching with a different block height, transaction hash, or account address
          </p>
        </div>
      )}
    </div>
  );
};

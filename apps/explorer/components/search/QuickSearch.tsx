'use client';

import { useState, useCallback } from 'react';
import { useRouter } from 'next/navigation';

export const QuickSearch = (): JSX.Element => {
  const [query, setQuery] = useState('');
  const [isSearching, setIsSearching] = useState(false);
  const router = useRouter();

  const handleSearch = useCallback((e: React.FormEvent) => {
    e.preventDefault();
    const trimmedQuery = query.trim();

    if (!trimmedQuery) return;

    setIsSearching(true);

    // Detect search type and navigate accordingly
    // Block height (numeric only)
    if (/^\d+$/.test(trimmedQuery)) {
      router.push(`/blocks/${trimmedQuery}`);
      return;
    }

    // Transaction/Block hash (64 hex characters with 0x prefix)
    if (/^0x[A-Fa-f0-9]{64}$/.test(trimmedQuery)) {
      // Try as transaction first
      router.push(`/tx/${trimmedQuery}`);
      return;
    }

    // Account address (Ethereum-style 0x address)
    if (/^0x[A-Fa-f0-9]{40}$/.test(trimmedQuery)) {
      router.push(`/address/${trimmedQuery}`);
      return;
    }

    // Any address starting with 0x (flexible length for various formats)
    if (trimmedQuery.startsWith('0x') && /^0x[A-Fa-f0-9]+$/.test(trimmedQuery)) {
      // Could be address or hash, try to determine
      if (trimmedQuery.length === 42) {
        // Standard Ethereum address length
        router.push(`/address/${trimmedQuery}`);
      } else if (trimmedQuery.length === 66) {
        // Standard transaction hash length
        router.push(`/tx/${trimmedQuery}`);
      } else {
        // Try as address for other lengths
        router.push(`/address/${trimmedQuery}`);
      }
      return;
    }

    // Default: open advanced search
    const searchButton = document.querySelector('[aria-label="Toggle search"]') as HTMLButtonElement;
    searchButton?.click();
    setTimeout(() => {
      const searchInput = document.querySelector('input[placeholder*="Search by block"]') as HTMLInputElement;
      if (searchInput) {
        searchInput.value = trimmedQuery;
        searchInput.dispatchEvent(new Event('input', { bubbles: true }));
      }
    }, 100);
  }, [query, router]);

  const handleKeyDown = useCallback((e: React.KeyboardEvent) => {
    if (e.key === 'Enter') {
      handleSearch(e as any);
    }
  }, [handleSearch]);

  return (
    <form onSubmit={handleSearch} className="w-full">
      <div className="relative group">
        <div className="absolute inset-y-0 left-0 pl-4 flex items-center pointer-events-none">
          {isSearching ? (
            <div className="animate-spin rounded-full h-5 w-5 border-2 border-blue-500 border-t-transparent"></div>
          ) : (
            <svg className="h-5 w-5 text-gray-400 group-hover:text-blue-500 transition-colors" fill="currentColor" viewBox="0 0 20 20">
              <path fillRule="evenodd" d="M8 4a4 4 0 100 8 4 4 0 000-8zM2 8a6 6 0 1110.89 3.476l4.817 4.817a1 1 0 01-1.414 1.414l-4.816-4.816A6 6 0 012 8z" clipRule="evenodd" />
            </svg>
          )}
        </div>
        <input
          type="text"
          value={query}
          onChange={(e) => setQuery(e.target.value)}
          onKeyDown={handleKeyDown}
          placeholder="Search blocks, transactions, or addresses..."
          className="w-full pl-12 pr-32 py-4 bg-white dark:bg-gray-800 border-2 border-gray-400 dark:border-gray-600 rounded-xl text-gray-900 dark:text-white placeholder-gray-600 dark:placeholder-gray-400 hover:border-blue-600 dark:hover:border-blue-500 focus:border-blue-600 dark:focus:border-bnb-yellow focus:ring-4 focus:ring-blue-200 dark:focus:ring-blue-900/30 transition-all shadow-lg hover:shadow-xl"
        />
        <div className="absolute inset-y-0 right-0 pr-3 flex items-center gap-2">
          {query && (
            <button
              type="button"
              onClick={() => setQuery('')}
              className="p-1 hover:bg-gray-100 dark:hover:bg-gray-700 rounded transition-colors"
            >
              <svg className="w-4 h-4 text-gray-400" fill="currentColor" viewBox="0 0 20 20">
                <path fillRule="evenodd" d="M10 18a8 8 0 100-16 8 8 0 000 16zM8.707 7.293a1 1 0 00-1.414 1.414L8.586 10l-1.293 1.293a1 1 0 101.414 1.414L10 11.414l1.293 1.293a1 1 0 001.414-1.414L11.414 10l1.293-1.293a1 1 0 00-1.414-1.414L10 8.586 8.707 7.293z" clipRule="evenodd" />
              </svg>
            </button>
          )}
          <button
            type="submit"
            disabled={!query.trim()}
            className="px-4 py-2 bg-blue-600 hover:bg-blue-700 disabled:bg-gray-400 disabled:text-gray-600 disabled:cursor-not-allowed text-white rounded-lg font-medium transition-colors text-sm shadow-md"
          >
            Search
          </button>
        </div>
      </div>

      {/* Quick hints */}
      <div className="mt-2 flex flex-wrap items-center gap-2 text-xs text-gray-500 dark:text-gray-400">
        <span className="flex items-center gap-1">
          <kbd className="px-2 py-0.5 bg-gray-100 dark:bg-gray-700 border border-gray-300 dark:border-gray-600 rounded">Enter</kbd>
          to search
        </span>
        <span className="hidden sm:inline">•</span>
        <span className="hidden sm:inline">Try: block number, tx hash, or address</span>
      </div>
    </form>
  );
};

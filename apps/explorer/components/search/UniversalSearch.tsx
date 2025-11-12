'use client';

import React, { useState, useEffect, useRef } from 'react';
import { useRouter } from 'next/navigation';
import { formatAddress, formatHash } from '@/lib/api-client';
import { AddressLabels } from './AddressLabels';

interface SearchResult {
  type: 'block' | 'transaction' | 'account' | 'contract' | 'token';
  value: string;
  label: string;
  description?: string;
}

interface UniversalSearchProps {
  onResultSelect?: (result: SearchResult) => void;
  placeholder?: string;
  className?: string;
}

export function UniversalSearch({ onResultSelect, placeholder = 'Search by address, transaction hash, block height, token symbol...', className = '' }: UniversalSearchProps): JSX.Element {
  const [query, setQuery] = useState('');
  const [results, setResults] = useState<SearchResult[]>([]);
  const [isLoading, setIsLoading] = useState(false);
  const [showResults, setShowResults] = useState(false);
  const [selectedIndex, setSelectedIndex] = useState(-1);
  const router = useRouter();
  const searchRef = useRef<HTMLDivElement>(null);
  const inputRef = useRef<HTMLInputElement>(null);

  // Close results when clicking outside
  useEffect(() => {
    const handleClickOutside = (event: MouseEvent) => {
      if (searchRef.current && !searchRef.current.contains(event.target as Node)) {
        setShowResults(false);
      }
    };

    document.addEventListener('mousedown', handleClickOutside);
    return () => document.removeEventListener('mousedown', handleClickOutside);
  }, []);

  // Handle keyboard navigation
  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      if (!showResults || results.length === 0) return;

      if (e.key === 'ArrowDown') {
        e.preventDefault();
        setSelectedIndex((prev) => (prev < results.length - 1 ? prev + 1 : prev));
      } else if (e.key === 'ArrowUp') {
        e.preventDefault();
        setSelectedIndex((prev) => (prev > 0 ? prev - 1 : -1));
      } else if (e.key === 'Enter' && selectedIndex >= 0) {
        e.preventDefault();
        handleSelectResult(results[selectedIndex]);
      } else if (e.key === 'Escape') {
        setShowResults(false);
        setSelectedIndex(-1);
      }
    };

    window.addEventListener('keydown', handleKeyDown);
    return () => window.removeEventListener('keydown', handleKeyDown);
  }, [showResults, results, selectedIndex]);

  const performSearch = async (searchQuery: string) => {
    if (!searchQuery || searchQuery.length < 2) {
      setResults([]);
      setShowResults(false);
      return;
    }

    setIsLoading(true);
    setShowResults(true);

    try {
      const searchResults: SearchResult[] = [];

      // Detect search type and format results
      const trimmedQuery = searchQuery.trim();

      // Check if it's a block height (numeric)
      if (/^\d+$/.test(trimmedQuery)) {
        searchResults.push({
          type: 'block',
          value: trimmedQuery,
          label: `Block #${trimmedQuery}`,
          description: 'View block details',
        });
      }

      // Check if it's an address (0x followed by 40 hex chars)
      if (/^0x[a-fA-F0-9]{40}$/.test(trimmedQuery)) {
        // Check for user label
        const stored = localStorage.getItem('addressLabels');
        let userLabel: string | undefined;
        if (stored) {
          const parsed = JSON.parse(stored);
          userLabel = parsed[trimmedQuery.toLowerCase()];
        }

        const addressLabel = userLabel ? ` (${userLabel})` : '';
        
        searchResults.push({
          type: 'account',
          value: trimmedQuery,
          label: `Address ${formatAddress(trimmedQuery)}${addressLabel}`,
          description: userLabel || 'View account details',
        });
        searchResults.push({
          type: 'contract',
          value: trimmedQuery,
          label: `Contract ${formatAddress(trimmedQuery)}${addressLabel}`,
          description: userLabel || 'View contract details',
        });
        searchResults.push({
          type: 'token',
          value: trimmedQuery,
          label: `Token ${formatAddress(trimmedQuery)}${addressLabel}`,
          description: userLabel || 'View token details',
        });
      }

      // Check if it's a transaction hash (0x followed by 64 hex chars)
      if (/^0x[a-fA-F0-9]{64}$/.test(trimmedQuery)) {
        searchResults.push({
          type: 'transaction',
          value: trimmedQuery,
          label: `Transaction ${formatHash(trimmedQuery)}`,
          description: 'View transaction details',
        });
      }

      // If no specific format detected, search as text (token symbol, contract name, etc.)
      if (searchResults.length === 0 && trimmedQuery.length >= 2) {
        // Text search functionality
        // Placeholder results shown - full-text search API endpoint will be implemented for token symbols, contract names, etc.
        searchResults.push({
          type: 'token',
          value: trimmedQuery,
          label: `Search for "${trimmedQuery}"`,
          description: 'Search tokens, contracts, and addresses',
        });
      }

      setResults(searchResults);
      setSelectedIndex(-1);
    } catch (error) {
      console.error('Search error:', error);
      setResults([]);
    } finally {
      setIsLoading(false);
    }
  };

  const handleInputChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const value = e.target.value;
    setQuery(value);
    performSearch(value);
  };

  const handleSelectResult = (result: SearchResult) => {
    setShowResults(false);
    setQuery('');

    if (onResultSelect) {
      onResultSelect(result);
    } else {
      // Default navigation
      switch (result.type) {
        case 'block':
          router.push(`/blocks/${result.value}`);
          break;
        case 'transaction':
          router.push(`/tx/${result.value}`);
          break;
        case 'account':
          router.push(`/accounts/${result.value}`);
          break;
        case 'contract':
          router.push(`/contracts/${result.value}`);
          break;
        case 'token':
          router.push(`/tokens?address=${result.value}`);
          break;
      }
    }
  };

  const getTypeIcon = (type: string) => {
    const icons = {
      block: (
        <svg className="w-5 h-5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 11H5m14 0a2 2 0 012 2v6a2 2 0 01-2 2H5a2 2 0 01-2-2v-6a2 2 0 012-2m14 0V9a2 2 0 00-2-2M5 11V9a2 2 0 012-2m0 0V5a2 2 0 012-2h6a2 2 0 012 2v2M7 7h10" />
        </svg>
      ),
      transaction: (
        <svg className="w-5 h-5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M8 7h12m0 0l-4-4m4 4l-4 4m0 6H4m0 0l4 4m-4-4l4-4" />
        </svg>
      ),
      account: (
        <svg className="w-5 h-5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M16 7a4 4 0 11-8 0 4 4 0 018 0zM12 14a7 7 0 00-7 7h14a7 7 0 00-7-7z" />
        </svg>
      ),
      contract: (
        <svg className="w-5 h-5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12h6m-6 4h6m2 5H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z" />
        </svg>
      ),
      token: (
        <svg className="w-5 h-5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 8c-1.657 0-3 .895-3 2s1.343 2 3 2 3 .895 3 2-1.343 2-3 2m0-8c1.11 0 2.08.402 2.599 1M12 8V7m0 1v8m0 0v1m0-1c-1.11 0-2.08-.402-2.599-1M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
        </svg>
      ),
    };
    return icons[type as keyof typeof icons] || icons.account;
  };

  const getTypeColor = (type: string) => {
    const colors = {
      block: 'text-blue-400 bg-blue-500/20 border-blue-500/30',
      transaction: 'text-purple-400 bg-purple-500/20 border-purple-500/30',
      account: 'text-green-400 bg-green-500/20 border-green-500/30',
      contract: 'text-orange-400 bg-orange-500/20 border-orange-500/30',
      token: 'text-yellow-400 bg-yellow-500/20 border-yellow-500/30',
    };
    return colors[type as keyof typeof colors] || colors.account;
  };

  return (
    <div ref={searchRef} className={`relative ${className}`}>
      {/* Search Input */}
      <div className="relative">
        <div className="absolute inset-y-0 left-0 pl-4 flex items-center pointer-events-none">
          <svg className="h-5 w-5 text-gray-400" fill="none" viewBox="0 0 24 24" stroke="currentColor">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z" />
          </svg>
        </div>
        <input
          ref={inputRef}
          type="text"
          value={query}
          onChange={handleInputChange}
          onFocus={() => query.length >= 2 && setShowResults(true)}
          placeholder={placeholder}
          className="w-full pl-12 pr-4 py-3 bg-slate-900 border border-slate-700 rounded-lg text-white placeholder-gray-500 focus:border-blue-500 focus:ring-2 focus:ring-blue-500/20 transition-all"
        />
        {isLoading && (
          <div className="absolute inset-y-0 right-0 pr-4 flex items-center">
            <div className="w-5 h-5 border-2 border-blue-500 border-t-transparent rounded-full animate-spin"></div>
          </div>
        )}
      </div>

      {/* Search Results Dropdown */}
      {showResults && (
        <div className="absolute z-50 w-full mt-2 bg-slate-800 border border-slate-700 rounded-lg shadow-xl max-h-96 overflow-y-auto">
          {results.length > 0 ? (
            <div className="py-2">
              {results.map((result, index) => (
                <button
                  key={`${result.type}-${result.value}-${index}`}
                  onClick={() => handleSelectResult(result)}
                  onMouseEnter={() => setSelectedIndex(index)}
                  className={`w-full px-4 py-3 flex items-start gap-3 hover:bg-slate-700 transition-colors ${
                    selectedIndex === index ? 'bg-slate-700' : ''
                  }`}
                >
                  <div className={`flex-shrink-0 p-2 rounded-lg border ${getTypeColor(result.type)}`}>
                    {getTypeIcon(result.type)}
                  </div>
                  <div className="flex-1 text-left min-w-0">
                    <div className="text-white font-medium truncate">{result.label}</div>
                    {result.description && (
                      <div className="text-sm text-gray-400 mt-0.5">{result.description}</div>
                    )}
                  </div>
                  <div className="flex-shrink-0">
                    <span className={`px-2 py-1 text-xs font-semibold rounded ${getTypeColor(result.type)}`}>
                      {result.type}
                    </span>
                  </div>
                </button>
              ))}
            </div>
          ) : query.length >= 2 && !isLoading ? (
            <div className="px-4 py-8 text-center text-gray-400">
              <p>No results found</p>
              <p className="text-sm mt-1">Try searching by address, transaction hash, or block height</p>
            </div>
          ) : null}
        </div>
      )}
    </div>
  );
}


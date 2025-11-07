'use client'

import { motion, AnimatePresence } from 'framer-motion'
import { useState, useEffect } from 'react'
import { Search, X, Hash, User, FileText } from 'lucide-react'

interface SearchResult {
  type: 'block' | 'transaction' | 'account' | 'contract'
  id: string
  title: string
  subtitle: string
}

interface AdvancedSearchProps {
  onSelect?: (result: SearchResult) => void
}

/**
 * Advanced Search Component
 * Intelligent search with autocomplete and filters
 */
export function AdvancedSearch({ onSelect }: AdvancedSearchProps) {
  const [query, setQuery] = useState('')
  const [results, setResults] = useState<SearchResult[]>([])
  const [isOpen, setIsOpen] = useState(false)
  const [selectedFilter, setSelectedFilter] = useState<'all' | 'block' | 'transaction' | 'account'>('all')

  // Mock search function - replace with actual API call
  const performSearch = async (searchQuery: string) => {
    if (searchQuery.length < 2) {
      setResults([])
      return
    }

    // Simulate API call
    const mockResults: SearchResult[] = [
      {
        type: 'block',
        id: '12345',
        title: 'Block #12345',
        subtitle: '2 transactions • 2 seconds ago',
      },
      {
        type: 'transaction',
        id: '0x1234...5678',
        title: 'Transaction',
        subtitle: 'From: 0xabcd... • 1 NOR',
      },
      {
        type: 'account',
        id: '0xabcd...efgh',
        title: 'Account',
        subtitle: 'Balance: 1,234.56 NOR',
      },
    ]

    setResults(mockResults.filter(r => 
      r.title.toLowerCase().includes(searchQuery.toLowerCase()) ||
      r.id.toLowerCase().includes(searchQuery.toLowerCase())
    ))
  }

  useEffect(() => {
    const timeoutId = setTimeout(() => {
      performSearch(query)
    }, 300)

    return () => clearTimeout(timeoutId)
  }, [query])

  const getIcon = (type: string) => {
    switch (type) {
      case 'block':
        return <Hash className="w-4 h-4" />
      case 'transaction':
        return <FileText className="w-4 h-4" />
      case 'account':
        return <User className="w-4 h-4" />
      default:
        return <Search className="w-4 h-4" />
    }
  }

  return (
    <div className="relative w-full max-w-2xl">
      {/* Search Input */}
      <div className="relative">
        <Search className="absolute left-4 top-1/2 -translate-y-1/2 w-5 h-5 text-neutral-400" />
        <input
          type="text"
          value={query}
          onChange={(e) => {
            setQuery(e.target.value)
            setIsOpen(true)
          }}
          onFocus={() => setIsOpen(true)}
          placeholder="Search blocks, transactions, accounts..."
          className="w-full pl-12 pr-12 py-3 bg-neutral-900 border border-neutral-800
            rounded-xl text-white placeholder-neutral-500
            focus:outline-none focus:ring-2 focus:ring-primary-500 focus:border-transparent
            transition-all"
        />
        {query && (
          <button
            onClick={() => {
              setQuery('')
              setResults([])
            }}
            className="absolute right-4 top-1/2 -translate-y-1/2 text-neutral-400 hover:text-white"
          >
            <X className="w-5 h-5" />
          </button>
        )}
      </div>

      {/* Search Results */}
      <AnimatePresence>
        {isOpen && results.length > 0 && (
          <motion.div
            initial={{ opacity: 0, y: -10 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: -10 }}
            className="absolute top-full mt-2 w-full bg-neutral-900 border border-neutral-800
              rounded-xl shadow-xl overflow-hidden z-50 max-h-96 overflow-y-auto"
          >
            {/* Filters */}
            <div className="flex gap-2 p-3 border-b border-neutral-800">
              {(['all', 'block', 'transaction', 'account'] as const).map((filter) => (
                <button
                  key={filter}
                  onClick={() => setSelectedFilter(filter)}
                  className={`px-3 py-1 rounded-lg text-sm font-medium transition-colors
                    ${selectedFilter === filter
                      ? 'bg-primary-500 text-white'
                      : 'bg-neutral-800 text-neutral-400 hover:text-white'
                    }`}
                >
                  {filter.charAt(0).toUpperCase() + filter.slice(1)}
                </button>
              ))}
            </div>

            {/* Results List */}
            <div className="p-2">
              {results
                .filter(r => selectedFilter === 'all' || r.type === selectedFilter)
                .map((result, index) => (
                  <motion.button
                    key={result.id}
                    initial={{ opacity: 0, x: -10 }}
                    animate={{ opacity: 1, x: 0 }}
                    transition={{ delay: index * 0.05 }}
                    onClick={() => {
                      onSelect?.(result)
                      setIsOpen(false)
                    }}
                    className="w-full flex items-center gap-3 p-3 rounded-lg
                      hover:bg-neutral-800 transition-colors text-left"
                  >
                    <div className={`p-2 rounded-lg ${
                      result.type === 'block' ? 'bg-primary-500/20 text-primary-400' :
                      result.type === 'transaction' ? 'bg-shariah-500/20 text-shariah-400' :
                      'bg-defi-500/20 text-defi-400'
                    }`}>
                      {getIcon(result.type)}
                    </div>
                    <div className="flex-1 min-w-0">
                      <div className="text-white font-medium truncate">{result.title}</div>
                      <div className="text-neutral-400 text-sm truncate">{result.subtitle}</div>
                    </div>
                  </motion.button>
                ))}
            </div>
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  )
}

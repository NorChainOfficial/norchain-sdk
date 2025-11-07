'use client'

import { motion, AnimatePresence } from 'framer-motion'
import { useEffect, useState } from 'react'

interface Transaction {
  hash: string
  from: string
  to: string
  value: string
  timestamp: number
  status: 'pending' | 'confirmed'
}

interface LiveTransactionFeedProps {
  transactions: Transaction[]
  maxItems?: number
}

/**
 * Live Transaction Feed
 * Real-time animated transaction feed
 */
export function LiveTransactionFeed({
  transactions,
  maxItems = 10,
}: LiveTransactionFeedProps) {
  const [displayedTransactions, setDisplayedTransactions] = useState<Transaction[]>([])

  useEffect(() => {
    setDisplayedTransactions(transactions.slice(0, maxItems))
  }, [transactions, maxItems])

  const formatAddress = (address: string) => {
    return `${address.slice(0, 6)}...${address.slice(-4)}`
  }

  const formatTimeAgo = (timestamp: number) => {
    const seconds = Math.floor((Date.now() / 1000) - timestamp)
    if (seconds < 60) return `${seconds}s ago`
    if (seconds < 3600) return `${Math.floor(seconds / 60)}m ago`
    return `${Math.floor(seconds / 3600)}h ago`
  }

  return (
    <div className="space-y-2">
      <div className="flex items-center justify-between mb-4">
        <h3 className="text-lg font-semibold text-white">Live Transactions</h3>
        <div className="flex items-center gap-2">
          <div className="w-2 h-2 rounded-full bg-success-500 animate-pulse" />
          <span className="text-sm text-neutral-400">Live</span>
        </div>
      </div>

      <AnimatePresence mode="popLayout">
        {displayedTransactions.map((tx, index) => (
          <motion.div
            key={tx.hash}
            initial={{ opacity: 0, x: -20, scale: 0.95 }}
            animate={{ opacity: 1, x: 0, scale: 1 }}
            exit={{ opacity: 0, x: 20, scale: 0.95 }}
            transition={{ duration: 0.3, delay: index * 0.05 }}
            className="bg-neutral-900/50 rounded-lg p-4 border border-neutral-800
              hover:border-primary-500 transition-colors cursor-pointer
              hover:bg-neutral-900/70"
          >
            <div className="flex items-center justify-between">
              <div className="flex items-center gap-3 flex-1 min-w-0">
                {/* Status Indicator */}
                <div className={`w-2 h-2 rounded-full flex-shrink-0
                  ${tx.status === 'confirmed' ? 'bg-success-500' : 'bg-warning-500 animate-pulse'}`}
                />

                {/* Transaction Info */}
                <div className="flex-1 min-w-0">
                  <div className="flex items-center gap-2 mb-1">
                    <span className="text-white font-mono text-sm truncate">
                      {formatAddress(tx.from)}
                    </span>
                    <span className="text-neutral-500">→</span>
                    <span className="text-white font-mono text-sm truncate">
                      {formatAddress(tx.to)}
                    </span>
                  </div>
                  <div className="flex items-center gap-4 text-xs text-neutral-400">
                    <span>{formatTimeAgo(tx.timestamp)}</span>
                    <span className="text-shariah-400 font-medium">
                      {parseFloat(tx.value).toFixed(4)} NOR
                    </span>
                  </div>
                </div>
              </div>

              {/* Hash Preview */}
              <div className="text-neutral-600 font-mono text-xs ml-4 hidden md:block">
                {tx.hash.slice(0, 8)}...
              </div>
            </div>
          </motion.div>
        ))}
      </AnimatePresence>
    </div>
  )
}

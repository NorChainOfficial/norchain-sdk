'use client'

import { motion } from 'framer-motion'
import { useState } from 'react'

interface TransactionFlowProps {
  from: string
  to: string
  value: string
  gasUsed?: string
  status: 'pending' | 'confirmed' | 'failed'
}

/**
 * Interactive Transaction Flow Diagram
 * Visual representation of transaction flow
 */
export function TransactionFlowDiagram({
  from,
  to,
  value,
  gasUsed,
  status,
}: TransactionFlowProps) {
  const [isAnimating, setIsAnimating] = useState(true)

  const statusColors = {
    pending: 'text-warning-500',
    confirmed: 'text-success-500',
    failed: 'text-error-500',
  }

  return (
    <div className="w-full p-6 bg-neutral-900/50 rounded-xl border border-neutral-800">
      <div className="flex items-center justify-between mb-6">
        <h3 className="text-lg font-semibold text-white">Transaction Flow</h3>
        <span className={`text-sm font-medium ${statusColors[status]}`}>
          {status.toUpperCase()}
        </span>
      </div>

      <div className="relative">
        {/* From Address */}
        <motion.div
          initial={{ opacity: 0, x: -20 }}
          animate={{ opacity: 1, x: 0 }}
          className="flex items-center gap-4 mb-4"
        >
          <div className="w-12 h-12 rounded-full bg-gradient-to-br from-primary-500 to-primary-700
            flex items-center justify-center text-white font-bold shadow-lg">
            F
          </div>
          <div className="flex-1">
            <div className="text-neutral-400 text-sm mb-1">From</div>
            <div className="text-white font-mono text-sm break-all">{from}</div>
          </div>
        </motion.div>

        {/* Flow Arrow */}
        <div className="relative flex items-center justify-center my-4">
          <motion.div
            initial={{ scaleY: 0 }}
            animate={{ scaleY: 1 }}
            transition={{ duration: 0.5, delay: 0.3 }}
            className="w-0.5 h-16 bg-gradient-to-b from-primary-500 via-shariah-500 to-primary-500"
          />

          {/* Animated Flow */}
          {isAnimating && (
            <motion.div
              initial={{ y: -32, opacity: 0 }}
              animate={{ y: 32, opacity: [0, 1, 0] }}
              transition={{
                duration: 2,
                repeat: Infinity,
                ease: 'easeInOut',
              }}
              className="absolute w-3 h-3 rounded-full bg-shariah-400 shadow-glow-shariah"
            />
          )}

          {/* Value Display */}
          <motion.div
            initial={{ opacity: 0, scale: 0.8 }}
            animate={{ opacity: 1, scale: 1 }}
            transition={{ delay: 0.5 }}
            className="absolute bg-neutral-800 px-3 py-1 rounded-lg border border-neutral-700
              text-white font-semibold text-sm shadow-lg"
          >
            {value} NOR
          </motion.div>
        </div>

        {/* To Address */}
        <motion.div
          initial={{ opacity: 0, x: 20 }}
          animate={{ opacity: 1, x: 0 }}
          className="flex items-center gap-4"
        >
          <div className="w-12 h-12 rounded-full bg-gradient-to-br from-shariah-500 to-shariah-700
            flex items-center justify-center text-white font-bold shadow-lg">
            T
          </div>
          <div className="flex-1">
            <div className="text-neutral-400 text-sm mb-1">To</div>
            <div className="text-white font-mono text-sm break-all">{to}</div>
          </div>
        </motion.div>

        {/* Gas Info */}
        {gasUsed && (
          <motion.div
            initial={{ opacity: 0, y: 10 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.7 }}
            className="mt-6 pt-4 border-t border-neutral-800 flex items-center justify-between"
          >
            <span className="text-neutral-400 text-sm">Gas Used</span>
            <span className="text-white font-semibold">{gasUsed}</span>
          </motion.div>
        )}
      </div>
    </div>
  )
}


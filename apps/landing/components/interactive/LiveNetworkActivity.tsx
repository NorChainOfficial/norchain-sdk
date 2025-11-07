'use client'

import { motion } from 'framer-motion'
import { useEffect, useState } from 'react'

interface NetworkActivityProps {
  transactionsPerSecond: number
  blocksPerMinute: number
  activeValidators: number
}

/**
 * Live Network Activity
 * Real-time network activity visualization
 */
export function LiveNetworkActivity({
  transactionsPerSecond,
  blocksPerMinute,
  activeValidators,
}: NetworkActivityProps) {
  const [animatedTps, setAnimatedTps] = useState(0)
  const [animatedBpm, setAnimatedBpm] = useState(0)

  useEffect(() => {
    const interval = setInterval(() => {
      setAnimatedTps((prev) => {
        const diff = transactionsPerSecond - prev
        return prev + diff * 0.1
      })
      setAnimatedBpm((prev) => {
        const diff = blocksPerMinute - prev
        return prev + diff * 0.1
      })
    }, 100)

    return () => clearInterval(interval)
  }, [transactionsPerSecond, blocksPerMinute])

  return (
    <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
      {/* Transactions Per Second */}
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        whileInView={{ opacity: 1, y: 0 }}
        viewport={{ once: true }}
        className="bg-gradient-to-br from-primary-600/20 to-primary-800/20
          rounded-xl p-6 border border-primary-500/30"
      >
        <div className="flex items-center justify-between mb-2">
          <span className="text-neutral-400 text-sm">Transactions/sec</span>
          <motion.div
            className="w-3 h-3 rounded-full bg-success-500"
            animate={{ scale: [1, 1.2, 1] }}
            transition={{ duration: 1, repeat: Infinity }}
          />
        </div>
        <motion.div
          key={animatedTps}
          initial={{ scale: 1.2 }}
          animate={{ scale: 1 }}
          className="text-3xl font-bold text-white"
        >
          {animatedTps.toFixed(1)}
        </motion.div>
      </motion.div>

      {/* Blocks Per Minute */}
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        whileInView={{ opacity: 1, y: 0 }}
        viewport={{ once: true }}
        transition={{ delay: 0.1 }}
        className="bg-gradient-to-br from-shariah-600/20 to-shariah-800/20
          rounded-xl p-6 border border-shariah-500/30"
      >
        <div className="flex items-center justify-between mb-2">
          <span className="text-neutral-400 text-sm">Blocks/min</span>
          <motion.div
            className="w-3 h-3 rounded-full bg-shariah-500"
            animate={{ scale: [1, 1.2, 1] }}
            transition={{ duration: 1, repeat: Infinity, delay: 0.3 }}
          />
        </div>
        <motion.div
          key={animatedBpm}
          initial={{ scale: 1.2 }}
          animate={{ scale: 1 }}
          className="text-3xl font-bold text-white"
        >
          {animatedBpm.toFixed(1)}
        </motion.div>
      </motion.div>

      {/* Active Validators */}
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        whileInView={{ opacity: 1, y: 0 }}
        viewport={{ once: true }}
        transition={{ delay: 0.2 }}
        className="bg-gradient-to-br from-defi-600/20 to-defi-800/20
          rounded-xl p-6 border border-defi-500/30"
      >
        <div className="flex items-center justify-between mb-2">
          <span className="text-neutral-400 text-sm">Validators</span>
          <div className="w-3 h-3 rounded-full bg-defi-500" />
        </div>
        <div className="text-3xl font-bold text-white">{activeValidators}</div>
      </motion.div>
    </div>
  )
}


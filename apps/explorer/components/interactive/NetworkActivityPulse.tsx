'use client'

import { motion } from 'framer-motion'
import { useEffect, useState } from 'react'

interface NetworkActivityPulseProps {
  activity: 'high' | 'medium' | 'low'
  transactionsPerSecond?: number
}

/**
 * Network Activity Pulse
 * Visual indicator of network activity with animated pulse
 */
export function NetworkActivityPulse({
  activity,
  transactionsPerSecond = 0,
}: NetworkActivityPulseProps) {
  const [pulseCount, setPulseCount] = useState(0)

  useEffect(() => {
    const interval = setInterval(() => {
      setPulseCount((prev) => prev + 1)
    }, 1000)

    return () => clearInterval(interval)
  }, [])

  const activityConfig = {
    high: {
      color: 'bg-success-500',
      pulseColor: 'bg-success-400',
      text: 'High Activity',
      speed: 0.5,
    },
    medium: {
      color: 'bg-warning-500',
      pulseColor: 'bg-warning-400',
      text: 'Medium Activity',
      speed: 1,
    },
    low: {
      color: 'bg-neutral-500',
      pulseColor: 'bg-neutral-400',
      text: 'Low Activity',
      speed: 2,
    },
  }

  const config = activityConfig[activity]

  return (
    <div className="flex items-center gap-4">
      {/* Pulse Indicator */}
      <div className="relative">
        {/* Outer Pulse */}
        <motion.div
          key={pulseCount}
          initial={{ scale: 1, opacity: 0.8 }}
          animate={{ scale: 2, opacity: 0 }}
          transition={{
            duration: config.speed,
            repeat: Infinity,
            ease: 'easeOut',
          }}
          className={`absolute inset-0 rounded-full ${config.pulseColor}`}
        />

        {/* Inner Circle */}
        <div className={`relative w-4 h-4 rounded-full ${config.color} shadow-lg`}>
          <motion.div
            animate={{ scale: [1, 1.2, 1] }}
            transition={{
              duration: config.speed,
              repeat: Infinity,
              ease: 'easeInOut',
            }}
            className={`absolute inset-0 rounded-full ${config.color}`}
          />
        </div>
      </div>

      {/* Activity Info */}
      <div>
        <div className="text-white font-medium text-sm">{config.text}</div>
        {transactionsPerSecond > 0 && (
          <div className="text-neutral-400 text-xs">
            {transactionsPerSecond.toFixed(1)} tx/s
          </div>
        )}
      </div>
    </div>
  )
}


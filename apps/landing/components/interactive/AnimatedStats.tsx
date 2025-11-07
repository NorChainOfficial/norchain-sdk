'use client'

import { motion, useMotionValue, useSpring, useTransform } from 'framer-motion'
import { useEffect, useState } from 'react'

interface AnimatedStatProps {
  label: string
  value: number | string
  suffix?: string
  prefix?: string
  duration?: number
  format?: 'number' | 'currency' | 'percentage'
}

/**
 * Animated Stat Counter
 * Smoothly animates numbers when value changes
 */
export function AnimatedStat({
  label,
  value,
  suffix = '',
  prefix = '',
  duration = 1,
  format = 'number',
}: AnimatedStatProps) {
  const [displayValue, setDisplayValue] = useState(value)
  const motionValue = useMotionValue(0)
  const springValue = useSpring(motionValue, {
    damping: 30,
    stiffness: 100,
  })

  useEffect(() => {
    const numValue = typeof value === 'string' ? parseFloat(value) : value
    motionValue.set(numValue)
    
    const unsubscribe = springValue.on('change', (latest) => {
      if (format === 'number') {
        setDisplayValue(Math.floor(latest))
      } else if (format === 'currency') {
        setDisplayValue(latest.toFixed(2))
      } else if (format === 'percentage') {
        setDisplayValue(latest.toFixed(2))
      }
    })

    return () => unsubscribe()
  }, [value, motionValue, springValue, format])

  const formattedValue = format === 'number' 
    ? new Intl.NumberFormat('en-US').format(displayValue as number)
    : displayValue

  return (
    <motion.div
      initial={{ opacity: 0, y: 20 }}
      whileInView={{ opacity: 1, y: 0 }}
      viewport={{ once: true }}
      transition={{ duration: 0.5 }}
      className="text-center"
    >
      <div className="text-4xl md:text-5xl font-bold bg-gradient-to-r from-primary-400 to-shariah-400 bg-clip-text text-transparent mb-2">
        {prefix}{formattedValue}{suffix}
      </div>
      <div className="text-neutral-400 text-sm md:text-base">{label}</div>
    </motion.div>
  )
}

interface AnimatedStatsGridProps {
  stats: Array<{
    label: string
    value: number | string
    suffix?: string
    prefix?: string
    format?: 'number' | 'currency' | 'percentage'
  }>
}

/**
 * Animated Stats Grid
 * Grid of animated statistics
 */
export function AnimatedStatsGrid({ stats }: AnimatedStatsGridProps) {
  return (
    <div className="grid grid-cols-2 md:grid-cols-4 gap-6 md:gap-8">
      {stats.map((stat, index) => (
        <motion.div
          key={stat.label}
          initial={{ opacity: 0, y: 20 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true }}
          transition={{ duration: 0.5, delay: index * 0.1 }}
        >
          <AnimatedStat {...stat} />
        </motion.div>
      ))}
    </div>
  )
}


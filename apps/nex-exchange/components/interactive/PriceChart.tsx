'use client'

import { motion } from 'framer-motion'
import { useState, useEffect } from 'react'

interface PriceData {
  timestamp: number
  price: number
}

interface PriceChartProps {
  symbol: string
  data: PriceData[]
  height?: number
}

/**
 * Interactive Price Chart
 * Animated price chart with hover interactions
 */
export function PriceChart({
  symbol,
  data,
  height = 300,
}: PriceChartProps) {
  const [hoveredPoint, setHoveredPoint] = useState<number | null>(null)
  const [selectedRange, setSelectedRange] = useState<'1h' | '24h' | '7d' | '30d'>('24h')

  // Calculate chart dimensions
  const maxPrice = Math.max(...data.map(d => d.price))
  const minPrice = Math.min(...data.map(d => d.price))
  const priceRange = maxPrice - minPrice

  // Generate path for line
  const getPath = () => {
    if (data.length === 0) return ''
    
    const width = 800 // Chart width
    const stepX = width / (data.length - 1)
    
    return data.map((point, index) => {
      const x = index * stepX
      const y = height - ((point.price - minPrice) / priceRange) * height
      return `${index === 0 ? 'M' : 'L'} ${x} ${y}`
    }).join(' ')
  }

  const currentPrice = data[data.length - 1]?.price || 0
  const priceChange = data.length > 1 
    ? ((currentPrice - data[0].price) / data[0].price) * 100 
    : 0

  return (
    <div className="w-full bg-neutral-900/50 rounded-xl p-6 border border-neutral-800">
      {/* Header */}
      <div className="flex items-center justify-between mb-6">
        <div>
          <h3 className="text-xl font-bold text-white mb-1">{symbol} Price</h3>
          <div className="flex items-center gap-4">
            <span className="text-2xl font-bold text-white">
              ${currentPrice.toFixed(4)}
            </span>
            <span className={`text-sm font-medium ${priceChange >= 0 ? 'text-success-500' : 'text-error-500'}`}>
              {priceChange >= 0 ? '+' : ''}{priceChange.toFixed(2)}%
            </span>
          </div>
        </div>

        {/* Time Range Selector */}
        <div className="flex gap-2">
          {(['1h', '24h', '7d', '30d'] as const).map((range) => (
            <button
              key={range}
              onClick={() => setSelectedRange(range)}
              className={`px-3 py-1 rounded-lg text-sm font-medium transition-colors
                ${selectedRange === range
                  ? 'bg-primary-500 text-white'
                  : 'bg-neutral-800 text-neutral-400 hover:text-white'
                }`}
            >
              {range}
            </button>
          ))}
        </div>
      </div>

      {/* Chart */}
      <div className="relative" style={{ height }}>
        <svg
          width="100%"
          height={height}
          className="overflow-visible"
          viewBox={`0 0 800 ${height}`}
          preserveAspectRatio="none"
        >
          {/* Gradient Definition */}
          <defs>
            <linearGradient id="priceGradient" x1="0%" y1="0%" x2="0%" y2="100%">
              <stop offset="0%" stopColor="#22c55e" stopOpacity="0.3" />
              <stop offset="100%" stopColor="#22c55e" stopOpacity="0" />
            </linearGradient>
          </defs>

          {/* Area Fill */}
          <motion.path
            d={`${getPath()} L 800 ${height} L 0 ${height} Z`}
            fill="url(#priceGradient)"
            initial={{ pathLength: 0 }}
            animate={{ pathLength: 1 }}
            transition={{ duration: 1, ease: 'easeInOut' }}
          />

          {/* Price Line */}
          <motion.path
            d={getPath()}
            fill="none"
            stroke="#22c55e"
            strokeWidth="2"
            strokeLinecap="round"
            strokeLinejoin="round"
            initial={{ pathLength: 0 }}
            animate={{ pathLength: 1 }}
            transition={{ duration: 1, ease: 'easeInOut' }}
          />

          {/* Hover Indicator */}
          {hoveredPoint !== null && data[hoveredPoint] && (
            <g>
              <circle
                cx={(hoveredPoint / (data.length - 1)) * 800}
                cy={height - ((data[hoveredPoint].price - minPrice) / priceRange) * height}
                r="4"
                fill="#22c55e"
                className="drop-shadow-lg"
              />
              <line
                x1={(hoveredPoint / (data.length - 1)) * 800}
                y1="0"
                x2={(hoveredPoint / (data.length - 1)) * 800}
                y2={height}
                stroke="#22c55e"
                strokeWidth="1"
                strokeDasharray="4 4"
                opacity="0.5"
              />
            </g>
          )}
        </svg>

        {/* Hover Tooltip */}
        {hoveredPoint !== null && data[hoveredPoint] && (
          <motion.div
            initial={{ opacity: 0, y: 10 }}
            animate={{ opacity: 1, y: 0 }}
            className="absolute bg-neutral-800 text-white text-sm rounded-lg px-3 py-2 shadow-xl
              border border-neutral-700 pointer-events-none z-10"
            style={{
              left: `${(hoveredPoint / (data.length - 1)) * 100}%`,
              top: `${height - ((data[hoveredPoint].price - minPrice) / priceRange) * height - 40}px`,
              transform: 'translateX(-50%)',
            }}
          >
            <div className="font-semibold">${data[hoveredPoint].price.toFixed(4)}</div>
            <div className="text-neutral-400 text-xs mt-1">
              {new Date(data[hoveredPoint].timestamp).toLocaleTimeString()}
            </div>
          </motion.div>
        )}
      </div>

      {/* Chart Interaction Area */}
      <div
        className="absolute inset-0 cursor-crosshair"
        onMouseMove={(e) => {
          const rect = e.currentTarget.getBoundingClientRect()
          const x = e.clientX - rect.left
          const pointIndex = Math.round((x / rect.width) * (data.length - 1))
          setHoveredPoint(Math.max(0, Math.min(data.length - 1, pointIndex)))
        }}
        onMouseLeave={() => setHoveredPoint(null)}
      />
    </div>
  )
}


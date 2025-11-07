'use client'

import { useState, useEffect } from 'react'
import { motion, AnimatePresence } from 'framer-motion'

interface Block {
  height: number
  hash: string
  timestamp: number
  transactions: number
  validator: string
}

interface InteractiveBlockVisualizationProps {
  blocks: Block[]
  onBlockClick?: (block: Block) => void
}

/**
 * Interactive Block Visualization
 * Animated, interactive visualization of blockchain blocks
 */
export function InteractiveBlockVisualization({
  blocks,
  onBlockClick,
}: InteractiveBlockVisualizationProps) {
  const [selectedBlock, setSelectedBlock] = useState<Block | null>(null)
  const [hoveredBlock, setHoveredBlock] = useState<number | null>(null)

  const handleBlockClick = (block: Block) => {
    setSelectedBlock(block)
    onBlockClick?.(block)
  }

  return (
    <div className="w-full">
      {/* Block Chain Visualization */}
      <div className="flex items-center gap-2 overflow-x-auto pb-4">
        <AnimatePresence mode="popLayout">
          {blocks.map((block, index) => (
            <motion.div
              key={block.height}
              initial={{ opacity: 0, scale: 0.8, x: -20 }}
              animate={{ opacity: 1, scale: 1, x: 0 }}
              exit={{ opacity: 0, scale: 0.8 }}
              transition={{ duration: 0.3, delay: index * 0.05 }}
              className="relative"
            >
              {/* Connection Line */}
              {index > 0 && (
                <motion.div
                  className="absolute -left-4 top-1/2 h-0.5 w-8 bg-gradient-to-r from-primary-500 to-shariah-500"
                  initial={{ scaleX: 0 }}
                  animate={{ scaleX: 1 }}
                  transition={{ delay: index * 0.05 + 0.2 }}
                />
              )}

              {/* Block */}
              <motion.button
                onClick={() => handleBlockClick(block)}
                onHoverStart={() => setHoveredBlock(block.height)}
                onHoverEnd={() => setHoveredBlock(null)}
                className={`
                  relative flex flex-col items-center justify-center
                  w-20 h-20 rounded-xl
                  bg-gradient-to-br from-primary-600 to-shariah-600
                  shadow-lg cursor-pointer
                  transition-all duration-300
                  ${selectedBlock?.height === block.height ? 'ring-4 ring-primary-400 scale-110' : ''}
                  ${hoveredBlock === block.height ? 'scale-105 shadow-glow-primary' : ''}
                `}
                whileHover={{ y: -4 }}
                whileTap={{ scale: 0.95 }}
              >
                {/* Block Number */}
                <span className="text-white font-bold text-sm">
                  #{block.height}
                </span>

                {/* Transaction Count */}
                <span className="text-white/80 text-xs mt-1">
                  {block.transactions} tx
                </span>

                {/* Hover Tooltip */}
                {hoveredBlock === block.height && (
                  <motion.div
                    initial={{ opacity: 0, y: 10 }}
                    animate={{ opacity: 1, y: 0 }}
                    className="absolute -top-20 left-1/2 -translate-x-1/2
                      bg-neutral-900 text-white text-xs rounded-lg px-3 py-2
                      shadow-xl whitespace-nowrap z-10
                      border border-neutral-700"
                  >
                    <div className="font-semibold">Block #{block.height}</div>
                    <div className="text-neutral-400 mt-1">
                      {new Date(block.timestamp * 1000).toLocaleTimeString()}
                    </div>
                    <div className="absolute bottom-0 left-1/2 -translate-x-1/2 translate-y-full">
                      <div className="border-4 border-transparent border-t-neutral-900" />
                    </div>
                  </motion.div>
                )}
              </motion.button>
            </motion.div>
          ))}
        </AnimatePresence>
      </div>

      {/* Selected Block Details */}
      <AnimatePresence>
        {selectedBlock && (
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: 20 }}
            className="mt-6 p-6 bg-neutral-900/50 rounded-xl border border-neutral-800"
          >
            <div className="flex items-start justify-between mb-4">
              <h3 className="text-xl font-bold text-white">
                Block #{selectedBlock.height}
              </h3>
              <button
                onClick={() => setSelectedBlock(null)}
                className="text-neutral-400 hover:text-white transition-colors"
              >
                ✕
              </button>
            </div>

            <div className="grid grid-cols-2 gap-4">
              <div>
                <div className="text-neutral-400 text-sm mb-1">Hash</div>
                <div className="text-white font-mono text-sm break-all">
                  {selectedBlock.hash}
                </div>
              </div>
              <div>
                <div className="text-neutral-400 text-sm mb-1">Validator</div>
                <div className="text-white font-mono text-sm">
                  {selectedBlock.validator.slice(0, 20)}...
                </div>
              </div>
              <div>
                <div className="text-neutral-400 text-sm mb-1">Transactions</div>
                <div className="text-white font-semibold">
                  {selectedBlock.transactions}
                </div>
              </div>
              <div>
                <div className="text-neutral-400 text-sm mb-1">Timestamp</div>
                <div className="text-white">
                  {new Date(selectedBlock.timestamp * 1000).toLocaleString()}
                </div>
              </div>
            </div>
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  )
}


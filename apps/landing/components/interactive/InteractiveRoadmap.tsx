'use client'

import { motion } from 'framer-motion'
import { useState } from 'react'

interface RoadmapItem {
  quarter: string
  title: string
  description: string
  status: 'completed' | 'in-progress' | 'planned'
  features: string[]
}

interface InteractiveRoadmapProps {
  items: RoadmapItem[]
}

/**
 * Interactive Roadmap
 * Visual roadmap with expandable items
 */
export function InteractiveRoadmap({ items }: InteractiveRoadmapProps) {
  const [expandedItem, setExpandedItem] = useState<number | null>(null)

  const statusColors = {
    completed: 'bg-success-500',
    'in-progress': 'bg-warning-500',
    planned: 'bg-neutral-500',
  }

  const statusLabels = {
    completed: 'Completed',
    'in-progress': 'In Progress',
    planned: 'Planned',
  }

  return (
    <div className="space-y-6">
      {items.map((item, index) => (
        <motion.div
          key={index}
          initial={{ opacity: 0, x: -20 }}
          whileInView={{ opacity: 1, x: 0 }}
          viewport={{ once: true }}
          transition={{ duration: 0.5, delay: index * 0.1 }}
          className="relative"
        >
          {/* Timeline Line */}
          {index < items.length - 1 && (
            <div className="absolute left-6 top-16 bottom-0 w-0.5 bg-gradient-to-b from-primary-500 to-shariah-500" />
          )}

          {/* Roadmap Item */}
          <div className="relative flex gap-6">
            {/* Status Indicator */}
            <div className="relative z-10">
              <motion.div
                className={`w-12 h-12 rounded-full ${statusColors[item.status]} 
                  flex items-center justify-center text-white font-bold shadow-lg
                  border-4 border-neutral-900`}
                whileHover={{ scale: 1.1 }}
                whileTap={{ scale: 0.95 }}
              >
                {item.status === 'completed' ? '✓' : index + 1}
              </motion.div>
            </div>

            {/* Content */}
            <motion.div
              className="flex-1 bg-neutral-900/50 rounded-xl p-6 border border-neutral-800
                cursor-pointer hover:border-primary-500 transition-colors"
              onClick={() => setExpandedItem(expandedItem === index ? null : index)}
              whileHover={{ x: 4 }}
            >
              <div className="flex items-start justify-between mb-2">
                <div>
                  <div className="text-primary-400 text-sm font-medium mb-1">
                    {item.quarter}
                  </div>
                  <h3 className="text-xl font-bold text-white mb-2">
                    {item.title}
                  </h3>
                </div>
                <span className={`px-3 py-1 rounded-full text-xs font-medium text-white ${statusColors[item.status]}`}>
                  {statusLabels[item.status]}
                </span>
              </div>

              <p className="text-neutral-400 mb-4">{item.description}</p>

              {/* Expandable Features */}
              <motion.div
                initial={false}
                animate={{
                  height: expandedItem === index ? 'auto' : 0,
                  opacity: expandedItem === index ? 1 : 0,
                }}
                transition={{ duration: 0.3 }}
                className="overflow-hidden"
              >
                <div className="pt-4 border-t border-neutral-800">
                  <div className="text-neutral-400 text-sm mb-2">Features:</div>
                  <ul className="space-y-2">
                    {item.features.map((feature, featureIndex) => (
                      <li key={featureIndex} className="flex items-start gap-2 text-neutral-300">
                        <span className="text-shariah-500 mt-1">•</span>
                        <span>{feature}</span>
                      </li>
                    ))}
                  </ul>
                </div>
              </motion.div>
            </motion.div>
          </div>
        </motion.div>
      ))}
    </div>
  )
}


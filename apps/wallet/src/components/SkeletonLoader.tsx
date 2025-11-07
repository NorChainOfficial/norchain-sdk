/**
 * Professional Skeleton Loader Component
 * Shimmer effect and smooth animations
 */

'use client';

import React from 'react';
import { motion } from 'framer-motion';

interface SkeletonLoaderProps {
  variant?: 'balance' | 'asset' | 'button' | 'text';
  className?: string;
}

export const SkeletonLoader: React.FC<SkeletonLoaderProps> = ({
  variant = 'asset',
  className = '',
}) => {
  if (variant === 'balance') {
    return (
      <div className={`glass-card-balance p-6 ${className}`}>
        <div className="flex items-start justify-between mb-6">
          <div className="flex-1">
            <div className="h-4 w-24 bg-white/10 rounded mb-3 shimmer" />
            <div className="h-10 w-48 bg-white/10 rounded mb-3 shimmer" />
            <div className="h-6 w-20 bg-white/10 rounded shimmer" />
          </div>
        </div>
        <div className="grid grid-cols-4 gap-3">
          {[1, 2, 3, 4].map((i) => (
            <div key={i} className="flex flex-col items-center gap-2">
              <div className="w-14 h-14 bg-white/10 rounded-full shimmer" />
              <div className="h-3 w-12 bg-white/10 rounded shimmer" />
            </div>
          ))}
        </div>
      </div>
    );
  }

  if (variant === 'asset') {
    return (
      <motion.div
        className={`glass-card-enhanced p-4 ${className}`}
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.3 }}
      >
        <div className="flex items-center gap-4">
          <div className="w-13 h-13 bg-white/10 rounded-full shimmer" />
          <div className="flex-1 space-y-2">
            <div className="h-4 bg-white/10 rounded w-24 shimmer" />
            <div className="h-3 bg-white/10 rounded w-16 shimmer" />
          </div>
          <div className="space-y-2">
            <div className="h-4 bg-white/10 rounded w-20 shimmer" />
            <div className="h-3 bg-white/10 rounded w-12 shimmer" />
          </div>
        </div>
      </motion.div>
    );
  }

  if (variant === 'button') {
    return (
      <div className={`h-10 bg-white/10 rounded-lg shimmer ${className}`} />
    );
  }

  return (
    <div className={`h-4 bg-white/10 rounded shimmer ${className}`} />
  );
};

/**
 * Shimmer effect CSS is added via globals.css
 */


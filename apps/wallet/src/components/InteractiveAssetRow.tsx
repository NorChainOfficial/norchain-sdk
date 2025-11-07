/**
 * Enhanced Interactive Asset Row Component
 * Professional animations and expandable charts
 */

'use client';

import React, { useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { TokenIcon } from './TokenIcon';

interface Asset {
  id: string;
  symbol: string;
  name: string;
  balance: string;
  usdValue: string;
  change24h: string;
  changePositive?: boolean;
  chartData?: number[];
}

interface InteractiveAssetRowProps {
  asset: Asset;
  onClick?: () => void;
  index?: number;
}

export const InteractiveAssetRow: React.FC<InteractiveAssetRowProps> = ({
  asset,
  onClick,
  index = 0,
}) => {
  const [isSelected, setIsSelected] = useState(false);
  const [isHovered, setIsHovered] = useState(false);

  const handleClick = () => {
    setIsSelected(!isSelected);
    onClick?.();
  };

  const changeColor = asset.changePositive !== false
    ? 'text-success'
    : 'text-error';

  return (
    <motion.div
      className="glass-card-enhanced overflow-hidden cursor-pointer relative"
      onClick={handleClick}
      onMouseEnter={() => setIsHovered(true)}
      onMouseLeave={() => setIsHovered(false)}
      initial={{ opacity: 0, y: 20 }}
      animate={{
        opacity: 1,
        y: 0,
      }}
      transition={{
        delay: index * 0.05,
        duration: 0.4,
        type: 'spring',
        stiffness: 300,
        damping: 25,
      }}
      whileHover={{
        y: -1,
      }}
    >

      <div className="p-4 relative z-10">
        <motion.div
          className="flex items-center gap-4"
          animate={{
            paddingBottom: isSelected ? '0' : '0',
          }}
        >
          {/* Token Icon - Professional */}
          <div className="relative">
            <TokenIcon symbol={asset.symbol} size={40} />
          </div>

          {/* Token Info */}
          <div className="flex-1 min-w-0">
            <h3 className="text-base font-medium text-primary truncate mb-1">
              {asset.name}
            </h3>
            <div className="flex items-center gap-2">
              <span className="text-sm text-secondary truncate">
                {asset.balance}
              </span>
              <span className="text-xs text-muted">
                {asset.symbol}
              </span>
            </div>
          </div>

          {/* Mini Chart (when not selected) */}
          <AnimatePresence mode="wait">
            {!isSelected && asset.chartData && (
              <motion.div
                key="mini-chart"
                className="w-[60px] h-[30px] flex items-end justify-center"
                initial={{ opacity: 0, scale: 0.8 }}
                animate={{ opacity: 1, scale: 1 }}
                exit={{ opacity: 0, scale: 0.8 }}
                transition={{ duration: 0.3 }}
              >
                <svg
                  className="w-full h-full"
                  viewBox="0 0 60 30"
                  preserveAspectRatio="none"
                >
                  <motion.path
                    d={generateSparklinePath(asset.chartData, 60, 30)}
                    fill="none"
                    stroke={asset.changePositive !== false ? '#10B981' : '#EF4444'}
                    strokeWidth="1.5"
                    strokeLinecap="round"
                    strokeLinejoin="round"
                    initial={{ pathLength: 0 }}
                    animate={{ pathLength: 1 }}
                    transition={{ duration: 1, ease: 'easeInOut' }}
                  />
                </svg>
              </motion.div>
            )}
          </AnimatePresence>

          {/* Value and Change */}
          <div className="text-right min-w-[100px]">
            <p className="text-base font-medium text-primary truncate mb-1">
              {asset.usdValue}
            </p>
            <div className={`flex items-center justify-end gap-1 ${changeColor}`}>
              <svg className="w-3 h-3" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d={asset.changePositive !== false ? 'M5 10l7-7m0 0l7 7m-7-7v18' : 'M19 14l-7 7m0 0l-7-7m7 7V3'} />
              </svg>
              <span className="text-xs font-medium">{asset.change24h}</span>
            </div>
          </div>
        </motion.div>
      </div>

      {/* Expanded Chart View */}
      <AnimatePresence>
        {isSelected && asset.chartData && (
          <motion.div
            className="border-t relative z-10"
            style={{ borderColor: 'var(--border-primary)' }}
            initial={{ height: 0, opacity: 0 }}
            animate={{ height: 'auto', opacity: 1 }}
            exit={{ height: 0, opacity: 0 }}
            transition={{
              duration: 0.3,
              ease: [0.16, 1, 0.3, 1],
            }}
          >
            <motion.div
              className="px-4 pb-4 pt-4"
              initial={{ y: -10 }}
              animate={{ y: 0 }}
              exit={{ y: -10 }}
              transition={{ duration: 0.2 }}
            >
              <div className="flex items-center justify-between mb-3">
                <span className="text-xs font-medium text-text-tertiary uppercase tracking-wide">24h Chart</span>
                <div className="flex gap-2">
                  <button
                    className="px-2.5 py-1 text-xs font-medium rounded border transition-colors"
                    style={{
                      color: 'var(--primary)',
                      backgroundColor: 'var(--surface-elevated)',
                      borderColor: 'var(--border-primary)',
                    }}
                    onMouseEnter={(e) => {
                      e.currentTarget.style.backgroundColor = 'var(--surface-hover)';
                    }}
                    onMouseLeave={(e) => {
                      e.currentTarget.style.backgroundColor = 'var(--surface-elevated)';
                    }}
                  >
                    1D
                  </button>
                  <button
                    className="px-2.5 py-1 text-xs font-medium text-text-tertiary hover:text-text-secondary transition-colors"
                  >
                    1W
                  </button>
                  <button
                    className="px-2.5 py-1 text-xs font-medium text-text-tertiary hover:text-text-secondary transition-colors"
                  >
                    1M
                  </button>
                </div>
              </div>
              
              <motion.div
                className="h-[120px] relative"
                initial={{ opacity: 0 }}
                animate={{ opacity: 1 }}
                transition={{ delay: 0.2 }}
              >
                <svg
                  className="w-full h-full"
                  viewBox="0 0 200 120"
                  preserveAspectRatio="none"
                >
                  {/* Gradient Fill */}
                  <defs>
                    <linearGradient id={`gradient-${asset.id}`} x1="0%" y1="0%" x2="0%" y2="100%">
                      <stop
                        offset="0%"
                        stopColor={asset.changePositive !== false ? '#10B981' : '#EF4444'}
                        stopOpacity="0.3"
                      />
                      <stop
                        offset="100%"
                        stopColor={asset.changePositive !== false ? '#10B981' : '#EF4444'}
                        stopOpacity="0.05"
                      />
                    </linearGradient>
                  </defs>
                  
                  {/* Animated Area */}
                  <motion.path
                    d={`${generateAreaPath(asset.chartData, 200, 120)} L 200 120 L 0 120 Z`}
                    fill={`url(#gradient-${asset.id})`}
                    initial={{ pathLength: 0, opacity: 0 }}
                    animate={{ pathLength: 1, opacity: 1 }}
                    transition={{ duration: 1, ease: 'easeInOut' }}
                  />
                  
                  {/* Animated Line */}
                  <motion.path
                    d={generateSparklinePath(asset.chartData, 200, 120)}
                    fill="none"
                    stroke={asset.changePositive !== false ? '#10B981' : '#EF4444'}
                    strokeWidth="2"
                    strokeLinecap="round"
                    strokeLinejoin="round"
                    initial={{ pathLength: 0 }}
                    animate={{ pathLength: 1 }}
                    transition={{ duration: 1.5, ease: 'easeInOut', delay: 0.2 }}
                  />
                </svg>
              </motion.div>
            </motion.div>
          </motion.div>
        )}
      </AnimatePresence>
    </motion.div>
  );
};

// Helper functions for chart generation
function generateSparklinePath(data: number[], width: number, height: number): string {
  if (!data || data.length === 0) return '';
  
  const max = Math.max(...data);
  const min = Math.min(...data);
  const range = max - min || 1;
  
  const stepX = width / (data.length - 1);
  
  let path = '';
  data.forEach((value, index) => {
    const x = index * stepX;
    const normalized = (value - min) / range;
    const y = height * (1 - normalized);
    
    if (index === 0) {
      path += `M ${x} ${y}`;
    } else {
      path += ` L ${x} ${y}`;
    }
  });
  
  return path;
}

function generateAreaPath(data: number[], width: number, height: number): string {
  if (!data || data.length === 0) return '';
  
  const max = Math.max(...data);
  const min = Math.min(...data);
  const range = max - min || 1;
  
  const stepX = width / (data.length - 1);
  
  let path = `M 0 ${height}`;
  data.forEach((value, index) => {
    const x = index * stepX;
    const normalized = (value - min) / range;
    const y = height * (1 - normalized);
    path += ` L ${x} ${y}`;
  });
  
  return path;
}

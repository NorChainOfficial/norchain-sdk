/**
 * Professional Balance Card Component
 * Modern, clean design with dark/light theme support
 */

'use client';

import React, { useState, useEffect } from 'react';
import { useRouter } from 'next/navigation';
import { motion } from 'framer-motion';

interface BalanceCardProps {
  balance: string;
  isLoading?: boolean;
  change?: string;
  changePositive?: boolean;
}

export const BalanceCard: React.FC<BalanceCardProps> = ({
  balance,
  isLoading = false,
  change,
  changePositive = true,
}) => {
  const router = useRouter();
  const [showBalance, setShowBalance] = useState(true);
  const [displayBalance, setDisplayBalance] = useState(balance);

  // Animated counter
  useEffect(() => {
    if (!isLoading && balance) {
      const numericValue = parseFloat(balance.replace(/[^0-9.]/g, ''));
      if (!isNaN(numericValue)) {
        const duration = 1200;
        const steps = 40;
        const stepValue = numericValue / steps;
        let current = 0;
        const interval = setInterval(() => {
          current += stepValue;
          if (current >= numericValue) {
            setDisplayBalance(balance);
            clearInterval(interval);
          } else {
            const formatted = balance.includes('$')
              ? `$${current.toFixed(2)}`
              : `${current.toFixed(4)} ETH`;
            setDisplayBalance(formatted);
          }
        }, duration / steps);
        return () => clearInterval(interval);
      }
    }
  }, [balance, isLoading]);

  return (
    <div className="relative">
      <div className="glass-card-balance p-8">
        <div className="flex items-start justify-between mb-8">
          <div className="flex-1">
            <p className="text-sm text-tertiary mb-3 uppercase tracking-wider font-medium">Total Balance</p>
            
            <div className="flex items-center gap-3 mb-4">
              {isLoading ? (
                <div className="w-10 h-10 border-2 border-border-primary border-t-accent rounded-full animate-spin" />
              ) : (
                <>
                  <h2 className="text-5xl font-semibold text-primary tracking-tight">
                    {showBalance ? displayBalance : '••••••'}
                  </h2>
                  
                  <button
                    onClick={() => setShowBalance(!showBalance)}
                    className="p-2 rounded-lg hover:bg-surface-hover transition-colors"
                  >
                    <svg className="w-5 h-5 text-tertiary" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      {showBalance ? (
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 12a3 3 0 11-6 0 3 3 0 016 0z" />
                      ) : (
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M13.875 18.825A10.05 10.05 0 0112 19c-4.478 0-8.268-2.943-9.543-7a9.97 9.97 0 011.563-3.029m5.858.908a3 3 0 114.243 4.243M9.878 9.878l4.242 4.242M9.88 9.88l-3.29-3.29m7.532 7.532l3.29 3.29M3 3l3.29 3.29m0 0L9.88 9.88M3 3h3.29M3 3v3.29m0 0l3.29 3.29" />
                      )}
                    </svg>
                  </button>
                </>
              )}
            </div>
            
            {change && (
              <div className={`inline-flex items-center gap-1.5 px-3 py-1.5 rounded-lg ${
                changePositive ? 'bg-success-bg text-success' : 'bg-error-bg text-error'
              }`}>
                <svg className="w-3.5 h-3.5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2.5} d={changePositive ? "M5 10l7-7m0 0l7 7m-7-7v18" : "M19 14l-7 7m0 0l-7-7m7 7V3"} />
                </svg>
                <span className="text-xs font-semibold">{change}</span>
              </div>
            )}
          </div>
        </div>

        {/* Quick Actions */}
        <div className="grid grid-cols-4 gap-4">
          <GlassActionButton
            icon="arrow-up"
            title="Send"
            color="#EF4444"
            onClick={() => router.push('/send')}
            delay={0}
          />
          <GlassActionButton
            icon="arrow-down"
            title="Receive"
            color="#10B981"
            onClick={() => router.push('/receive')}
            delay={0.05}
          />
          <GlassActionButton
            icon="arrow-left-right"
            title="Swap"
            color="#6366F1"
            onClick={() => {}}
            delay={0.1}
          />
          <GlassActionButton
            icon="trending-up"
            title="Stake"
            color="#3B82F6"
            onClick={() => {}}
            delay={0.15}
          />
        </div>
      </div>
    </div>
  );
};

/**
 * Professional Action Button
 */
interface GlassActionButtonProps {
  icon: string;
  title: string;
  color: string;
  onClick: () => void;
  delay?: number;
}

const GlassActionButton: React.FC<GlassActionButtonProps> = ({
  icon,
  title,
  color,
  onClick,
  delay = 0,
}) => {
  const iconMap: { [key: string]: string } = {
    'arrow-up': 'M5 10l7-7m0 0l7 7m-7-7v18',
    'arrow-down': 'M19 14l-7 7m0 0l-7-7m7 7V3',
    'arrow-left-right': 'M8 7h12m0 0l-4-4m4 4l-4 4m0 6H4m0 0l4 4m-4-4l4-4',
    'trending-up': 'M13 7h8m0 0v8m0-8l-8 8-4-4-6 6',
  };

  return (
    <button
      onClick={onClick}
      className="flex flex-col items-center gap-2.5 group"
    >
      <div className="w-14 h-14 rounded-xl flex items-center justify-center bg-surface-hover border border-border-primary group-hover:border-accent transition-all">
        <svg className="w-6 h-6" fill="none" stroke={color} viewBox="0 0 24 24">
          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d={iconMap[icon] || iconMap['arrow-up']} />
        </svg>
      </div>
      <span className="text-xs font-medium text-secondary group-hover:text-primary transition-colors">
        {title}
      </span>
    </button>
  );
};

/**
 * Utility Functions
 * Helper functions for the design system
 */

import { clsx, type ClassValue } from 'clsx'
import { twMerge } from 'tailwind-merge'

/**
 * Merge Tailwind CSS classes
 */
export function cn(...inputs: ClassValue[]) {
  return twMerge(clsx(inputs))
}

/**
 * Format currency
 */
export function formatCurrency(
  value: number | string,
  currency: string = 'NOR',
  decimals: number = 4
): string {
  const numValue = typeof value === 'string' ? parseFloat(value) : value
  return new Intl.NumberFormat('en-US', {
    style: 'currency',
    currency,
    minimumFractionDigits: decimals,
    maximumFractionDigits: decimals,
  }).format(numValue)
}

/**
 * Format address (truncate middle)
 */
export function formatAddress(
  address: string,
  startLength: number = 6,
  endLength: number = 4
): string {
  if (address.length <= startLength + endLength) {
    return address
  }
  return `${address.slice(0, startLength)}...${address.slice(-endLength)}`
}

/**
 * Format number with commas
 */
export function formatNumber(value: number | string): string {
  const numValue = typeof value === 'string' ? parseFloat(value) : value
  return new Intl.NumberFormat('en-US').format(numValue)
}

/**
 * Format percentage
 */
export function formatPercentage(value: number, decimals: number = 2): string {
  return `${value.toFixed(decimals)}%`
}

/**
 * Format time ago
 */
export function formatTimeAgo(date: Date | string | number): string {
  const now = new Date()
  const then = new Date(date)
  const seconds = Math.floor((now.getTime() - then.getTime()) / 1000)

  if (seconds < 60) return 'just now'
  if (seconds < 3600) return `${Math.floor(seconds / 60)}m ago`
  if (seconds < 86400) return `${Math.floor(seconds / 3600)}h ago`
  if (seconds < 604800) return `${Math.floor(seconds / 86400)}d ago`
  
  return then.toLocaleDateString()
}

/**
 * Generate gradient class
 */
export function getGradientClass(type: 'primary' | 'shariah' | 'defi' = 'primary'): string {
  const gradients = {
    primary: 'bg-gradient-primary',
    shariah: 'bg-gradient-shariah',
    defi: 'bg-gradient-defi',
  }
  return gradients[type]
}

/**
 * Get color class
 */
export function getColorClass(
  color: 'primary' | 'shariah' | 'defi' | 'success' | 'warning' | 'error',
  shade: number | 'DEFAULT' = 500
): string {
  if (shade === 'DEFAULT') {
    return `text-${color}`
  }
  return `text-${color}-${shade}`
}


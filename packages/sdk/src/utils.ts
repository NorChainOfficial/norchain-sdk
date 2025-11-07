/**
 * Utility Functions
 */

/**
 * Format address (truncate middle)
 */
export function formatAddress(address: string, start: number = 6, end: number = 4): string {
  if (address.length <= start + end) return address
  return `${address.slice(0, start)}...${address.slice(-end)}`
}

/**
 * Format currency
 */
export function formatCurrency(value: string | number, decimals: number = 4): string {
  const num = typeof value === 'string' ? parseFloat(value) : value
  return num.toFixed(decimals)
}

/**
 * Validate address
 */
export function isValidAddress(address: string): boolean {
  return /^0x[a-fA-F0-9]{40}$/.test(address)
}

/**
 * Validate transaction hash
 */
export function isValidTxHash(hash: string): boolean {
  return /^0x[a-fA-F0-9]{64}$/.test(hash)
}


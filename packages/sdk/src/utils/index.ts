/**
 * Utility functions for working with NorChain
 */

/**
 * Convert Ether to Wei
 */
export function wei(amount: string | number): string {
  const amountStr = typeof amount === 'number' ? amount.toString() : amount;
  // Simple conversion - in production, use a library like ethers.js
  return (parseFloat(amountStr) * 1e18).toString();
}

/**
 * Convert Wei to Ether
 */
export function ether(amount: string): string {
  return (BigInt(amount) / BigInt(1e18)).toString();
}

/**
 * Generate idempotency key
 */
export function generateIdempotencyKey(): string {
  return `${Date.now()}-${Math.random().toString(36).substring(7)}`;
}


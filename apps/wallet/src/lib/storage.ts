/**
 * Storage utilities for Web app
 * Uses localStorage for wallet persistence
 */

const WALLET_STORAGE_KEY = 'nor_wallet';
const WALLET_ENCRYPTED_KEY = 'nor_wallet_encrypted';

/**
 * Save wallet to localStorage (encrypted)
 */
export function saveWallet(wallet: any, password?: string): void {
  try {
    if (password) {
      // TODO: Encrypt wallet with password before storing
      // For now, store encrypted flag
      localStorage.setItem(WALLET_ENCRYPTED_KEY, 'true');
      // Store encrypted wallet data
      localStorage.setItem(WALLET_STORAGE_KEY, JSON.stringify({
        encrypted: true,
        // TODO: Store encrypted data
      }));
    } else {
      // Store unencrypted (not recommended for production)
      localStorage.setItem(WALLET_STORAGE_KEY, JSON.stringify(wallet));
      localStorage.removeItem(WALLET_ENCRYPTED_KEY);
    }
  } catch (error) {
    console.error('Failed to save wallet:', error);
    throw new Error('Failed to save wallet to storage');
  }
}

/**
 * Load wallet from localStorage
 */
export function loadWallet(password?: string): any | null {
  try {
    const stored = localStorage.getItem(WALLET_STORAGE_KEY);
    if (!stored) return null;

    const wallet = JSON.parse(stored);

    if (wallet.encrypted && password) {
      // TODO: Decrypt wallet with password
      // For now, return null if encrypted
      return null;
    }

    return wallet;
  } catch (error) {
    console.error('Failed to load wallet:', error);
    return null;
  }
}

/**
 * Clear wallet from storage
 */
export function clearWallet(): void {
  localStorage.removeItem(WALLET_STORAGE_KEY);
  localStorage.removeItem(WALLET_ENCRYPTED_KEY);
}

/**
 * Check if wallet exists in storage
 */
export function hasStoredWallet(): boolean {
  return localStorage.getItem(WALLET_STORAGE_KEY) !== null;
}


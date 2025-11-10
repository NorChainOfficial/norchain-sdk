/**
 * Secure Key Manager
 * Handles private key encryption, storage, and retrieval
 * IMPORTANT: Private keys are encrypted before storage
 */

import { encryptPrivateKey, decryptPrivateKey, generateWalletFromMnemonic } from './crypto';
import { WalletService, WalletInfo } from './wallet-service';

export interface EncryptedKey {
  encrypted: string;
  salt: string;
  iv: string;
}

/**
 * Secure Key Manager
 * Manages private keys with encryption and password protection
 */
export class KeyManager {
  private static instance: KeyManager;
  private sessionKeys: Map<string, string> = new Map(); // Temporary in-memory storage
  private readonly SESSION_TIMEOUT = 5 * 60 * 1000; // 5 minutes

  private constructor() {
    // Clear expired session keys periodically
    setInterval(() => {
      this.cleanExpiredKeys();
    }, 60000); // Check every minute
  }

  static getInstance(): KeyManager {
    if (!KeyManager.instance) {
      KeyManager.instance = new KeyManager();
    }
    return KeyManager.instance;
  }

  /**
   * Get private key from mnemonic (derived on-demand)
   * This is the preferred method - keys are never stored
   */
  async getPrivateKeyFromMnemonic(
    mnemonic: string,
    accountIndex: number = 0
  ): Promise<string> {
    const walletData = generateWalletFromMnemonic(mnemonic, accountIndex);
    return walletData.privateKey;
  }

  /**
   * Store private key in session (temporary, encrypted)
   * Only for active signing sessions
   */
  async storePrivateKeyInSession(
    walletId: string,
    privateKey: string,
    password: string
  ): Promise<void> {
    // Encrypt with password
    const encrypted = await encryptPrivateKey(privateKey, password);
    
    // Store in memory (session storage)
    this.sessionKeys.set(walletId, encrypted);
    
    // Auto-expire after timeout
    setTimeout(() => {
      this.sessionKeys.delete(walletId);
    }, this.SESSION_TIMEOUT);
  }

  /**
   * Get private key from session (requires password)
   */
  async getPrivateKeyFromSession(
    walletId: string,
    password: string
  ): Promise<string | null> {
    const encrypted = this.sessionKeys.get(walletId);
    if (!encrypted) {
      return null;
    }

    try {
      return await decryptPrivateKey(encrypted, password);
    } catch (error) {
      return null;
    }
  }

  /**
   * Clear session key
   */
  clearSessionKey(walletId: string): void {
    this.sessionKeys.delete(walletId);
  }

  /**
   * Clear all session keys
   */
  clearAllSessions(): void {
    this.sessionKeys.clear();
  }

  /**
   * Clean expired keys (called periodically)
   */
  private cleanExpiredKeys(): void {
    // Keys are auto-expired via setTimeout, but we can add additional cleanup here
  }

  /**
   * Check if session key exists
   */
  hasSessionKey(walletId: string): boolean {
    return this.sessionKeys.has(walletId);
  }
}


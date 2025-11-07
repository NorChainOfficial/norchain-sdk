/**
 * Wallet Service for Web
 * Handles wallet operations (create, import, manage)
 * Mirrors iOS WalletViewModel functionality
 */

import { SupabaseService } from './supabase-service';
import { SupabaseConfig } from './supabase-config';
import {
  generateMnemonic,
  validateMnemonic,
  generateWalletFromMnemonic,
  generateWalletFromPrivateKey,
} from './crypto';
import { saveWallet, loadWallet, clearWallet as clearStorage } from './storage';

export interface WalletInfo {
  id: string;
  mnemonic: string;
  accounts: Account[];
}

export interface Account {
  id: string;
  address: string;
  chain: string;
  type: string;
}

export class WalletService {
  private static instance: WalletService;
  private supabaseService: SupabaseService;
  private currentWallet: WalletInfo | null = null;

  private constructor() {
    this.supabaseService = SupabaseService.getInstance();
    
    // Try to load wallet from storage on init
    try {
      const storedWallet = loadWallet();
      if (storedWallet) {
        this.currentWallet = storedWallet as WalletInfo;
      }
    } catch (error) {
      // Ignore storage errors
      console.warn('Failed to load wallet from storage:', error);
    }
  }

  static getInstance(): WalletService {
    if (!WalletService.instance) {
      WalletService.instance = new WalletService();
    }
    return WalletService.instance;
  }

  /**
   * Generate a new mnemonic phrase
   */
  async generateMnemonic(): Promise<string> {
    return generateMnemonic();
  }

  /**
   * Create a new wallet
   */
  async createWallet(): Promise<WalletInfo> {
    // Generate mnemonic
    const mnemonic = generateMnemonic();
    
    // Generate first account from mnemonic
    const accountData = generateWalletFromMnemonic(mnemonic, 0);
    
    const wallet: WalletInfo = {
      id: `wallet_${Date.now()}`,
      mnemonic,
      accounts: [
        {
          id: 'account_0',
          address: accountData.address,
          chain: 'xaheen',
          type: 'EOA',
        },
      ],
    };

    this.currentWallet = wallet;
    
    // Auto-sync to Supabase
    await this.syncWalletToSupabase(wallet);
    
    return wallet;
  }

  /**
   * Import wallet from mnemonic
   */
  async importWallet(mnemonic: string): Promise<WalletInfo> {
    const trimmedMnemonic = mnemonic.trim();
    
    if (!trimmedMnemonic || trimmedMnemonic.length === 0) {
      throw new Error('Invalid mnemonic phrase');
    }

    if (!validateMnemonic(trimmedMnemonic)) {
      throw new Error('Invalid mnemonic phrase. Please check your recovery phrase.');
    }

    // Generate account from mnemonic
    const accountData = generateWalletFromMnemonic(trimmedMnemonic, 0);

    const wallet: WalletInfo = {
      id: `wallet_${Date.now()}`,
      mnemonic: trimmedMnemonic,
      accounts: [
        {
          id: 'account_0',
          address: accountData.address,
          chain: 'xaheen',
          type: 'EOA',
        },
      ],
    };

    this.currentWallet = wallet;
    
    // Save to localStorage
    saveWallet(wallet);
    
    // Auto-sync to Supabase
    await this.syncWalletToSupabase(wallet);
    
    return wallet;
  }

  /**
   * Import wallet from private key
   */
  async importWalletFromPrivateKey(privateKey: string): Promise<WalletInfo> {
    const trimmedKey = privateKey.trim();
    
    if (!trimmedKey || trimmedKey.length === 0) {
      throw new Error('Invalid private key');
    }

    // Validate and generate wallet from private key
    try {
      const accountData = generateWalletFromPrivateKey(trimmedKey);

      const wallet: WalletInfo = {
        id: `wallet_${Date.now()}`,
        mnemonic: '', // Private key import doesn't have mnemonic
        accounts: [
          {
            id: 'account_0',
            address: accountData.address,
            chain: 'xaheen',
            type: 'EOA',
          },
        ],
      };

      this.currentWallet = wallet;
      
      // Save to localStorage
      saveWallet(wallet);
      
      // Auto-sync to Supabase
      await this.syncWalletToSupabase(wallet);
      
      return wallet;
    } catch (error: any) {
      throw new Error(`Failed to import wallet: ${error.message}`);
    }
  }

  /**
   * Sync wallet to Supabase
   */
  private async syncWalletToSupabase(wallet: WalletInfo): Promise<void> {
    const firstAccount = wallet.accounts[0];
    if (!firstAccount) {
      if (SupabaseConfig.enableDebugLogging) {
        console.warn('No accounts in wallet - skipping sync');
      }
      return;
    }

    // Check if authenticated
    if (!this.supabaseService.isAuthenticated) {
      if (SupabaseConfig.enableDebugLogging) {
        console.warn('Not authenticated - skipping Supabase sync');
      }
      return;
    }

    try {
      // Register device
      const deviceName = navigator.userAgent;
      await this.supabaseService.registerDevice(
        'web',
        deviceName,
        null // Web push token (TODO: implement)
      );

      if (SupabaseConfig.enableDebugLogging) {
        console.log('✅ Device registered with Supabase');
      }

      // Sync account
      await this.supabaseService.createAccount(
        firstAccount.chain,
        firstAccount.address,
        firstAccount.type,
        true
      );

      if (SupabaseConfig.enableDebugLogging) {
        console.log('✅ Account synced to Supabase');
      }
    } catch (error: any) {
      if (SupabaseConfig.enableDebugLogging) {
        console.warn('⚠️ Supabase sync failed:', error.message);
      }
      // Don't show error to user - sync is optional
    }
  }

  /**
   * Get current wallet
   */
  getCurrentWallet(): WalletInfo | null {
    return this.currentWallet;
  }

  /**
   * Create a demo/test wallet for testing
   * This is useful for development and testing without creating a real wallet
   */
  async createDemoWallet(): Promise<WalletInfo> {
    // Use a known test mnemonic for demo purposes
    const demoMnemonic = 'abandon abandon abandon abandon abandon abandon abandon abandon abandon abandon abandon about';
    
    // Generate account from demo mnemonic
    const accountData = generateWalletFromMnemonic(demoMnemonic, 0);

    const wallet: WalletInfo = {
      id: 'demo_wallet_001',
      mnemonic: demoMnemonic,
      accounts: [
        {
          id: 'account_0',
          address: accountData.address,
          chain: 'xaheen',
          type: 'EOA',
        },
      ],
    };

    this.currentWallet = wallet;
    
    // Save to localStorage
    saveWallet(wallet);
    
    // Don't sync demo wallet to Supabase
    if (SupabaseConfig.enableDebugLogging) {
      console.log('✅ Demo wallet created (not synced to Supabase)');
    }
    
    return wallet;
  }

  /**
   * Check if current wallet is a demo wallet
   */
  isDemoWallet(): boolean {
    return this.currentWallet?.id === 'demo_wallet_001';
  }

  /**
   * Clear current wallet (sign out)
   */
  clearWallet(): void {
    this.currentWallet = null;
    clearStorage();
  }
}


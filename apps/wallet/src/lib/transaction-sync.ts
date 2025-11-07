/**
 * Transaction Sync Service
 * Syncs transactions to Supabase after broadcasting
 */

import { SupabaseService } from './supabase-service';
import { TransactionResult } from './transaction-service';

export class TransactionSyncService {
  private static instance: TransactionSyncService;
  private supabaseService: SupabaseService;

  private constructor() {
    this.supabaseService = SupabaseService.getInstance();
  }

  static getInstance(): TransactionSyncService {
    if (!TransactionSyncService.instance) {
      TransactionSyncService.instance = new TransactionSyncService();
    }
    return TransactionSyncService.instance;
  }

  /**
   * Sync transaction to Supabase
   */
  async syncTransaction(
    transaction: TransactionResult,
    chain: string = 'xaheen'
  ): Promise<void> {
    if (!this.supabaseService.isAuthenticated) {
      console.warn('Not authenticated - skipping transaction sync');
      return;
    }

    try {
      const account = await this.supabaseService.fetchAccounts();
      if (!account || account.length === 0) {
        console.warn('No accounts found - skipping transaction sync');
        return;
      }

      const accountAddress = account[0].address;

      // Sync to tx_history table
      try {
        await this.supabaseService.createTransaction({
          chain,
          accountAddress,
          txHash: transaction.hash,
          status: transaction.status,
          direction: 'outgoing',
          asset: 'ETH',
          value: transaction.value,
        });
      } catch (createError) {
        // If transaction already exists, that's okay
        console.log('Transaction may already exist in Supabase');
      }
    } catch (error: any) {
      console.error('Failed to sync transaction:', error);
      // Don't throw - sync failure shouldn't break the transaction
    }
  }

  /**
   * Update transaction status in Supabase
   */
  async updateTransactionStatus(
    txHash: string,
    status: 'pending' | 'confirmed' | 'failed',
    blockNumber?: number
  ): Promise<void> {
    if (!this.supabaseService.isAuthenticated) {
      return;
    }

    try {
      // TODO: Implement update transaction status in SupabaseService
      // For now, this is a placeholder
      console.log('Updating transaction status:', { txHash, status, blockNumber });
    } catch (error: any) {
      console.error('Failed to update transaction status:', error);
    }
  }
}


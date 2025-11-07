/**
 * Transaction Type Resolvers
 * Resolve nested fields for Transaction type
 */

import type { DataLoaderContext } from '../dataloaders';
import type { Transaction, Block, Account } from '../../types';
import { ethers } from 'ethers';

interface Context {
  dataloaders: DataLoaderContext;
  provider: ethers.JsonRpcProvider;
}

export const transactionResolvers = {
  // Resolve block
  async block(tx: Transaction, _args: unknown, context: Context): Promise<Block | null> {
    return context.dataloaders.blockLoader.load(tx.block_height);
  },

  // Resolve sender account
  async senderAccount(
    tx: Transaction,
    _args: unknown,
    context: Context
  ): Promise<Account | null> {
    return context.dataloaders.accountLoader.load(tx.sender);
  },

  // Resolve receiver account
  async receiverAccount(
    tx: Transaction,
    _args: unknown,
    context: Context
  ): Promise<Account | null> {
    if (!tx.receiver) return null;
    return context.dataloaders.accountLoader.load(tx.receiver);
  },

  // Resolve transaction events (logs)
  async events(tx: Transaction, _args: unknown, context: Context): Promise<any[]> {
    try {
      const receipt = await context.provider.getTransactionReceipt(tx.hash);
      if (!receipt || !receipt.logs) return [];

      return receipt.logs.map((log, index) => ({
        id: `${tx.hash}-${index}`,
        transactionHash: tx.hash,
        logIndex: index,
        contractAddress: log.address,
        eventName: null,
        eventSignature: log.topics[0] || null,
        topics: log.topics,
        data: log.data,
        decodedParams: null,
        timestamp: tx.timestamp,
      }));
    } catch (error) {
      console.error('Error loading transaction events:', error);
      return [];
    }
  },

  // Decode transaction data
  async decodedData(
    tx: Transaction,
    _args: unknown,
    context: Context
  ): Promise<any | null> {
    try {
      const transaction = await context.provider.getTransaction(tx.hash);
      if (!transaction || !transaction.data || transaction.data === '0x') {
        return null;
      }

      // Extract method signature (first 4 bytes)
      const methodSignature = transaction.data.slice(0, 10);

      // Try to decode if we have ABI
      // This is a simplified version - production would use ABI lookup
      return {
        methodName: null,
        methodSignature,
        params: [],
        decodedInput: transaction.data,
      };
    } catch (error) {
      console.error('Error decoding transaction data:', error);
      return null;
    }
  },
};

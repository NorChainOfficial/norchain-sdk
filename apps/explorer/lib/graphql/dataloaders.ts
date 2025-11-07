/**
 * DataLoader Implementation
 * Efficient batch loading to prevent N+1 query problems
 */

import DataLoader from 'dataloader';
import { ethers } from 'ethers';
import type {
  Block,
  Transaction,
  Account,
  Contract,
} from '../types';

const RPC_URL = process.env.NEXT_PUBLIC_RPC_URL || 'https://rpc.norchain.org';

/**
 * Create a new ethers provider for data loading
 */
function createProvider(): ethers.JsonRpcProvider {
  return new ethers.JsonRpcProvider(RPC_URL);
}

/**
 * Block DataLoader - Batch load blocks by height
 */
export function createBlockLoader(): DataLoader<number, Block | null> {
  return new DataLoader<number, Block | null>(
    async (heights: readonly number[]) => {
      const provider = createProvider();

      const blockPromises = heights.map(async (height) => {
        try {
          const block = await provider.getBlock(height);
          if (!block) return null;

          return {
            id: block.number,
            height: block.number,
            hash: block.hash || '',
            previous_hash: block.parentHash,
            timestamp: new Date(block.timestamp * 1000).toISOString(),
            proposer_address: block.miner || '',
            transaction_count: block.transactions.length,
            block_time_seconds: null,
            size_bytes: block.length || null,
            gas_used: Number(block.gasUsed),
            gas_wanted: Number(block.gasLimit),
            created_at: new Date(block.timestamp * 1000).toISOString(),
            updated_at: new Date(block.timestamp * 1000).toISOString(),
          } as Block;
        } catch (error) {
          console.error(`Error loading block ${height}:`, error);
          return null;
        }
      });

      return Promise.all(blockPromises);
    },
    {
      cacheKeyFn: (height: number) => height.toString(),
      maxBatchSize: 100,
    }
  );
}

/**
 * Block by Hash DataLoader
 */
export function createBlockByHashLoader(): DataLoader<string, Block | null> {
  return new DataLoader<string, Block | null>(
    async (hashes: readonly string[]) => {
      const provider = createProvider();

      const blockPromises = hashes.map(async (hash) => {
        try {
          const block = await provider.getBlock(hash);
          if (!block) return null;

          return {
            id: block.number,
            height: block.number,
            hash: block.hash || '',
            previous_hash: block.parentHash,
            timestamp: new Date(block.timestamp * 1000).toISOString(),
            proposer_address: block.miner || '',
            transaction_count: block.transactions.length,
            block_time_seconds: null,
            size_bytes: block.length || null,
            gas_used: Number(block.gasUsed),
            gas_wanted: Number(block.gasLimit),
            created_at: new Date(block.timestamp * 1000).toISOString(),
            updated_at: new Date(block.timestamp * 1000).toISOString(),
          } as Block;
        } catch (error) {
          console.error(`Error loading block by hash ${hash}:`, error);
          return null;
        }
      });

      return Promise.all(blockPromises);
    },
    {
      maxBatchSize: 100,
    }
  );
}

/**
 * Transaction DataLoader - Batch load transactions by hash
 */
export function createTransactionLoader(): DataLoader<string, Transaction | null> {
  return new DataLoader<string, Transaction | null>(
    async (hashes: readonly string[]) => {
      const provider = createProvider();

      const txPromises = hashes.map(async (hash) => {
        try {
          const [tx, receipt] = await Promise.all([
            provider.getTransaction(hash),
            provider.getTransactionReceipt(hash),
          ]);

          if (!tx || !receipt) return null;

          const block = await provider.getBlock(tx.blockNumber || 0);

          return {
            id: receipt.index,
            hash: tx.hash,
            block_height: tx.blockNumber || 0,
            block_hash: receipt.blockHash,
            timestamp: block ? new Date(block.timestamp * 1000).toISOString() : new Date().toISOString(),
            type: tx.type?.toString() || 'legacy',
            sender: tx.from,
            receiver: tx.to || null,
            amount: tx.value.toString(),
            fee: (receipt.gasUsed * (tx.gasPrice || BigInt(0))).toString(),
            gas_used: Number(receipt.gasUsed),
            gas_wanted: Number(tx.gasLimit),
            memo: null,
            status: receipt.status === 1 ? 'success' : 'failed',
            error_message: receipt.status === 0 ? 'Transaction failed' : null,
            created_at: block ? new Date(block.timestamp * 1000).toISOString() : new Date().toISOString(),
            updated_at: block ? new Date(block.timestamp * 1000).toISOString() : new Date().toISOString(),
          } as Transaction;
        } catch (error) {
          console.error(`Error loading transaction ${hash}:`, error);
          return null;
        }
      });

      return Promise.all(txPromises);
    },
    {
      maxBatchSize: 50,
    }
  );
}

/**
 * Account DataLoader - Batch load accounts by address
 */
export function createAccountLoader(): DataLoader<string, Account | null> {
  return new DataLoader<string, Account | null>(
    async (addresses: readonly string[]) => {
      const provider = createProvider();

      const accountPromises = addresses.map(async (address) => {
        try {
          const balance = await provider.getBalance(address);
          const code = await provider.getCode(address);
          const isContract = code !== '0x';

          return {
            id: 0, // This would come from database in production
            address,
            balance: balance.toString(),
            staked_balance: '0',
            delegated_balance: '0',
            tx_count: await provider.getTransactionCount(address),
            type: isContract ? 'contract' : 'user',
            created_at: new Date().toISOString(),
            updated_at: new Date().toISOString(),
            first_seen_at: null,
            last_active_at: null,
          } as Account;
        } catch (error) {
          console.error(`Error loading account ${address}:`, error);
          return null;
        }
      });

      return Promise.all(accountPromises);
    },
    {
      cacheKeyFn: (address: string) => address.toLowerCase(),
      maxBatchSize: 100,
    }
  );
}

/**
 * Transactions by Block DataLoader - Batch load transactions for multiple blocks
 */
export function createTransactionsByBlockLoader(): DataLoader<number, Transaction[]> {
  return new DataLoader<number, Transaction[]>(
    async (blockHeights: readonly number[]) => {
      const provider = createProvider();

      const txPromises = blockHeights.map(async (height) => {
        try {
          const block = await provider.getBlock(height, true);
          if (!block || !block.prefetchedTransactions) return [];

          return block.prefetchedTransactions.map((tx, index) => ({
            id: index,
            hash: tx.hash,
            block_height: height,
            block_hash: block.hash || '',
            timestamp: new Date(block.timestamp * 1000).toISOString(),
            type: tx.type?.toString() || 'legacy',
            sender: tx.from,
            receiver: tx.to || null,
            amount: tx.value.toString(),
            fee: '0', // Would need receipt for accurate fee
            gas_used: 0,
            gas_wanted: Number(tx.gasLimit),
            memo: null,
            status: 'success',
            error_message: null,
            created_at: new Date(block.timestamp * 1000).toISOString(),
            updated_at: new Date(block.timestamp * 1000).toISOString(),
          } as Transaction));
        } catch (error) {
          console.error(`Error loading transactions for block ${height}:`, error);
          return [];
        }
      });

      return Promise.all(txPromises);
    },
    {
      cacheKeyFn: (height: number) => height.toString(),
      maxBatchSize: 20,
    }
  );
}

/**
 * Contract DataLoader - Batch load contract data by address
 */
export function createContractLoader(): DataLoader<string, Contract | null> {
  return new DataLoader<string, Contract | null>(
    async (addresses: readonly string[]) => {
      const provider = createProvider();

      const contractPromises = addresses.map(async (address) => {
        try {
          const code = await provider.getCode(address);
          if (code === '0x') return null;

          return {
            contract_address: address,
            is_verified: false,
            source_code: undefined,
            abi: undefined,
            metadata: {
              creator_address: null,
              creation_transaction_hash: null,
              creation_block_height: null,
              is_token: false,
              token_type: null,
              token_name: null,
              token_symbol: null,
              token_decimals: null,
              total_transactions: 0,
              balance: '0',
              first_seen: null,
              last_active: null,
            },
          } as Contract;
        } catch (error) {
          console.error(`Error loading contract ${address}:`, error);
          return null;
        }
      });

      return Promise.all(contractPromises);
    },
    {
      cacheKeyFn: (address: string) => address.toLowerCase(),
      maxBatchSize: 50,
    }
  );
}

/**
 * DataLoader Context
 * All DataLoaders for a single request
 */
export interface DataLoaderContext {
  blockLoader: DataLoader<number, Block | null>;
  blockByHashLoader: DataLoader<string, Block | null>;
  transactionLoader: DataLoader<string, Transaction | null>;
  accountLoader: DataLoader<string, Account | null>;
  transactionsByBlockLoader: DataLoader<number, Transaction[]>;
  contractLoader: DataLoader<string, Contract | null>;
}

/**
 * Create all DataLoaders for a GraphQL request
 */
export function createDataLoaders(): DataLoaderContext {
  return {
    blockLoader: createBlockLoader(),
    blockByHashLoader: createBlockByHashLoader(),
    transactionLoader: createTransactionLoader(),
    accountLoader: createAccountLoader(),
    transactionsByBlockLoader: createTransactionsByBlockLoader(),
    contractLoader: createContractLoader(),
  };
}

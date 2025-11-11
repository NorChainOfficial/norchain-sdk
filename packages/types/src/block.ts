/**
 * Block-related types
 */

import type { Address, Hash, Wei, Timestamp } from './common';

/**
 * Block information
 */
export interface Block {
  readonly number: number;
  readonly hash: Hash;
  readonly parentHash: Hash;
  readonly nonce?: string;
  readonly sha3Uncles: string;
  readonly logsBloom: string;
  readonly transactionsRoot: Hash;
  readonly stateRoot: Hash;
  readonly receiptsRoot: Hash;
  readonly miner: Address;
  readonly difficulty?: string;
  readonly totalDifficulty?: string;
  readonly extraData?: string;
  readonly size: number;
  readonly gasLimit: string;
  readonly gasUsed: string;
  readonly timestamp: Timestamp;
  readonly transactions: readonly Hash[] | readonly Transaction[];
  readonly uncles?: readonly Hash[];
}

/**
 * Block summary (lighter version)
 */
export interface BlockSummary {
  readonly number: number;
  readonly hash: Hash;
  readonly timestamp: Timestamp;
  readonly miner: Address;
  readonly transactionCount: number;
  readonly gasUsed: string;
  readonly gasLimit: string;
  readonly size: number;
}

/**
 * Block reward information
 */
export interface BlockReward {
  readonly blockNumber: number;
  readonly miner: Address;
  readonly blockReward: Wei;
  readonly uncleReward?: Wei;
  readonly totalReward: Wei;
}

/**
 * Block with transaction details
 */
export interface BlockWithTransactions extends Omit<Block, 'transactions'> {
  readonly transactions: readonly Transaction[];
}

/**
 * Import for Transaction type
 */
import type { Transaction } from './transaction';

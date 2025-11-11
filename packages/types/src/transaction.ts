/**
 * Transaction-related types
 */

import type { Address, Hash, Wei, Timestamp, TransactionStatus } from './common';

/**
 * Core transaction data
 */
export interface Transaction {
  readonly hash: Hash;
  readonly blockNumber: number;
  readonly blockHash: Hash;
  readonly transactionIndex: number;
  readonly from: Address;
  readonly to: Address | null;
  readonly value: Wei;
  readonly gas: string;
  readonly gasPrice: Wei;
  readonly gasUsed?: string;
  readonly nonce: number;
  readonly input?: string;
  readonly status?: number;
  readonly contractAddress?: Address;
  readonly timestamp?: Timestamp;
}

/**
 * Transaction receipt
 */
export interface TransactionReceipt {
  readonly transactionHash: Hash;
  readonly blockNumber: number;
  readonly blockHash: Hash;
  readonly from: Address;
  readonly to: Address | null;
  readonly contractAddress?: Address;
  readonly gasUsed: string;
  readonly cumulativeGasUsed: string;
  readonly effectiveGasPrice: Wei;
  readonly status: number;
  readonly logs: readonly TransactionLog[];
  readonly logsBloom?: string;
}

/**
 * Transaction log entry
 */
export interface TransactionLog {
  readonly address: Address;
  readonly topics: readonly string[];
  readonly data: string;
  readonly blockNumber: number;
  readonly transactionHash: Hash;
  readonly transactionIndex: number;
  readonly blockHash: Hash;
  readonly logIndex: number;
  readonly removed: boolean;
}

/**
 * Transaction status response
 */
export interface TransactionStatusResponse {
  readonly hash: Hash;
  readonly status: TransactionStatus;
  readonly blockNumber?: number;
  readonly confirmations?: number;
  readonly timestamp?: Timestamp;
}

/**
 * Transaction receipt status
 */
export interface TransactionReceiptStatus {
  readonly txHash: Hash;
  readonly status: number;
  readonly blockNumber?: number;
  readonly gasUsed?: string;
}

/**
 * Broadcast transaction request
 */
export interface BroadcastTransactionRequest {
  readonly signedTransaction: string;
}

/**
 * Broadcast transaction response
 */
export interface BroadcastTransactionResponse {
  readonly hash: Hash;
  readonly from: Address;
  readonly to: Address | null;
  readonly value: Wei;
  readonly gasLimit: string;
  readonly gasPrice: Wei;
  readonly nonce: number;
  readonly status: TransactionStatus;
  readonly message: string;
}

/**
 * Detailed transaction info
 */
export interface TransactionInfo extends Transaction {
  readonly confirmations: number;
  readonly timestamp: Timestamp;
  readonly receipt?: TransactionReceipt;
  readonly decodedInput?: unknown;
  readonly valueFormatted?: string;
}

/**
 * Pending transaction
 */
export interface PendingTransaction {
  readonly hash: Hash;
  readonly from: Address;
  readonly to: Address | null;
  readonly value: Wei;
  readonly gasPrice: Wei;
  readonly nonce: number;
  readonly submittedAt: Timestamp;
}

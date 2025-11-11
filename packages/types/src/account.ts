/**
 * Account-related types
 */

import type { Address, Wei, Timestamp } from './common';

/**
 * Account balance information
 */
export interface AccountBalance {
  readonly address: Address;
  readonly balance: Wei;
  readonly balanceFormatted?: string;
  readonly nonce?: number;
  readonly updatedAt?: Timestamp;
}

/**
 * Multi-account balance response
 */
export interface MultiAccountBalance {
  readonly account: Address;
  readonly balance: Wei;
}

/**
 * Account summary with additional statistics
 */
export interface AccountSummary {
  readonly address: Address;
  readonly balance: Wei;
  readonly nonce: number;
  readonly transactionCount: number;
  readonly tokenCount: number;
  readonly firstSeen?: Timestamp;
  readonly lastActive?: Timestamp;
  readonly isContract: boolean;
}

/**
 * Token held by an account
 */
export interface AccountToken {
  readonly contractAddress: Address;
  readonly name: string;
  readonly symbol: string;
  readonly decimals: number;
  readonly balance: Wei;
  readonly balanceFormatted: string;
  readonly type: 'ERC20' | 'ERC721' | 'ERC1155';
  readonly logoUri?: string;
}

/**
 * Account transaction list parameters
 */
export interface GetAccountTransactionsParams {
  readonly address: Address;
  readonly page?: number;
  readonly offset?: number;
  readonly startBlock?: number;
  readonly endBlock?: number;
  readonly sort?: 'asc' | 'desc';
}

/**
 * Internal transaction (contract execution)
 */
export interface InternalTransaction {
  readonly hash: string;
  readonly blockNumber: number;
  readonly timestamp: Timestamp;
  readonly from: Address;
  readonly to: Address;
  readonly value: Wei;
  readonly type: string;
  readonly isError: boolean;
  readonly errCode?: string;
}

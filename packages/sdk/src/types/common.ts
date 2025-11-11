/**
 * Common types used across the SDK
 */

/**
 * Blockchain network identifiers
 */
export type ChainId = 'NOR' | 'BSC' | 'ETHEREUM' | 'TRON';

/**
 * Standard pagination parameters
 */
export interface PaginationParams {
  readonly page?: number;
  readonly limit?: number;
  readonly offset?: number;
}

/**
 * Standard paginated response
 */
export interface PaginatedResponse<T> {
  readonly data: readonly T[];
  readonly total: number;
  readonly page?: number;
  readonly limit?: number;
  readonly offset?: number;
  readonly hasMore?: boolean;
}

/**
 * Standard API response wrapper
 */
export interface ApiResponse<T = any> {
  readonly success: boolean;
  readonly data?: T;
  readonly error?: ApiError;
  readonly timestamp: string;
}

/**
 * Standard API error
 */
export interface ApiError {
  readonly code: string;
  readonly message: string;
  readonly details?: Record<string, any>;
  readonly statusCode: number;
}

/**
 * Transaction status
 */
export type TransactionStatus =
  | 'pending'
  | 'confirmed'
  | 'failed'
  | 'reverted'
  | 'replaced';

/**
 * Standard transaction receipt
 */
export interface TransactionReceipt {
  readonly transactionHash: string;
  readonly blockNumber: string;
  readonly blockHash: string;
  readonly from: string;
  readonly to: string;
  readonly gasUsed: string;
  readonly status: TransactionStatus;
  readonly logs: readonly Log[];
  readonly timestamp: string;
}

/**
 * Standard log entry
 */
export interface Log {
  readonly address: string;
  readonly topics: readonly string[];
  readonly data: string;
  readonly logIndex: number;
  readonly transactionIndex: number;
  readonly blockNumber: string;
}

/**
 * Address type (0x-prefixed hex string)
 */
export type Address = string;

/**
 * Transaction hash type (0x-prefixed hex string)
 */
export type TxHash = string;

/**
 * Block number or tag
 */
export type BlockNumber = string | 'latest' | 'earliest' | 'pending';

/**
 * Hex string type
 */
export type HexString = string;

/**
 * Wei amount (smallest unit)
 */
export type Wei = string;

/**
 * Timestamp (ISO 8601 string or Unix timestamp)
 */
export type Timestamp = string | number;

/**
 * Filter options for queries
 */
export interface FilterOptions {
  readonly fromBlock?: BlockNumber;
  readonly toBlock?: BlockNumber;
  readonly address?: Address | readonly Address[];
  readonly topics?: readonly (string | readonly string[] | null)[];
}

/**
 * Sort order
 */
export type SortOrder = 'asc' | 'desc';

/**
 * Metadata type for extensible objects
 */
export type Metadata = Record<string, any>;

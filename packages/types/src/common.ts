/**
 * Common types used across the NorChain ecosystem
 */

/**
 * Ethereum-compatible address (42 characters with 0x prefix)
 */
export type Address = `0x${string}`;

/**
 * Transaction or block hash (66 characters with 0x prefix)
 */
export type Hash = `0x${string}`;

/**
 * Wei value as string (to handle large numbers without precision loss)
 */
export type Wei = string;

/**
 * Unix timestamp in milliseconds
 */
export type Timestamp = number;

/**
 * ISO 8601 date string
 */
export type ISODateString = string;

/**
 * Chain ID for different networks
 */
export type ChainId = number;

/**
 * Hexadecimal string
 */
export type HexString = `0x${string}`;

/**
 * Pagination parameters
 */
export interface PaginationParams {
  readonly page?: number;
  readonly offset?: number;
  readonly limit?: number;
  readonly sort?: 'asc' | 'desc';
}

/**
 * Paginated response wrapper
 */
export interface PaginatedResponse<T> {
  readonly data: readonly T[];
  readonly total: number;
  readonly page: number;
  readonly limit: number;
  readonly hasMore: boolean;
}

/**
 * API success response
 */
export interface SuccessResponse<T = unknown> {
  readonly success: true;
  readonly result: T;
  readonly message?: string;
}

/**
 * API error response
 */
export interface ErrorResponse {
  readonly success: false;
  readonly error: {
    readonly code: string;
    readonly message: string;
    readonly details?: unknown;
  };
}

/**
 * Generic API response type
 */
export type ApiResponse<T = unknown> = SuccessResponse<T> | ErrorResponse;

/**
 * Network type
 */
export type NetworkType = 'mainnet' | 'testnet' | 'devnet';

/**
 * Transaction status
 */
export type TransactionStatus = 'pending' | 'confirmed' | 'failed' | 'dropped';

/**
 * Sort direction
 */
export type SortDirection = 'asc' | 'desc';

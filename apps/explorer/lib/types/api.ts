/**
 * Comprehensive TypeScript Types for API Responses
 * Centralized type definitions for all API endpoints
 *
 * This file provides strict type safety for:
 * - Blockchain data (blocks, transactions, accounts)
 * - Network statistics and metrics
 * - AI features
 * - Enterprise features (Flash Coins, Mixer)
 * - API responses and pagination
 */

// ============================================================================
// Core API Response Types
// ============================================================================

export interface ApiResponse<T> {
  readonly data: T;
  readonly status: number;
  readonly message?: string;
  readonly timestamp?: string;
}

export interface PaginationMeta {
  readonly page: number;
  readonly limit: number;
  readonly total: number;
  readonly totalPages: number;
  readonly hasNext: boolean;
  readonly hasPrevious: boolean;
}

export interface PaginatedResponse<T> {
  readonly data: T[];
  readonly pagination: PaginationMeta;
}

export interface ErrorResponse {
  readonly error: string;
  readonly message: string;
  readonly statusCode: number;
  readonly timestamp: string;
  readonly path?: string;
}

// ============================================================================
// Blockchain Core Types
// ============================================================================

export interface Block {
  readonly id: string;
  readonly height: number;
  readonly hash: string;
  readonly parent_hash: string;
  readonly timestamp: string;
  readonly transaction_count: number;
  readonly miner: string;
  readonly miner_reward: string;
  readonly difficulty: string;
  readonly total_difficulty: string;
  readonly gas_used: string;
  readonly gas_limit: string;
  readonly size: number;
  readonly nonce: string;
  readonly extra_data?: string;
  readonly state_root: string;
  readonly transactions_root: string;
  readonly receipts_root: string;
  readonly created_at: string;
  readonly updated_at: string;
}

export interface Transaction {
  readonly id: string;
  readonly hash: string;
  readonly from: string;
  readonly to: string;
  readonly value: string;
  readonly gas_price: string;
  readonly gas_limit: string;
  readonly gas_used: string;
  readonly nonce: number;
  readonly input: string;
  readonly block_height: number;
  readonly block_hash: string;
  readonly transaction_index: number;
  readonly timestamp: string;
  readonly status: TransactionStatus;
  readonly contract_address?: string;
  readonly cumulative_gas_used?: string;
  readonly logs_bloom?: string;
  readonly created_at: string;
  readonly updated_at: string;
}

export enum TransactionStatus {
  PENDING = 'pending',
  SUCCESS = 'success',
  FAILED = 'failed',
  REPLACED = 'replaced',
}

export interface Account {
  readonly address: string;
  readonly balance: string;
  readonly nonce: number;
  readonly transaction_count: number;
  readonly contract: boolean;
  readonly created_at: string;
  readonly updated_at: string;
  readonly first_seen_block?: number;
  readonly last_seen_block?: number;
}

export interface AccountBalance {
  readonly address: string;
  readonly balance: string;
  readonly balance_usd?: string;
  readonly timestamp: string;
}

// ============================================================================
// Contract Types
// ============================================================================

export interface Contract {
  readonly address: string;
  readonly creator: string;
  readonly creation_transaction: string;
  readonly creation_block: number;
  readonly name?: string;
  readonly compiler_version?: string;
  readonly optimization_enabled?: boolean;
  readonly optimization_runs?: number;
  readonly source_code?: string;
  readonly abi?: ContractABI[];
  readonly bytecode?: string;
  readonly verified: boolean;
  readonly verification_date?: string;
  readonly license?: string;
  readonly created_at: string;
  readonly updated_at: string;
}

export interface ContractABI {
  readonly type: 'function' | 'constructor' | 'event' | 'fallback' | 'receive';
  readonly name?: string;
  readonly inputs?: ABIParameter[];
  readonly outputs?: ABIParameter[];
  readonly stateMutability?: 'pure' | 'view' | 'nonpayable' | 'payable';
  readonly anonymous?: boolean;
}

export interface ABIParameter {
  readonly name: string;
  readonly type: string;
  readonly indexed?: boolean;
  readonly components?: ABIParameter[];
}

export interface ContractVerificationRequest {
  readonly address: string;
  readonly source_code: string;
  readonly compiler_version: string;
  readonly optimization_enabled: boolean;
  readonly optimization_runs?: number;
  readonly constructor_arguments?: string;
  readonly license?: string;
}

export interface ContractVerificationResponse {
  readonly verified: boolean;
  readonly message: string;
  readonly contract_address: string;
  readonly timestamp: string;
}

// ============================================================================
// Network Statistics
// ============================================================================

export interface NetworkStats {
  readonly total_blocks: number;
  readonly total_transactions: number;
  readonly total_accounts: number;
  readonly total_contracts: number;
  readonly average_block_time: number;
  readonly tps: number;
  readonly pending_transactions: number;
  readonly network_hash_rate: string;
  readonly difficulty: string;
  readonly timestamp: string;
}

export interface GasPrice {
  readonly slow: string;
  readonly slow_wait_time: number;
  readonly standard: string;
  readonly standard_wait_time: number;
  readonly fast: string;
  readonly fast_wait_time: number;
  readonly instant: string;
  readonly instant_wait_time: number;
  readonly base_fee?: string;
  readonly timestamp: string;
}

export interface TokenMetrics {
  readonly token_address: string;
  readonly name: string;
  readonly symbol: string;
  readonly decimals: number;
  readonly total_supply: string;
  readonly circulating_supply: string;
  readonly price_usd?: string;
  readonly market_cap_usd?: string;
  readonly volume_24h_usd?: string;
  readonly holders: number;
  readonly transfers_24h: number;
  readonly timestamp: string;
}

export interface ChartDataPoint {
  readonly timestamp: string;
  readonly value: number;
}

export interface ChartData {
  readonly type: string;
  readonly period: string;
  readonly data: ChartDataPoint[];
}

// ============================================================================
// AI Features
// ============================================================================

export interface AITransactionDecoder {
  readonly hash: string;
  readonly method: string;
  readonly method_signature: string;
  readonly parameters: Record<string, AIDecodedParameter>;
  readonly description: string;
  readonly confidence: number;
  readonly contract_name?: string;
  readonly contract_type?: string;
  readonly risk_level?: 'low' | 'medium' | 'high';
  readonly warnings?: string[];
  readonly timestamp: string;
}

export interface AIDecodedParameter {
  readonly name: string;
  readonly type: string;
  readonly value: any;
  readonly decoded_value?: string;
  readonly description?: string;
}

export interface AIGasPrediction {
  readonly prediction: string;
  readonly confidence: number;
  readonly recommended_gas_price: string;
  readonly estimated_wait_time: number;
  readonly factors: string[];
  readonly timestamp: string;
}

export interface AIContractAnalysis {
  readonly address: string;
  readonly contract_type: string;
  readonly security_score: number;
  readonly risk_level: 'low' | 'medium' | 'high' | 'critical';
  readonly vulnerabilities: AIVulnerability[];
  readonly code_quality: AICodeQuality;
  readonly recommendations: string[];
  readonly timestamp: string;
}

export interface AIVulnerability {
  readonly type: string;
  readonly severity: 'low' | 'medium' | 'high' | 'critical';
  readonly description: string;
  readonly line_number?: number;
  readonly recommendation: string;
}

export interface AICodeQuality {
  readonly score: number;
  readonly complexity: number;
  readonly test_coverage?: number;
  readonly documentation_score: number;
  readonly maintainability: string;
}

// ============================================================================
// Flash Coins
// ============================================================================

export interface FlashCoin {
  readonly id: string;
  readonly sender: string;
  readonly recipient: string;
  readonly amount: string;
  readonly token_address?: string;
  readonly expiry_blocks: number;
  readonly expiry_timestamp: string;
  readonly status: FlashCoinStatus;
  readonly created_block: number;
  readonly created_at: string;
  readonly claimed_at?: string;
  readonly refunded_at?: string;
  readonly transaction_hash: string;
}

export enum FlashCoinStatus {
  ACTIVE = 'active',
  CLAIMED = 'claimed',
  EXPIRED = 'expired',
  REFUNDED = 'refunded',
}

export interface FlashCoinStats {
  readonly total_created: number;
  readonly total_claimed: number;
  readonly total_expired: number;
  readonly total_refunded: number;
  readonly total_value: string;
  readonly active_count: number;
  readonly active_value: string;
}

// ============================================================================
// Mixer / Privacy
// ============================================================================

export interface MixerDeposit {
  readonly id: string;
  readonly commitment: string;
  readonly amount: string;
  readonly token_address?: string;
  readonly depositor: string;
  readonly nullifier_hash: string;
  readonly leaf_index: number;
  readonly deposit_block: number;
  readonly deposit_timestamp: string;
  readonly withdrawn: boolean;
  readonly withdrawal_block?: number;
  readonly withdrawal_timestamp?: string;
  readonly transaction_hash: string;
}

export interface MixerStats {
  readonly total_deposits: number;
  readonly total_withdrawals: number;
  readonly total_volume: string;
  readonly active_deposits: number;
  readonly active_volume: string;
  readonly anonymity_set_size: number;
}

// ============================================================================
// Rate Limiter
// ============================================================================

export interface RateLimitInfo {
  readonly ip: string;
  readonly endpoint: string;
  readonly limit: number;
  readonly remaining: number;
  readonly reset_at: string;
  readonly retry_after?: number;
}

export interface RateLimitStats {
  readonly total_requests: number;
  readonly blocked_requests: number;
  readonly top_endpoints: Array<{
    readonly endpoint: string;
    readonly count: number;
  }>;
  readonly top_ips: Array<{
    readonly ip: string;
    readonly count: number;
  }>;
}

// ============================================================================
// Enterprise Features Dashboard
// ============================================================================

export interface CircuitBreakerStats {
  readonly state: 'CLOSED' | 'OPEN' | 'HALF_OPEN';
  readonly failure_count: number;
  readonly success_count: number;
  readonly total_requests: number;
  readonly success_rate: number;
  readonly last_failure_time: string | null;
  readonly next_attempt_time: string | null;
}

export interface CacheStats {
  readonly size: number;
  readonly max_size: number;
  readonly hits: number;
  readonly misses: number;
  readonly hit_rate: number;
  readonly evictions: number;
}

export interface RetryStats {
  readonly total_attempts: number;
  readonly successful_retries: number;
  readonly failed_retries: number;
  readonly average_attempts: number;
}

export interface EnterpriseStats {
  readonly circuit_breaker: CircuitBreakerStats;
  readonly cache: CacheStats;
  readonly retry: RetryStats;
  readonly rate_limit: RateLimitStats;
}

// ============================================================================
// Search
// ============================================================================

export interface SearchResult {
  readonly type: 'block' | 'transaction' | 'account' | 'contract';
  readonly data: Block | Transaction | Account | Contract;
  readonly relevance_score?: number;
}

export interface SearchResponse {
  readonly query: string;
  readonly results: SearchResult[];
  readonly total: number;
  readonly search_time_ms: number;
}

// ============================================================================
// WebSocket Events
// ============================================================================

export interface NewBlockEvent {
  readonly event: 'new_block';
  readonly data: Block;
  readonly timestamp: string;
}

export interface NewTransactionEvent {
  readonly event: 'new_transaction';
  readonly data: Transaction;
  readonly timestamp: string;
}

export interface PendingTransactionEvent {
  readonly event: 'pending_transaction';
  readonly data: Transaction;
  readonly timestamp: string;
}

export interface GasPriceUpdateEvent {
  readonly event: 'gas_price_update';
  readonly data: GasPrice;
  readonly timestamp: string;
}

export interface NetworkStatsUpdateEvent {
  readonly event: 'network_stats_update';
  readonly data: NetworkStats;
  readonly timestamp: string;
}

export interface AccountBalanceUpdateEvent {
  readonly event: 'account_balance_update';
  readonly data: {
    readonly address: string;
    readonly balance: string;
    readonly previous_balance: string;
  };
  readonly timestamp: string;
}

export type WebSocketEventData =
  | NewBlockEvent
  | NewTransactionEvent
  | PendingTransactionEvent
  | GasPriceUpdateEvent
  | NetworkStatsUpdateEvent
  | AccountBalanceUpdateEvent;

// ============================================================================
// Utility Types
// ============================================================================

export type Nullable<T> = T | null;
export type Optional<T> = T | undefined;
export type AsyncData<T> = {
  readonly data: T | null;
  readonly loading: boolean;
  readonly error: ErrorResponse | null;
};

// ============================================================================
// Type Guards
// ============================================================================

export function isBlock(data: any): data is Block {
  return data && typeof data.height === 'number' && typeof data.hash === 'string';
}

export function isTransaction(data: any): data is Transaction {
  return data && typeof data.hash === 'string' && typeof data.from === 'string';
}

export function isAccount(data: any): data is Account {
  return data && typeof data.address === 'string' && typeof data.balance === 'string';
}

export function isContract(data: any): data is Contract {
  return data && typeof data.address === 'string' && typeof data.verified === 'boolean';
}

export function isErrorResponse(data: any): data is ErrorResponse {
  return data && typeof data.error === 'string' && typeof data.statusCode === 'number';
}

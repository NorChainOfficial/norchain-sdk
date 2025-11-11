/**
 * Global constants for NorChain ecosystem
 */

/**
 * Chain IDs for different networks
 */
export const CHAIN_IDS = {
  MAINNET: 2022,
  TESTNET: 2023,
  DEVNET: 2024,
} as const;

/**
 * Native token symbol
 */
export const NATIVE_TOKEN_SYMBOL = 'NOR' as const;

/**
 * Native token decimals
 */
export const NATIVE_TOKEN_DECIMALS = 18 as const;

/**
 * Native token name
 */
export const NATIVE_TOKEN_NAME = 'NorChain' as const;

/**
 * Block time in seconds
 */
export const BLOCK_TIME = 3 as const;

/**
 * Blocks per epoch
 */
export const BLOCKS_PER_EPOCH = 28800 as const;

/**
 * Default gas limit for transactions
 */
export const DEFAULT_GAS_LIMIT = 21000 as const;

/**
 * Default gas price in wei (10 Gwei)
 */
export const DEFAULT_GAS_PRICE = '10000000000' as const;

/**
 * Maximum gas limit per block
 */
export const MAX_GAS_LIMIT = 30000000 as const;

/**
 * Zero address
 */
export const ZERO_ADDRESS = '0x0000000000000000000000000000000000000000' as const;

/**
 * Zero hash
 */
export const ZERO_HASH = '0x0000000000000000000000000000000000000000000000000000000000000000' as const;

/**
 * Minimum stake amount for validators (in wei)
 */
export const MIN_VALIDATOR_STAKE = '1000000000000000000000000' as const; // 1M NOR

/**
 * Unbonding period in seconds (7 days)
 */
export const UNBONDING_PERIOD = 604800; // 7 * 24 * 60 * 60

/**
 * Minimum proposal deposit (in wei)
 */
export const MIN_PROPOSAL_DEPOSIT = '10000000000000000000000' as const; // 10K NOR

/**
 * Voting period in blocks
 */
export const VOTING_PERIOD = 40320; // ~5 days

/**
 * Supported currencies
 */
export const SUPPORTED_CURRENCIES = [
  'NOR',
  'USD',
  'EUR',
  'NOK',
  'AED',
  'SAR',
] as const;

/**
 * Pagination defaults
 */
export const PAGINATION = {
  DEFAULT_PAGE: 1,
  DEFAULT_LIMIT: 20,
  MAX_LIMIT: 100,
  MIN_LIMIT: 1,
} as const;

/**
 * API rate limits
 */
export const RATE_LIMITS = {
  DEFAULT_TTL: 60000, // 1 minute
  DEFAULT_LIMIT: 100,
  STRICT_LIMIT: 10,
} as const;

/**
 * WebSocket event types
 */
export const WS_EVENTS = {
  CONNECT: 'connect',
  DISCONNECT: 'disconnect',
  ERROR: 'error',
  NEW_BLOCK: 'newBlock',
  NEW_TRANSACTION: 'newTransaction',
  PRICE_UPDATE: 'priceUpdate',
  BALANCE_UPDATE: 'balanceUpdate',
} as const;

/**
 * Cache TTL values (in seconds)
 */
export const CACHE_TTL = {
  SHORT: 60, // 1 minute
  MEDIUM: 300, // 5 minutes
  LONG: 3600, // 1 hour
  DAY: 86400, // 24 hours
} as const;

/**
 * API versions
 */
export const API_VERSION = 'v1' as const;

/**
 * Token standards
 */
export const TOKEN_STANDARDS = {
  ERC20: 'ERC20',
  ERC721: 'ERC721',
  ERC1155: 'ERC1155',
} as const;

/**
 * KYC levels
 */
export const KYC_LEVELS = {
  LEVEL_1: 1,
  LEVEL_2: 2,
  LEVEL_3: 3,
} as const;

/**
 * Risk levels
 */
export const RISK_LEVELS = {
  LOW: 'low',
  MEDIUM: 'medium',
  HIGH: 'high',
  CRITICAL: 'critical',
} as const;

/**
 * Payment methods
 */
export const PAYMENT_METHODS = {
  CRYPTO: 'crypto',
  CARD: 'card',
  BANK_TRANSFER: 'bank_transfer',
  MOBILE_MONEY: 'mobile_money',
} as const;

/**
 * Type exports for constants
 */
export type ChainId = typeof CHAIN_IDS[keyof typeof CHAIN_IDS];
export type SupportedCurrency = typeof SUPPORTED_CURRENCIES[number];
export type WsEvent = typeof WS_EVENTS[keyof typeof WS_EVENTS];
export type TokenStandard = typeof TOKEN_STANDARDS[keyof typeof TOKEN_STANDARDS];

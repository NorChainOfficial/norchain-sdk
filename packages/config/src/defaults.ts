/**
 * Default configuration values
 */

import type { NetworkConfig } from './networks';
import { DEVNET_CONFIG } from './networks';
import { PAGINATION, CACHE_TTL, RATE_LIMITS } from './constants';

/**
 * Default network configuration (devnet for local development)
 */
export const DEFAULT_NETWORK: NetworkConfig = DEVNET_CONFIG;

/**
 * Default pagination settings
 */
export const DEFAULT_PAGINATION = {
  page: PAGINATION.DEFAULT_PAGE,
  limit: PAGINATION.DEFAULT_LIMIT,
} as const;

/**
 * Default cache settings
 */
export const DEFAULT_CACHE = {
  ttl: CACHE_TTL.MEDIUM,
  enabled: true,
} as const;

/**
 * Default rate limit settings
 */
export const DEFAULT_RATE_LIMIT = {
  ttl: RATE_LIMITS.DEFAULT_TTL,
  limit: RATE_LIMITS.DEFAULT_LIMIT,
} as const;

/**
 * Default API client configuration
 */
export const DEFAULT_API_CONFIG = {
  timeout: 30000,
  retryAttempts: 3,
  retryDelay: 1000,
  headers: {
    'Content-Type': 'application/json',
    'Accept': 'application/json',
  },
} as const;

/**
 * Default WebSocket configuration
 */
export const DEFAULT_WS_CONFIG = {
  reconnect: true,
  reconnectAttempts: 5,
  reconnectDelay: 1000,
  pingInterval: 30000,
  pongTimeout: 5000,
} as const;

/**
 * Default transaction configuration
 */
export const DEFAULT_TX_CONFIG = {
  gasLimit: '21000',
  gasPrice: '10000000000', // 10 Gwei
  confirmations: 1,
  timeout: 60000, // 1 minute
} as const;

/**
 * Default validator configuration
 */
export const DEFAULT_VALIDATOR_CONFIG = {
  minStake: '1000000000000000000000000', // 1M NOR
  commission: '0.05', // 5%
  unbondingPeriod: 604800, // 7 days in seconds
} as const;

/**
 * Default governance configuration
 */
export const DEFAULT_GOVERNANCE_CONFIG = {
  minDeposit: '10000000000000000000000', // 10K NOR
  votingPeriod: 40320, // blocks (~5 days)
  quorum: '0.33', // 33%
  threshold: '0.50', // 50%
  vetoThreshold: '0.33', // 33%
} as const;

/**
 * Default payment configuration
 */
export const DEFAULT_PAYMENT_CONFIG = {
  currency: 'NOR' as const,
  confirmations: 12,
  expirationTime: 3600, // 1 hour
} as const;

/**
 * Default KYC configuration
 */
export const DEFAULT_KYC_CONFIG = {
  level: 1,
  expirationDays: 365,
} as const;

/**
 * Default logger configuration
 */
export const DEFAULT_LOGGER_CONFIG = {
  level: 'info' as const,
  pretty: false,
  timestamp: true,
} as const;

/**
 * Feature flags
 */
export const FEATURE_FLAGS = {
  ENABLE_GOVERNANCE: true,
  ENABLE_STAKING: true,
  ENABLE_PAYMENTS: true,
  ENABLE_NFT: true,
  ENABLE_BRIDGE: true,
  ENABLE_ANALYTICS: true,
  ENABLE_WEBSOCKETS: true,
  ENABLE_CACHING: true,
} as const;

/**
 * Get default configuration based on environment
 */
export const getDefaultConfig = (env: string = 'development') => {
  return {
    env,
    network: DEFAULT_NETWORK,
    pagination: DEFAULT_PAGINATION,
    cache: DEFAULT_CACHE,
    rateLimit: DEFAULT_RATE_LIMIT,
    api: DEFAULT_API_CONFIG,
    ws: DEFAULT_WS_CONFIG,
    tx: DEFAULT_TX_CONFIG,
    validator: DEFAULT_VALIDATOR_CONFIG,
    governance: DEFAULT_GOVERNANCE_CONFIG,
    payment: DEFAULT_PAYMENT_CONFIG,
    kyc: DEFAULT_KYC_CONFIG,
    logger: DEFAULT_LOGGER_CONFIG,
    features: FEATURE_FLAGS,
  } as const;
};

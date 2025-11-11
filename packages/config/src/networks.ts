/**
 * Network configurations for different environments
 */

import { CHAIN_IDS, NATIVE_TOKEN_NAME, NATIVE_TOKEN_SYMBOL, NATIVE_TOKEN_DECIMALS } from './constants';

export interface NetworkConfig {
  readonly chainId: number;
  readonly chainName: string;
  readonly rpcUrl: string;
  readonly explorerUrl: string;
  readonly apiUrl: string;
  readonly wsUrl: string;
  readonly nativeCurrency: {
    readonly name: string;
    readonly symbol: string;
    readonly decimals: number;
  };
  readonly blockTime: number;
  readonly isTestnet: boolean;
}

/**
 * Mainnet configuration
 */
export const MAINNET_CONFIG: NetworkConfig = {
  chainId: CHAIN_IDS.MAINNET,
  chainName: 'NorChain Mainnet',
  rpcUrl: 'https://rpc.norchain.io',
  explorerUrl: 'https://explorer.norchain.io',
  apiUrl: 'https://api.norchain.io',
  wsUrl: 'wss://ws.norchain.io',
  nativeCurrency: {
    name: NATIVE_TOKEN_NAME,
    symbol: NATIVE_TOKEN_SYMBOL,
    decimals: NATIVE_TOKEN_DECIMALS,
  },
  blockTime: 3,
  isTestnet: false,
} as const;

/**
 * Testnet configuration
 */
export const TESTNET_CONFIG: NetworkConfig = {
  chainId: CHAIN_IDS.TESTNET,
  chainName: 'NorChain Testnet',
  rpcUrl: 'https://testnet-rpc.norchain.io',
  explorerUrl: 'https://testnet-explorer.norchain.io',
  apiUrl: 'https://testnet-api.norchain.io',
  wsUrl: 'wss://testnet-ws.norchain.io',
  nativeCurrency: {
    name: NATIVE_TOKEN_NAME,
    symbol: NATIVE_TOKEN_SYMBOL,
    decimals: NATIVE_TOKEN_DECIMALS,
  },
  blockTime: 3,
  isTestnet: true,
} as const;

/**
 * Devnet configuration (local development)
 */
export const DEVNET_CONFIG: NetworkConfig = {
  chainId: CHAIN_IDS.DEVNET,
  chainName: 'NorChain Devnet',
  rpcUrl: 'http://localhost:8545',
  explorerUrl: 'http://localhost:3002',
  apiUrl: 'http://localhost:4000',
  wsUrl: 'ws://localhost:4000',
  nativeCurrency: {
    name: NATIVE_TOKEN_NAME,
    symbol: NATIVE_TOKEN_SYMBOL,
    decimals: NATIVE_TOKEN_DECIMALS,
  },
  blockTime: 3,
  isTestnet: true,
} as const;

/**
 * All network configurations
 */
export const NETWORKS: Record<string, NetworkConfig> = {
  mainnet: MAINNET_CONFIG,
  testnet: TESTNET_CONFIG,
  devnet: DEVNET_CONFIG,
} as const;

/**
 * Get network config by chain ID
 */
export const getNetworkByChainId = (chainId: number): NetworkConfig | undefined => {
  return Object.values(NETWORKS).find((network) => network.chainId === chainId);
};

/**
 * Get network config by name
 */
export const getNetworkByName = (name: string): NetworkConfig | undefined => {
  return NETWORKS[name.toLowerCase()];
};

/**
 * Check if chain ID is supported
 */
export const isSupportedChainId = (chainId: number): boolean => {
  return Object.values(NETWORKS).some((network) => network.chainId === chainId);
};

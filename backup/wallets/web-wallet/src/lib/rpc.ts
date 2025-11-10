/**
 * RPC utilities for blockchain interactions
 * Handles balance fetching, transaction broadcasting, etc.
 */

import { ethers } from 'ethers';

export interface RPCConfig {
  url: string;
  chainId: number;
  name: string;
}

/**
 * Default RPC configurations
 */
export const RPC_CONFIGS: Record<string, RPCConfig> = {
  ethereum: {
    url: 'https://eth.llamarpc.com',
    chainId: 1,
    name: 'Ethereum',
  },
  norchain: {
    url: process.env.NEXT_PUBLIC_RPC_URL || 'https://rpc.norchain.org',
    chainId: parseInt(process.env.NEXT_PUBLIC_CHAIN_ID || '65001'),
    name: 'NorChain',
  },
  xaheen: {
    url: process.env.NEXT_PUBLIC_RPC_URL || 'https://rpc.norchain.org',
    chainId: parseInt(process.env.NEXT_PUBLIC_CHAIN_ID || '65001'),
    name: 'NorChain',
  },
  sepolia: {
    url: 'https://sepolia.infura.io/v3/YOUR_KEY',
    chainId: 11155111,
    name: 'Sepolia',
  },
};

/**
 * Get provider for a chain
 */
export function getProvider(chain: string = 'norchain'): ethers.Provider {
  const config = RPC_CONFIGS[chain];
  if (!config) {
    // Fallback to NorChain if chain not found
    const norchainConfig = RPC_CONFIGS.norchain;
    return new ethers.JsonRpcProvider(norchainConfig.url);
  }
  return new ethers.JsonRpcProvider(config.url);
}

/**
 * Get balance for an address
 */
export async function getBalance(
  address: string,
  chain: string = 'xaheen'
): Promise<string> {
  try {
    const provider = getProvider(chain);
    const balance = await provider.getBalance(address);
    return ethers.formatEther(balance);
  } catch (error: any) {
    throw new Error(`Failed to fetch balance: ${error.message}`);
  }
}

/**
 * Get transaction count (nonce)
 */
export async function getTransactionCount(
  address: string,
  chain: string = 'xaheen'
): Promise<number> {
  try {
    const provider = getProvider(chain);
    return await provider.getTransactionCount(address);
  } catch (error: any) {
    throw new Error(`Failed to fetch transaction count: ${error.message}`);
  }
}

/**
 * Get gas price
 */
export async function getGasPrice(chain: string = 'xaheen'): Promise<string> {
  try {
    const provider = getProvider(chain);
    const feeData = await provider.getFeeData();
    return feeData.gasPrice?.toString() || '0';
  } catch (error: any) {
    throw new Error(`Failed to fetch gas price: ${error.message}`);
  }
}

/**
 * Broadcast transaction
 */
export async function broadcastTransaction(
  signedTx: string,
  chain: string = 'xaheen'
): Promise<string> {
  try {
    const provider = getProvider(chain);
    const tx = await provider.broadcastTransaction(signedTx);
    return tx.hash;
  } catch (error: any) {
    throw new Error(`Failed to broadcast transaction: ${error.message}`);
  }
}

/**
 * Get transaction receipt
 */
export async function getTransactionReceipt(
  txHash: string,
  chain: string = 'xaheen'
): Promise<ethers.TransactionReceipt | null> {
  try {
    const provider = getProvider(chain);
    return await provider.getTransactionReceipt(txHash);
  } catch (error: any) {
    throw new Error(`Failed to fetch transaction receipt: ${error.message}`);
  }
}

/**
 * Wait for transaction confirmation
 */
export async function waitForTransaction(
  txHash: string,
  chain: string = 'xaheen',
  confirmations: number = 1
): Promise<ethers.TransactionReceipt> {
  try {
    const provider = getProvider(chain);
    return await provider.waitForTransaction(txHash, confirmations);
  } catch (error: any) {
    throw new Error(`Failed to wait for transaction: ${error.message}`);
  }
}


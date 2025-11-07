import { BitcoinBRApi } from './api';

// Connect to Unified API
// For server-side (SSR), use API_URL (Docker internal networking)
// For client-side, use NEXT_PUBLIC_API_URL (public URL)
const API_BASE_URL = process.env.API_URL || process.env.NEXT_PUBLIC_API_URL || 'http://localhost:4000/api/v1';

/**
 * Format timestamp to relative time
 */
export function formatTimeAgo(timestamp: number | undefined | null): string {
  if (!timestamp) return 'Never';
  const now = Math.floor(Date.now() / 1000);
  const diff = now - timestamp;

  if (diff < 60) return `${diff}s ago`;
  if (diff < 3600) return `${Math.floor(diff / 60)}m ago`;
  if (diff < 86400) return `${Math.floor(diff / 3600)}h ago`;
  return `${Math.floor(diff / 86400)}d ago`;
}

/**
 * Format address to short form
 */
export function formatAddress(address: string | undefined | null): string {
  if (!address) return 'N/A';
  return `${address.slice(0, 8)}...${address.slice(-6)}`;
}

/**
 * Format hash to short form
 */
export function formatHash(hash: string | undefined | null): string {
  if (!hash) return 'N/A';
  return `${hash.slice(0, 10)}...${hash.slice(-6)}`;
}

/**
 * Format number with commas
 */
export function formatNumber(num: number | undefined | null): string {
  if (num === undefined || num === null) return '0';
  return num.toLocaleString();
}

/**
 * Convert Wei to NOR (Noor native currency)
 */
export function weiToXhn(wei: string | number | undefined | null): string {
  if (!wei || wei === '0') return '0.0000';
  try {
    const value = typeof wei === 'string' ? BigInt(wei) : BigInt(wei.toString());
    const xht = Number(value) / 1e18;
    return xht.toFixed(4);
  } catch (error) {
    return '0.0000';
  }
}

export const apiClient = {
  getBlocks: async ({ page = 1, per_page = 20 }: { page?: number; per_page?: number }) => {
    const response = await fetch(`${API_BASE_URL}/blocks?page=${page}&per_page=${per_page}`);
    if (!response.ok) throw new Error('Failed to fetch blocks');
    const result = await response.json();
    // Unwrap backend response format: {success: true, data: {...}}
    return result.data || result;
  },

  getBlock: async (height: number) => {
    const response = await fetch(`${API_BASE_URL}/blocks/${height}`);
    if (!response.ok) throw new Error('Failed to fetch block');
    const result = await response.json();
    return result.data || result;
  },

  getTransactions: async ({ page = 1, per_page = 20, block_height }: { page?: number; per_page?: number; block_height?: number }) => {
    let url = `${API_BASE_URL}/transactions?page=${page}&limit=${per_page}`;
    if (block_height !== undefined) {
      url += `&block_height=${block_height}`;
    }
    const response = await fetch(url);
    if (!response.ok) throw new Error('Failed to fetch transactions');
    const result = await response.json();
    return result.data || result;
  },

  getTransaction: async (hash: string) => {
    const response = await fetch(`${API_BASE_URL}/transactions/${hash}`);
    if (!response.ok) throw new Error('Failed to fetch transaction');
    const result = await response.json();
    return result.data || result;
  },

  getAccounts: async ({ page = 1, per_page = 20 }: { page?: number; per_page?: number }) => {
    const response = await fetch(`${API_BASE_URL}/accounts?page=${page}&per_page=${per_page}`);
    if (!response.ok) throw new Error('Failed to fetch accounts');
    const result = await response.json();
    return result.data || result;
  },

  getAccount: async (address: string) => {
    const response = await fetch(`${API_BASE_URL}/accounts/${address}`);
    if (!response.ok) throw new Error('Failed to fetch account');
    const result = await response.json();
    return result.data || result;
  },

  getAccountTransactions: async (address: string, { page = 1, per_page = 20 }: { page?: number; per_page?: number } = {}) => {
    const response = await fetch(`${API_BASE_URL}/accounts/${address}/transactions?page=${page}&per_page=${per_page}`);
    if (!response.ok) throw new Error('Failed to fetch account transactions');
    const result = await response.json();
    return result.data || result;
  },

  getTransactionEvents: async (hash: string) => {
    const response = await fetch(`${API_BASE_URL}/transactions/${hash}/events`);
    if (!response.ok) throw new Error('Failed to fetch transaction events');
    const result = await response.json();
    return result.data || result;
  },

  getValidators: async () => {
    const response = await fetch(`${API_BASE_URL}/validators`);
    if (!response.ok) throw new Error('Failed to fetch validators');
    const result = await response.json();
    return result.data || result;
  },

  getStats: async () => {
    const response = await fetch(`${API_BASE_URL}/stats`);
    if (!response.ok) throw new Error('Failed to fetch stats');
    const result = await response.json();
    return result.data || result;
  },

  // Contract API methods
  getContract: async (address: string) => {
    const response = await fetch(`${API_BASE_URL}/contracts/${address}`);
    if (!response.ok) throw new Error('Failed to fetch contract');
    const result = await response.json();
    return result.data || result;
  },

  getContractAbi: async (address: string) => {
    const response = await fetch(`${API_BASE_URL}/contracts/${address}/abi`);
    if (!response.ok) throw new Error('Failed to fetch contract ABI');
    const result = await response.json();
    return result.data || result;
  },

  getContractSource: async (address: string) => {
    const response = await fetch(`${API_BASE_URL}/contracts/${address}/source`);
    if (!response.ok) throw new Error('Failed to fetch contract source');
    const result = await response.json();
    return result.data || result;
  },

  getContractEvents: async (address: string, { page = 1, per_page = 20, event_name, from_block, to_block }: {
    page?: number;
    per_page?: number;
    event_name?: string;
    from_block?: number;
    to_block?: number;
  } = {}) => {
    let url = `${API_BASE_URL}/contracts/${address}/events?page=${page}&per_page=${per_page}`;
    if (event_name) url += `&event_name=${event_name}`;
    if (from_block !== undefined) url += `&from_block=${from_block}`;
    if (to_block !== undefined) url += `&to_block=${to_block}`;
    const response = await fetch(url);
    if (!response.ok) throw new Error('Failed to fetch contract events');
    const result = await response.json();
    return result.data || result;
  },

  getContractInternalTransactions: async (address: string, { page = 1, per_page = 20 }: { page?: number; per_page?: number } = {}) => {
    const response = await fetch(`${API_BASE_URL}/contracts/${address}/internal-transactions?page=${page}&per_page=${per_page}`);
    if (!response.ok) throw new Error('Failed to fetch internal transactions');
    const result = await response.json();
    return result.data || result;
  },

  getVerifiedContracts: async ({ page = 1, per_page = 20 }: { page?: number; per_page?: number } = {}) => {
    const response = await fetch(`${API_BASE_URL}/contracts/verified?page=${page}&per_page=${per_page}`);
    if (!response.ok) throw new Error('Failed to fetch verified contracts');
    const result = await response.json();
    return result.data || result;
  },

  readContract: async (address: string, functionName: string, params: any[] = []) => {
    const response = await fetch(`${API_BASE_URL}/contracts/${address}/read`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ function: functionName, params }),
    });
    if (!response.ok) throw new Error('Failed to read contract');
    const result = await response.json();
    return result.data || result;
  },
};

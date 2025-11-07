/**
 * Demo Assets for Testing
 * Provides sample assets for demo/test wallets
 */

export interface DemoAsset {
  id: string;
  symbol: string;
  name: string;
  balance: string;
  usdValue: string;
  change24h: string;
  icon?: string;
  chartData?: number[];
}

export const DEMO_ASSETS: DemoAsset[] = [
  {
    id: 'eth',
    symbol: 'ETH',
    name: 'Ethereum',
    balance: '2.5432',
    usdValue: '$4,876.32',
    change24h: '+2.45%',
  },
  {
    id: 'usdc',
    symbol: 'USDC',
    name: 'USD Coin',
    balance: '1,250.00',
    usdValue: '$1,250.00',
    change24h: '+0.01%',
  },
  {
    id: 'dai',
    symbol: 'DAI',
    name: 'Dai Stablecoin',
    balance: '500.00',
    usdValue: '$500.00',
    change24h: '+0.02%',
  },
  {
    id: 'usdt',
    symbol: 'USDT',
    name: 'Tether',
    balance: '750.50',
    usdValue: '$750.50',
    change24h: '+0.01%',
  },
  {
    id: 'link',
    symbol: 'LINK',
    name: 'Chainlink',
    balance: '125.75',
    usdValue: '$1,892.50',
    change24h: '+5.23%',
  },
];

export const DEMO_BALANCE = '$8,269.32';

export const DEMO_ADDRESS = '0x742d35Cc6634C0532925a3b844Bc9e7595f0bEb';

export interface DemoTransaction {
  id: string;
  hash: string;
  from: string;
  to: string;
  value: string;
  asset: string;
  status: 'confirmed' | 'pending' | 'failed';
  timestamp: string;
  direction: 'incoming' | 'outgoing';
}

export const DEMO_TRANSACTIONS: DemoTransaction[] = [
  {
    id: 'tx_001',
    hash: '0x1234567890abcdef1234567890abcdef1234567890abcdef1234567890abcdef',
    from: '0x742d35Cc6634C0532925a3b844Bc9e7595f0bEb',
    to: '0x8ba1f109551bD432803012645Hac136c22C9',
    value: '0.5',
    asset: 'ETH',
    status: 'confirmed',
    timestamp: new Date(Date.now() - 3600000).toISOString(), // 1 hour ago
    direction: 'outgoing',
  },
  {
    id: 'tx_002',
    hash: '0xabcdef1234567890abcdef1234567890abcdef1234567890abcdef1234567890',
    from: '0x8ba1f109551bD432803012645Hac136c22C9',
    to: '0x742d35Cc6634C0532925a3b844Bc9e7595f0bEb',
    value: '1.25',
    asset: 'ETH',
    status: 'confirmed',
    timestamp: new Date(Date.now() - 86400000).toISOString(), // 1 day ago
    direction: 'incoming',
  },
  {
    id: 'tx_003',
    hash: '0x9876543210fedcba9876543210fedcba9876543210fedcba9876543210fedcba',
    from: '0x742d35Cc6634C0532925a3b844Bc9e7595f0bEb',
    to: '0x1234567890123456789012345678901234567890',
    value: '100',
    asset: 'USDC',
    status: 'confirmed',
    timestamp: new Date(Date.now() - 172800000).toISOString(), // 2 days ago
    direction: 'outgoing',
  },
];

export function getDemoTransactions(): DemoTransaction[] {
  return DEMO_TRANSACTIONS;
}

/**
 * Get demo assets for a wallet
 */
export function getDemoAssets(): DemoAsset[] {
  return DEMO_ASSETS;
}

/**
 * Get demo total balance
 */
export function getDemoBalance(): string {
  return DEMO_BALANCE;
}


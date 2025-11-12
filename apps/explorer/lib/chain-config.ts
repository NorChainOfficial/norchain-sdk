/**
 * NorChain Configuration
 */

import { defineChain } from 'viem';

export const norChain = defineChain({
  id: 885824,
  name: 'NorChain',
  nativeCurrency: {
    decimals: 18,
    name: 'Nor Token',
    symbol: 'NOR',
  },
  rpcUrls: {
    default: {
      http: ['https://rpc.norchain.org'],
      webSocket: ['wss://ws.norchain.org'],
    },
    public: {
      http: ['https://rpc.norchain.org'],
      webSocket: ['wss://ws.norchain.org'],
    },
  },
  blockExplorers: {
    default: {
      name: 'NorChain Explorer',
      url: 'https://explorer.norchain.org',
    },
  },
  contracts: {
    multicall3: {
      address: '0xcA11bde05977b3631167028862bE2a173976CA11',
      blockCreated: 0,
    },
  },
  testnet: false,
});

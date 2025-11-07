/**
 * NorChain SDK
 * 
 * Easy-to-use SDK for interacting with the NorChain ecosystem
 */

import { ApiClient } from './api-client'
import { WalletClient } from './wallet-client'
import { ExplorerClient } from './explorer-client'
import { ExchangeClient } from './exchange-client'

export * from './types'
export * from './utils'

/**
 * Main SDK class
 */
export class NorChainSDK {
  public api: ApiClient
  public wallet: WalletClient
  public explorer: ExplorerClient
  public exchange: ExchangeClient

  constructor(config: SDKConfig) {
    this.api = new ApiClient(config)
    this.wallet = new WalletClient(config)
    this.explorer = new ExplorerClient(config)
    this.exchange = new ExchangeClient(config)
  }
}

export interface SDKConfig {
  apiUrl?: string
  rpcUrl?: string
  chainId?: number
  apiKey?: string
}

// Default configuration
const defaultConfig: SDKConfig = {
  apiUrl: 'http://localhost:4000',
  rpcUrl: 'https://rpc.norchain.org',
  chainId: 65001,
}

/**
 * Create SDK instance
 */
export function createSDK(config?: Partial<SDKConfig>): NorChainSDK {
  return new NorChainSDK({ ...defaultConfig, ...config })
}

// Export individual clients
export { ApiClient, WalletClient, ExplorerClient, ExchangeClient }


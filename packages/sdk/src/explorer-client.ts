/**
 * Explorer Client
 * Client for blockchain explorer operations
 */

import { ApiClient } from './api-client'
import { SDKConfig } from './index'

export class ExplorerClient {
  private api: ApiClient

  constructor(config: SDKConfig) {
    this.api = new ApiClient(config)
  }

  /**
   * Get block by height
   */
  async getBlock(height: number): Promise<any> {
    return this.api.get(`/api/v1/blocks/${height}`)
  }

  /**
   * Get latest blocks
   */
  async getLatestBlocks(limit: number = 10): Promise<any[]> {
    return this.api.get(`/api/v1/blocks?limit=${limit}`)
  }

  /**
   * Get transaction by hash
   */
  async getTransaction(hash: string): Promise<any> {
    return this.api.get(`/api/v1/transactions/${hash}`)
  }

  /**
   * Get latest transactions
   */
  async getLatestTransactions(limit: number = 10): Promise<any[]> {
    return this.api.get(`/api/v1/transactions?limit=${limit}`)
  }
}


/**
 * Wallet Client
 * Client for wallet-related operations
 */

import { ApiClient } from './api-client'
import { SDKConfig } from './index'

export class WalletClient {
  private api: ApiClient

  constructor(config: SDKConfig) {
    this.api = new ApiClient(config)
  }

  /**
   * Get wallet balance
   */
  async getBalance(address: string): Promise<{ balance: string }> {
    return this.api.get(`/api/v1/account/${address}/balance`)
  }

  /**
   * Get wallet transactions
   */
  async getTransactions(address: string, limit: number = 50): Promise<any[]> {
    return this.api.get(`/api/v1/account/${address}/transactions?limit=${limit}`)
  }

  /**
   * Get account information
   */
  async getAccountInfo(address: string): Promise<any> {
    return this.api.get(`/api/v1/account/${address}`)
  }
}


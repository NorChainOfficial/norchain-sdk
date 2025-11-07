/**
 * Exchange Client
 * Client for NEX Exchange operations
 */

import { ApiClient } from './api-client'
import { SDKConfig } from './index'

export class ExchangeClient {
  private api: ApiClient

  constructor(config: SDKConfig) {
    this.api = new ApiClient(config)
  }

  /**
   * Get swap quote
   */
  async getSwapQuote(
    fromToken: string,
    toToken: string,
    amount: string
  ): Promise<any> {
    return this.api.post('/api/v1/swap/quote', {
      fromToken,
      toToken,
      amount,
    })
  }

  /**
   * Execute swap
   */
  async executeSwap(quoteId: string, signedTx: string): Promise<any> {
    return this.api.post('/api/v1/swap/execute', {
      quoteId,
      signedTx,
    })
  }

  /**
   * Get token prices
   */
  async getPrices(): Promise<any> {
    return this.api.get('/api/v1/prices')
  }

  /**
   * Get portfolio
   */
  async getPortfolio(address: string): Promise<any> {
    return this.api.get(`/api/v1/portfolio/${address}`)
  }
}


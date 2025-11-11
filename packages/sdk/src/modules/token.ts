import { AxiosInstance } from 'axios';

export interface TokenSupplyResponse {
  readonly contractAddress: string;
  readonly totalSupply: string;
  readonly circulatingSupply?: string;
}

export interface TokenBalanceResponse {
  readonly contractAddress: string;
  readonly address: string;
  readonly balance: string;
  readonly decimals: number;
}

export interface TokenInfo {
  readonly contractAddress: string;
  readonly name: string;
  readonly symbol: string;
  readonly decimals: number;
  readonly totalSupply: string;
  readonly tokenType: string;
  readonly metadata?: Record<string, any>;
}

export interface TokenTransfer {
  readonly hash: string;
  readonly from: string;
  readonly to: string;
  readonly value: string;
  readonly timestamp: string;
  readonly blockNumber: string;
}

export interface TokenTransfersResponse {
  readonly transfers: readonly TokenTransfer[];
  readonly total: number;
  readonly page: number;
  readonly limit: number;
}

/**
 * Token module for ERC20/token operations
 */
export class TokenModule {
  constructor(private readonly axios: AxiosInstance) {}

  /**
   * Get total supply for a token contract
   */
  async getSupply(contractAddress: string): Promise<TokenSupplyResponse> {
    const response = await this.axios.get<TokenSupplyResponse>('/token/tokensupply', {
      params: { contractaddress: contractAddress },
    });
    return response.data;
  }

  /**
   * Get token balance for an address
   */
  async getBalance(contractAddress: string, address: string): Promise<TokenBalanceResponse> {
    const response = await this.axios.get<TokenBalanceResponse>('/token/tokenaccountbalance', {
      params: { contractaddress: contractAddress, address },
    });
    return response.data;
  }

  /**
   * Get token information and metadata
   */
  async getInfo(contractAddress: string): Promise<TokenInfo> {
    const response = await this.axios.get<TokenInfo>('/token/tokeninfo', {
      params: { contractaddress: contractAddress },
    });
    return response.data;
  }

  /**
   * Get token transfer history
   */
  async getTransfers(
    contractAddress: string,
    page: number = 1,
    limit: number = 10
  ): Promise<TokenTransfersResponse> {
    const response = await this.axios.get<TokenTransfersResponse>('/token/tokentx', {
      params: { contractaddress: contractAddress, page, limit },
    });
    return response.data;
  }
}

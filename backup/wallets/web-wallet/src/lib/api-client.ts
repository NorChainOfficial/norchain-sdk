/**
 * API Client for Wallet
 * Connects to Unified API for wallet-related operations
 */

const API_BASE_URL = process.env.NEXT_PUBLIC_API_URL || 'http://localhost:4000/api/v1';

export interface ApiResponse<T> {
  success: boolean;
  data?: T;
  error?: string;
  message?: string;
}

export class ApiClient {
  private baseUrl: string;

  constructor(baseUrl: string = API_BASE_URL) {
    this.baseUrl = baseUrl;
  }

  private async request<T>(
    endpoint: string,
    options: RequestInit = {}
  ): Promise<ApiResponse<T>> {
    try {
      const url = `${this.baseUrl}${endpoint}`;
      const response = await fetch(url, {
        ...options,
        headers: {
          'Content-Type': 'application/json',
          ...options.headers,
        },
      });

      const data = await response.json();

      if (!response.ok) {
        return {
          success: false,
          error: data.message || `HTTP ${response.status}`,
        };
      }

      return {
        success: true,
        data: data.data || data,
      };
    } catch (error: any) {
      return {
        success: false,
        error: error.message || 'Network error',
      };
    }
  }

  // Wallet endpoints
  async getWalletBalance(address: string): Promise<ApiResponse<{ balance: string }>> {
    return this.request(`/account/${address}/balance`);
  }

  async getWalletTransactions(
    address: string,
    limit: number = 50
  ): Promise<ApiResponse<any[]>> {
    return this.request(`/account/${address}/transactions?limit=${limit}`);
  }

  async getTransaction(txHash: string): Promise<ApiResponse<any>> {
    return this.request(`/transaction/${txHash}`);
  }

  async getAccountInfo(address: string): Promise<ApiResponse<any>> {
    return this.request(`/account/${address}`);
  }

  // Health check
  async healthCheck(): Promise<ApiResponse<{ status: string }>> {
    return this.request('/health');
  }
}

// Singleton instance
export const apiClient = new ApiClient();


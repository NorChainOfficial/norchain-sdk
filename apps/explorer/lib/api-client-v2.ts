/**
 * Enhanced API Client V2 with Enterprise Features
 * Integrates Circuit Breaker, Retry Handler, and Cache Manager
 *
 * Features:
 * - Automatic circuit breaking for failing services
 * - Exponential backoff retry logic
 * - Response caching with TTL
 * - Full TypeScript type safety
 * - Comprehensive error handling
 * - All backend API endpoints
 */

import { CircuitBreaker } from './circuit-breaker';
import { RetryHandler } from './retry-handler';
import { CacheManager, createCacheKey } from './cache-manager';

// ============================================================================
// TypeScript Types
// ============================================================================

export interface ApiResponse<T> {
  readonly data: T;
  readonly status: number;
  readonly message?: string;
}

export interface PaginatedResponse<T> {
  readonly data: T[];
  readonly pagination: {
    readonly page: number;
    readonly limit: number;
    readonly total: number;
    readonly totalPages: number;
  };
}

export interface Block {
  readonly height: number;
  readonly hash: string;
  readonly timestamp: string;
  readonly transaction_count: number;
  readonly miner: string;
  readonly difficulty: string;
  readonly gas_used: string;
  readonly gas_limit: string;
  readonly size: number;
}

export interface Transaction {
  readonly hash: string;
  readonly from: string;
  readonly to: string;
  readonly value: string;
  readonly gas_price: string;
  readonly gas_used: string;
  readonly block_height: number;
  readonly timestamp: string;
  readonly status: 'success' | 'failed' | 'pending';
  readonly input?: string;
}

export interface Account {
  readonly address: string;
  readonly balance: string;
  readonly transaction_count: number;
  readonly created_at: string;
  readonly updated_at: string;
}

export interface Contract {
  readonly address: string;
  readonly name?: string;
  readonly compiler_version?: string;
  readonly optimization_enabled?: boolean;
  readonly source_code?: string;
  readonly abi?: any[];
  readonly verified: boolean;
  readonly created_at: string;
}

export interface NetworkStats {
  readonly total_blocks: number;
  readonly total_transactions: number;
  readonly total_accounts: number;
  readonly average_block_time: number;
  readonly tps: number;
  readonly pending_transactions: number;
}

export interface GasPrice {
  readonly slow: string;
  readonly standard: string;
  readonly fast: string;
  readonly instant: string;
  readonly timestamp: string;
}

export interface AIDecodeResult {
  readonly hash: string;
  readonly method: string;
  readonly method_signature?: string;
  readonly parameters: Record<string, any>;
  readonly description: string;
  readonly confidence: number;
  readonly contract_name?: string;
  readonly contract_type?: string;
  readonly risk_level?: 'low' | 'medium' | 'high';
  readonly warnings?: string[];
}

export interface SearchResult {
  readonly type: 'block' | 'transaction' | 'account' | 'contract';
  readonly data: Block | Transaction | Account | Contract;
}

// ============================================================================
// API Client Configuration
// ============================================================================

export interface ApiClientConfig {
  readonly baseUrl?: string;
  readonly timeout?: number;
  readonly circuitBreaker?: {
    readonly failureThreshold?: number;
    readonly successThreshold?: number;
    readonly timeout?: number;
  };
  readonly retry?: {
    readonly maxRetries?: number;
    readonly baseDelay?: number;
    readonly maxDelay?: number;
  };
  readonly cache?: {
    readonly ttl?: number;
    readonly maxSize?: number;
  };
}

// ============================================================================
// Enhanced API Client Class
// ============================================================================

export class NoorApiClient {
  private readonly baseUrl: string;
  private readonly timeout: number;
  private readonly circuitBreaker: CircuitBreaker;
  private readonly retryHandler: RetryHandler;
  private readonly cache: CacheManager;

  constructor(config: ApiClientConfig = {}) {
    this.baseUrl = config.baseUrl || process.env.NEXT_PUBLIC_API_URL || 'http://localhost:4000/api/v1';
    this.timeout = config.timeout || 30000;

    // Initialize Circuit Breaker
    this.circuitBreaker = new CircuitBreaker({
      failureThreshold: config.circuitBreaker?.failureThreshold || 5,
      successThreshold: config.circuitBreaker?.successThreshold || 2,
      timeout: config.circuitBreaker?.timeout || 60000,
    });

    // Initialize Retry Handler
    this.retryHandler = new RetryHandler({
      maxRetries: config.retry?.maxRetries || 3,
      baseDelay: config.retry?.baseDelay || 1000,
      maxDelay: config.retry?.maxDelay || 30000,
      exponentialBase: 2,
      jitter: true,
    });

    // Initialize Cache Manager
    this.cache = new CacheManager({
      ttl: config.cache?.ttl || 5000,
      maxSize: config.cache?.maxSize || 1000,
      cleanupInterval: 60000,
    });
  }

  // ==========================================================================
  // Core Request Method
  // ==========================================================================

  private async request<T>(
    endpoint: string,
    options: RequestInit = {},
    useCache: boolean = true
  ): Promise<ApiResponse<T>> {
    const url = `${this.baseUrl}${endpoint}`;
    const cacheKey = createCacheKey('api', endpoint, JSON.stringify(options));

    // Check cache first
    if (useCache && options.method === 'GET') {
      const cached = this.cache.get<ApiResponse<T>>(cacheKey);
      if (cached) {
        return cached;
      }
    }

    // Execute request with circuit breaker and retry logic
    const response = await this.circuitBreaker.execute(async () => {
      return await this.retryHandler.execute(async () => {
        const controller = new AbortController();
        const timeoutId = setTimeout(() => controller.abort(), this.timeout);

        try {
          const res = await fetch(url, {
            ...options,
            signal: controller.signal,
            headers: {
              'Content-Type': 'application/json',
              ...options.headers,
            },
          });

          clearTimeout(timeoutId);

          if (!res.ok) {
            const error = new Error(`HTTP ${res.status}: ${res.statusText}`);
            (error as any).statusCode = res.status;
            throw error;
          }

          const data = await res.json();
          return {
            data: data.data || data,
            status: res.status,
            message: data.message,
          };
        } catch (error) {
          clearTimeout(timeoutId);
          throw error;
        }
      });
    });

    // Cache successful GET requests
    if (useCache && options.method === 'GET') {
      this.cache.set(cacheKey, response);
    }

    return response;
  }

  // ==========================================================================
  // Blocks API
  // ==========================================================================

  async getBlocks(page: number = 1, limit: number = 20): Promise<PaginatedResponse<Block>> {
    const response = await this.request<Block[]>(`/blocks?page=${page}&limit=${limit}`);
    return response.data as any;
  }

  async getBlock(heightOrHash: string | number): Promise<Block> {
    const response = await this.request<Block>(`/blocks/${heightOrHash}`);
    return response.data;
  }

  async getBlockTransactions(
    heightOrHash: string | number,
    page: number = 1,
    limit: number = 20
  ): Promise<PaginatedResponse<Transaction>> {
    const response = await this.request<Transaction[]>(
      `/blocks/${heightOrHash}/transactions?page=${page}&limit=${limit}`
    );
    return response.data as any;
  }

  // ==========================================================================
  // Transactions API
  // ==========================================================================

  async getTransactions(page: number = 1, limit: number = 20): Promise<PaginatedResponse<Transaction>> {
    const response = await this.request<Transaction[]>(`/transactions?page=${page}&limit=${limit}`);
    return response.data as any;
  }

  async getTransaction(hash: string): Promise<Transaction> {
    const response = await this.request<Transaction>(`/transactions/${hash}`);
    return response.data;
  }

  async decodeTransaction(hash: string): Promise<any> {
    const response = await this.request<any>(`/transactions/${hash}/decode`);
    return response.data;
  }

  // ==========================================================================
  // Accounts API
  // ==========================================================================

  async getAccount(address: string): Promise<Account> {
    const response = await this.request<Account>(`/accounts/${address}`);
    return response.data;
  }

  async getAccountTransactions(
    address: string,
    page: number = 1,
    limit: number = 20
  ): Promise<PaginatedResponse<Transaction>> {
    const response = await this.request<Transaction[]>(
      `/accounts/${address}/transactions?page=${page}&limit=${limit}`
    );
    return response.data as any;
  }

  async getAccountBalance(address: string): Promise<{ balance: string }> {
    const response = await this.request<{ balance: string }>(`/accounts/${address}/balance`);
    return response.data;
  }

  // ==========================================================================
  // Contracts API
  // ==========================================================================

  async getContract(address: string): Promise<Contract> {
    const response = await this.request<Contract>(`/contracts/${address}`);
    return response.data;
  }

  async getContractABI(address: string): Promise<any[]> {
    const response = await this.request<any[]>(`/contracts/${address}/abi`);
    return response.data;
  }

  async verifyContract(
    address: string,
    sourceCode: string,
    compilerVersion: string,
    optimizationEnabled: boolean
  ): Promise<{ verified: boolean; message: string }> {
    const response = await this.request<{ verified: boolean; message: string }>(
      `/contracts/${address}/verify`,
      {
        method: 'POST',
        body: JSON.stringify({
          source_code: sourceCode,
          compiler_version: compilerVersion,
          optimization_enabled: optimizationEnabled,
        }),
      },
      false
    );
    return response.data;
  }

  // ==========================================================================
  // Stats & Analytics API
  // ==========================================================================

  async getNetworkStats(): Promise<NetworkStats> {
    const response = await this.request<NetworkStats>('/stats/network');
    return response.data;
  }

  async getGasPrices(): Promise<GasPrice> {
    const response = await this.request<GasPrice>('/stats/gas');
    return response.data;
  }

  async getTokenMetrics(): Promise<any> {
    const response = await this.request<any>('/stats/tokens');
    return response.data;
  }

  async getChartData(type: string, period: string): Promise<any> {
    const response = await this.request<any>(`/stats/charts/${type}?period=${period}`);
    return response.data;
  }

  // ==========================================================================
  // AI Features API
  // ==========================================================================

  async decodeWithAI(hash: string): Promise<AIDecodeResult> {
    const response = await this.request<AIDecodeResult>(
      `/ai/decode/${hash}`,
      {},
      false // Don't cache AI results
    );
    return response.data;
  }

  async predictGasPrice(): Promise<{ prediction: string; confidence: number }> {
    const response = await this.request<{ prediction: string; confidence: number }>(
      '/ai/gas-prediction',
      {},
      false
    );
    return response.data;
  }

  async analyzeContract(address: string): Promise<any> {
    const response = await this.request<any>(`/ai/analyze-contract/${address}`, {}, false);
    return response.data;
  }

  // ==========================================================================
  // Search API
  // ==========================================================================

  async search(query: string): Promise<SearchResult[]> {
    const response = await this.request<SearchResult[]>(`/search?q=${encodeURIComponent(query)}`);
    return response.data;
  }

  // ==========================================================================
  // Utility Methods
  // ==========================================================================

  /**
   * Get statistics for all services
   */
  getStats() {
    return {
      circuitBreaker: this.circuitBreaker.getStats(),
      retry: this.retryHandler.getStats(),
      cache: this.cache.getStats(),
    };
  }

  /**
   * Clear all caches
   */
  clearCache(): void {
    this.cache.clear();
  }

  /**
   * Invalidate cache entries matching pattern
   */
  invalidateCache(pattern: RegExp): number {
    return this.cache.invalidatePattern(pattern);
  }

  /**
   * Reset circuit breaker
   */
  resetCircuitBreaker(): void {
    this.circuitBreaker.reset();
  }

  /**
   * Force circuit breaker to open (maintenance mode)
   */
  forceCircuitBreakerOpen(): void {
    this.circuitBreaker.forceOpen();
  }

  /**
   * Destroy client and cleanup resources
   */
  destroy(): void {
    this.cache.destroy();
  }
}

// ============================================================================
// Singleton Instance Export
// ============================================================================

let apiClientInstance: NoorApiClient | null = null;

export function getApiClient(config?: ApiClientConfig): NoorApiClient {
  if (!apiClientInstance) {
    apiClientInstance = new NoorApiClient(config);
  }
  return apiClientInstance;
}

export default NoorApiClient;

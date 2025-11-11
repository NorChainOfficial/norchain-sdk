import axios, { AxiosInstance, AxiosRequestConfig, AxiosError } from 'axios';
import { v4 as uuidv4 } from 'uuid';
import { AccountModule } from './modules/account';
import { AuthModule } from './modules/auth';
import { BlockchainModule } from './modules/blockchain';
import { BridgeModule } from './modules/bridge';
import { ComplianceModule } from './modules/compliance';
import { GovernanceModule } from './modules/governance';
import { WalletModule } from './modules/wallet';
import { SwapModule } from './modules/swap';
import { TransactionModule } from './modules/transaction';
import { TokenModule } from './modules/token';
import { PaymentModule } from './modules/payment';
import { OrderModule } from './modules/order';
import { GasModule } from './modules/gas';
import { WebSocketClient, WebSocketConfig } from './websocket';

export interface NorChainClientConfig {
  readonly baseUrl: string;
  readonly apiKey?: string;
  readonly token?: string;
  readonly timeout?: number;
  readonly retries?: number;
  readonly retryDelay?: number;
  readonly websocket?: WebSocketConfig;
}

export interface RequestConfig extends AxiosRequestConfig {
  retryCount?: number;
}

/**
 * Main NorChain SDK Client
 *
 * Provides type-safe access to all NorChain API endpoints
 *
 * @example
 * ```typescript
 * const client = new NorChainClient({
 *   baseUrl: 'https://api.norchain.org/api/v1',
 *   apiKey: 'nk_xxx'
 * });
 *
 * const balance = await client.account.getBalance('0x...');
 * ```
 */
export class NorChainClient {
  private readonly axiosInstance: AxiosInstance;
  private websocketClient: WebSocketClient | null = null;
  private mutableConfig: { apiKey?: string; token?: string; websocket?: WebSocketConfig };

  // API Modules
  public readonly account: AccountModule;
  public readonly auth: AuthModule;
  public readonly blockchain: BlockchainModule;
  public readonly bridge: BridgeModule;
  public readonly compliance: ComplianceModule;
  public readonly governance: GovernanceModule;
  public readonly wallet: WalletModule;
  public readonly swap: SwapModule;
  public readonly transaction: TransactionModule;
  public readonly token: TokenModule;
  public readonly payment: PaymentModule;
  public readonly order: OrderModule;
  public readonly gas: GasModule;

  constructor(private readonly config: NorChainClientConfig) {
    // Create mutable copy of config for updates
    this.mutableConfig = {
      apiKey: config.apiKey,
      token: config.token,
      websocket: config.websocket,
    };

    // Create axios instance with configuration
    this.axiosInstance = axios.create({
      baseURL: config.baseUrl,
      timeout: config.timeout || 30000,
      headers: {
        'Content-Type': 'application/json',
        ...(config.apiKey && { 'X-API-Key': config.apiKey }),
        ...(config.token && { Authorization: `Bearer ${config.token}` }),
      },
    });

    // Add request interceptor for tracing and idempotency
    this.axiosInstance.interceptors.request.use(
      (requestConfig) => {
        // Add trace ID to all requests for debugging
        if (!requestConfig.headers['X-Trace-ID']) {
          requestConfig.headers['X-Trace-ID'] = uuidv4();
        }
        return requestConfig;
      },
      (error) => Promise.reject(error)
    );

    // Add response interceptor for error handling and retries
    this.axiosInstance.interceptors.response.use(
      (response) => response,
      async (error: AxiosError) => {
        const requestConfig = error.config as RequestConfig;

        if (!requestConfig) {
          return Promise.reject(error);
        }

        const maxRetries = config.retries ?? 3;
        const retryDelay = config.retryDelay ?? 1000;
        const retryCount = requestConfig.retryCount ?? 0;

        // Retry on network errors or 5xx errors
        const shouldRetry =
          (!error.response || (error.response.status >= 500 && error.response.status < 600)) &&
          retryCount < maxRetries;

        if (shouldRetry) {
          requestConfig.retryCount = retryCount + 1;

          // Exponential backoff with jitter
          const delay = retryDelay * Math.pow(2, retryCount) + Math.random() * 1000;
          await new Promise((resolve) => setTimeout(resolve, delay));

          return this.axiosInstance(requestConfig);
        }

        // Handle rate limiting
        if (error.response?.status === 429) {
          const retryAfter = error.response.headers['retry-after'];
          const retryAfterMs = retryAfter ? parseInt(retryAfter, 10) * 1000 : 60000;

          const rateLimitError = new Error(
            `Rate limit exceeded. Retry after ${retryAfterMs}ms`
          );
          (rateLimitError as any).retryAfter = retryAfterMs;
          return Promise.reject(rateLimitError);
        }

        return Promise.reject(error);
      }
    );

    // Initialize all API modules
    this.account = new AccountModule(this.axiosInstance);
    this.auth = new AuthModule(this.axiosInstance);
    this.blockchain = new BlockchainModule(this.axiosInstance);
    this.bridge = new BridgeModule(this.axiosInstance);
    this.compliance = new ComplianceModule(this.axiosInstance);
    this.governance = new GovernanceModule(this.axiosInstance);
    this.wallet = new WalletModule(this.axiosInstance);
    this.swap = new SwapModule(this.axiosInstance);
    this.transaction = new TransactionModule(this.axiosInstance);
    this.token = new TokenModule(this.axiosInstance);
    this.payment = new PaymentModule(this.axiosInstance);
    this.order = new OrderModule(this.axiosInstance);
    this.gas = new GasModule(this.axiosInstance);
  }

  /**
   * Set authentication token for subsequent requests
   */
  setToken(token: string): void {
    this.axiosInstance.defaults.headers.common['Authorization'] = `Bearer ${token}`;
    this.mutableConfig.token = token;

    // Update WebSocket token if connected
    if (this.websocketClient && this.mutableConfig.websocket) {
      this.websocketClient.disconnect();
      this.mutableConfig.websocket = { ...this.mutableConfig.websocket, token };
      this.websocketClient = new WebSocketClient(this.mutableConfig.websocket);
      this.websocketClient.connect();
    }
  }

  /**
   * Set API key for subsequent requests
   */
  setApiKey(apiKey: string): void {
    this.axiosInstance.defaults.headers.common['X-API-Key'] = apiKey;
    this.mutableConfig.apiKey = apiKey;

    // Update WebSocket API key if connected
    if (this.websocketClient && this.mutableConfig.websocket) {
      this.websocketClient.disconnect();
      this.mutableConfig.websocket = { ...this.mutableConfig.websocket, apiKey };
      this.websocketClient = new WebSocketClient(this.mutableConfig.websocket);
      this.websocketClient.connect();
    }
  }

  /**
   * Generate a unique idempotency key for safe retries
   */
  generateIdempotencyKey(): string {
    return uuidv4();
  }

  /**
   * Get or create WebSocket client for real-time updates
   */
  getWebSocket(): WebSocketClient {
    if (!this.websocketClient) {
      const wsConfig: WebSocketConfig = this.mutableConfig.websocket || {
        url: this.config.baseUrl.replace(/^http/, 'ws'),
        apiKey: this.mutableConfig.apiKey,
        token: this.mutableConfig.token,
      };

      this.websocketClient = new WebSocketClient(wsConfig);
    }

    if (!this.websocketClient.isConnected()) {
      this.websocketClient.connect();
    }

    return this.websocketClient;
  }

  /**
   * Close WebSocket connection
   */
  disconnectWebSocket(): void {
    if (this.websocketClient) {
      this.websocketClient.disconnect();
      this.websocketClient = null;
    }
  }

  /**
   * Health check - verify API connectivity
   */
  async healthCheck(): Promise<{ status: string; timestamp: string }> {
    const response = await this.axiosInstance.get('/health');
    return response.data;
  }

  /**
   * Get SDK version
   */
  getVersion(): string {
    return '1.0.0';
  }
}

/**
 * Legacy export for backwards compatibility
 */
export { NorChainClient as NorClient };

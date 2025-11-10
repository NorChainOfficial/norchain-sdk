import axios, { AxiosInstance, AxiosRequestConfig } from 'axios';
import { v4 as uuidv4 } from 'uuid';
import { AccountModule } from './modules/account';
import { AuthModule } from './modules/auth';
import { BridgeModule } from './modules/bridge';
import { ComplianceModule } from './modules/compliance';
import { GovernanceModule } from './modules/governance';
import { WalletModule } from './modules/wallet';
import { SwapModule } from './modules/swap';
import { TransactionModule } from './modules/transaction';

export interface NorClientConfig {
  baseUrl: string;
  apiKey?: string;
  token?: string;
  timeout?: number;
  retries?: number;
  retryDelay?: number;
}

export class NorClient {
  private axiosInstance: AxiosInstance;
  public account: AccountModule;
  public auth: AuthModule;
  public bridge: BridgeModule;
  public compliance: ComplianceModule;
  public governance: GovernanceModule;
  public wallet: WalletModule;
  public swap: SwapModule;
  public transaction: TransactionModule;

  constructor(config: NorClientConfig) {
    this.axiosInstance = axios.create({
      baseURL: config.baseUrl,
      timeout: config.timeout || 30000,
      headers: {
        'Content-Type': 'application/json',
        ...(config.apiKey && { 'X-API-Key': config.apiKey }),
        ...(config.token && { Authorization: `Bearer ${config.token}` }),
      },
    });

    // Add request interceptor for idempotency and retries
    this.axiosInstance.interceptors.request.use((config) => {
      // Add trace ID to all requests
      config.headers['X-Trace-ID'] = uuidv4();
      return config;
    });

    // Add response interceptor for error handling
    this.axiosInstance.interceptors.response.use(
      (response) => response,
      async (error) => {
        const config = error.config;
        const retries = config.retries || config.retries === 0 ? config.retries : 3;
        const retryDelay = config.retryDelay || 1000;

        // Retry on network errors or 5xx errors
        if (
          (!error.response || (error.response.status >= 500 && error.response.status < 600)) &&
          config.retryCount < retries
        ) {
          config.retryCount = config.retryCount || 0;
          config.retryCount += 1;

          // Exponential backoff
          const delay = retryDelay * Math.pow(2, config.retryCount - 1);
          await new Promise((resolve) => setTimeout(resolve, delay));

          return this.axiosInstance(config);
        }

        return Promise.reject(error);
      },
    );

    // Initialize modules
    this.account = new AccountModule(this.axiosInstance);
    this.auth = new AuthModule(this.axiosInstance);
    this.bridge = new BridgeModule(this.axiosInstance);
    this.compliance = new ComplianceModule(this.axiosInstance);
    this.governance = new GovernanceModule(this.axiosInstance);
    this.wallet = new WalletModule(this.axiosInstance);
    this.swap = new SwapModule(this.axiosInstance);
    this.transaction = new TransactionModule(this.axiosInstance);
  }

  /**
   * Set authentication token
   */
  setToken(token: string): void {
    this.axiosInstance.defaults.headers.common['Authorization'] = `Bearer ${token}`;
  }

  /**
   * Set API key
   */
  setApiKey(apiKey: string): void {
    this.axiosInstance.defaults.headers.common['X-API-Key'] = apiKey;
  }

  /**
   * Generate idempotency key
   */
  generateIdempotencyKey(): string {
    return uuidv4();
  }
}


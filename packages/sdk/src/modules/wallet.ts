import { AxiosInstance } from 'axios';
import { CreateWalletDto, ImportWalletDto, SendTransactionDto } from '../types';

export class WalletModule {
  constructor(private axios: AxiosInstance) {}

  /**
   * Create a new wallet
   */
  async create(dto: CreateWalletDto) {
    const response = await this.axios.post('/api/v1/wallet', dto);
    return response.data;
  }

  /**
   * Import an existing wallet
   */
  async import(dto: ImportWalletDto) {
    const response = await this.axios.post('/api/v1/wallet/import', dto);
    return response.data;
  }

  /**
   * List all wallets
   */
  async list() {
    const response = await this.axios.get('/api/v1/wallet');
    return response.data;
  }

  /**
   * Get wallet details
   */
  async get(address: string) {
    const response = await this.axios.get(`/api/v1/wallet/${address}`);
    return response.data;
  }

  /**
   * Get wallet balance
   */
  async getBalance(address: string) {
    const response = await this.axios.get(`/api/v1/wallet/${address}/balance`);
    return response.data;
  }

  /**
   * Get wallet tokens
   */
  async getTokens(address: string) {
    const response = await this.axios.get(`/api/v1/wallet/${address}/tokens`);
    return response.data;
  }

  /**
   * Get wallet transactions
   */
  async getTransactions(address: string) {
    const response = await this.axios.get(`/api/v1/wallet/${address}/transactions`);
    return response.data;
  }

  /**
   * Send transaction from wallet
   */
  async send(address: string, dto: SendTransactionDto) {
    const response = await this.axios.post(`/api/v1/wallet/${address}/send`, dto);
    return response.data;
  }

  /**
   * Delete a wallet
   */
  async delete(address: string) {
    const response = await this.axios.delete(`/api/v1/wallet/${address}`);
    return response.data;
  }
}


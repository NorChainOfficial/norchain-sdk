import { AxiosInstance } from 'axios';

export class AccountModule {
  constructor(private axios: AxiosInstance) {}

  /**
   * Get balance for an address
   */
  async getBalance(address: string) {
    const response = await this.axios.get('/api/v1/account/balance', {
      params: { address },
    });
    return response.data;
  }

  /**
   * Get account summary
   */
  async getSummary(address: string) {
    const response = await this.axios.get('/api/v1/account/summary', {
      params: { address },
    });
    return response.data;
  }
}


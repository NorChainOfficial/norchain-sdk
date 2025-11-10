import { AxiosInstance } from 'axios';

export interface BroadcastTransactionDto {
  signedTransaction: string;
}

export class TransactionModule {
  constructor(private axios: AxiosInstance) {}

  /**
   * Broadcast a signed transaction
   */
  async broadcast(dto: BroadcastTransactionDto) {
    const response = await this.axios.post('/api/v1/transaction/broadcast', dto);
    return response.data;
  }

  /**
   * Get transaction details
   */
  async get(txHash: string) {
    const response = await this.axios.get(`/api/v1/transaction/${txHash}`);
    return response.data;
  }
}


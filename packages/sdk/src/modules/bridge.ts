import { AxiosInstance } from 'axios';
import { CreateBridgeQuoteDto, CreateBridgeTransferDto } from '../types';

export class BridgeModule {
  constructor(private axios: AxiosInstance) {}

  /**
   * Get a quote for a bridge transfer
   */
  async getQuote(dto: CreateBridgeQuoteDto) {
    const response = await this.axios.post('/api/v1/bridge/quotes', dto);
    return response.data;
  }

  /**
   * Create a bridge transfer (with idempotency support)
   */
  async createTransfer(
    dto: CreateBridgeTransferDto,
    options?: { idempotencyKey?: string },
  ) {
    const headers: Record<string, string> = {};
    if (options?.idempotencyKey) {
      headers['Idempotency-Key'] = options.idempotencyKey;
    }

    const response = await this.axios.post('/api/v1/bridge/transfers', dto, {
      headers,
    });
    return response.data;
  }

  /**
   * Get all bridge transfers
   */
  async getTransfers(limit?: number, offset?: number) {
    const response = await this.axios.get('/api/v1/bridge/transfers', {
      params: { limit, offset },
    });
    return response.data;
  }

  /**
   * Get transfer details
   */
  async getTransfer(transferId: string) {
    const response = await this.axios.get(`/api/v1/bridge/transfers/${transferId}`);
    return response.data;
  }

  /**
   * Get transfer proof
   */
  async getTransferProof(transferId: string) {
    const response = await this.axios.get(
      `/api/v1/bridge/transfers/${transferId}/proof`,
    );
    return response.data;
  }
}


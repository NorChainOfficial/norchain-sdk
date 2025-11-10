import { AxiosInstance } from 'axios';
import { GetQuoteDto, ExecuteSwapDto } from '../types';

export class SwapModule {
  constructor(private axios: AxiosInstance) {}

  /**
   * Get swap quote
   */
  async getQuote(dto: GetQuoteDto) {
    const response = await this.axios.post('/api/v1/swap/quote', dto);
    return response.data;
  }

  /**
   * Execute swap
   */
  async execute(dto: ExecuteSwapDto, options?: { idempotencyKey?: string }) {
    const headers: Record<string, string> = {};
    if (options?.idempotencyKey) {
      headers['Idempotency-Key'] = options.idempotencyKey;
    }

    const response = await this.axios.post('/api/v1/swap/execute', dto, {
      headers,
    });
    return response.data;
  }
}


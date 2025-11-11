import { AxiosInstance } from 'axios';

export interface GetQuoteDto {
  readonly tokenIn: string;
  readonly tokenOut: string;
  readonly amountIn: string;
  readonly chainId: string;
}

export interface ExecuteSwapDto {
  readonly quoteId: string;
  readonly signedTx: string;
  readonly userAddress: string;
}

export class SwapModule {
  constructor(private readonly axios: AxiosInstance) {}

  /**
   * Get swap quote
   */
  async getQuote(dto: GetQuoteDto): Promise<any> {
    const response = await this.axios.post('/api/v1/swap/quote', dto);
    return response.data;
  }

  /**
   * Execute swap
   */
  async execute(dto: ExecuteSwapDto, options?: { idempotencyKey?: string }): Promise<any> {
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

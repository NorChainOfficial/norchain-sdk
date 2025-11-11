import { AxiosInstance } from 'axios';

export interface GasPrices {
  readonly slow: string;
  readonly standard: string;
  readonly fast: string;
  readonly instant: string;
  readonly timestamp: string;
}

export interface GasPrediction {
  readonly blockNumber: string;
  readonly predictedGasPrice: string;
  readonly confidence: number;
  readonly factors: readonly string[];
}

export interface GasHistoryEntry {
  readonly blockNumber: string;
  readonly gasPrice: string;
  readonly gasUsed: string;
  readonly timestamp: string;
}

export interface GasHistoryResponse {
  readonly history: readonly GasHistoryEntry[];
  readonly average: string;
  readonly median: string;
}

/**
 * Gas module for gas price tracking and prediction
 */
export class GasModule {
  constructor(private readonly axios: AxiosInstance) {}

  /**
   * Get current gas prices with different speed options
   */
  async getCurrentPrices(): Promise<GasPrices> {
    const response = await this.axios.get<GasPrices>('/gas/prices');
    return response.data;
  }

  /**
   * Get gas price prediction for future blocks
   */
  async getPrediction(blocks: number = 10): Promise<GasPrediction> {
    const response = await this.axios.get<GasPrediction>('/gas/prediction', {
      params: { blocks },
    });
    return response.data;
  }

  /**
   * Get historical gas price data
   */
  async getHistory(
    fromBlock?: string,
    toBlock?: string,
    limit: number = 100
  ): Promise<GasHistoryResponse> {
    const response = await this.axios.get<GasHistoryResponse>('/gas/history', {
      params: { fromBlock, toBlock, limit },
    });
    return response.data;
  }

  /**
   * Estimate gas for a transaction
   */
  async estimateGas(transaction: {
    readonly from?: string;
    readonly to: string;
    readonly data?: string;
    readonly value?: string;
  }): Promise<{ gasEstimate: string; gasPrice: string }> {
    const response = await this.axios.post('/gas/estimate', transaction);
    return response.data;
  }
}

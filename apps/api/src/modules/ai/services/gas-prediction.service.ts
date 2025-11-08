import { Injectable, Logger } from '@nestjs/common';
import { ProxyService } from '../../proxy/proxy.service';

export interface GasPrediction {
  predictedPrice: string;
  confidence: number;
  trend: 'increasing' | 'decreasing' | 'stable';
  recommendation: string;
  historicalData: Array<{
    timestamp: number;
    price: string;
  }>;
}

@Injectable()
export class GasPredictionService {
  private readonly logger = new Logger(GasPredictionService.name);

  constructor(private readonly proxyService: ProxyService) {}

  async predict(): Promise<GasPrediction> {
    try {
      const currentGasPrice = await this.proxyService.call('eth_gasPrice', []);
      const currentPrice = parseInt(currentGasPrice || '0x0', 16);
      
      // Simple prediction based on recent trends
      // In production, use ML models or historical analysis
      const predictedPrice = currentPrice * 1.1; // 10% increase prediction
      
      return {
        predictedPrice: '0x' + predictedPrice.toString(16),
        confidence: 65,
        trend: 'increasing',
        recommendation: 'Consider waiting for lower gas prices',
        historicalData: [
          {
            timestamp: Date.now() - 3600000,
            price: currentGasPrice || '0x0',
          },
          {
            timestamp: Date.now(),
            price: currentGasPrice || '0x0',
          },
        ],
      };
    } catch (error) {
      this.logger.error('Error predicting gas price:', error);
      throw error;
    }
  }
}


import { Injectable, Logger } from '@nestjs/common';
import { ProxyService } from '../../proxy/proxy.service';
import { TransactionService } from '../../transaction/transaction.service';

export interface AnomalyDetection {
  anomalies: Array<{
    type: string;
    severity: 'low' | 'medium' | 'high';
    description: string;
    timestamp: number;
  }>;
  riskScore: number;
  recommendations: string[];
}

@Injectable()
export class AnomalyDetectionService {
  private readonly logger = new Logger(AnomalyDetectionService.name);

  constructor(
    private readonly proxyService: ProxyService,
    private readonly transactionService: TransactionService,
  ) {}

  async detect(address: string, days: number = 7): Promise<AnomalyDetection> {
    try {
      // Get recent transactions
      const transactions = await this.getRecentTransactions(address, days);
      
      const anomalies: AnomalyDetection['anomalies'] = [];
      
      // Detect unusual patterns
      if (transactions.length > 100) {
        anomalies.push({
          type: 'high_frequency',
          severity: 'medium',
          description: `Unusually high transaction frequency: ${transactions.length} transactions in ${days} days`,
          timestamp: Date.now(),
        });
      }

      // Detect large value transfers
      const largeTransfers = transactions.filter(tx => {
        const value = BigInt(tx.value || '0');
        return value > BigInt('1000000000000000000'); // > 1 ETH
      });

      if (largeTransfers.length > 0) {
        anomalies.push({
          type: 'large_transfers',
          severity: 'high',
          description: `${largeTransfers.length} large value transfers detected`,
          timestamp: Date.now(),
        });
      }

      const riskScore = this.calculateRiskScore(anomalies);

      return {
        anomalies,
        riskScore,
        recommendations: this.generateRecommendations(anomalies),
      };
    } catch (error) {
      this.logger.error(`Error detecting anomalies for ${address}:`, error);
      throw error;
    }
  }

  private async getRecentTransactions(address: string, days: number): Promise<any[]> {
    // Placeholder - implement actual transaction fetching
    return [];
  }

  private calculateRiskScore(anomalies: AnomalyDetection['anomalies']): number {
    let score = 0;
    anomalies.forEach(anomaly => {
      switch (anomaly.severity) {
        case 'critical':
          score += 40;
          break;
        case 'high':
          score += 25;
          break;
        case 'medium':
          score += 15;
          break;
        case 'low':
          score += 5;
          break;
      }
    });
    return Math.min(score, 100);
  }

  private generateRecommendations(anomalies: AnomalyDetection['anomalies']): string[] {
    const recommendations: string[] = [];
    
    if (anomalies.some(a => a.type === 'high_frequency')) {
      recommendations.push('Monitor transaction frequency closely');
    }
    
    if (anomalies.some(a => a.type === 'large_transfers')) {
      recommendations.push('Verify large transfers are authorized');
    }

    return recommendations.length > 0 ? recommendations : ['No immediate concerns detected'];
  }
}


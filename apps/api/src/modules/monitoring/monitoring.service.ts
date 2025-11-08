import { Injectable, Logger } from '@nestjs/common';
import { PrometheusService } from './services/prometheus.service';
import { ProxyService } from '../proxy/proxy.service';

@Injectable()
export class MonitoringService {
  private readonly logger = new Logger(MonitoringService.name);

  constructor(
    private readonly prometheusService: PrometheusService,
    private readonly proxyService: ProxyService,
  ) {}

  async getHealth() {
    try {
      const blockNumber = await this.proxyService.call('eth_blockNumber', []);
      
      return {
        status: 'healthy',
        timestamp: Date.now(),
        blockNumber: blockNumber || '0x0',
        uptime: process.uptime(),
      };
    } catch (error) {
      this.logger.error('Health check failed:', error);
      return {
        status: 'unhealthy',
        timestamp: Date.now(),
        error: error.message,
      };
    }
  }

  async getStats() {
    try {
      const blockNumber = await this.proxyService.call('eth_blockNumber', []);
      const gasPrice = await this.proxyService.call('eth_gasPrice', []);
      
      return {
        blocksPerSecond: await this.calculateBlocksPerSecond(),
        txpoolSize: 0, // Placeholder
        cpuUsage: process.cpuUsage(),
        memoryUsage: process.memoryUsage(),
        currentBlock: blockNumber || '0x0',
        gasPrice: gasPrice || '0x0',
      };
    } catch (error) {
      this.logger.error('Stats retrieval failed:', error);
      throw error;
    }
  }

  private async calculateBlocksPerSecond(): Promise<number> {
    // Placeholder - implement actual calculation
    return 0.33; // ~3s per block
  }
}


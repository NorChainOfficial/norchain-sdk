import { Injectable, Logger } from '@nestjs/common';
import { PrometheusService } from './services/prometheus.service';
import { RpcService } from '@/common/services/rpc.service';

@Injectable()
export class MonitoringService {
  private readonly logger = new Logger(MonitoringService.name);

  constructor(
    private readonly prometheusService: PrometheusService,
    private readonly rpcService: RpcService,
  ) {}

  async getHealth() {
    try {
      const blockNumber = await this.rpcService.getBlockNumber();

      return {
        status: 'healthy',
        timestamp: Date.now(),
        blockNumber: `0x${blockNumber.toString(16)}`,
        uptime: process.uptime(),
      };
    } catch (error: any) {
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
      const blockNumber = await this.rpcService.getBlockNumber();
      const feeData = await this.rpcService.getFeeData();
      const gasPrice = feeData.gasPrice || BigInt(0);

      return {
        blocksPerSecond: await this.calculateBlocksPerSecond(),
        txpoolSize: 0, // Placeholder
        cpuUsage: process.cpuUsage(),
        memoryUsage: process.memoryUsage(),
        currentBlock: `0x${blockNumber.toString(16)}`,
        gasPrice: `0x${gasPrice.toString(16)}`,
      };
    } catch (error: any) {
      this.logger.error('Stats retrieval failed:', error);
      throw error;
    }
  }

  private async calculateBlocksPerSecond(): Promise<number> {
    // Placeholder - implement actual calculation
    return 0.33; // ~3s per block
  }
}

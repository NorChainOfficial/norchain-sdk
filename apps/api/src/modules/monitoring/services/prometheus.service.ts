import { Injectable, Logger } from '@nestjs/common';
import { RpcService } from '@/common/services/rpc.service';

@Injectable()
export class PrometheusService {
  private readonly logger = new Logger(PrometheusService.name);
  private metrics: Map<string, number> = new Map();

  constructor(private readonly rpcService: RpcService) {
    this.initializeMetrics();
  }

  private initializeMetrics() {
    this.metrics.set('blocks_per_second', 0);
    this.metrics.set('txpool_size', 0);
    this.metrics.set('transactions_per_second', 0);
    this.metrics.set('cpu_usage', 0);
    this.metrics.set('memory_usage', 0);
  }

  async getMetrics(): Promise<string> {
    await this.updateMetrics();
    return this.formatPrometheusMetrics();
  }

  private async updateMetrics() {
    try {
      await this.rpcService.getBlockNumber(); // Verify connection
      this.metrics.set('blocks_per_second', 0.33); // ~3s per block
      this.metrics.set('txpool_size', 0); // Placeholder
      this.metrics.set('transactions_per_second', 0); // Placeholder
      this.metrics.set('cpu_usage', process.cpuUsage().user);
      this.metrics.set('memory_usage', process.memoryUsage().heapUsed);
    } catch (error: any) {
      this.logger.error('Failed to update metrics:', error);
    }
  }

  private formatPrometheusMetrics(): string {
    let output = '# HELP blocks_per_second Blocks produced per second\n';
    output += '# TYPE blocks_per_second gauge\n';
    output += `blocks_per_second ${this.metrics.get('blocks_per_second')}\n\n`;

    output += '# HELP txpool_size Current transaction pool size\n';
    output += '# TYPE txpool_size gauge\n';
    output += `txpool_size ${this.metrics.get('txpool_size')}\n\n`;

    output +=
      '# HELP transactions_per_second Transactions processed per second\n';
    output += '# TYPE transactions_per_second gauge\n';
    output += `transactions_per_second ${this.metrics.get('transactions_per_second')}\n\n`;

    output += '# HELP cpu_usage CPU usage in microseconds\n';
    output += '# TYPE cpu_usage gauge\n';
    output += `cpu_usage ${this.metrics.get('cpu_usage')}\n\n`;

    output += '# HELP memory_usage Memory usage in bytes\n';
    output += '# TYPE memory_usage gauge\n';
    output += `memory_usage ${this.metrics.get('memory_usage')}\n`;

    return output;
  }

  incrementCounter(name: string, value: number = 1) {
    const current = this.metrics.get(name) || 0;
    this.metrics.set(name, current + value);
  }

  setGauge(name: string, value: number) {
    this.metrics.set(name, value);
  }
}

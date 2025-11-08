import { Injectable, Logger } from '@nestjs/common';
import { ProxyService } from '../../proxy/proxy.service';

@Injectable()
export class StateRootService {
  private readonly logger = new Logger(StateRootService.name);

  constructor(private readonly proxyService: ProxyService) {}

  async getStateRoot(blockNumber: string): Promise<{ stateRoot: string; blockNumber: string }> {
    try {
      const block = await this.proxyService.call('eth_getBlockByNumber', [blockNumber, false]);
      return {
        stateRoot: block?.stateRoot || '0x0',
        blockNumber,
      };
    } catch (error) {
      this.logger.error(`Error getting state root for block ${blockNumber}:`, error);
      throw error;
    }
  }
}


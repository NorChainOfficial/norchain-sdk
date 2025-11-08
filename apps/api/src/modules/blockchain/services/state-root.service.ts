import { Injectable, Logger } from '@nestjs/common';
import { ProxyService } from '../../proxy/proxy.service';

@Injectable()
export class StateRootService {
  private readonly logger = new Logger(StateRootService.name);

  constructor(private readonly proxyService: ProxyService) {}

  async getStateRoot(
    blockNumber: string,
  ): Promise<{ stateRoot: string; blockNumber: string }> {
    try {
      const result = await this.proxyService.eth_getBlockByNumber(
        blockNumber,
        false,
      );
      const block = result.status === '1' ? result.result : null;
      return {
        stateRoot: block?.stateRoot || '0x0',
        blockNumber,
      };
    } catch (error: any) {
      this.logger.error(
        `Error getting state root for block ${blockNumber}:`,
        error,
      );
      throw error;
    }
  }
}

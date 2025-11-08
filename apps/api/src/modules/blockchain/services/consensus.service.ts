import { Injectable, Logger } from '@nestjs/common';

@Injectable()
export class ConsensusService {
  private readonly logger = new Logger(ConsensusService.name);

  async getInfo(): Promise<{
    consensus: string;
    blockTime: number;
    finality: string;
  }> {
    return {
      consensus: 'PoSA',
      blockTime: 3, // seconds
      finality: '1 block',
    };
  }
}

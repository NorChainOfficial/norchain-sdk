import { Resolver, Query, Args } from '@nestjs/graphql';
import { BlockService } from '../../block/block.service';
import { Block } from '../types/block.type';

@Resolver(() => Block)
export class BlockResolver {
  constructor(private readonly blockService: BlockService) {}

  @Query(() => Block, { nullable: true })
  async block(
    @Args('hash', { nullable: true }) hash?: string,
    @Args('number', { nullable: true }) number?: number,
  ) {
    const dto = hash ? { tag: hash } : { blockno: number || 0 };
    const result = await this.blockService.getBlock(dto);

    if (!result || !result.result) return null;

    const block = result.result;
    return {
      hash: block.blockHash || '',
      number:
        typeof block.blockNumber === 'number'
          ? block.blockNumber
          : parseInt(block.blockNumber) || 0,
      parentHash: block.parentHash || '',
      timestamp: block.timeStamp
        ? new Date(parseInt(block.timeStamp) * 1000).toISOString()
        : new Date().toISOString(),
      transactions: block.transactions || [],
      gasUsed: block.gasUsed?.toString() || '0',
      gasLimit: block.gasLimit?.toString() || '0',
    };
  }

  @Query(() => Number)
  async blockNumber() {
    const result = await this.blockService.getBlockNumber();
    return result?.result || 0;
  }
}

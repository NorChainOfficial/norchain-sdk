import { Module } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';
import { BlockController } from './block.controller';
import { BlockService } from './block.service';
import { Block } from './entities/block.entity';
import { RpcService } from '@/common/services/rpc.service';
import { CacheService } from '@/common/services/cache.service';

@Module({
  imports: [TypeOrmModule.forFeature([Block])],
  controllers: [BlockController],
  providers: [BlockService, RpcService, CacheService],
  exports: [BlockService],
})
export class BlockModule {}

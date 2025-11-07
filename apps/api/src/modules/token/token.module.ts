import { Module } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';
import { TokenController } from './token.controller';
import { TokenService } from './token.service';
import { TokenTransfer } from './entities/token-transfer.entity';
import { NftTransfer } from './entities/nft-transfer.entity';
import { TokenHolder } from './entities/token-holder.entity';
import { TokenMetadata } from './entities/token-metadata.entity';
import { RpcService } from '@/common/services/rpc.service';
import { CacheService } from '@/common/services/cache.service';

@Module({
  imports: [
    TypeOrmModule.forFeature([
      TokenTransfer,
      NftTransfer,
      TokenHolder,
      TokenMetadata,
    ]),
  ],
  controllers: [TokenController],
  providers: [TokenService, RpcService, CacheService],
  exports: [TokenService],
})
export class TokenModule {}


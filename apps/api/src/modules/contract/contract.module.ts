import { Module } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';
import { ContractController } from './contract.controller';
import { ContractService } from './contract.service';
import { Contract } from './entities/contract.entity';
import { RpcService } from '@/common/services/rpc.service';
import { CacheService } from '@/common/services/cache.service';

@Module({
  imports: [TypeOrmModule.forFeature([Contract])],
  controllers: [ContractController],
  providers: [ContractService, RpcService, CacheService],
  exports: [ContractService],
})
export class ContractModule {}

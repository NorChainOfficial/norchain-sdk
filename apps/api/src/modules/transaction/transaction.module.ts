import { Module } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';
import { TransactionController } from './transaction.controller';
import { TransactionService } from './transaction.service';
import { Transaction } from './entities/transaction.entity';
import { TransactionLog } from './entities/transaction-log.entity';
import { RpcService } from '@/common/services/rpc.service';
import { CacheService } from '@/common/services/cache.service';

@Module({
  imports: [TypeOrmModule.forFeature([Transaction, TransactionLog])],
  controllers: [TransactionController],
  providers: [TransactionService, RpcService, CacheService],
  exports: [TransactionService],
})
export class TransactionModule {}


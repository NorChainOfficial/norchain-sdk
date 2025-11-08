import { Module } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';
import { AccountController } from './account.controller';
import { AccountService } from './account.service';
import { AccountRepository } from './repositories/account.repository';
import { Transaction } from '@/modules/transaction/entities/transaction.entity';
import { TransactionLog } from '@/modules/transaction/entities/transaction-log.entity';
import { TokenTransfer } from '@/modules/token/entities/token-transfer.entity';
import { TokenHolder } from '@/modules/token/entities/token-holder.entity';
import { TokenMetadata } from '@/modules/token/entities/token-metadata.entity';
import { RpcService } from '@/common/services/rpc.service';
import { CacheService } from '@/common/services/cache.service';

@Module({
  imports: [
    TypeOrmModule.forFeature([
      Transaction,
      TransactionLog,
      TokenTransfer,
      TokenHolder,
      TokenMetadata,
    ]),
  ],
  controllers: [AccountController],
  providers: [AccountService, AccountRepository, RpcService, CacheService],
  exports: [AccountService],
})
export class AccountModule {}

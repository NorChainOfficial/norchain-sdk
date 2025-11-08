import { Module } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';
import { WalletController } from './wallet.controller';
import { WalletService } from './wallet.service';
import { Wallet } from './entities/wallet.entity';
import { WalletAccount } from './entities/wallet-account.entity';
import { RpcService } from '@/common/services/rpc.service';
import { CacheService } from '@/common/services/cache.service';
import { AccountModule } from '@/modules/account/account.module';

@Module({
  imports: [
    TypeOrmModule.forFeature([Wallet, WalletAccount]),
    AccountModule,
  ],
  controllers: [WalletController],
  providers: [WalletService, RpcService, CacheService],
  exports: [WalletService],
})
export class WalletModule {}


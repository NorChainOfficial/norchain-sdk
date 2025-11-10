import { Module } from '@nestjs/common';
import { WalletController } from './wallet.controller';
import { WalletService } from './wallet.service';
import { TypeOrmModule } from '@nestjs/typeorm';
import { Wallet } from './entities/wallet.entity';
import { User } from '../auth/entities/user.entity';
import { CommonModule } from '@/common/common.module';
import { PolicyModule } from '../policy/policy.module';

@Module({
  imports: [
    TypeOrmModule.forFeature([Wallet, User]),
    CommonModule,
    PolicyModule,
  ],
  controllers: [WalletController],
  providers: [WalletService],
  exports: [WalletService],
})
export class WalletModule {}

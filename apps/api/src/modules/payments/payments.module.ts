import { Module } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';
import { PaymentsController } from './payments.controller';
import { PaymentsService } from './payments.service';
import { PaymentInvoice } from './entities/payment-invoice.entity';
import { POSSession } from './entities/pos-session.entity';
import { MerchantSettlement } from './entities/merchant-settlement.entity';
import { CommonModule } from '@/common/common.module';

@Module({
  imports: [
    TypeOrmModule.forFeature([PaymentInvoice, POSSession, MerchantSettlement]),
    CommonModule,
  ],
  controllers: [PaymentsController],
  providers: [PaymentsService],
  exports: [PaymentsService],
})
export class PaymentsModule {}


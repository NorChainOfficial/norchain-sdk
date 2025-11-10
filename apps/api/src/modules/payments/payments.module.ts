import { Module, forwardRef } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';
import { PaymentsController } from './payments.controller';
import { PaymentsV2Controller } from './payments-v2.controller';
import { PaymentsV2EnhancedController } from './payments-v2-enhanced.controller';
import { PaymentsService } from './payments.service';
import { PaymentsV2Service } from './payments-v2.service';
import { PaymentsV2EnhancedService } from './payments-v2-enhanced.service';
import { PaymentInvoice } from './entities/payment-invoice.entity';
import { POSSession } from './entities/pos-session.entity';
import { MerchantSettlement } from './entities/merchant-settlement.entity';
import { Merchant } from './entities/merchant.entity';
import { CheckoutSession } from './entities/checkout-session.entity';
import { Payment } from './entities/payment.entity';
import { Refund } from './entities/refund.entity';
import { Product } from './entities/product.entity';
import { Price } from './entities/price.entity';
import { Customer } from './entities/customer.entity';
import { PaymentMethod } from './entities/payment-method.entity';
import { Subscription } from './entities/subscription.entity';
import { Dispute } from './entities/dispute.entity';
import { WebhookEndpoint } from './entities/webhook-endpoint.entity';
import { CommonModule } from '@/common/common.module';
import { PolicyModule } from '../policy/policy.module';
import { LedgerModule } from '../ledger/ledger.module';
import { EventEmitterModule } from '@nestjs/event-emitter';

@Module({
  imports: [
    TypeOrmModule.forFeature([
      PaymentInvoice,
      POSSession,
      MerchantSettlement,
      Merchant,
      CheckoutSession,
      Payment,
      Refund,
      Product,
      Price,
      Customer,
      PaymentMethod,
      Subscription,
      Dispute,
      WebhookEndpoint,
    ]),
    CommonModule,
    PolicyModule,
    forwardRef(() => LedgerModule),
    EventEmitterModule,
  ],
  controllers: [PaymentsController, PaymentsV2Controller, PaymentsV2EnhancedController],
  providers: [PaymentsService, PaymentsV2Service, PaymentsV2EnhancedService],
  exports: [PaymentsService, PaymentsV2Service, PaymentsV2EnhancedService],
})
export class PaymentsModule {}

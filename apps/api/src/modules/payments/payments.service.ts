import {
  Injectable,
  NotFoundException,
  BadRequestException,
  Logger,
} from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository, DataSource } from 'typeorm';
import {
  PaymentInvoice,
  InvoiceStatus,
  PaymentMethod,
} from './entities/payment-invoice.entity';
import { POSSession, POSSessionStatus } from './entities/pos-session.entity';
import {
  MerchantSettlement,
  SettlementStatus,
  SettlementType,
} from './entities/merchant-settlement.entity';
import { Merchant } from './entities/merchant.entity';
import { Product } from './entities/product.entity';
import { Price, BillingCycle } from './entities/price.entity';
import { Customer } from './entities/customer.entity';
import { PaymentMethod as PaymentMethodEntity, PaymentMethodKind } from './entities/payment-method.entity';
import { CheckoutSession } from './entities/checkout-session.entity';
import { Payment } from './entities/payment.entity';
import { Refund } from './entities/refund.entity';
import { Subscription, SubscriptionStatus } from './entities/subscription.entity';
import { Dispute, DisputeStatus } from './entities/dispute.entity';
import { WebhookEndpoint } from './entities/webhook-endpoint.entity';
import { CreateInvoiceDto } from './dto/create-invoice.dto';
import { CreatePOSSessionDto } from './dto/create-pos-session.dto';
import { CreateProductDto } from './dto/create-product.dto';
import { CreatePriceDto } from './dto/create-price.dto';
import { CreateCustomerDto } from './dto/create-customer.dto';
import { CreateSubscriptionDto } from './dto/create-subscription.dto';
import { CreateDisputeDto } from './dto/create-dispute.dto';
import { CreateCheckoutSessionV2Dto } from './dto/create-checkout-session-v2.dto';
import { RpcService } from '@/common/services/rpc.service';
import { PolicyService } from '../policy/policy.service';
import { LedgerService } from '../ledger/ledger.service';
import { EventEmitter2 } from '@nestjs/event-emitter';
import { ethers } from 'ethers';
import { randomBytes } from 'crypto';

@Injectable()
export class PaymentsService {
  private readonly logger = new Logger(PaymentsService.name);

  constructor(
    @InjectRepository(PaymentInvoice)
    private readonly invoiceRepository: Repository<PaymentInvoice>,
    @InjectRepository(POSSession)
    private readonly posSessionRepository: Repository<POSSession>,
    @InjectRepository(MerchantSettlement)
    private readonly settlementRepository: Repository<MerchantSettlement>,
    @InjectRepository(Merchant)
    private readonly merchantRepository: Repository<Merchant>,
    @InjectRepository(Product)
    private readonly productRepository: Repository<Product>,
    @InjectRepository(Price)
    private readonly priceRepository: Repository<Price>,
    @InjectRepository(Customer)
    private readonly customerRepository: Repository<Customer>,
    @InjectRepository(PaymentMethodEntity)
    private readonly paymentMethodRepository: Repository<PaymentMethodEntity>,
    @InjectRepository(CheckoutSession)
    private readonly checkoutSessionRepository: Repository<CheckoutSession>,
    @InjectRepository(Payment)
    private readonly paymentRepository: Repository<Payment>,
    @InjectRepository(Refund)
    private readonly refundRepository: Repository<Refund>,
    @InjectRepository(Subscription)
    private readonly subscriptionRepository: Repository<Subscription>,
    @InjectRepository(Dispute)
    private readonly disputeRepository: Repository<Dispute>,
    @InjectRepository(WebhookEndpoint)
    private readonly webhookEndpointRepository: Repository<WebhookEndpoint>,
    private readonly rpcService: RpcService,
    private readonly policyService: PolicyService,
    private readonly ledgerService: LedgerService,
    private readonly dataSource: DataSource,
    private readonly eventEmitter: EventEmitter2,
  ) {}

  /**
   * Create a payment invoice
   */
  async createInvoice(userId: string, dto: CreateInvoiceDto) {
    // Generate unique invoice number
    const invoiceNumber = `INV-${Date.now()}-${randomBytes(4).toString('hex').toUpperCase()}`;

    const invoice = this.invoiceRepository.create({
      userId,
      invoiceNumber,
      description: dto.description,
      amount: dto.amount,
      currency: dto.currency,
      paymentMethod: dto.paymentMethod || PaymentMethod.CRYPTO,
      recipientAddress: dto.recipientAddress,
      dueDate: dto.dueDate ? new Date(dto.dueDate) : null,
      status: InvoiceStatus.PENDING,
      metadata: dto.metadata,
    });

    const savedInvoice = await this.invoiceRepository.save(invoice);

    // Generate QR code (simplified - in production, use proper QR library)
    const qrData = JSON.stringify({
      type: 'payment',
      invoiceId: savedInvoice.id,
      amount: savedInvoice.amount,
      currency: savedInvoice.currency,
      address: savedInvoice.recipientAddress,
    });
    savedInvoice.qrCode = qrData;
    await this.invoiceRepository.save(savedInvoice);

    return {
      invoice_id: savedInvoice.id,
      invoiceNumber: savedInvoice.invoiceNumber,
      amount: savedInvoice.amount,
      currency: savedInvoice.currency,
      status: savedInvoice.status,
      qrCode: savedInvoice.qrCode,
      recipientAddress: savedInvoice.recipientAddress,
      dueDate: savedInvoice.dueDate,
    };
  }

  /**
   * Get invoice details
   */
  async getInvoice(userId: string, invoiceId: string) {
    const invoice = await this.invoiceRepository.findOne({
      where: { id: invoiceId, userId },
    });

    if (!invoice) {
      throw new NotFoundException('Invoice not found');
    }

    return {
      invoice_id: invoice.id,
      invoiceNumber: invoice.invoiceNumber,
      description: invoice.description,
      amount: invoice.amount,
      amountFormatted: ethers.formatEther(invoice.amount),
      currency: invoice.currency,
      status: invoice.status,
      paymentMethod: invoice.paymentMethod,
      recipientAddress: invoice.recipientAddress,
      qrCode: invoice.qrCode,
      dueDate: invoice.dueDate,
      paidAt: invoice.paidAt,
      paymentTxHash: invoice.paymentTxHash,
      metadata: invoice.metadata,
      createdAt: invoice.createdAt,
    };
  }

  /**
   * List invoices
   */
  async getInvoices(
    userId: string,
    limit: number = 50,
    offset: number = 0,
    status?: InvoiceStatus,
  ) {
    const where: any = { userId };
    if (status) {
      where.status = status;
    }

    const [invoices, total] = await this.invoiceRepository.findAndCount({
      where,
      order: { createdAt: 'DESC' },
      take: limit,
      skip: offset,
    });

    return {
      invoices: invoices.map((inv) => ({
        invoice_id: inv.id,
        invoiceNumber: inv.invoiceNumber,
        amount: inv.amount,
        currency: inv.currency,
        status: inv.status,
        createdAt: inv.createdAt,
        dueDate: inv.dueDate,
      })),
      total,
      limit,
      offset,
    };
  }

  /**
   * Create POS session
   */
  async createPOSSession(userId: string, dto: CreatePOSSessionDto) {
    // Generate unique session token
    const sessionToken = randomBytes(32).toString('hex');

    // Generate payment address (in production, use merchant's address or generate unique address)
    const paymentAddress = '0x742d35Cc6634C0532925a3b844Bc9e7595f0bEb0'; // Would be merchant's address

    const expiresIn = dto.expiresIn || 300; // Default 5 minutes
    const expiresAt = new Date(Date.now() + expiresIn * 1000);

    const session = this.posSessionRepository.create({
      merchantId: userId,
      sessionToken,
      amount: dto.amount,
      currency: dto.currency,
      status: POSSessionStatus.ACTIVE,
      paymentAddress,
      expiresAt,
      metadata: {
        description: dto.description,
        location: dto.location,
      },
    });

    const savedSession = await this.posSessionRepository.save(session);

    // Generate QR code
    const qrData = JSON.stringify({
      type: 'pos',
      sessionId: savedSession.id,
      token: sessionToken,
      amount: savedSession.amount,
      currency: savedSession.currency,
      address: paymentAddress,
    });
    savedSession.qrCode = qrData;
    await this.posSessionRepository.save(savedSession);

    return {
      session_id: savedSession.id,
      sessionToken: savedSession.sessionToken,
      amount: savedSession.amount,
      currency: savedSession.currency,
      qrCode: savedSession.qrCode,
      paymentAddress: savedSession.paymentAddress,
      expiresAt: savedSession.expiresAt,
    };
  }

  /**
   * Get POS session status
   */
  async getPOSSession(merchantId: string, sessionId: string) {
    const session = await this.posSessionRepository.findOne({
      where: { id: sessionId, merchantId },
    });

    if (!session) {
      throw new NotFoundException('POS session not found');
    }

    // Check if expired
    if (
      session.status === POSSessionStatus.ACTIVE &&
      session.expiresAt &&
      new Date() > session.expiresAt
    ) {
      session.status = POSSessionStatus.EXPIRED;
      await this.posSessionRepository.save(session);
    }

    return {
      session_id: session.id,
      amount: session.amount,
      currency: session.currency,
      status: session.status,
      paymentAddress: session.paymentAddress,
      paymentTxHash: session.paymentTxHash,
      expiresAt: session.expiresAt,
      completedAt: session.completedAt,
    };
  }

  /**
   * Get merchant settlements
   */
  async getSettlements(
    merchantId: string,
    limit: number = 50,
    offset: number = 0,
  ) {
    const [settlements, total] = await this.settlementRepository.findAndCount({
      where: { merchantId },
      order: { createdAt: 'DESC' },
      take: limit,
      skip: offset,
    });

    return {
      settlements: settlements.map((s) => ({
        settlement_id: s.id,
        type: s.type,
        status: s.status,
        totalAmount: s.totalAmount,
        netAmount: s.netAmount,
        fees: s.fees,
        currency: s.currency,
        periodStart: s.periodStart,
        periodEnd: s.periodEnd,
        processedAt: s.processedAt,
        settlementTxHash: s.settlementTxHash,
      })),
      total,
      limit,
      offset,
    };
  }

  /**
   * Get settlement details
   */
  async getSettlement(merchantId: string, settlementId: string) {
    const settlement = await this.settlementRepository.findOne({
      where: { id: settlementId, merchantId },
    });

    if (!settlement) {
      throw new NotFoundException('Settlement not found');
    }

    return {
      settlement_id: settlement.id,
      type: settlement.type,
      status: settlement.status,
      totalAmount: settlement.totalAmount,
      netAmount: settlement.netAmount,
      fees: settlement.fees,
      currency: settlement.currency,
      transactions: settlement.transactions,
      settlementAddress: settlement.settlementAddress,
      settlementTxHash: settlement.settlementTxHash,
      periodStart: settlement.periodStart,
      periodEnd: settlement.periodEnd,
      processedAt: settlement.processedAt,
      createdAt: settlement.createdAt,
    };
  }
}

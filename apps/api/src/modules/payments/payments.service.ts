import {
  Injectable,
  NotFoundException,
  BadRequestException,
  ConflictException,
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
import {
  Merchant,
  KYCTier,
  SettlementPreference,
} from './entities/merchant.entity';
import { Product } from './entities/product.entity';
import { Price, BillingCycle } from './entities/price.entity';
import { Customer } from './entities/customer.entity';
import {
  PaymentMethod as PaymentMethodEntity,
  PaymentMethodKind,
} from './entities/payment-method.entity';
import { CheckoutSession } from './entities/checkout-session.entity';
import { Payment } from './entities/payment.entity';
import { Refund } from './entities/refund.entity';
import {
  Subscription,
  SubscriptionStatus,
} from './entities/subscription.entity';
import { Dispute, DisputeStatus } from './entities/dispute.entity';
import { WebhookEndpoint } from './entities/webhook-endpoint.entity';
import { Coupon, CouponType, CouponStatus } from './entities/coupon.entity';
import { CreateInvoiceDto } from './dto/create-invoice.dto';
import { CreatePOSSessionDto } from './dto/create-pos-session.dto';
import { CreateProductDto } from './dto/create-product.dto';
import { CreatePriceDto } from './dto/create-price.dto';
import { CreateCustomerDto } from './dto/create-customer.dto';
import { CreateSubscriptionDto } from './dto/create-subscription.dto';
import { CreateDisputeDto } from './dto/create-dispute.dto';
import { CreateCheckoutSessionWithLineItemsDto } from './dto/create-checkout-session-with-line-items.dto';
import { CreateCheckoutSessionDto } from './dto/create-checkout-session.dto';
import { CreateRefundDto } from './dto/create-refund.dto';
import { OnboardMerchantDto } from './dto/onboard-merchant.dto';
import { CreateCouponDto } from './dto/create-coupon.dto';
import { ApplyCouponDto } from './dto/apply-coupon.dto';
import { CheckoutSessionStatus } from './entities/checkout-session.entity';
import { PaymentStatus } from './entities/payment.entity';
import { RefundStatus } from './entities/refund.entity';
import { ForbiddenException } from '@nestjs/common';
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
    @InjectRepository(Coupon)
    private readonly couponRepository: Repository<Coupon>,
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

  // ========== Merchant & Checkout Methods ==========

  /**
   * Onboard a merchant
   */
  async onboardMerchant(
    orgId: string,
    userId: string,
    dto: OnboardMerchantDto,
  ): Promise<Merchant> {
    // Check if merchant already exists
    const existing = await this.merchantRepository.findOne({
      where: { orgId },
    });

    if (existing) {
      throw new BadRequestException(
        `Merchant already onboarded for organization ${orgId}`,
      );
    }

    // Generate webhook secret
    const webhookSecret = randomBytes(32).toString('hex');

    const merchant = this.merchantRepository.create({
      orgId,
      kycTier: dto.kycTier || KYCTier.TIER_0,
      settlementPreference:
        dto.settlementPreference || SettlementPreference.CRYPTO_ONLY,
      webhookSecret,
      webhookUrl: dto.webhookUrl,
      active: true,
    });

    const saved = await this.merchantRepository.save(merchant);
    this.logger.log(`Merchant onboarded: ${saved.id} for org ${orgId}`);

    return saved;
  }

  /**
   * Create a checkout session
   */
  async createCheckoutSession(
    dto: CreateCheckoutSessionDto,
    userId: string,
  ): Promise<CheckoutSession & { payUrl: string }> {
    // Verify merchant exists and is active
    const merchant = await this.merchantRepository.findOne({
      where: { orgId: dto.merchantId, active: true },
    });

    if (!merchant) {
      throw new NotFoundException(
        `Merchant ${dto.merchantId} not found or inactive`,
      );
    }

    // Generate session ID
    const sessionId = `cs_${Date.now()}_${randomBytes(8).toString('hex')}`;

    // Set expiration (default 15 minutes)
    const expiresAt = new Date(Date.now() + 15 * 60 * 1000);

    const session = this.checkoutSessionRepository.create({
      sessionId,
      merchantId: merchant.id,
      amount: dto.amount,
      currency: dto.currency,
      assets: dto.assets || ['NOR'],
      metadata: dto.metadata,
      successUrl: dto.successUrl,
      cancelUrl: dto.cancelUrl,
      status: CheckoutSessionStatus.PENDING,
      expiresAt,
    });

    const saved = await this.checkoutSessionRepository.save(session);

    // Generate payment URL
    const payUrl = `https://pay.norchain.org/${saved.sessionId}`;

    this.logger.log(
      `Created checkout session: ${saved.sessionId} for merchant ${merchant.id}`,
    );

    return {
      ...saved,
      payUrl,
    } as CheckoutSession & { payUrl: string };
  }

  /**
   * Get checkout session status
   */
  async getCheckoutSession(sessionId: string): Promise<CheckoutSession> {
    const session = await this.checkoutSessionRepository.findOne({
      where: { sessionId },
    });

    if (!session) {
      throw new NotFoundException(`Checkout session ${sessionId} not found`);
    }

    // Check expiration
    if (
      session.status === CheckoutSessionStatus.PENDING &&
      new Date() > session.expiresAt
    ) {
      session.status = CheckoutSessionStatus.EXPIRED;
      await this.checkoutSessionRepository.save(session);
    }

    return session;
  }

  /**
   * Process payment (called when transaction is detected on-chain)
   */
  async processPayment(
    sessionId: string,
    txHash: string,
    payerAddress: string,
    blockNo?: number,
  ): Promise<Payment> {
    const session = await this.getCheckoutSession(sessionId);

    if (session.status !== CheckoutSessionStatus.PENDING) {
      throw new BadRequestException(`Session ${sessionId} is not pending`);
    }

    // Create payment record
    const paymentId = `pay_${Date.now()}_${randomBytes(8).toString('hex')}`;

    const payment = this.paymentRepository.create({
      paymentId,
      merchantId: session.merchantId,
      checkoutSessionId: session.id,
      amount: session.amount,
      currency: session.currency,
      payerAddress,
      txHash,
      blockNo,
      status: PaymentStatus.CONFIRMING,
    });

    const saved = await this.paymentRepository.save(payment);

    // Update session
    session.status = CheckoutSessionStatus.PAID;
    session.paymentTxHash = txHash;
    session.payerAddress = payerAddress;
    session.paidAt = new Date();
    await this.checkoutSessionRepository.save(session);

    // Post to ledger
    await this.postPaymentToLedger(saved, session);

    // Emit webhook event
    await this.sendWebhook('payment.succeeded', {
      paymentId: saved.paymentId,
      sessionId: session.sessionId,
      amount: saved.amount,
      currency: saved.currency,
      txHash,
      payerAddress,
    });

    this.logger.log(
      `Payment processed: ${saved.paymentId} for session ${sessionId}`,
    );

    return saved;
  }

  /**
   * Create a refund
   */
  async createRefund(dto: CreateRefundDto, userId: string): Promise<Refund> {
    // Get payment
    const payment = await this.paymentRepository.findOne({
      where: { paymentId: dto.paymentId },
    });

    if (!payment) {
      throw new NotFoundException(`Payment ${dto.paymentId} not found`);
    }

    // Verify merchant owns this payment
    const merchant = await this.merchantRepository.findOne({
      where: { id: payment.merchantId },
    });

    if (!merchant || merchant.orgId !== userId) {
      throw new ForbiddenException('Not authorized to refund this payment');
    }

    // Validate refund amount
    const refundAmount = parseFloat(dto.amount);
    const paymentAmount = parseFloat(payment.amount);

    if (refundAmount > paymentAmount) {
      throw new BadRequestException(
        'Refund amount cannot exceed payment amount',
      );
    }

    // Policy check for refund
    const policyCheck = await this.policyService.checkPolicy(userId, {
      fromAddress: payment.payerAddress,
      toAddress: dto.recipientAddress,
      amount: dto.amount,
      asset: payment.currency,
    });

    if (!policyCheck.allowed) {
      throw new ForbiddenException('Refund blocked by policy');
    }

    // Create refund record
    const refundId = `ref_${Date.now()}_${randomBytes(8).toString('hex')}`;

    const refund = this.refundRepository.create({
      refundId,
      paymentId: payment.id,
      merchantId: payment.merchantId,
      amount: dto.amount,
      currency: payment.currency,
      recipientAddress: dto.recipientAddress,
      status: RefundStatus.PENDING,
      reason: dto.reason,
      metadata: dto.metadata,
    });

    const saved = await this.refundRepository.save(refund);

    // Process refund (send on-chain transaction)
    await this.processRefund(saved);

    this.logger.log(
      `Refund created: ${saved.refundId} for payment ${dto.paymentId}`,
    );

    return saved;
  }

  /**
   * Process refund (send on-chain transaction)
   */
  private async processRefund(refund: Refund): Promise<void> {
    try {
      this.logger.log(
        `Processing refund ${refund.refundId}: sending ${refund.amount} ${refund.currency} to ${refund.recipientAddress}`,
      );

      // Update status to processing
      refund.status = RefundStatus.PROCESSING;
      await this.refundRepository.save(refund);

      // Simulate transaction (in production, use RpcService)
      const txHash = `0x${randomBytes(32).toString('hex')}`; // Mock

      refund.txHash = txHash;
      refund.status = RefundStatus.SUCCEEDED;
      refund.confirmedAt = new Date();
      await this.refundRepository.save(refund);

      // Post to ledger
      await this.postRefundToLedger(refund);

      // Emit webhook
      await this.sendWebhook('refund.succeeded', {
        refundId: refund.refundId,
        paymentId: refund.paymentId,
        amount: refund.amount,
        currency: refund.currency,
        txHash,
        recipientAddress: refund.recipientAddress,
      });

      this.logger.log(`Refund processed: ${refund.refundId} with tx ${txHash}`);
    } catch (error) {
      this.logger.error(
        `Failed to process refund ${refund.refundId}: ${error.message}`,
      );
      refund.status = RefundStatus.FAILED;
      await this.refundRepository.save(refund);
      throw error;
    }
  }

  /**
   * Post payment to ledger (double-entry)
   */
  private async postPaymentToLedger(
    payment: Payment,
    session: CheckoutSession,
  ): Promise<void> {
    try {
      const merchant = await this.merchantRepository.findOne({
        where: { id: payment.merchantId },
      });

      if (!merchant) {
        this.logger.warn(
          `Merchant ${payment.merchantId} not found, skipping ledger posting`,
        );
        return;
      }

      // Create journal entry
      const period = new Date().toISOString().substring(0, 7); // YYYY-MM

      await this.ledgerService.createJournalEntry(
        {
          orgId: merchant.orgId,
          eventType: 'payment.succeeded',
          eventId: payment.paymentId,
          txHash: payment.txHash,
          blockNo: payment.blockNo,
          occurredAt: payment.createdAt.toISOString(),
          period,
          memo: `Payment received for checkout session ${session.sessionId}`,
          lines: [
            {
              account: '1100-User NOR Cash', // User cash account
              currency: payment.currency,
              amount: payment.amount,
              direction: 'debit' as any,
            },
            {
              account: '4000-Sales Income', // Sales income
              currency: payment.currency,
              amount: payment.amount,
              direction: 'credit' as any,
            },
          ],
        },
        'system', // System user
      );

      this.logger.log(`Posted payment ${payment.paymentId} to ledger`);
    } catch (error) {
      this.logger.error(`Failed to post payment to ledger: ${error.message}`);
      // Don't throw - ledger posting failure shouldn't fail payment
    }
  }

  /**
   * Post refund to ledger (double-entry)
   */
  private async postRefundToLedger(refund: Refund): Promise<void> {
    try {
      const payment = await this.paymentRepository.findOne({
        where: { id: refund.paymentId },
      });

      if (!payment) {
        this.logger.warn(
          `Payment ${refund.paymentId} not found, skipping ledger posting`,
        );
        return;
      }

      const merchant = await this.merchantRepository.findOne({
        where: { id: refund.merchantId },
      });

      if (!merchant) {
        this.logger.warn(
          `Merchant ${refund.merchantId} not found, skipping ledger posting`,
        );
        return;
      }

      const period = new Date().toISOString().substring(0, 7);

      await this.ledgerService.createJournalEntry(
        {
          orgId: merchant.orgId,
          eventType: 'refund.succeeded',
          eventId: refund.refundId,
          txHash: refund.txHash,
          occurredAt: refund.createdAt.toISOString(),
          period,
          memo: `Refund for payment ${payment.paymentId}`,
          lines: [
            {
              account: '4000-Sales Income', // Reverse sales income
              currency: refund.currency,
              amount: refund.amount,
              direction: 'debit' as any,
            },
            {
              account: '1100-User NOR Cash', // Refund to user
              currency: refund.currency,
              amount: refund.amount,
              direction: 'credit' as any,
            },
          ],
        },
        'system',
      );

      this.logger.log(`Posted refund ${refund.refundId} to ledger`);
    } catch (error) {
      this.logger.error(`Failed to post refund to ledger: ${error.message}`);
    }
  }

  // ========== Products, Customers, Subscriptions & Disputes Methods ==========

  /**
   * Create a product
   */
  async createProduct(dto: CreateProductDto, userId: string): Promise<Product> {
    const product = this.productRepository.create({
      orgId: dto.orgId,
      name: dto.name,
      description: dto.description,
      active: dto.active !== false,
      metadata: dto.metadata,
    });

    return this.productRepository.save(product);
  }

  /**
   * Create a price for a product
   */
  async createPrice(dto: CreatePriceDto, userId: string): Promise<Price> {
    // Verify product exists
    const product = await this.productRepository.findOne({
      where: { id: dto.productId },
    });

    if (!product) {
      throw new NotFoundException(`Product ${dto.productId} not found`);
    }

    const price = this.priceRepository.create({
      productId: dto.productId,
      amount: dto.amount,
      currency: dto.currency,
      billingCycle: dto.billingCycle,
      active: true,
      metadata: dto.metadata,
    });

    return this.priceRepository.save(price);
  }

  /**
   * Get catalog (products with prices)
   */
  async getCatalog(orgId: string): Promise<Product[]> {
    return this.productRepository.find({
      where: { orgId, active: true },
      relations: ['prices'],
      order: { createdAt: 'DESC' },
    });
  }

  /**
   * Create a customer
   */
  async createCustomer(
    dto: CreateCustomerDto,
    userId: string,
  ): Promise<Customer> {
    // Validate: must have either address or email
    if (!dto.address && !dto.email) {
      throw new BadRequestException(
        'Customer must have either address or email',
      );
    }

    const customer = this.customerRepository.create({
      orgId: dto.orgId,
      address: dto.address?.toLowerCase(),
      email: dto.email?.toLowerCase(),
      displayName: dto.displayName,
      kycTier: dto.kycTier,
      metadata: dto.metadata,
    });

    return this.customerRepository.save(customer);
  }

  /**
   * Create checkout session with line items
   */
  async createCheckoutSessionWithLineItems(
    dto: CreateCheckoutSessionWithLineItemsDto,
    userId: string,
  ): Promise<CheckoutSession & { payUrl: string }> {
    // Verify merchant exists
    const merchant = await this.merchantRepository.findOne({
      where: { orgId: dto.orgId, active: true },
    });

    if (!merchant) {
      throw new NotFoundException(
        `Merchant ${dto.orgId} not found or inactive`,
      );
    }

    // Calculate total amount from line items
    let totalAmount = '0';
    for (const item of dto.lineItems) {
      const price = await this.priceRepository.findOne({
        where: { id: item.priceId, active: true },
      });

      if (!price) {
        throw new NotFoundException(`Price ${item.priceId} not found`);
      }

      const itemTotal = (parseFloat(price.amount) * item.quantity).toString();
      totalAmount = (
        parseFloat(totalAmount) + parseFloat(itemTotal)
      ).toString();
    }

    // Generate session ID
    const sessionId = `cs_${Date.now()}_${randomBytes(8).toString('hex')}`;
    const expiresAt = new Date(Date.now() + 15 * 60 * 1000); // 15 minutes

    const session = this.checkoutSessionRepository.create({
      sessionId,
      merchantId: merchant.id,
      amount: totalAmount,
      currency: 'NOR', // Default, can be multi-currency
      assets: dto.assetSet,
      metadata: {
        ...dto.metadata,
        lineItems: dto.lineItems,
      },
      successUrl: dto.successUrl,
      cancelUrl: dto.cancelUrl,
      status: CheckoutSessionStatus.PENDING,
      expiresAt,
    });

    const saved = await this.checkoutSessionRepository.save(session);
    const payUrl = `https://pay.norchain.org/${saved.sessionId}`;

    this.logger.log(
      `Created checkout session with line items: ${saved.sessionId}`,
    );

    return {
      ...saved,
      payUrl,
    } as CheckoutSession & { payUrl: string };
  }

  /**
   * Create a subscription
   */
  async createSubscription(
    dto: CreateSubscriptionDto,
    userId: string,
  ): Promise<Subscription> {
    // Verify price exists and has billing cycle
    const price = await this.priceRepository.findOne({
      where: { id: dto.priceId, active: true },
    });

    if (!price) {
      throw new NotFoundException(`Price ${dto.priceId} not found`);
    }

    if (!price.billingCycle) {
      throw new BadRequestException(
        'Price must have a billing cycle for subscriptions',
      );
    }

    // Verify customer exists
    const customer = await this.customerRepository.findOne({
      where: { id: dto.customerId },
    });

    if (!customer) {
      throw new NotFoundException(`Customer ${dto.customerId} not found`);
    }

    // Calculate billing dates
    const now = new Date();
    const periodStart = now;
    let periodEnd: Date;

    switch (price.billingCycle) {
      case BillingCycle.MONTHLY:
        periodEnd = new Date(now.setMonth(now.getMonth() + 1));
        break;
      case BillingCycle.YEARLY:
        periodEnd = new Date(now.setFullYear(now.getFullYear() + 1));
        break;
      case BillingCycle.WEEKLY:
        periodEnd = new Date(now.getTime() + 7 * 24 * 60 * 60 * 1000);
        break;
      case BillingCycle.DAILY:
        periodEnd = new Date(now.getTime() + 24 * 60 * 60 * 1000);
        break;
      default:
        periodEnd = new Date(now.getTime() + 30 * 24 * 60 * 60 * 1000);
    }

    const subscription = this.subscriptionRepository.create({
      priceId: dto.priceId,
      customerId: dto.customerId,
      status: SubscriptionStatus.TRIALING,
      currentPeriodStart: periodStart,
      currentPeriodEnd: periodEnd,
      nextBillingAt: periodEnd,
      prorationPolicy: dto.prorationPolicy || ('create_proration' as any),
      metadata: dto.metadata,
    });

    const saved = await this.subscriptionRepository.save(subscription);

    // Emit event for billing daemon
    this.eventEmitter.emit('subscription.created', {
      subscriptionId: saved.id,
      priceId: dto.priceId,
      customerId: dto.customerId,
      nextBillingAt: periodEnd,
    });

    this.logger.log(`Created subscription: ${saved.id}`);

    return saved;
  }

  /**
   * Cancel a subscription
   */
  async cancelSubscription(
    subscriptionId: string,
    userId: string,
  ): Promise<Subscription> {
    const subscription = await this.subscriptionRepository.findOne({
      where: { id: subscriptionId },
    });

    if (!subscription) {
      throw new NotFoundException(`Subscription ${subscriptionId} not found`);
    }

    subscription.status = SubscriptionStatus.CANCELED;
    subscription.canceledAt = new Date();

    const saved = await this.subscriptionRepository.save(subscription);

    this.eventEmitter.emit('subscription.canceled', {
      subscriptionId: saved.id,
    });

    return saved;
  }

  /**
   * Create a dispute
   */
  async createDispute(dto: CreateDisputeDto, userId: string): Promise<Dispute> {
    // Verify payment exists
    const payment = await this.paymentRepository.findOne({
      where: { paymentId: dto.paymentId },
    });

    if (!payment) {
      throw new NotFoundException(`Payment ${dto.paymentId} not found`);
    }

    // Check if dispute already exists
    const existing = await this.disputeRepository.findOne({
      where: { paymentId: payment.id },
    });

    if (existing) {
      throw new BadRequestException('Dispute already exists for this payment');
    }

    const dispute = this.disputeRepository.create({
      paymentId: payment.id,
      merchantId: payment.merchantId,
      status: DisputeStatus.OPEN,
      reason: dto.reason,
      customerEvidence: dto.customerEvidence,
      metadata: dto.metadata,
    });

    const saved = await this.disputeRepository.save(dispute);

    // Emit webhook
    await this.sendWebhook('dispute.created', {
      disputeId: saved.id,
      paymentId: dto.paymentId,
      reason: dto.reason,
    });

    this.logger.log(
      `Created dispute: ${saved.id} for payment ${dto.paymentId}`,
    );

    return saved;
  }

  /**
   * Register webhook endpoint
   */
  async registerWebhook(
    orgId: string,
    url: string,
    events: string[],
    userId: string,
  ): Promise<WebhookEndpoint> {
    const hmacSecret = randomBytes(32).toString('hex');

    const endpoint = this.webhookEndpointRepository.create({
      orgId,
      url,
      hmacSecret,
      events,
      active: true,
    });

    return this.webhookEndpointRepository.save(endpoint);
  }

  /**
   * Send webhook notification
   */
  private async sendWebhook(event: string, data: any): Promise<void> {
    // In production, implement webhook delivery with HMAC signing
    this.logger.log(`Webhook event: ${event}`, data);
    this.eventEmitter.emit(`webhook.${event}`, data);
  }

  /**
   * Create a coupon
   */
  async createCoupon(dto: CreateCouponDto, userId: string): Promise<Coupon> {
    // Check if coupon code already exists for this org
    const existing = await this.couponRepository.findOne({
      where: { code: dto.code.toUpperCase(), orgId: dto.orgId },
    });

    if (existing) {
      throw new ConflictException(
        `Coupon with code ${dto.code} already exists for this organization`,
      );
    }

    const coupon = this.couponRepository.create({
      ...dto,
      code: dto.code.toUpperCase(),
      status: CouponStatus.ACTIVE,
      timesRedeemed: 0,
    });

    const saved = await this.couponRepository.save(coupon);

    this.logger.log(`Created coupon: ${saved.code} for org ${dto.orgId}`);
    this.eventEmitter.emit('coupon.created', {
      couponId: saved.id,
      code: saved.code,
      orgId: dto.orgId,
    });

    return saved;
  }

  /**
   * Get coupons for an organization
   */
  async getCoupons(orgId: string, status?: CouponStatus): Promise<Coupon[]> {
    const where: any = { orgId };
    if (status) {
      where.status = status;
    }

    return this.couponRepository.find({
      where,
      order: { createdAt: 'DESC' },
    });
  }

  /**
   * Get coupon by code
   */
  async getCouponByCode(code: string, orgId: string): Promise<Coupon> {
    const coupon = await this.couponRepository.findOne({
      where: { code: code.toUpperCase(), orgId },
    });

    if (!coupon) {
      throw new NotFoundException(`Coupon ${code} not found`);
    }

    return coupon;
  }

  /**
   * Apply coupon and calculate discount
   */
  async applyCoupon(
    dto: ApplyCouponDto,
    orgId: string,
  ): Promise<{
    coupon: Coupon;
    discountAmount: string;
    finalAmount: string;
    valid: boolean;
    reason?: string;
  }> {
    const coupon = await this.couponRepository.findOne({
      where: { code: dto.code.toUpperCase(), orgId },
    });

    if (!coupon) {
      throw new NotFoundException(`Coupon ${dto.code} not found`);
    }

    // Validate coupon status
    if (coupon.status !== CouponStatus.ACTIVE) {
      return {
        coupon,
        discountAmount: '0',
        finalAmount: dto.amount || '0',
        valid: false,
        reason: 'Coupon is not active',
      };
    }

    // Check expiration
    const now = new Date();
    if (coupon.validUntil && new Date(coupon.validUntil) < now) {
      coupon.status = CouponStatus.EXPIRED;
      await this.couponRepository.save(coupon);
      return {
        coupon,
        discountAmount: '0',
        finalAmount: dto.amount || '0',
        valid: false,
        reason: 'Coupon has expired',
      };
    }

    if (coupon.validFrom && new Date(coupon.validFrom) > now) {
      return {
        coupon,
        discountAmount: '0',
        finalAmount: dto.amount || '0',
        valid: false,
        reason: 'Coupon is not yet valid',
      };
    }

    // Check max redemptions
    if (
      coupon.maxRedemptions &&
      coupon.timesRedeemed >= coupon.maxRedemptions
    ) {
      return {
        coupon,
        discountAmount: '0',
        finalAmount: dto.amount || '0',
        valid: false,
        reason: 'Coupon has reached maximum redemptions',
      };
    }

    // Calculate discount
    // Amount is in NOR (string), convert to wei for calculations
    const amountWei = ethers.parseEther(dto.amount || '0');
    let discountAmountWei = BigInt(0);

    if (coupon.type === CouponType.PERCENTAGE) {
      const percentage = parseFloat(coupon.discountValue);
      if (percentage < 0 || percentage > 100) {
        throw new BadRequestException('Invalid discount percentage');
      }
      discountAmountWei =
        (amountWei * BigInt(Math.floor(percentage * 100))) / BigInt(10000);
    } else {
      // Fixed amount - discountValue is in NOR
      discountAmountWei = ethers.parseEther(coupon.discountValue);
      if (discountAmountWei > amountWei) {
        discountAmountWei = amountWei; // Don't allow negative final amount
      }
    }

    // Check minimum amount
    if (coupon.minimumAmount) {
      const minimumWei = ethers.parseEther(coupon.minimumAmount);
      if (amountWei < minimumWei) {
        return {
          coupon,
          discountAmount: '0',
          finalAmount: dto.amount || '0',
          valid: false,
          reason: `Minimum purchase amount of ${coupon.minimumAmount} NOR required`,
        };
      }
    }

    const finalAmountWei = amountWei - discountAmountWei;

    return {
      coupon,
      discountAmount: ethers.formatEther(discountAmountWei),
      finalAmount: ethers.formatEther(finalAmountWei),
      valid: true,
    };
  }

  /**
   * Redeem coupon (increment usage count)
   */
  async redeemCoupon(couponId: string): Promise<Coupon> {
    const coupon = await this.couponRepository.findOne({
      where: { id: couponId },
    });

    if (!coupon) {
      throw new NotFoundException(`Coupon ${couponId} not found`);
    }

    coupon.timesRedeemed += 1;

    // Check if max redemptions reached
    if (
      coupon.maxRedemptions &&
      coupon.timesRedeemed >= coupon.maxRedemptions
    ) {
      coupon.status = CouponStatus.INACTIVE;
    }

    return this.couponRepository.save(coupon);
  }

  /**
   * Update coupon status
   */
  async updateCouponStatus(
    couponId: string,
    status: CouponStatus,
    orgId: string,
  ): Promise<Coupon> {
    const coupon = await this.couponRepository.findOne({
      where: { id: couponId, orgId },
    });

    if (!coupon) {
      throw new NotFoundException(`Coupon ${couponId} not found`);
    }

    coupon.status = status;
    return this.couponRepository.save(coupon);
  }
}

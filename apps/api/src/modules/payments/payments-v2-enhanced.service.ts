import {
  Injectable,
  NotFoundException,
  BadRequestException,
  Logger,
} from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository, DataSource } from 'typeorm';
import { Merchant } from './entities/merchant.entity';
import { Product } from './entities/product.entity';
import { Price, BillingCycle } from './entities/price.entity';
import { Customer } from './entities/customer.entity';
import { PaymentMethod, PaymentMethodKind } from './entities/payment-method.entity';
import { CheckoutSession } from './entities/checkout-session.entity';
import { Payment } from './entities/payment.entity';
import { Refund } from './entities/refund.entity';
import { Subscription, SubscriptionStatus } from './entities/subscription.entity';
import { Dispute, DisputeStatus } from './entities/dispute.entity';
import { WebhookEndpoint } from './entities/webhook-endpoint.entity';
import { CreateProductDto } from './dto/create-product.dto';
import { CreatePriceDto } from './dto/create-price.dto';
import { CreateCustomerDto } from './dto/create-customer.dto';
import { CreateSubscriptionDto } from './dto/create-subscription.dto';
import { CreateDisputeDto } from './dto/create-dispute.dto';
import { CreateCheckoutSessionV2Dto } from './dto/create-checkout-session-v2.dto';
import { PolicyService } from '../policy/policy.service';
import { LedgerService } from '../ledger/ledger.service';
import { EventEmitter2 } from '@nestjs/event-emitter';
import { randomBytes } from 'crypto';

@Injectable()
export class PaymentsV2EnhancedService {
  private readonly logger = new Logger(PaymentsV2EnhancedService.name);

  constructor(
    @InjectRepository(Merchant)
    private readonly merchantRepository: Repository<Merchant>,
    @InjectRepository(Product)
    private readonly productRepository: Repository<Product>,
    @InjectRepository(Price)
    private readonly priceRepository: Repository<Price>,
    @InjectRepository(Customer)
    private readonly customerRepository: Repository<Customer>,
    @InjectRepository(PaymentMethod)
    private readonly paymentMethodRepository: Repository<PaymentMethod>,
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
    private readonly policyService: PolicyService,
    private readonly ledgerService: LedgerService,
    private readonly dataSource: DataSource,
    private readonly eventEmitter: EventEmitter2,
  ) {}

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
      throw new BadRequestException('Customer must have either address or email');
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
  async createCheckoutSessionV2(
    dto: CreateCheckoutSessionV2Dto,
    userId: string,
  ): Promise<CheckoutSession & { payUrl: string }> {
    // Verify merchant exists
    const merchant = await this.merchantRepository.findOne({
      where: { orgId: dto.orgId, active: true },
    });

    if (!merchant) {
      throw new NotFoundException(`Merchant ${dto.orgId} not found or inactive`);
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

      const itemTotal = (
        parseFloat(price.amount) * item.quantity
      ).toString();
      totalAmount = (parseFloat(totalAmount) + parseFloat(itemTotal)).toString();
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
      status: 'pending' as any,
      expiresAt,
    });

    const saved = await this.checkoutSessionRepository.save(session);
    const payUrl = `https://pay.norchain.org/${saved.sessionId}`;

    this.logger.log(`Created checkout session v2: ${saved.sessionId}`);

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
      throw new BadRequestException('Price must have a billing cycle for subscriptions');
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
      prorationPolicy: dto.prorationPolicy || 'create_proration' as any,
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
  async createDispute(
    dto: CreateDisputeDto,
    userId: string,
  ): Promise<Dispute> {
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

    this.logger.log(`Created dispute: ${saved.id} for payment ${dto.paymentId}`);

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
}


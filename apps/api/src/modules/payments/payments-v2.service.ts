import {
  Injectable,
  NotFoundException,
  BadRequestException,
  Logger,
  ForbiddenException,
} from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository, DataSource } from 'typeorm';
import { Merchant, KYCTier, SettlementPreference } from './entities/merchant.entity';
import {
  CheckoutSession,
  CheckoutSessionStatus,
} from './entities/checkout-session.entity';
import { Payment, PaymentStatus } from './entities/payment.entity';
import { Refund, RefundStatus } from './entities/refund.entity';
import { CreateCheckoutSessionDto } from './dto/create-checkout-session.dto';
import { CreateRefundDto } from './dto/create-refund.dto';
import { OnboardMerchantDto } from './dto/onboard-merchant.dto';
import { PolicyService } from '../policy/policy.service';
import { LedgerService } from '../ledger/ledger.service';
import { RpcService } from '@/common/services/rpc.service';
import { EventEmitter2 } from '@nestjs/event-emitter';
import { randomBytes } from 'crypto';
import { ethers } from 'ethers';

@Injectable()
export class PaymentsV2Service {
  private readonly logger = new Logger(PaymentsV2Service.name);

  constructor(
    @InjectRepository(Merchant)
    private readonly merchantRepository: Repository<Merchant>,
    @InjectRepository(CheckoutSession)
    private readonly checkoutSessionRepository: Repository<CheckoutSession>,
    @InjectRepository(Payment)
    private readonly paymentRepository: Repository<Payment>,
    @InjectRepository(Refund)
    private readonly refundRepository: Repository<Refund>,
    private readonly policyService: PolicyService,
    private readonly ledgerService: LedgerService,
    private readonly rpcService: RpcService,
    private readonly dataSource: DataSource,
    private readonly eventEmitter: EventEmitter2,
  ) {}

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
      throw new BadRequestException(`Merchant already onboarded for organization ${orgId}`);
    }

    // Generate webhook secret
    const webhookSecret = randomBytes(32).toString('hex');

    const merchant = this.merchantRepository.create({
      orgId,
      kycTier: dto.kycTier || KYCTier.TIER_0,
      settlementPreference: dto.settlementPreference || SettlementPreference.CRYPTO_ONLY,
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
  ): Promise<CheckoutSession> {
    // Verify merchant exists and is active
    const merchant = await this.merchantRepository.findOne({
      where: { orgId: dto.merchantId, active: true },
    });

    if (!merchant) {
      throw new NotFoundException(`Merchant ${dto.merchantId} not found or inactive`);
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

    this.logger.log(`Created checkout session: ${saved.sessionId} for merchant ${merchant.id}`);

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

    // Policy check (if required)
    // Note: This would be done before payment is accepted
    // For now, we assume policy checks passed

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

    this.logger.log(`Payment processed: ${saved.paymentId} for session ${sessionId}`);

    return saved;
  }

  /**
   * Create a refund
   */
  async createRefund(
    dto: CreateRefundDto,
    userId: string,
  ): Promise<Refund> {
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
      throw new BadRequestException('Refund amount cannot exceed payment amount');
    }

    // Policy check for refund
    const policyCheck = await this.policyService.checkPolicy(
      userId,
      {
        fromAddress: payment.payerAddress,
        toAddress: dto.recipientAddress,
        amount: dto.amount,
        asset: payment.currency,
      },
    );

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

    this.logger.log(`Refund created: ${saved.refundId} for payment ${dto.paymentId}`);

    return saved;
  }

  /**
   * Process refund (send on-chain transaction)
   */
  private async processRefund(refund: Refund): Promise<void> {
    try {
      // In production, this would use RpcService to send transaction
      // For now, we'll simulate it
      this.logger.log(`Processing refund ${refund.refundId}: sending ${refund.amount} ${refund.currency} to ${refund.recipientAddress}`);

      // Update status to processing
      refund.status = RefundStatus.PROCESSING;
      await this.refundRepository.save(refund);

      // Simulate transaction (in production, use RpcService)
      // const txHash = await this.rpcService.sendTransaction(...);
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
      this.logger.error(`Failed to process refund ${refund.refundId}: ${error.message}`);
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
        this.logger.warn(`Merchant ${payment.merchantId} not found, skipping ledger posting`);
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

      // Update payment with journal entry ID
      // Note: We'd need to get the entry ID from the ledger service response
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
        this.logger.warn(`Payment ${refund.paymentId} not found, skipping ledger posting`);
        return;
      }

      const merchant = await this.merchantRepository.findOne({
        where: { id: refund.merchantId },
      });

      if (!merchant) {
        this.logger.warn(`Merchant ${refund.merchantId} not found, skipping ledger posting`);
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

  /**
   * Send webhook notification
   */
  private async sendWebhook(event: string, data: any): Promise<void> {
    // In production, implement webhook delivery with HMAC signing
    this.logger.log(`Webhook event: ${event}`, data);
    this.eventEmitter.emit(`webhook.${event}`, data);
  }
}


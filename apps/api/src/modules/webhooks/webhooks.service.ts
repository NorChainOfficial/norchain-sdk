import { Injectable, NotFoundException } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { WebhookSubscription, WebhookEventType, WebhookStatus } from './entities/webhook-subscription.entity';
import { WebhookDelivery, DeliveryStatus } from './entities/webhook-delivery.entity';
import { CreateWebhookDto } from './dto/create-webhook.dto';
import { randomBytes, createHmac } from 'crypto';

@Injectable()
export class WebhooksService {
  constructor(
    @InjectRepository(WebhookSubscription)
    private readonly subscriptionRepository: Repository<WebhookSubscription>,
    @InjectRepository(WebhookDelivery)
    private readonly deliveryRepository: Repository<WebhookDelivery>,
  ) {}

  /**
   * Create webhook subscription
   */
  async createWebhook(userId: string, dto: CreateWebhookDto) {
    // Generate HMAC secret
    const secret = randomBytes(32).toString('hex');

    const subscription = this.subscriptionRepository.create({
      userId,
      url: dto.url,
      events: dto.events,
      secret,
      status: WebhookStatus.ACTIVE,
    });

    const saved = await this.subscriptionRepository.save(subscription);

    return {
      webhook_id: saved.id,
      url: saved.url,
      events: saved.events,
      status: saved.status,
      secret: saved.secret, // Return secret only once
    };
  }

  /**
   * Get webhook subscriptions
   */
  async getWebhooks(userId: string) {
    const subscriptions = await this.subscriptionRepository.find({
      where: { userId },
      order: { createdAt: 'DESC' },
    });

    return {
      webhooks: subscriptions.map((s) => ({
        webhook_id: s.id,
        url: s.url,
        events: s.events,
        status: s.status,
        failureCount: s.failureCount,
        lastSuccessAt: s.lastSuccessAt,
        createdAt: s.createdAt,
      })),
    };
  }

  /**
   * Get webhook deliveries
   */
  async getDeliveries(
    userId: string,
    webhookId: string,
    limit: number = 50,
    offset: number = 0,
  ) {
    // Verify ownership
    const subscription = await this.subscriptionRepository.findOne({
      where: { id: webhookId, userId },
    });

    if (!subscription) {
      throw new NotFoundException('Webhook not found');
    }

    const [deliveries, total] = await this.deliveryRepository.findAndCount({
      where: { subscriptionId: webhookId },
      order: { createdAt: 'DESC' },
      take: limit,
      skip: offset,
    });

    return {
      deliveries: deliveries.map((d) => ({
        delivery_id: d.id,
        eventType: d.eventType,
        status: d.status,
        attemptCount: d.attemptCount,
        httpStatus: d.httpStatus,
        errorMessage: d.errorMessage,
        deliveredAt: d.deliveredAt,
        createdAt: d.createdAt,
      })),
      total,
      limit,
      offset,
    };
  }

  /**
   * Sign webhook payload (HMAC-SHA256)
   */
  signPayload(payload: string, secret: string): string {
    return createHmac('sha256', secret).update(payload).digest('hex');
  }

  /**
   * Create CloudEvents 1.0 envelope
   */
  createCloudEvent(
    eventType: WebhookEventType,
    data: any,
    source: string = 'norchain-api',
  ): any {
    return {
      specversion: '1.0',
      type: eventType,
      source,
      id: `evt_${Date.now()}_${randomBytes(8).toString('hex')}`,
      time: new Date().toISOString(),
      datacontenttype: 'application/json',
      data,
    };
  }
}


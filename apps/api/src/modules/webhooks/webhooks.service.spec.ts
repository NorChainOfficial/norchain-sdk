import { Test, TestingModule } from '@nestjs/testing';
import { getRepositoryToken } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { WebhooksService } from './webhooks.service';
import { WebhookSubscription, WebhookEventType, WebhookStatus } from './entities/webhook-subscription.entity';
import { WebhookDelivery, DeliveryStatus } from './entities/webhook-delivery.entity';
import { CreateWebhookDto } from './dto/create-webhook.dto';
import { NotFoundException } from '@nestjs/common';

describe('WebhooksService', () => {
  let service: WebhooksService;
  let subscriptionRepository: Repository<WebhookSubscription>;
  let deliveryRepository: Repository<WebhookDelivery>;

  const mockSubscriptionRepository = {
    create: jest.fn(),
    save: jest.fn(),
    find: jest.fn(),
    findOne: jest.fn(),
  };

  const mockDeliveryRepository = {
    findAndCount: jest.fn(),
  };

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      providers: [
        WebhooksService,
        {
          provide: getRepositoryToken(WebhookSubscription),
          useValue: mockSubscriptionRepository,
        },
        {
          provide: getRepositoryToken(WebhookDelivery),
          useValue: mockDeliveryRepository,
        },
      ],
    }).compile();

    service = module.get<WebhooksService>(WebhooksService);
    subscriptionRepository = module.get<Repository<WebhookSubscription>>(getRepositoryToken(WebhookSubscription));
    deliveryRepository = module.get<Repository<WebhookDelivery>>(getRepositoryToken(WebhookDelivery));
  });

  afterEach(() => {
    jest.clearAllMocks();
  });

  describe('createWebhook', () => {
    it('should create a webhook subscription', async () => {
      const userId = 'user-123';
      const dto: CreateWebhookDto = {
        url: 'https://example.com/webhook',
        events: [WebhookEventType.TRANSACTION_MINED, WebhookEventType.SWAP_EXECUTED],
      };

      const mockSubscription = {
        id: 'webhook-123',
        userId,
        ...dto,
        secret: 'secret-abc',
        status: WebhookStatus.ACTIVE,
      };

      mockSubscriptionRepository.create.mockReturnValue(mockSubscription);
      mockSubscriptionRepository.save.mockResolvedValue(mockSubscription);

      const result = await service.createWebhook(userId, dto);

      expect(result).toHaveProperty('webhook_id');
      expect(result).toHaveProperty('url', dto.url);
      expect(result).toHaveProperty('events', dto.events);
      expect(result).toHaveProperty('secret');
      expect(mockSubscriptionRepository.create).toHaveBeenCalled();
    });
  });

  describe('getWebhooks', () => {
    it('should return all webhooks for user', async () => {
      const userId = 'user-123';
      const mockWebhooks = [
        {
          id: 'webhook-1',
          url: 'https://example.com/webhook',
          events: [WebhookEventType.TRANSACTION_MINED],
          status: WebhookStatus.ACTIVE,
          failureCount: 0,
          lastSuccessAt: new Date(),
          createdAt: new Date(),
        },
      ];

      mockSubscriptionRepository.find.mockResolvedValue(mockWebhooks);

      const result = await service.getWebhooks(userId);

      expect(result).toHaveProperty('webhooks');
      expect(result.webhooks).toHaveLength(1);
      expect(mockSubscriptionRepository.find).toHaveBeenCalledWith({
        where: { userId },
        order: { createdAt: 'DESC' },
      });
    });
  });

  describe('getDeliveries', () => {
    it('should return webhook deliveries', async () => {
      const userId = 'user-123';
      const webhookId = 'webhook-123';
      const mockSubscription = {
        id: webhookId,
        userId,
      };

      const mockDeliveries = [
        {
          id: 'delivery-1',
          eventType: WebhookEventType.TRANSACTION_MINED,
          status: DeliveryStatus.SUCCESS,
          attemptCount: 1,
          httpStatus: 200,
          deliveredAt: new Date(),
          createdAt: new Date(),
        },
      ];

      mockSubscriptionRepository.findOne.mockResolvedValue(mockSubscription);
      mockDeliveryRepository.findAndCount.mockResolvedValue([mockDeliveries, 1]);

      const result = await service.getDeliveries(userId, webhookId, 50, 0);

      expect(result).toHaveProperty('deliveries');
      expect(result).toHaveProperty('total', 1);
      expect(result.deliveries).toHaveLength(1);
    });

    it('should throw NotFoundException if webhook not found', async () => {
      mockSubscriptionRepository.findOne.mockResolvedValue(null);

      await expect(service.getDeliveries('user-123', 'invalid-id', 50, 0)).rejects.toThrow(NotFoundException);
    });
  });

  describe('signPayload', () => {
    it('should sign payload with HMAC-SHA256', () => {
      const payload = 'test payload';
      const secret = 'test-secret';

      const signature = service.signPayload(payload, secret);

      expect(signature).toBeDefined();
      expect(typeof signature).toBe('string');
      expect(signature.length).toBeGreaterThan(0);
    });

    it('should produce consistent signatures', () => {
      const payload = 'test payload';
      const secret = 'test-secret';

      const sig1 = service.signPayload(payload, secret);
      const sig2 = service.signPayload(payload, secret);

      expect(sig1).toBe(sig2);
    });
  });

  describe('createCloudEvent', () => {
    it('should create CloudEvents 1.0 envelope', () => {
      const eventType = WebhookEventType.TRANSACTION_MINED;
      const data = { txHash: '0x123' };

      const event = service.createCloudEvent(eventType, data);

      expect(event).toHaveProperty('specversion', '1.0');
      expect(event).toHaveProperty('type', eventType);
      expect(event).toHaveProperty('source');
      expect(event).toHaveProperty('id');
      expect(event).toHaveProperty('time');
      expect(event).toHaveProperty('datacontenttype', 'application/json');
      expect(event).toHaveProperty('data', data);
    });

    it('should generate unique IDs', () => {
      const event1 = service.createCloudEvent(WebhookEventType.TRANSACTION_MINED, {});
      const event2 = service.createCloudEvent(WebhookEventType.TRANSACTION_MINED, {});

      expect(event1.id).not.toBe(event2.id);
    });
  });

  describe('getDeliveries - Edge Cases', () => {
    it('should return empty deliveries when none exist', async () => {
      const userId = 'user-123';
      const webhookId = 'webhook-123';
      const mockSubscription = {
        id: webhookId,
        userId,
      };

      mockSubscriptionRepository.findOne.mockResolvedValue(mockSubscription);
      mockDeliveryRepository.findAndCount.mockResolvedValue([[], 0]);

      const result = await service.getDeliveries(userId, webhookId, 50, 0);

      expect(result.deliveries).toEqual([]);
      expect(result.total).toBe(0);
    });

    it('should use default pagination values', async () => {
      const userId = 'user-123';
      const webhookId = 'webhook-123';
      const mockSubscription = {
        id: webhookId,
        userId,
      };

      mockSubscriptionRepository.findOne.mockResolvedValue(mockSubscription);
      mockDeliveryRepository.findAndCount.mockResolvedValue([[], 0]);

      await service.getDeliveries(userId, webhookId);

      expect(mockDeliveryRepository.findAndCount).toHaveBeenCalledWith({
        where: { subscriptionId: webhookId },
        order: { createdAt: 'DESC' },
        take: 50,
        skip: 0,
      });
    });

    it('should handle pagination correctly', async () => {
      const userId = 'user-123';
      const webhookId = 'webhook-123';
      const mockSubscription = {
        id: webhookId,
        userId,
      };

      const mockDeliveries = [
        {
          id: 'delivery-1',
          eventType: WebhookEventType.TRANSACTION_MINED,
          status: DeliveryStatus.SUCCESS,
          attemptCount: 1,
          httpStatus: 200,
          deliveredAt: new Date(),
          createdAt: new Date(),
        },
      ];

      mockSubscriptionRepository.findOne.mockResolvedValue(mockSubscription);
      mockDeliveryRepository.findAndCount.mockResolvedValue([mockDeliveries, 1]);

      const result = await service.getDeliveries(userId, webhookId, 10, 5);

      expect(result.limit).toBe(10);
      expect(result.offset).toBe(5);
      expect(mockDeliveryRepository.findAndCount).toHaveBeenCalledWith({
        where: { subscriptionId: webhookId },
        order: { createdAt: 'DESC' },
        take: 10,
        skip: 5,
      });
    });
  });

  describe('createWebhook - Edge Cases', () => {
    it('should generate unique HMAC secret for each webhook', async () => {
      const userId = 'user-123';
      const dto: CreateWebhookDto = {
        url: 'https://example.com/webhook',
        events: [WebhookEventType.TRANSACTION_MINED],
      };

      const mockSubscription1 = {
        id: 'webhook-1',
        userId,
        ...dto,
        secret: 'secret-1',
        status: WebhookStatus.ACTIVE,
      };

      const mockSubscription2 = {
        id: 'webhook-2',
        userId,
        ...dto,
        secret: 'secret-2',
        status: WebhookStatus.ACTIVE,
      };

      mockSubscriptionRepository.create.mockReturnValueOnce(mockSubscription1);
      mockSubscriptionRepository.save.mockResolvedValueOnce(mockSubscription1);
      mockSubscriptionRepository.create.mockReturnValueOnce(mockSubscription2);
      mockSubscriptionRepository.save.mockResolvedValueOnce(mockSubscription2);

      const result1 = await service.createWebhook(userId, dto);
      const result2 = await service.createWebhook(userId, dto);

      expect(result1.secret).toBeDefined();
      expect(result2.secret).toBeDefined();
      // Secrets should be different (randomly generated)
      expect(result1.secret).not.toBe(result2.secret);
    });
  });
});


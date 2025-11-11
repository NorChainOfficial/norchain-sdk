import { Test, TestingModule } from '@nestjs/testing';
import { WebhooksController } from './webhooks.controller';
import { WebhooksService } from './webhooks.service';
import { CreateWebhookDto } from './dto/create-webhook.dto';
import { WebhookEventType, WebhookStatus } from './entities/webhook-subscription.entity';
import { DeliveryStatus } from './entities/webhook-delivery.entity';

describe('WebhooksController', () => {
  let controller: WebhooksController;
  let webhooksService: jest.Mocked<WebhooksService>;

  const mockWebhooksService = {
    createWebhook: jest.fn(),
    getWebhooks: jest.fn(),
    getDeliveries: jest.fn(),
  };

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      controllers: [WebhooksController],
      providers: [
        {
          provide: WebhooksService,
          useValue: mockWebhooksService,
        },
      ],
    }).compile();

    controller = module.get<WebhooksController>(WebhooksController);
    webhooksService = module.get(WebhooksService);
  });

  afterEach(() => {
    jest.clearAllMocks();
  });

  it('should be defined', () => {
    expect(controller).toBeDefined();
  });

  describe('createWebhook', () => {
    it('should create a webhook subscription', async () => {
      const userId = 'user-123';
      const dto: CreateWebhookDto = {
        url: 'https://example.com/webhook',
        events: [WebhookEventType.TRANSACTION_MINED, WebhookEventType.SWAP_EXECUTED],
      };

      const mockResult = {
        webhook_id: 'webhook-123',
        url: dto.url,
        events: dto.events,
        status: WebhookStatus.ACTIVE,
        secret: 'test-secret',
      };

      mockWebhooksService.createWebhook.mockResolvedValue(mockResult);

      const result = await controller.createWebhook(
        { user: { id: userId } },
        dto,
      );

      expect(result).toEqual(mockResult);
      expect(webhooksService.createWebhook).toHaveBeenCalledWith(userId, dto);
    });

    it('should handle empty events array', async () => {
      const userId = 'user-123';
      const dto: CreateWebhookDto = {
        url: 'https://example.com/webhook',
        events: [],
      };

      const mockResult = {
        webhook_id: 'webhook-123',
        url: dto.url,
        events: [],
        status: WebhookStatus.ACTIVE,
        secret: 'test-secret',
      };

      mockWebhooksService.createWebhook.mockResolvedValue(mockResult);

      const result = await controller.createWebhook(
        { user: { id: userId } },
        dto,
      );

      expect(result).toEqual(mockResult);
      expect(webhooksService.createWebhook).toHaveBeenCalledWith(userId, dto);
    });
  });

  describe('getWebhooks', () => {
    it('should return all webhook subscriptions', async () => {
      const userId = 'user-123';
      const mockResult = {
        webhooks: [
          {
            webhook_id: 'webhook-1',
            url: 'https://example.com/webhook1',
            events: [WebhookEventType.TRANSACTION_MINED],
            status: WebhookStatus.ACTIVE,
            failureCount: 0,
            lastSuccessAt: new Date(),
            createdAt: new Date(),
          },
          {
            webhook_id: 'webhook-2',
            url: 'https://example.com/webhook2',
            events: [WebhookEventType.SWAP_EXECUTED],
            status: WebhookStatus.PAUSED,
            failureCount: 5,
            lastSuccessAt: null,
            createdAt: new Date(),
          },
        ],
      };

      mockWebhooksService.getWebhooks.mockResolvedValue(mockResult);

      const result = await controller.getWebhooks({ user: { id: userId } });

      expect(result).toEqual(mockResult);
      expect(webhooksService.getWebhooks).toHaveBeenCalledWith(userId);
    });

    it('should return empty array when no webhooks exist', async () => {
      const userId = 'user-123';
      const mockResult = {
        webhooks: [],
      };

      mockWebhooksService.getWebhooks.mockResolvedValue(mockResult);

      const result = await controller.getWebhooks({ user: { id: userId } });

      expect(result).toEqual(mockResult);
      expect(result.webhooks).toHaveLength(0);
    });
  });

  describe('getDeliveries', () => {
    it('should return webhook delivery history', async () => {
      const userId = 'user-123';
      const webhookId = 'webhook-123';
      const limit = 50;
      const offset = 0;

      const mockResult = {
        deliveries: [
          {
            delivery_id: 'delivery-1',
            eventType: WebhookEventType.TRANSACTION_MINED,
            status: DeliveryStatus.SUCCESS,
            attemptCount: 1,
            httpStatus: 200,
            errorMessage: null,
            deliveredAt: new Date(),
            createdAt: new Date(),
          },
          {
            delivery_id: 'delivery-2',
            eventType: WebhookEventType.SWAP_EXECUTED,
            status: DeliveryStatus.FAILED,
            attemptCount: 3,
            httpStatus: 500,
            errorMessage: 'Connection timeout',
            deliveredAt: null,
            createdAt: new Date(),
          },
        ],
        total: 2,
        limit,
        offset,
      };

      mockWebhooksService.getDeliveries.mockResolvedValue(mockResult);

      const result = await controller.getDeliveries(
        { user: { id: userId } },
        webhookId,
        limit,
        offset,
      );

      expect(result).toEqual(mockResult);
      expect(webhooksService.getDeliveries).toHaveBeenCalledWith(
        userId,
        webhookId,
        limit,
        offset,
      );
    });

    it('should use default limit and offset when not provided', async () => {
      const userId = 'user-123';
      const webhookId = 'webhook-123';
      const defaultLimit = 50;
      const defaultOffset = 0;

      const mockResult = {
        deliveries: [],
        total: 0,
        limit: defaultLimit,
        offset: defaultOffset,
      };

      mockWebhooksService.getDeliveries.mockResolvedValue(mockResult);

      const result = await controller.getDeliveries(
        { user: { id: userId } },
        webhookId,
        defaultLimit,
        defaultOffset,
      );

      expect(result).toEqual(mockResult);
    });

    it('should handle pagination correctly', async () => {
      const userId = 'user-123';
      const webhookId = 'webhook-123';
      const limit = 10;
      const offset = 20;

      const mockResult = {
        deliveries: [],
        total: 100,
        limit,
        offset,
      };

      mockWebhooksService.getDeliveries.mockResolvedValue(mockResult);

      const result = await controller.getDeliveries(
        { user: { id: userId } },
        webhookId,
        limit,
        offset,
      );

      expect(result.limit).toBe(limit);
      expect(result.offset).toBe(offset);
      expect(result.total).toBe(100);
    });
  });
});


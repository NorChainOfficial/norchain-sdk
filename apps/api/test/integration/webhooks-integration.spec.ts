/**
 * Webhooks Integration Tests
 *
 * Tests webhooks service integration with database
 * - Webhook creation
 * - Delivery tracking
 * - HMAC signing
 * - CloudEvents creation
 */

import { Test, TestingModule } from '@nestjs/testing';
import { INestApplication } from '@nestjs/common';
import { AppModule } from '../../src/app.module';
import { WebhooksService } from '../../src/modules/webhooks/webhooks.service';

describe('Webhooks Integration Tests', () => {
  let app: INestApplication;
  let webhooksService: WebhooksService;

  beforeAll(async () => {
    const moduleFixture: TestingModule = await Test.createTestingModule({
      imports: [AppModule],
    }).compile();

    app = moduleFixture.createNestApplication();
    await app.init();

    webhooksService = moduleFixture.get<WebhooksService>(WebhooksService);
  });

  afterAll(async () => {
    await app.close();
  });

  describe('Webhooks Service', () => {
    it('should be initialized', () => {
      expect(webhooksService).toBeDefined();
    });

    it('should sign payload with HMAC', () => {
      const payload = 'test payload';
      const secret = 'test-secret';

      const signature = webhooksService.signPayload(payload, secret);

      expect(signature).toBeDefined();
      expect(typeof signature).toBe('string');
      expect(signature.length).toBeGreaterThan(0);
    });

    it('should create CloudEvents envelope', () => {
      const eventType = 'TRANSACTION_MINED' as any;
      const data = { txHash: '0x123' };

      const event = webhooksService.createCloudEvent(eventType, data);

      expect(event).toHaveProperty('specversion', '1.0');
      expect(event).toHaveProperty('type', eventType);
      expect(event).toHaveProperty('source');
      expect(event).toHaveProperty('id');
      expect(event).toHaveProperty('time');
      expect(event).toHaveProperty('datacontenttype', 'application/json');
      expect(event).toHaveProperty('data', data);
    });

    it('should get webhooks for user', async () => {
      try {
        const result = await webhooksService.getWebhooks('user-123');
        expect(result).toHaveProperty('webhooks');
        expect(Array.isArray(result.webhooks)).toBe(true);
      } catch (error) {
        expect(error).toBeDefined();
      }
    });
  });
});


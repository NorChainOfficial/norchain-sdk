import { Test, TestingModule } from '@nestjs/testing';
import { INestApplication } from '@nestjs/common';
import request from 'supertest';
import { AppModule } from '../../src/app.module';

describe('Webhooks API Integration', () => {
  let app: INestApplication;
  let authToken: string;

  beforeAll(async () => {
    const moduleFixture: TestingModule = await Test.createTestingModule({
      imports: [AppModule],
    }).compile();

    app = moduleFixture.createNestApplication();
    await app.init();

    // Create test user and get auth token
    const registerResponse = await request(app.getHttpServer())
      .post('/api/v1/auth/register')
      .send({
        email: `test-webhooks-${Date.now()}@example.com`,
        password: 'Test123456!',
        name: 'Test User',
      });

    if (registerResponse.status === 201) {
      const loginResponse = await request(app.getHttpServer())
        .post('/api/v1/auth/login')
        .send({
          email: registerResponse.body.user?.email || `test-webhooks-${Date.now()}@example.com`,
          password: 'Test123456!',
        });
      authToken = loginResponse.body.access_token;
    }
  });

  afterAll(async () => {
    await app.close();
  });

  describe('POST /api/v1/webhooks', () => {
    it('should create a webhook subscription', async () => {
      const response = await request(app.getHttpServer())
        .post('/api/v1/webhooks')
        .set('Authorization', `Bearer ${authToken}`)
        .send({
          url: 'https://example.com/webhook',
          events: ['transaction.mined', 'swap.executed'],
        });

      expect(response.status).toBe(201);
      expect(response.body).toHaveProperty('webhook_id');
      expect(response.body).toHaveProperty('url', 'https://example.com/webhook');
      expect(response.body).toHaveProperty('events');
      expect(response.body).toHaveProperty('secret');
    });

    it('should require authentication', async () => {
      const response = await request(app.getHttpServer())
        .post('/api/v1/webhooks')
        .send({
          url: 'https://example.com/webhook',
          events: ['transaction.mined'],
        });

      expect(response.status).toBe(401);
    });
  });

  describe('GET /api/v1/webhooks', () => {
    it('should return webhook subscriptions', async () => {
      const response = await request(app.getHttpServer())
        .get('/api/v1/webhooks')
        .set('Authorization', `Bearer ${authToken}`);

      expect(response.status).toBe(200);
      expect(response.body).toHaveProperty('webhooks');
      expect(Array.isArray(response.body.webhooks)).toBe(true);
    });
  });

  describe('GET /api/v1/webhooks/:id/deliveries', () => {
    it('should return webhook deliveries', async () => {
      // First create a webhook
      const createResponse = await request(app.getHttpServer())
        .post('/api/v1/webhooks')
        .set('Authorization', `Bearer ${authToken}`)
        .send({
          url: 'https://example.com/webhook',
          events: ['transaction.mined'],
        });

      const webhookId = createResponse.body.webhook_id;

      const response = await request(app.getHttpServer())
        .get(`/api/v1/webhooks/${webhookId}/deliveries`)
        .set('Authorization', `Bearer ${authToken}`);

      expect(response.status).toBe(200);
      expect(response.body).toHaveProperty('deliveries');
      expect(response.body).toHaveProperty('total');
      expect(Array.isArray(response.body.deliveries)).toBe(true);
    });
  });
});


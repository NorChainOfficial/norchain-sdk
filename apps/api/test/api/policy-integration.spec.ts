import { Test, TestingModule } from '@nestjs/testing';
import { INestApplication } from '@nestjs/common';
import request from 'supertest';
import { AppModule } from '../../src/app.module';

describe('Policy API Integration', () => {
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
      .post('/api/auth/register')
      .send({
        email: `test-policy-${Date.now()}@example.com`,
        password: 'Test123456!',
        name: 'Test User',
      });

    if (registerResponse.status === 201) {
      const loginResponse = await request(app.getHttpServer())
        .post('/api/auth/login')
        .send({
          email: registerResponse.body.user?.email || `test-policy-${Date.now()}@example.com`,
          password: 'Test123456!',
        });
      authToken = loginResponse.body.access_token;
    }
  });

  afterAll(async () => {
    await app.close();
  });

  describe('POST /api/policy/check', () => {
    it('should perform policy checks', async () => {
      const response = await request(app.getHttpServer())
        .post('/api/policy/check')
        .set('Authorization', `Bearer ${authToken}`)
        .send({
          fromAddress: '0x742d35Cc6634C0532925a3b844Bc9e7595f0bEb0',
          toAddress: '0x1234567890123456789012345678901234567890',
          amount: '1000000000000000000',
          asset: 'NOR',
        });

      expect(response.status).toBe(200);
      expect(response.body).toHaveProperty('allowed');
      expect(response.body).toHaveProperty('status');
      expect(response.body).toHaveProperty('checks');
      expect(response.body).toHaveProperty('riskScore');
      expect(response.body).toHaveProperty('auditHash');
      expect(Array.isArray(response.body.checks)).toBe(true);
    });

    it('should require authentication', async () => {
      const response = await request(app.getHttpServer())
        .post('/api/policy/check')
        .send({
          fromAddress: '0x742d35Cc6634C0532925a3b844Bc9e7595f0bEb0',
          amount: '1000',
        });

      expect(response.status).toBe(401);
    });
  });

  describe('GET /api/policy/history', () => {
    it('should return policy check history', async () => {
      const response = await request(app.getHttpServer())
        .get('/api/policy/history')
        .set('Authorization', `Bearer ${authToken}`);

      expect(response.status).toBe(200);
      expect(response.body).toHaveProperty('checks');
      expect(response.body).toHaveProperty('total');
      expect(Array.isArray(response.body.checks)).toBe(true);
    });
  });
});


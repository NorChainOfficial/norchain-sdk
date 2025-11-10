import { Test, TestingModule } from '@nestjs/testing';
import { INestApplication } from '@nestjs/common';
import request from 'supertest';
import { AppModule } from '../../src/app.module';

describe('Admin API Integration', () => {
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
        email: `test-admin-${Date.now()}@example.com`,
        password: 'Test123456!',
        name: 'Test Admin',
      });

    if (registerResponse.status === 201) {
      const loginResponse = await request(app.getHttpServer())
        .post('/api/v1/auth/login')
        .send({
          email: registerResponse.body.user?.email || `test-admin-${Date.now()}@example.com`,
          password: 'Test123456!',
        });
      authToken = loginResponse.body.access_token;
    }
  });

  afterAll(async () => {
    await app.close();
  });

  describe('GET /api/v1/admin/validators', () => {
    it('should return validators list', async () => {
      const response = await request(app.getHttpServer())
        .get('/api/v1/admin/validators')
        .set('Authorization', `Bearer ${authToken}`);

      expect(response.status).toBe(200);
      expect(response.body).toHaveProperty('validators');
      expect(response.body).toHaveProperty('total');
      expect(Array.isArray(response.body.validators)).toBe(true);
    });

    it('should require authentication', async () => {
      const response = await request(app.getHttpServer())
        .get('/api/v1/admin/validators');

      expect(response.status).toBe(401);
    });
  });

  describe('GET /api/v1/admin/slashing', () => {
    it('should return slashing events', async () => {
      const response = await request(app.getHttpServer())
        .get('/api/v1/admin/slashing')
        .set('Authorization', `Bearer ${authToken}`);

      expect(response.status).toBe(200);
      expect(response.body).toHaveProperty('events');
      expect(response.body).toHaveProperty('total');
      expect(Array.isArray(response.body.events)).toBe(true);
    });
  });

  describe('GET /api/v1/admin/feature-flags', () => {
    it('should return feature flags', async () => {
      const response = await request(app.getHttpServer())
        .get('/api/v1/admin/feature-flags')
        .set('Authorization', `Bearer ${authToken}`);

      expect(response.status).toBe(200);
      expect(response.body).toHaveProperty('flags');
      expect(Array.isArray(response.body.flags)).toBe(true);
    });
  });

  describe('GET /api/v1/admin/audit-log', () => {
    it('should return audit log', async () => {
      const response = await request(app.getHttpServer())
        .get('/api/v1/admin/audit-log')
        .set('Authorization', `Bearer ${authToken}`);

      expect(response.status).toBe(200);
      expect(response.body).toHaveProperty('logs');
      expect(response.body).toHaveProperty('total');
      expect(Array.isArray(response.body.logs)).toBe(true);
    });
  });
});


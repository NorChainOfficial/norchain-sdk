import { Test, TestingModule } from '@nestjs/testing';
import { INestApplication, ValidationPipe } from '@nestjs/common';
import * as request from 'supertest';
import { AppModule } from '../src/app.module';

describe('AppController (e2e)', () => {
  let app: INestApplication;

  beforeAll(async () => {
    const moduleFixture: TestingModule = await Test.createTestingModule({
      imports: [AppModule],
    }).compile();

    app = moduleFixture.createNestApplication();
    app.useGlobalPipes(
      new ValidationPipe({
        whitelist: true,
        forbidNonWhitelisted: true,
        transform: true,
      }),
    );
    await app.init();
  });

  afterAll(async () => {
    await app.close();
  });

  describe('Health Check', () => {
    it('/health (GET) should return health status', () => {
      return request(app.getHttpServer())
        .get('/api/health')
        .expect(200)
        .expect((res) => {
          expect(res.body).toHaveProperty('status');
        });
    });
  });

  describe('Account Endpoints', () => {
    it('/api/v1/account/balance (GET) should return balance', () => {
      return request(app.getHttpServer())
        .get('/api/v1/account/balance')
        .query({ address: '0x742d35Cc6634C0532925a3b844Bc9e7595f0bEb0' })
        .expect(200)
        .expect((res) => {
          expect(res.body).toHaveProperty('status');
          expect(res.body).toHaveProperty('result');
        });
    });

    it('/api/v1/account/balance (GET) should validate address', () => {
      return request(app.getHttpServer())
        .get('/api/v1/account/balance')
        .query({ address: 'invalid-address' })
        .expect(400);
    });
  });

  describe('Block Endpoints', () => {
    it('/api/v1/block/getblocknumber (GET) should return block number', () => {
      return request(app.getHttpServer())
        .get('/api/v1/block/getblocknumber')
        .expect(200)
        .expect((res) => {
          expect(res.body).toHaveProperty('status');
          expect(res.body).toHaveProperty('result');
        });
    });
  });

  describe('Stats Endpoints', () => {
    it('/api/v1/stats/ethsupply (GET) should return ETH supply', () => {
      return request(app.getHttpServer())
        .get('/api/v1/stats/ethsupply')
        .expect(200)
        .expect((res) => {
          expect(res.body).toHaveProperty('status');
          expect(res.body).toHaveProperty('result');
        });
    });
  });

  describe('Auth Endpoints', () => {
    it('/api/v1/auth/register (POST) should register a user', () => {
      return request(app.getHttpServer())
        .post('/api/v1/auth/register')
        .send({
          email: 'test@example.com',
          password: 'password123',
          name: 'Test User',
        })
        .expect(201)
        .expect((res) => {
          expect(res.body).toHaveProperty('email');
          expect(res.body.email).toBe('test@example.com');
        });
    });

    it('/api/v1/auth/register (POST) should reject duplicate email', async () => {
      // First registration
      await request(app.getHttpServer())
        .post('/api/v1/auth/register')
        .send({
          email: 'duplicate@example.com',
          password: 'password123',
          name: 'Test User',
        })
        .expect(201);

      // Second registration with same email
      return request(app.getHttpServer())
        .post('/api/v1/auth/register')
        .send({
          email: 'duplicate@example.com',
          password: 'password123',
          name: 'Test User',
        })
        .expect(409);
    });

    it('/api/v1/auth/login (POST) should return access token', async () => {
      // Register first
      await request(app.getHttpServer())
        .post('/api/v1/auth/register')
        .send({
          email: 'login@example.com',
          password: 'password123',
          name: 'Test User',
        })
        .expect(201);

      // Then login
      return request(app.getHttpServer())
        .post('/api/v1/auth/login')
        .send({
          email: 'login@example.com',
          password: 'password123',
        })
        .expect(200)
        .expect((res) => {
          expect(res.body).toHaveProperty('access_token');
        });
    });

    it('/api/v1/auth/login (POST) should reject invalid credentials', async () => {
      return request(app.getHttpServer())
        .post('/api/v1/auth/login')
        .send({
          email: 'nonexistent@example.com',
          password: 'wrong-password',
        })
        .expect(401);
    });
  });
});


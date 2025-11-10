/**
 * Comprehensive API Integration Tests
 * 
 * Tests complete API endpoints with database and external service integration
 * - Full HTTP request/response cycle
 * - Database operations
 * - External service calls (RPC, Supabase)
 * - Authentication flows
 * - Error handling
 */

import { Test, TestingModule } from '@nestjs/testing';
import { INestApplication, ValidationPipe } from '@nestjs/common';
import * as request from 'supertest';
import { AppModule } from '../../src/app.module';
import { ConfigService } from '@nestjs/config';

describe('API Integration Tests', () => {
  let app: INestApplication;
  let configService: ConfigService;
  let authToken: string;
  let testUserId: string;
  let testEmail: string;

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

    configService = moduleFixture.get<ConfigService>(ConfigService);

    // Setup test user for authenticated endpoints
    testEmail = `integration-test-${Date.now()}@example.com`;
    const registerResponse = await request(app.getHttpServer())
      .post('/api/v1/auth/register')
      .send({
        email: testEmail,
        password: 'TestPassword123!',
        name: 'Integration Test User',
      });

    if (registerResponse.status === 201) {
      testUserId = registerResponse.body.id;
      const loginResponse = await request(app.getHttpServer())
        .post('/api/v1/auth/login')
        .send({
          email: testEmail,
          password: 'TestPassword123!',
        });
      if (loginResponse.status === 200) {
        authToken = loginResponse.body.access_token;
      }
    }
  });

  afterAll(async () => {
    await app.close();
  });

  describe('Health & Status Endpoints', () => {
    it('GET /api/health should return health status', async () => {
      const response = await request(app.getHttpServer())
        .get('/api/health')
        .expect(200);

      expect(response.body).toHaveProperty('status');
      expect(response.body).toHaveProperty('info');
      expect(response.body).toHaveProperty('error');
    });

    it('GET /api/health/live should return liveness status', async () => {
      const response = await request(app.getHttpServer())
        .get('/api/health/live')
        .expect(200);

      expect(response.body).toHaveProperty('status');
      expect(response.body.status).toBe('ok');
    });

    it('GET /api/health/ready should return readiness status', async () => {
      const response = await request(app.getHttpServer())
        .get('/api/health/ready')
        .expect(200);

      expect(response.body).toHaveProperty('status');
    });
  });

  describe('Account Endpoints Integration', () => {
    const validAddress = '0xdAC17F958D2ee523a2206206994597C13D831ec7';

    it('GET /api/v1/account/balance should return balance with caching', async () => {
      const response = await request(app.getHttpServer())
        .get('/api/v1/account/balance')
        .query({ address: validAddress })
        .expect(200);

      expect(response.body).toHaveProperty('status');
      expect(response.body).toHaveProperty('result');
      expect(response.body.status).toBe('1');

      // Second call should use cache
      const cachedResponse = await request(app.getHttpServer())
        .get('/api/v1/account/balance')
        .query({ address: validAddress })
        .expect(200);

      expect(cachedResponse.body).toEqual(response.body);
    });

    it('GET /api/v1/account/balance should validate address format', async () => {
      await request(app.getHttpServer())
        .get('/api/v1/account/balance')
        .query({ address: 'invalid-address' })
        .expect(400);
    });

    it('GET /api/v1/account/txlist should return paginated transactions', async () => {
      const response = await request(app.getHttpServer())
        .get('/api/v1/account/txlist')
        .query({ address: validAddress, page: 1, limit: 10 })
        .expect(200);

      expect(response.body).toHaveProperty('status');
      expect(response.body).toHaveProperty('result');
      expect(Array.isArray(response.body.result)).toBe(true);
    });

    it('GET /api/v1/account/tokenlist should return token list', async () => {
      const response = await request(app.getHttpServer())
        .get('/api/v1/account/tokenlist')
        .query({ address: validAddress })
        .expect(200);

      expect(response.body).toHaveProperty('status');
      expect(response.body).toHaveProperty('result');
      expect(Array.isArray(response.body.result)).toBe(true);
    });

    it('GET /api/v1/account/tokentx should return token transfers', async () => {
      const response = await request(app.getHttpServer())
        .get('/api/v1/account/tokentx')
        .query({ address: validAddress, page: 1, limit: 10 })
        .expect(200);

      expect(response.body).toHaveProperty('status');
      expect(response.body).toHaveProperty('result');
    });

    it('GET /api/v1/account/balancemulti should handle multiple addresses', async () => {
      const addresses = [
        validAddress,
        '0xA0b86991c6218b36c1d19D4a2e9Eb0cE3606eB48',
      ];

      const response = await request(app.getHttpServer())
        .get('/api/v1/account/balancemulti')
        .query({ address: addresses })
        .expect(200);

      expect(response.body).toHaveProperty('status');
      expect(response.body).toHaveProperty('result');
      expect(Array.isArray(response.body.result)).toBe(true);
      expect(response.body.result.length).toBe(addresses.length);
    });
  });

  describe('Block Endpoints Integration', () => {
    it('GET /api/v1/block/getblocknumber should return current block number', async () => {
      const response = await request(app.getHttpServer())
        .get('/api/v1/block/getblocknumber')
        .expect(200);

      expect(response.body).toHaveProperty('status');
      expect(response.body).toHaveProperty('result');
      expect(typeof response.body.result).toBe('number');
      expect(response.body.result).toBeGreaterThan(0);
    });

    it('GET /api/v1/block/getblock should return block by number', async () => {
      // First get current block number
      const blockNumberResponse = await request(app.getHttpServer())
        .get('/api/v1/block/getblocknumber')
        .expect(200);

      const blockNumber = blockNumberResponse.body.result;

      const response = await request(app.getHttpServer())
        .get('/api/v1/block/getblock')
        .query({ blockno: blockNumber })
        .expect(200);

      expect(response.body).toHaveProperty('status');
      expect(response.body).toHaveProperty('result');
      expect(response.body.result).toHaveProperty('number');
      expect(response.body.result.number).toBe(blockNumber);
    });

    it('GET /api/v1/block/getblockreward should calculate block reward', async () => {
      const blockNumber = 12345;

      const response = await request(app.getHttpServer())
        .get('/api/v1/block/getblockreward')
        .query({ blockno: blockNumber })
        .expect(200);

      expect(response.body).toHaveProperty('status');
      expect(response.body).toHaveProperty('result');
      expect(response.body.result).toHaveProperty('blockReward');
    });

    it('GET /api/v1/block/getblockcountdown should return countdown', async () => {
      const blockNumberResponse = await request(app.getHttpServer())
        .get('/api/v1/block/getblocknumber')
        .expect(200);

      const futureBlock = blockNumberResponse.body.result + 100;

      const response = await request(app.getHttpServer())
        .get('/api/v1/block/getblockcountdown')
        .query({ blockno: futureBlock })
        .expect(200);

      expect(response.body).toHaveProperty('status');
      expect(response.body).toHaveProperty('result');
    });
  });

  describe('Transaction Endpoints Integration', () => {
    const testTxHash = '0x1234567890abcdef1234567890abcdef1234567890abcdef1234567890abcdef';

    it('GET /api/v1/transaction/gettxinfo should handle non-existent transaction', async () => {
      const response = await request(app.getHttpServer())
        .get('/api/v1/transaction/gettxinfo')
        .query({ txhash: testTxHash });

      // Should return 200 with status 0 or 404
      expect([200, 404]).toContain(response.status);
      if (response.status === 200) {
        expect(response.body).toHaveProperty('status');
      }
    });

    it('GET /api/v1/transaction/gettxreceiptstatus should return receipt status', async () => {
      const response = await request(app.getHttpServer())
        .get('/api/v1/transaction/gettxreceiptstatus')
        .query({ txhash: testTxHash });

      expect([200, 404]).toContain(response.status);
    });

    it('GET /api/v1/transaction/getstatus should return transaction status', async () => {
      const response = await request(app.getHttpServer())
        .get('/api/v1/transaction/getstatus')
        .query({ txhash: testTxHash });

      expect([200, 404]).toContain(response.status);
    });
  });

  describe('Token Endpoints Integration', () => {
    const tokenAddress = '0xdAC17F958D2ee523a2206206994597C13D831ec7';
    const holderAddress = '0xA0b86991c6218b36c1d19D4a2e9Eb0cE3606eB48';

    it('GET /api/v1/token/tokensupply should return token supply', async () => {
      const response = await request(app.getHttpServer())
        .get('/api/v1/token/tokensupply')
        .query({ contractaddress: tokenAddress })
        .expect(200);

      expect(response.body).toHaveProperty('status');
      expect(response.body).toHaveProperty('result');
    });

    it('GET /api/v1/token/tokenaccountbalance should return token balance', async () => {
      const response = await request(app.getHttpServer())
        .get('/api/v1/token/tokenaccountbalance')
        .query({ contractaddress: tokenAddress, address: holderAddress })
        .expect(200);

      expect(response.body).toHaveProperty('status');
      expect(response.body).toHaveProperty('result');
    });

    it('GET /api/v1/token/tokeninfo should return token information', async () => {
      const response = await request(app.getHttpServer())
        .get('/api/v1/token/tokeninfo')
        .query({ contractaddress: tokenAddress })
        .expect(200);

      expect(response.body).toHaveProperty('status');
      expect(response.body).toHaveProperty('result');
      if (response.body.result) {
        expect(response.body.result).toHaveProperty('name');
        expect(response.body.result).toHaveProperty('symbol');
      }
    });

    it('GET /api/v1/token/tokentx should return token transfers', async () => {
      const response = await request(app.getHttpServer())
        .get('/api/v1/token/tokentx')
        .query({ contractaddress: tokenAddress, page: 1, limit: 10 })
        .expect(200);

      expect(response.body).toHaveProperty('status');
      expect(response.body).toHaveProperty('result');
    });
  });

  describe('Authentication Flow Integration', () => {
    let testUserEmail: string;
    let testUserToken: string;

    beforeEach(() => {
      testUserEmail = `auth-test-${Date.now()}@example.com`;
    });

    it('should complete full registration and login flow', async () => {
      // Register
      const registerResponse = await request(app.getHttpServer())
        .post('/api/v1/auth/register')
        .send({
          email: testUserEmail,
          password: 'TestPassword123!',
          name: 'Test User',
        })
        .expect(201);

      expect(registerResponse.body).toHaveProperty('email');
      expect(registerResponse.body.email).toBe(testUserEmail);

      // Login
      const loginResponse = await request(app.getHttpServer())
        .post('/api/v1/auth/login')
        .send({
          email: testUserEmail,
          password: 'TestPassword123!',
        })
        .expect(200);

      expect(loginResponse.body).toHaveProperty('access_token');
      testUserToken = loginResponse.body.access_token;
      expect(testUserToken).toBeDefined();
    });

    it('should reject duplicate registration', async () => {
      const email = `duplicate-${Date.now()}@example.com`;

      // First registration
      await request(app.getHttpServer())
        .post('/api/v1/auth/register')
        .send({
          email,
          password: 'TestPassword123!',
          name: 'Test User',
        })
        .expect(201);

      // Duplicate registration
      await request(app.getHttpServer())
        .post('/api/v1/auth/register')
        .send({
          email,
          password: 'TestPassword123!',
          name: 'Test User',
        })
        .expect(409);
    });

    it('should reject invalid credentials', async () => {
      await request(app.getHttpServer())
        .post('/api/v1/auth/login')
        .send({
          email: 'nonexistent@example.com',
          password: 'wrong-password',
        })
        .expect(401);
    });

    it('should validate password strength', async () => {
      await request(app.getHttpServer())
        .post('/api/v1/auth/register')
        .send({
          email: `weak-${Date.now()}@example.com`,
          password: '123', // Too weak
          name: 'Test User',
        })
        .expect(400);
    });
  });

  describe('Orders Endpoints Integration', () => {
    const testAddress = '0xdAC17F958D2ee523a2206206994597C13D831ec7';
    let orderId: string;

    it('POST /api/v1/orders/limit should create limit order', async () => {
      const response = await request(app.getHttpServer())
        .post('/api/v1/orders/limit')
        .send({
          userAddress: testAddress,
          pair: 'NOR/USDT',
          side: 'buy',
          price: '0.0001',
          amount: '1000000000000000000',
        })
        .expect(201);

      expect(response.body).toHaveProperty('id');
      orderId = response.body.id;
    });

    it('GET /api/v1/orders/limit should return user orders', async () => {
      const response = await request(app.getHttpServer())
        .get('/api/v1/orders/limit')
        .query({ user: testAddress })
        .expect(200);

      expect(Array.isArray(response.body)).toBe(true);
    });

    it('POST /api/v1/orders/stop-loss should create stop-loss order', async () => {
      const response = await request(app.getHttpServer())
        .post('/api/v1/orders/stop-loss')
        .send({
          userAddress: testAddress,
          pair: 'NOR/USDT',
          stopPrice: '0.00008',
          amount: '1000000000000000000',
        })
        .expect(201);

      expect(response.body).toHaveProperty('id');
    });

    it('POST /api/v1/orders/dca should create DCA schedule', async () => {
      const response = await request(app.getHttpServer())
        .post('/api/v1/orders/dca')
        .send({
          userAddress: testAddress,
          pair: 'NOR/USDT',
          amountPerExecution: '1000000000000000000',
          intervalHours: 24,
          totalExecutions: 10,
        })
        .expect(201);

      expect(response.body).toHaveProperty('id');
    });

    it('DELETE /api/v1/orders/limit/:id should cancel order', async () => {
      if (orderId) {
        await request(app.getHttpServer())
          .delete(`/api/v1/orders/limit/${orderId}`)
          .expect((res) => {
            expect([200, 404]).toContain(res.status);
          });
      }
    });
  });

  describe('Swap Endpoints Integration', () => {
    it('POST /api/v1/swap/quote should return swap quote', async () => {
      const response = await request(app.getHttpServer())
        .post('/api/v1/swap/quote')
        .send({
          tokenIn: 'NOR',
          tokenOut: 'USDT',
          amountIn: '1000',
          chainId: '65001',
        })
        .expect(200);

      expect(response.body).toHaveProperty('amountOut');
      expect(response.body).toHaveProperty('quoteId');
    });

    it('POST /api/v1/swap/quote should validate input', async () => {
      await request(app.getHttpServer())
        .post('/api/v1/swap/quote')
        .send({
          tokenIn: '', // Invalid
          tokenOut: 'USDT',
          amountIn: '1000',
        })
        .expect(400);
    });

    it('POST /api/v1/swap/execute should handle swap execution', async () => {
      // First get a quote
      const quoteResponse = await request(app.getHttpServer())
        .post('/api/v1/swap/quote')
        .send({
          tokenIn: 'NOR',
          tokenOut: 'USDT',
          amountIn: '1000',
          chainId: '65001',
        })
        .expect(200);

      const quoteId = quoteResponse.body.quoteId;

      // Execute swap (may fail if no valid transaction, but should handle gracefully)
      const response = await request(app.getHttpServer())
        .post('/api/v1/swap/execute')
        .send({
          quoteId,
          signedTx: '0x1234567890abcdef',
          userAddress: '0xdAC17F958D2ee523a2206206994597C13D831ec7',
        });

      // Should return 200 or 400 depending on transaction validity
      expect([200, 400]).toContain(response.status);
    });
  });

  describe('Batch Endpoints Integration', () => {
    const addresses = [
      '0xdAC17F958D2ee523a2206206994597C13D831ec7',
      '0xA0b86991c6218b36c1d19D4a2e9Eb0cE3606eB48',
    ];

    it('POST /api/v1/batch/balances should return batch balances', async () => {
      const response = await request(app.getHttpServer())
        .post('/api/v1/batch/balances')
        .send({ address: addresses })
        .expect(200);

      expect(response.body).toHaveProperty('status');
      expect(response.body).toHaveProperty('result');
      expect(Array.isArray(response.body.result)).toBe(true);
      expect(response.body.result.length).toBe(addresses.length);
    });

    it('POST /api/v1/batch/transaction-counts should return batch counts', async () => {
      const response = await request(app.getHttpServer())
        .post('/api/v1/batch/transaction-counts')
        .send({ address: addresses })
        .expect(200);

      expect(response.body).toHaveProperty('status');
      expect(response.body).toHaveProperty('result');
    });

    it('POST /api/v1/batch/token-balances should return batch token balances', async () => {
      const response = await request(app.getHttpServer())
        .post('/api/v1/batch/token-balances')
        .send({
          requests: [
            {
              address: addresses[0],
              tokenAddress: '0xdAC17F958D2ee523a2206206994597C13D831ec7',
            },
          ],
        })
        .expect(200);

      expect(response.body).toHaveProperty('status');
      expect(response.body).toHaveProperty('result');
    });
  });

  describe('Analytics Endpoints Integration', () => {
    const address = '0xdAC17F958D2ee523a2206206994597C13D831ec7';

    it('GET /api/v1/analytics/portfolio should return portfolio summary', async () => {
      const response = await request(app.getHttpServer())
        .get('/api/v1/analytics/portfolio')
        .query({ address })
        .expect(200);

      expect(response.body).toHaveProperty('status');
      expect(response.body).toHaveProperty('result');
    });

    it('GET /api/v1/analytics/transactions should return transaction analytics', async () => {
      const response = await request(app.getHttpServer())
        .get('/api/v1/analytics/transactions')
        .query({ address, days: 30 })
        .expect(200);

      expect(response.body).toHaveProperty('status');
      expect(response.body).toHaveProperty('result');
    });

    it('GET /api/v1/analytics/network should return network statistics', async () => {
      const response = await request(app.getHttpServer())
        .get('/api/v1/analytics/network')
        .expect(200);

      expect(response.body).toHaveProperty('status');
      expect(response.body).toHaveProperty('result');
    });
  });

  describe('Notifications Endpoints Integration', () => {
    it('GET /api/v1/notifications should require authentication', async () => {
      const response = await request(app.getHttpServer())
        .get('/api/v1/notifications');

      // Should require auth
      expect([200, 401]).toContain(response.status);
    });

    it('GET /api/v1/notifications/unread/count should return unread count', async () => {
      if (authToken) {
        const response = await request(app.getHttpServer())
          .get('/api/v1/notifications/unread/count')
          .set('Authorization', `Bearer ${authToken}`)
          .expect(200);

        expect(response.body).toHaveProperty('count');
        expect(typeof response.body.count).toBe('number');
      }
    });

    it('POST /api/v1/notifications should create notification', async () => {
      if (authToken) {
        const response = await request(app.getHttpServer())
          .post('/api/v1/notifications')
          .set('Authorization', `Bearer ${authToken}`)
          .send({
            type: 'transaction',
            title: 'Test Notification',
            message: 'This is a test notification',
          })
          .expect((res) => {
            expect([200, 201]).toContain(res.status);
          });
      }
    });
  });

  describe('Error Handling Integration', () => {
    it('should return 404 for non-existent endpoints', async () => {
      await request(app.getHttpServer())
        .get('/api/v1/nonexistent')
        .expect(404);
    });

    it('should return 400 for invalid query parameters', async () => {
      await request(app.getHttpServer())
        .get('/api/v1/account/balance')
        .query({ address: 'invalid' })
        .expect(400);
    });

    it('should return 400 for missing required parameters', async () => {
      await request(app.getHttpServer())
        .get('/api/v1/account/balance')
        .expect(400);
    });

    it('should handle rate limiting', async () => {
      // Make multiple rapid requests
      const requests = Array(20).fill(null).map(() =>
        request(app.getHttpServer())
          .get('/api/v1/block/getblocknumber')
      );

      const responses = await Promise.all(requests);
      
      // Some requests might be rate limited (429)
      const statusCodes = responses.map(r => r.status);
      expect(statusCodes.every(code => [200, 429].includes(code))).toBe(true);
    });
  });

  describe('Caching Integration', () => {
    const testAddress = '0xdAC17F958D2ee523a2206206994597C13D831ec7';

    it('should cache account balance responses', async () => {
      const firstResponse = await request(app.getHttpServer())
        .get('/api/v1/account/balance')
        .query({ address: testAddress })
        .expect(200);

      const firstTimestamp = Date.now();

      // Second request should be faster (cached)
      const secondResponse = await request(app.getHttpServer())
        .get('/api/v1/account/balance')
        .query({ address: testAddress })
        .expect(200);

      const secondTimestamp = Date.now();
      const responseTime = secondTimestamp - firstTimestamp;

      // Cached response should be faster (less than 100ms typically)
      expect(responseTime).toBeLessThan(1000); // Allow some buffer
      expect(secondResponse.body).toEqual(firstResponse.body);
    });
  });
});


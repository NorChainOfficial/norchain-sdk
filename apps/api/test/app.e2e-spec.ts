// Mock bcrypt before any imports that use it
jest.mock('bcrypt', () => ({
  hash: jest.fn((password: string) => Promise.resolve(`hashed_${password}`)),
  compare: jest.fn((password: string, hash: string) => Promise.resolve(hash === `hashed_${password}`)),
  genSalt: jest.fn(() => Promise.resolve('salt')),
}));

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
    it('/api/health (GET) should return health status', () => {
      return request(app.getHttpServer())
        .get('/api/health')
        .expect(200)
        .expect((res) => {
          expect(res.body).toHaveProperty('status');
        });
    });

    it('/api/health/liveness (GET) should return liveness status', () => {
      return request(app.getHttpServer())
        .get('/api/health/liveness')
        .expect(200)
        .expect((res) => {
          expect(res.body).toHaveProperty('status');
        });
    });

    it('/api/health/readiness (GET) should return readiness status', () => {
      return request(app.getHttpServer())
        .get('/api/health/readiness')
        .expect(200)
        .expect((res) => {
          expect(res.body).toHaveProperty('status');
        });
    });
  });

  describe('Account Endpoints', () => {
    const validAddress = '0xdAC17F958D2ee523a2206206994597C13D831ec7';

    it('/api/v1/account/balance (GET) should return balance', () => {
      return request(app.getHttpServer())
        .get('/api/v1/account/balance')
        .query({ address: validAddress })
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

    it('/api/v1/account/txlist (GET) should return transactions', () => {
      return request(app.getHttpServer())
        .get('/api/v1/account/txlist')
        .query({ address: validAddress, page: 1, limit: 10 })
        .expect(200)
        .expect((res) => {
          expect(res.body).toHaveProperty('status');
          expect(res.body).toHaveProperty('result');
        });
    });

    it('/api/v1/account/summary (GET) should return account summary', () => {
      return request(app.getHttpServer())
        .get('/api/v1/account/summary')
        .query({ address: validAddress })
        .set('Authorization', 'Bearer mock-token') // Requires auth
        .expect((res) => {
          // May require authentication
          expect([200, 401]).toContain(res.status);
        });
    });

    it('/api/v1/account/tokenlist (GET) should return token list', () => {
      return request(app.getHttpServer())
        .get('/api/v1/account/tokenlist')
        .query({ address: validAddress })
        .expect(200)
        .expect((res) => {
          expect(res.body).toHaveProperty('status');
          expect(res.body).toHaveProperty('result');
        });
    });

    it('/api/v1/account/tokentx (GET) should return token transfers', () => {
      return request(app.getHttpServer())
        .get('/api/v1/account/tokentx')
        .query({ address: validAddress })
        .expect(200)
        .expect((res) => {
          expect(res.body).toHaveProperty('status');
          expect(res.body).toHaveProperty('result');
        });
    });

    it('/api/v1/account/balancemulti (GET) should return multiple balances', () => {
      return request(app.getHttpServer())
        .get('/api/v1/account/balancemulti')
        .query({ address: [validAddress, '0xA0b86991c6218b36c1d19D4a2e9Eb0cE3606eB48'] })
        .expect(200)
        .expect((res) => {
          expect(res.body).toHaveProperty('status');
          expect(res.body).toHaveProperty('result');
        });
    });

    it('/api/v1/account/txlistinternal (GET) should return internal transactions', () => {
      return request(app.getHttpServer())
        .get('/api/v1/account/txlistinternal')
        .query({ address: validAddress })
        .expect(200)
        .expect((res) => {
          expect(res.body).toHaveProperty('status');
          expect(res.body).toHaveProperty('result');
        });
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

    it('/api/v1/block/getblock (GET) should return block by number', () => {
      return request(app.getHttpServer())
        .get('/api/v1/block/getblock')
        .query({ blockno: 12345 })
        .expect(200)
        .expect((res) => {
          expect(res.body).toHaveProperty('status');
          expect(res.body).toHaveProperty('result');
        });
    });

    it('/api/v1/block/getblockreward (GET) should return block reward', () => {
      return request(app.getHttpServer())
        .get('/api/v1/block/getblockreward')
        .query({ blockno: 12345 })
        .expect(200)
        .expect((res) => {
          expect(res.body).toHaveProperty('status');
          expect(res.body).toHaveProperty('result');
        });
    });

    it('/api/v1/block/getblockcountdown (GET) should return block countdown', () => {
      return request(app.getHttpServer())
        .get('/api/v1/block/getblockcountdown')
        .query({ blockno: 12350 })
        .expect(200)
        .expect((res) => {
          expect(res.body).toHaveProperty('status');
          expect(res.body).toHaveProperty('result');
        });
    });
  });

  describe('Transaction Endpoints', () => {
    const txHash = '0x1234567890abcdef1234567890abcdef1234567890abcdef1234567890abcdef';

    it('/api/v1/transaction/gettxinfo (GET) should return transaction', () => {
      return request(app.getHttpServer())
        .get('/api/v1/transaction/gettxinfo')
        .query({ txhash: txHash })
        .expect((res) => {
          // May return 200 or 404 depending on transaction existence
          expect([200, 404]).toContain(res.status);
        });
    });

    it('/api/v1/transaction/gettxreceiptstatus (GET) should return receipt status', () => {
      return request(app.getHttpServer())
        .get('/api/v1/transaction/gettxreceiptstatus')
        .query({ txhash: txHash })
        .expect((res) => {
          expect([200, 404]).toContain(res.status);
        });
    });

    it('/api/v1/transaction/getstatus (GET) should return transaction status', () => {
      return request(app.getHttpServer())
        .get('/api/v1/transaction/getstatus')
        .query({ txhash: txHash })
        .expect((res) => {
          expect([200, 404]).toContain(res.status);
        });
    });
  });

  describe('Token Endpoints', () => {
    const tokenAddress = '0xdAC17F958D2ee523a2206206994597C13D831ec7';
    const holderAddress = '0xA0b86991c6218b36c1d19D4a2e9Eb0cE3606eB48';

    it('/api/v1/token/tokensupply (GET) should return token supply', () => {
      return request(app.getHttpServer())
        .get('/api/v1/token/tokensupply')
        .query({ contractaddress: tokenAddress })
        .expect(200)
        .expect((res) => {
          expect(res.body).toHaveProperty('status');
          expect(res.body).toHaveProperty('result');
        });
    });

    it('/api/v1/token/tokenaccountbalance (GET) should return token balance', () => {
      return request(app.getHttpServer())
        .get('/api/v1/token/tokenaccountbalance')
        .query({ contractaddress: tokenAddress, address: holderAddress })
        .expect(200)
        .expect((res) => {
          expect(res.body).toHaveProperty('status');
          expect(res.body).toHaveProperty('result');
        });
    });

    it('/api/v1/token/tokeninfo (GET) should return token info', () => {
      return request(app.getHttpServer())
        .get('/api/v1/token/tokeninfo')
        .query({ contractaddress: tokenAddress })
        .expect(200)
        .expect((res) => {
          expect(res.body).toHaveProperty('status');
          expect(res.body).toHaveProperty('result');
        });
    });

    it('/api/v1/token/tokentx (GET) should return token transfers', () => {
      return request(app.getHttpServer())
        .get('/api/v1/token/tokentx')
        .query({ contractaddress: tokenAddress, page: 1, limit: 10 })
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

    it('/api/v1/stats/ethprice (GET) should return ETH price', () => {
      return request(app.getHttpServer())
        .get('/api/v1/stats/ethprice')
        .expect(200)
        .expect((res) => {
          expect(res.body).toHaveProperty('status');
          expect(res.body).toHaveProperty('result');
        });
    });

    it('/api/v1/stats/chainsize (GET) should return chain size', () => {
      return request(app.getHttpServer())
        .get('/api/v1/stats/chainsize')
        .expect(200)
        .expect((res) => {
          expect(res.body).toHaveProperty('status');
          expect(res.body).toHaveProperty('result');
        });
    });

    it('/api/v1/stats/nodecount (GET) should return node count', () => {
      return request(app.getHttpServer())
        .get('/api/v1/stats/nodecount')
        .expect(200)
        .expect((res) => {
          expect(res.body).toHaveProperty('status');
          expect(res.body).toHaveProperty('result');
        });
    });
  });

  describe('Gas Endpoints', () => {
    it('/api/v1/gas/gasoracle (GET) should return gas oracle', () => {
      return request(app.getHttpServer())
        .get('/api/v1/gas/gasoracle')
        .expect(200)
        .expect((res) => {
          expect(res.body).toHaveProperty('status');
          expect(res.body).toHaveProperty('result');
        });
    });

    it('/api/v1/gas/gasestimate (POST) should estimate gas', () => {
      return request(app.getHttpServer())
        .post('/api/v1/gas/gasestimate')
        .send({
          to: '0xdAC17F958D2ee523a2206206994597C13D831ec7',
          from: '0xA0b86991c6218b36c1d19D4a2e9Eb0cE3606eB48',
          value: '1000000000000000000',
        })
        .expect(200)
        .expect((res) => {
          expect(res.body).toHaveProperty('status');
          expect(res.body).toHaveProperty('result');
        });
    });
  });

  describe('Contract Endpoints', () => {
    const contractAddress = '0xdAC17F958D2ee523a2206206994597C13D831ec7';

    it('/api/v1/contract/getabi (GET) should return contract ABI', () => {
      return request(app.getHttpServer())
        .get('/api/v1/contract/getabi')
        .query({ address: contractAddress })
        .expect(200)
        .expect((res) => {
          expect(res.body).toHaveProperty('status');
          expect(res.body).toHaveProperty('result');
        });
    });

    it('/api/v1/contract/getsourcecode (GET) should return source code', () => {
      return request(app.getHttpServer())
        .get('/api/v1/contract/getsourcecode')
        .query({ address: contractAddress })
        .expect(200)
        .expect((res) => {
          expect(res.body).toHaveProperty('status');
          expect(res.body).toHaveProperty('result');
        });
    });

    it('/api/v1/contract/verifycontract (POST) should verify contract', () => {
      return request(app.getHttpServer())
        .post('/api/v1/contract/verifycontract')
        .send({
          address: contractAddress,
          sourceCode: 'contract Test {}',
          contractName: 'Test',
          compilerVersion: '0.8.0',
          optimizationUsed: false,
          abi: [],
        })
        .expect(200)
        .expect((res) => {
          expect(res.body).toHaveProperty('status');
        });
    });
  });

  describe('Logs Endpoints', () => {
    it('/api/v1/logs/getlogs (POST) should return event logs', () => {
      return request(app.getHttpServer())
        .post('/api/v1/logs/getlogs')
        .send({
          fromBlock: 1000,
          toBlock: 2000,
          address: '0xdAC17F958D2ee523a2206206994597C13D831ec7',
        })
        .expect(200)
        .expect((res) => {
          expect(res.body).toHaveProperty('status');
          expect(res.body).toHaveProperty('result');
        });
    });

    it('/api/v1/logs/geteventlogs (GET) should return event logs', () => {
      return request(app.getHttpServer())
        .get('/api/v1/logs/geteventlogs')
        .query({ event: 'Transfer(address,address,uint256)', fromBlock: 1000, toBlock: 2000 })
        .expect(200)
        .expect((res) => {
          expect(res.body).toHaveProperty('status');
          expect(res.body).toHaveProperty('result');
        });
    });
  });

  describe('Batch Endpoints', () => {
    it('/api/v1/batch/balances (POST) should return batch balances', () => {
      return request(app.getHttpServer())
        .post('/api/v1/batch/balances')
        .send({ address: ['0xdAC17F958D2ee523a2206206994597C13D831ec7', '0xA0b86991c6218b36c1d19D4a2e9Eb0cE3606eB48'] })
        .expect(200)
        .expect((res) => {
          expect(res.body).toHaveProperty('status');
          expect(res.body).toHaveProperty('result');
        });
    });

    it('/api/v1/batch/transaction-counts (POST) should return batch transaction counts', () => {
      return request(app.getHttpServer())
        .post('/api/v1/batch/transaction-counts')
        .send({ address: ['0xdAC17F958D2ee523a2206206994597C13D831ec7'] })
        .expect(200)
        .expect((res) => {
          expect(res.body).toHaveProperty('status');
          expect(res.body).toHaveProperty('result');
        });
    });

    it('/api/v1/batch/token-balances (POST) should return batch token balances', () => {
      return request(app.getHttpServer())
        .post('/api/v1/batch/token-balances')
        .send({
          requests: [
            { address: '0xdAC17F958D2ee523a2206206994597C13D831ec7', tokenAddress: '0xA0b86991c6218b36c1d19D4a2e9Eb0cE3606eB48' },
          ],
        })
        .expect(200)
        .expect((res) => {
          expect(res.body).toHaveProperty('status');
          expect(res.body).toHaveProperty('result');
        });
    });

    it('/api/v1/batch/blocks (POST) should return batch blocks', () => {
      return request(app.getHttpServer())
        .post('/api/v1/batch/blocks')
        .send({ blockNumbers: [12345, 12346] })
        .expect(200)
        .expect((res) => {
          expect(res.body).toHaveProperty('status');
          expect(res.body).toHaveProperty('result');
        });
    });
  });

  describe('Analytics Endpoints', () => {
    const address = '0xdAC17F958D2ee523a2206206994597C13D831ec7';

    it('/api/v1/analytics/portfolio (GET) should return portfolio summary', () => {
      return request(app.getHttpServer())
        .get('/api/v1/analytics/portfolio')
        .query({ address })
        .expect(200)
        .expect((res) => {
          expect(res.body).toHaveProperty('status');
          expect(res.body).toHaveProperty('result');
        });
    });

    it('/api/v1/analytics/transactions (GET) should return transaction analytics', () => {
      return request(app.getHttpServer())
        .get('/api/v1/analytics/transactions')
        .query({ address, days: 30 })
        .expect(200)
        .expect((res) => {
          expect(res.body).toHaveProperty('status');
          expect(res.body).toHaveProperty('result');
        });
    });

    it('/api/v1/analytics/network (GET) should return network statistics', () => {
      return request(app.getHttpServer())
        .get('/api/v1/analytics/network')
        .expect(200)
        .expect((res) => {
          expect(res.body).toHaveProperty('status');
          expect(res.body).toHaveProperty('result');
        });
    });
  });

  describe('Proxy Endpoints', () => {
    it('/api/v1/proxy/eth_blockNumber (GET) should return block number', () => {
      return request(app.getHttpServer())
        .get('/api/v1/proxy/eth_blockNumber')
        .expect(200)
        .expect((res) => {
          expect(res.body).toHaveProperty('status');
          expect(res.body).toHaveProperty('result');
        });
    });

    it('/api/v1/proxy/eth_getBalance (GET) should return balance', () => {
      return request(app.getHttpServer())
        .get('/api/v1/proxy/eth_getBalance')
        .query({ address: '0xdAC17F958D2ee523a2206206994597C13D831ec7', tag: 'latest' })
        .expect(200)
        .expect((res) => {
          expect(res.body).toHaveProperty('status');
          expect(res.body).toHaveProperty('result');
        });
    });

    it('/api/v1/proxy/eth_getBlockByNumber (GET) should return block', () => {
      return request(app.getHttpServer())
        .get('/api/v1/proxy/eth_getBlockByNumber')
        .query({ tag: 'latest', full: false })
        .expect(200)
        .expect((res) => {
          expect(res.body).toHaveProperty('status');
          expect(res.body).toHaveProperty('result');
        });
    });

    it('/api/v1/proxy/eth_getTransactionByHash (GET) should return transaction', () => {
      return request(app.getHttpServer())
        .get('/api/v1/proxy/eth_getTransactionByHash')
        .query({ txhash: '0x1234567890abcdef1234567890abcdef1234567890abcdef1234567890abcdef' })
        .expect((res) => {
          expect([200, 404]).toContain(res.status);
        });
    });

    it('/api/v1/proxy/eth_getTransactionReceipt (GET) should return transaction receipt', () => {
      return request(app.getHttpServer())
        .get('/api/v1/proxy/eth_getTransactionReceipt')
        .query({ txhash: '0x1234567890abcdef1234567890abcdef1234567890abcdef1234567890abcdef' })
        .expect((res) => {
          expect([200, 404]).toContain(res.status);
        });
    });

    it('/api/v1/proxy/eth_call (POST) should execute call', () => {
      return request(app.getHttpServer())
        .post('/api/v1/proxy/eth_call')
        .send({
          transaction: {
            to: '0xdAC17F958D2ee523a2206206994597C13D831ec7',
            data: '0x70a08231',
          },
          tag: 'latest',
        })
        .expect(200)
        .expect((res) => {
          expect(res.body).toHaveProperty('status');
          expect(res.body).toHaveProperty('result');
        });
    });

    it('/api/v1/proxy/eth_estimateGas (POST) should estimate gas', () => {
      return request(app.getHttpServer())
        .post('/api/v1/proxy/eth_estimateGas')
        .send({
          transaction: {
            to: '0xdAC17F958D2ee523a2206206994597C13D831ec7',
            from: '0xA0b86991c6218b36c1d19D4a2e9Eb0cE3606eB48',
            value: '1000000000000000000',
          },
        })
        .expect(200)
        .expect((res) => {
          expect(res.body).toHaveProperty('status');
          expect(res.body).toHaveProperty('result');
        });
    });

    it('/api/v1/proxy/eth_getCode (GET) should return contract code', () => {
      return request(app.getHttpServer())
        .get('/api/v1/proxy/eth_getCode')
        .query({ address: '0xdAC17F958D2ee523a2206206994597C13D831ec7', tag: 'latest' })
        .expect(200)
        .expect((res) => {
          expect(res.body).toHaveProperty('status');
          expect(res.body).toHaveProperty('result');
        });
    });

    it('/api/v1/proxy/eth_getLogs (POST) should return event logs', () => {
      return request(app.getHttpServer())
        .post('/api/v1/proxy/eth_getLogs')
        .send({
          filter: {
            fromBlock: '0x3E8',
            toBlock: '0x7D0',
            address: '0xdAC17F958D2ee523a2206206994597C13D831ec7',
          },
        })
        .expect(200)
        .expect((res) => {
          expect(res.body).toHaveProperty('status');
          expect(res.body).toHaveProperty('result');
        });
    });

    it('/api/v1/proxy/eth_gasPrice (GET) should return gas price', () => {
      return request(app.getHttpServer())
        .get('/api/v1/proxy/eth_gasPrice')
        .expect(200)
        .expect((res) => {
          expect(res.body).toHaveProperty('status');
          expect(res.body).toHaveProperty('result');
        });
    });
  });

  describe('Auth Endpoints', () => {
    it('/api/v1/auth/register (POST) should register a user', () => {
      const email = `test-${Date.now()}@example.com`;
      return request(app.getHttpServer())
        .post('/api/v1/auth/register')
        .send({
          email,
          password: 'password123',
          name: 'Test User',
        })
        .expect(201)
        .expect((res) => {
          expect(res.body).toHaveProperty('email');
          expect(res.body.email).toBe(email);
        });
    });

    it('/api/v1/auth/register (POST) should reject duplicate email', async () => {
      const email = `duplicate-${Date.now()}@example.com`;
      // First registration
      await request(app.getHttpServer())
        .post('/api/v1/auth/register')
        .send({
          email,
          password: 'password123',
          name: 'Test User',
        })
        .expect(201);

      // Second registration with same email
      return request(app.getHttpServer())
        .post('/api/v1/auth/register')
        .send({
          email,
          password: 'password123',
          name: 'Test User',
        })
        .expect(409);
    });

    it('/api/v1/auth/login (POST) should return access token', async () => {
      const email = `login-${Date.now()}@example.com`;
      // Register first
      await request(app.getHttpServer())
        .post('/api/v1/auth/register')
        .send({
          email,
          password: 'password123',
          name: 'Test User',
        })
        .expect(201);

      // Then login
      return request(app.getHttpServer())
        .post('/api/v1/auth/login')
        .send({
          email,
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

  describe('Notifications Endpoints', () => {
    let authToken: string;

    beforeAll(async () => {
      // Register and login to get token
      const email = `notifications-${Date.now()}@example.com`;
      await request(app.getHttpServer())
        .post('/api/v1/auth/register')
        .send({
          email,
          password: 'password123',
          name: 'Test User',
        });

      const loginRes = await request(app.getHttpServer())
        .post('/api/v1/auth/login')
        .send({
          email,
          password: 'password123',
        });

      authToken = loginRes.body.access_token;
    });

    it('/api/v1/notifications (GET) should return notifications', () => {
      return request(app.getHttpServer())
        .get('/api/v1/notifications')
        .set('Authorization', `Bearer ${authToken}`)
        .expect((res) => {
          // May require authentication
          expect([200, 401]).toContain(res.status);
        });
    });

    it('/api/v1/notifications/unread/count (GET) should return unread count', () => {
      return request(app.getHttpServer())
        .get('/api/v1/notifications/unread/count')
        .set('Authorization', `Bearer ${authToken}`)
        .expect((res) => {
          expect([200, 401]).toContain(res.status);
        });
    });

    it('/api/v1/notifications (POST) should create notification', () => {
      return request(app.getHttpServer())
        .post('/api/v1/notifications')
        .set('Authorization', `Bearer ${authToken}`)
        .send({
          type: 'transaction',
          title: 'Test Notification',
          message: 'This is a test notification',
        })
        .expect((res) => {
          expect([200, 201, 401]).toContain(res.status);
        });
    });

    it('/api/v1/notifications/:id/read (PATCH) should mark notification as read', () => {
      return request(app.getHttpServer())
        .patch('/api/v1/notifications/test-id/read')
        .set('Authorization', `Bearer ${authToken}`)
        .expect((res) => {
          expect([200, 404, 401]).toContain(res.status);
        });
    });

    it('/api/v1/notifications/read-all (PATCH) should mark all as read', () => {
      return request(app.getHttpServer())
        .patch('/api/v1/notifications/read-all')
        .set('Authorization', `Bearer ${authToken}`)
        .expect((res) => {
          expect([200, 401]).toContain(res.status);
        });
    });

    it('/api/v1/notifications/:id (DELETE) should delete notification', () => {
      return request(app.getHttpServer())
        .delete('/api/v1/notifications/test-id')
        .set('Authorization', `Bearer ${authToken}`)
        .expect((res) => {
          expect([200, 404, 401]).toContain(res.status);
        });
    });
  });

  describe('Orders Endpoints', () => {
    it('/api/v1/orders/limit (POST) should create limit order', () => {
      return request(app.getHttpServer())
        .post('/api/v1/orders/limit')
        .send({
          userAddress: '0xdAC17F958D2ee523a2206206994597C13D831ec7',
          pair: 'NOR/USDT',
          side: 'buy',
          price: '0.0001',
          amount: '1000000000000000000',
        })
        .expect(201)
        .expect((res) => {
          expect(res.body).toHaveProperty('id');
        });
    });

    it('/api/v1/orders/limit (GET) should return limit orders', () => {
      return request(app.getHttpServer())
        .get('/api/v1/orders/limit')
        .query({ user: '0xdAC17F958D2ee523a2206206994597C13D831ec7' })
        .expect(200)
        .expect((res) => {
          expect(Array.isArray(res.body)).toBe(true);
        });
    });

    it('/api/v1/orders/stop-loss (POST) should create stop-loss order', () => {
      return request(app.getHttpServer())
        .post('/api/v1/orders/stop-loss')
        .send({
          userAddress: '0xdAC17F958D2ee523a2206206994597C13D831ec7',
          pair: 'NOR/USDT',
          stopPrice: '0.00008',
          amount: '1000000000000000000',
        })
        .expect(201)
        .expect((res) => {
          expect(res.body).toHaveProperty('id');
        });
    });

    it('/api/v1/orders/dca (POST) should create DCA schedule', () => {
      return request(app.getHttpServer())
        .post('/api/v1/orders/dca')
        .send({
          userAddress: '0xdAC17F958D2ee523a2206206994597C13D831ec7',
          pair: 'NOR/USDT',
          amountPerExecution: '1000000000000000000',
          intervalHours: 24,
          totalExecutions: 10,
        })
        .expect(201)
        .expect((res) => {
          expect(res.body).toHaveProperty('id');
        });
    });

    it('/api/v1/orders/stop-loss (GET) should return stop-loss orders', () => {
      return request(app.getHttpServer())
        .get('/api/v1/orders/stop-loss')
        .query({ user: '0xdAC17F958D2ee523a2206206994597C13D831ec7' })
        .expect(200)
        .expect((res) => {
          expect(Array.isArray(res.body)).toBe(true);
        });
    });

    it('/api/v1/orders/dca (GET) should return DCA schedules', () => {
      return request(app.getHttpServer())
        .get('/api/v1/orders/dca')
        .query({ user: '0xdAC17F958D2ee523a2206206994597C13D831ec7' })
        .expect(200)
        .expect((res) => {
          expect(Array.isArray(res.body)).toBe(true);
        });
    });

    it('/api/v1/orders/limit/:id (DELETE) should cancel limit order', () => {
      return request(app.getHttpServer())
        .delete('/api/v1/orders/limit/test-id')
        .expect((res) => {
          expect([200, 404]).toContain(res.status);
        });
    });
  });

  describe('Swap Endpoints', () => {
    it('/api/v1/swap/quote (POST) should return swap quote', () => {
      return request(app.getHttpServer())
        .post('/api/v1/swap/quote')
        .send({
          tokenIn: 'NOR',
          tokenOut: 'USDT',
          amountIn: '1000',
          chainId: '65001',
        })
        .expect(200)
        .expect((res) => {
          expect(res.body).toHaveProperty('amountOut');
        });
    });

    it('/api/v1/swap/execute (POST) should execute swap', () => {
      return request(app.getHttpServer())
        .post('/api/v1/swap/execute')
        .send({
          quoteId: 'quote-123',
          signedTx: '0x1234567890abcdef',
          userAddress: '0xdAC17F958D2ee523a2206206994597C13D831ec7',
        })
        .expect((res) => {
          expect([200, 400]).toContain(res.status);
        });
    });
  });
});

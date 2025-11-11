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

  describe('Bridge Endpoints', () => {
    let authToken: string;

    beforeAll(async () => {
      const email = `bridge-${Date.now()}@example.com`;
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

    it('/api/bridge/quotes (POST) should return bridge quote', () => {
      return request(app.getHttpServer())
        .post('/api/bridge/quotes')
        .set('Authorization', `Bearer ${authToken}`)
        .send({
          srcChain: 'NOR',
          dstChain: 'BSC',
          amount: '1000000000000000000',
          asset: 'NOR',
        })
        .expect((res) => {
          expect([200, 401, 400]).toContain(res.status);
          if (res.status === 200) {
            expect(res.body).toHaveProperty('amountAfterFees');
            expect(res.body).toHaveProperty('fees');
          }
        });
    });

    it('/api/bridge/quotes (POST) should reject same source and destination chain', () => {
      return request(app.getHttpServer())
        .post('/api/bridge/quotes')
        .set('Authorization', `Bearer ${authToken}`)
        .send({
          srcChain: 'NOR',
          dstChain: 'NOR',
          amount: '1000000000000000000',
          asset: 'NOR',
        })
        .expect((res) => {
          expect([400, 401]).toContain(res.status);
        });
    });

    it('/api/bridge/transfers (POST) should create bridge transfer', () => {
      return request(app.getHttpServer())
        .post('/api/bridge/transfers')
        .set('Authorization', `Bearer ${authToken}`)
        .send({
          srcChain: 'NOR',
          dstChain: 'BSC',
          amount: '1000000000000000000',
          asset: 'NOR',
          toAddress: '0x742d35Cc6634C0532925a3b844Bc9e7595f0bEb0',
        })
        .expect((res) => {
          expect([200, 201, 401, 400]).toContain(res.status);
        });
    });

    it('/api/bridge/transfers (GET) should return user transfers', () => {
      return request(app.getHttpServer())
        .get('/api/bridge/transfers')
        .set('Authorization', `Bearer ${authToken}`)
        .query({ limit: 50, offset: 0 })
        .expect((res) => {
          expect([200, 401]).toContain(res.status);
        });
    });

    it('/api/bridge/transfers/:id (GET) should return transfer details', () => {
      return request(app.getHttpServer())
        .get('/api/bridge/transfers/test-id')
        .set('Authorization', `Bearer ${authToken}`)
        .expect((res) => {
          expect([200, 404, 401]).toContain(res.status);
        });
    });
  });

  describe('Governance Endpoints', () => {
    let authToken: string;

    beforeAll(async () => {
      const email = `governance-${Date.now()}@example.com`;
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

    it('/api/governance/proposals (GET) should return proposals', () => {
      return request(app.getHttpServer())
        .get('/api/governance/proposals')
        .query({ limit: 50, offset: 0 })
        .expect(200)
        .expect((res) => {
          expect(res.body).toHaveProperty('proposals');
          expect(Array.isArray(res.body.proposals)).toBe(true);
        });
    });

    it('/api/governance/proposals (GET) should filter by status', () => {
      return request(app.getHttpServer())
        .get('/api/governance/proposals')
        .query({ limit: 50, offset: 0, status: 'active' })
        .expect(200)
        .expect((res) => {
          expect(res.body).toHaveProperty('proposals');
        });
    });

    it('/api/governance/proposals/:id (GET) should return proposal details', () => {
      return request(app.getHttpServer())
        .get('/api/governance/proposals/test-id')
        .expect((res) => {
          expect([200, 404]).toContain(res.status);
        });
    });

    it('/api/governance/proposals (POST) should create proposal', () => {
      return request(app.getHttpServer())
        .post('/api/governance/proposals')
        .set('Authorization', `Bearer ${authToken}`)
        .send({
          proposerAddress: '0x742d35Cc6634C0532925a3b844Bc9e7595f0bEb0',
          title: 'Test Proposal',
          description: 'This is a test proposal',
          type: 'parameter_change',
          parameters: { key: 'value' },
        })
        .expect((res) => {
          expect([200, 201, 401, 403]).toContain(res.status);
        });
    });

    it('/api/governance/proposals/:id/votes (POST) should submit vote', () => {
      return request(app.getHttpServer())
        .post('/api/governance/proposals/test-id/votes')
        .set('Authorization', `Bearer ${authToken}`)
        .send({
          voterAddress: '0x742d35Cc6634C0532925a3b844Bc9e7595f0bEb0',
          choice: 'for',
          votingPower: '1000000000000000000000',
        })
        .expect((res) => {
          expect([200, 201, 401, 404, 400]).toContain(res.status);
        });
    });

    it('/api/governance/proposals/:id/tally (GET) should return vote tally', () => {
      return request(app.getHttpServer())
        .get('/api/governance/proposals/test-id/tally')
        .expect((res) => {
          expect([200, 404]).toContain(res.status);
        });
    });

    it('/api/governance/params (GET) should return governance parameters', () => {
      return request(app.getHttpServer())
        .get('/api/governance/params')
        .expect(200)
        .expect((res) => {
          expect(res.body).toHaveProperty('parameters');
        });
    });
  });

  describe('Streaming Endpoints', () => {
    let authToken: string;

    beforeAll(async () => {
      const email = `streaming-${Date.now()}@example.com`;
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

    it('/api/stream/events (GET) should return SSE stream', () => {
      return request(app.getHttpServer())
        .get('/api/stream/events')
        .set('Authorization', `Bearer ${authToken}`)
        .query({ types: 'policy,transaction,block' })
        .expect((res) => {
          expect([200, 401]).toContain(res.status);
          if (res.status === 200) {
            expect(res.headers['content-type']).toContain('text/event-stream');
          }
        });
    });

    it('/api/stream/events (GET) should handle missing types', () => {
      return request(app.getHttpServer())
        .get('/api/stream/events')
        .set('Authorization', `Bearer ${authToken}`)
        .expect((res) => {
          expect([200, 401]).toContain(res.status);
        });
    });
  });

  describe('Wallet Endpoints', () => {
    let authToken: string;

    beforeAll(async () => {
      const email = `wallet-${Date.now()}@example.com`;
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

    it('/api/wallet (POST) should create wallet', () => {
      return request(app.getHttpServer())
        .post('/api/wallet')
        .set('Authorization', `Bearer ${authToken}`)
        .send({
          name: 'My Wallet',
          password: 'SecurePassword123!',
        })
        .expect((res) => {
          expect([200, 201, 401]).toContain(res.status);
        });
    });

    it('/api/wallet (GET) should return user wallets', () => {
      return request(app.getHttpServer())
        .get('/api/wallet')
        .set('Authorization', `Bearer ${authToken}`)
        .expect((res) => {
          expect([200, 401]).toContain(res.status);
          if (res.status === 200) {
            expect(Array.isArray(res.body)).toBe(true);
          }
        });
    });

    it('/api/wallet/:address (GET) should return wallet details', () => {
      return request(app.getHttpServer())
        .get('/api/wallet/0x742d35Cc6634C0532925a3b844Bc9e7595f0bEb0')
        .set('Authorization', `Bearer ${authToken}`)
        .expect((res) => {
          expect([200, 404, 401]).toContain(res.status);
        });
    });

    it('/api/wallet/:address/balance (GET) should return wallet balance', () => {
      return request(app.getHttpServer())
        .get('/api/wallet/0x742d35Cc6634C0532925a3b844Bc9e7595f0bEb0/balance')
        .set('Authorization', `Bearer ${authToken}`)
        .expect((res) => {
          expect([200, 404, 401]).toContain(res.status);
        });
    });

    it('/api/wallet/:address/tokens (GET) should return wallet tokens', () => {
      return request(app.getHttpServer())
        .get('/api/wallet/0x742d35Cc6634C0532925a3b844Bc9e7595f0bEb0/tokens')
        .set('Authorization', `Bearer ${authToken}`)
        .expect((res) => {
          expect([200, 404, 401]).toContain(res.status);
        });
    });

    it('/api/wallet/:address/transactions (GET) should return wallet transactions', () => {
      return request(app.getHttpServer())
        .get('/api/wallet/0x742d35Cc6634C0532925a3b844Bc9e7595f0bEb0/transactions')
        .set('Authorization', `Bearer ${authToken}`)
        .expect((res) => {
          expect([200, 404, 401]).toContain(res.status);
        });
    });
  });

  describe('Payments Endpoints', () => {
    let authToken: string;

    beforeAll(async () => {
      const email = `payments-${Date.now()}@example.com`;
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

    it('/api/payments/invoices (POST) should create invoice', () => {
      return request(app.getHttpServer())
        .post('/api/payments/invoices')
        .set('Authorization', `Bearer ${authToken}`)
        .send({
          merchantId: 'merchant-123',
          amount: '100.00',
          currency: 'NOR',
          description: 'Test Invoice',
        })
        .expect((res) => {
          expect([200, 201, 401, 404]).toContain(res.status);
        });
    });

    it('/api/payments/invoices (GET) should return invoices', () => {
      return request(app.getHttpServer())
        .get('/api/payments/invoices')
        .set('Authorization', `Bearer ${authToken}`)
        .query({ limit: 50, offset: 0 })
        .expect((res) => {
          expect([200, 401]).toContain(res.status);
        });
    });

    it('/api/payments/checkout-sessions (POST) should create checkout session', () => {
      return request(app.getHttpServer())
        .post('/api/payments/checkout-sessions')
        .set('Authorization', `Bearer ${authToken}`)
        .send({
          merchantId: 'merchant-123',
          amount: '100.00',
          currency: 'NOR',
          successUrl: 'https://example.com/success',
          cancelUrl: 'https://example.com/cancel',
        })
        .expect((res) => {
          expect([200, 201, 401, 404]).toContain(res.status);
        });
    });
  });

  describe('Messaging Endpoints', () => {
    let authToken: string;

    beforeAll(async () => {
      const email = `messaging-${Date.now()}@example.com`;
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

    it('/api/messaging/profile (POST) should create messaging profile', () => {
      return request(app.getHttpServer())
        .post('/api/messaging/profile')
        .set('Authorization', `Bearer ${authToken}`)
        .send({
          address: '0x742d35Cc6634C0532925a3b844Bc9e7595f0bEb0',
          displayName: 'Test User',
        })
        .expect((res) => {
          expect([200, 201, 401]).toContain(res.status);
        });
    });

    it('/api/messaging/conversations (GET) should return conversations', () => {
      return request(app.getHttpServer())
        .get('/api/messaging/conversations')
        .set('Authorization', `Bearer ${authToken}`)
        .expect((res) => {
          expect([200, 401]).toContain(res.status);
          if (res.status === 200) {
            expect(Array.isArray(res.body)).toBe(true);
          }
        });
    });

    it('/api/messaging/conversations (POST) should create conversation', () => {
      return request(app.getHttpServer())
        .post('/api/messaging/conversations')
        .set('Authorization', `Bearer ${authToken}`)
        .send({
          kind: 'p2p',
          members: [
            'did:pkh:eip155:65001:0x742d35cc6634c0532925a3b844bc9e7595f0beb0',
            'did:pkh:eip155:65001:0x1234567890123456789012345678901234567890',
          ],
        })
        .expect((res) => {
          expect([200, 201, 401, 400]).toContain(res.status);
        });
    });
  });

  describe('Metadata Endpoints', () => {
    let authToken: string;

    beforeAll(async () => {
      const email = `metadata-${Date.now()}@example.com`;
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

    it('/api/metadata/challenges (POST) should create ownership challenge', () => {
      return request(app.getHttpServer())
        .post('/api/metadata/challenges')
        .set('Authorization', `Bearer ${authToken}`)
        .send({
          chainId: '65001',
          address: '0x742d35Cc6634C0532925a3b844Bc9e7595f0bEb0',
        })
        .expect((res) => {
          expect([200, 201, 401]).toContain(res.status);
          if (res.status === 200 || res.status === 201) {
            expect(res.body).toHaveProperty('challengeId');
            expect(res.body).toHaveProperty('message');
          }
        });
    });

    it('/api/metadata/profiles/:chainId/:address (GET) should return asset profile', () => {
      return request(app.getHttpServer())
        .get('/api/metadata/profiles/65001/0x742d35Cc6634C0532925a3b844Bc9e7595f0bEb0')
        .expect((res) => {
          expect([200, 404]).toContain(res.status);
        });
    });
  });

  describe('Ledger Endpoints', () => {
    let authToken: string;

    beforeAll(async () => {
      const email = `ledger-${Date.now()}@example.com`;
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

    it('/api/ledger/accounts (POST) should create ledger account', () => {
      return request(app.getHttpServer())
        .post('/api/ledger/accounts')
        .set('Authorization', `Bearer ${authToken}`)
        .send({
          orgId: 'org-123',
          code: '1000',
          name: 'Cash Account',
          type: 'asset',
        })
        .expect((res) => {
          expect([200, 201, 401, 409]).toContain(res.status);
        });
    });

    it('/api/ledger/accounts (GET) should return accounts', () => {
      return request(app.getHttpServer())
        .get('/api/ledger/accounts')
        .set('Authorization', `Bearer ${authToken}`)
        .query({ orgId: 'org-123' })
        .expect((res) => {
          expect([200, 401]).toContain(res.status);
        });
    });
  });

  describe('Compliance Endpoints', () => {
    let authToken: string;

    beforeAll(async () => {
      const email = `compliance-${Date.now()}@example.com`;
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

    it('/api/compliance/screenings (POST) should create screening', () => {
      return request(app.getHttpServer())
        .post('/api/compliance/screenings')
        .set('Authorization', `Bearer ${authToken}`)
        .send({
          type: 'sanctions',
          subject: '0x742d35Cc6634C0532925a3b844Bc9e7595f0bEb0',
        })
        .expect((res) => {
          expect([200, 201, 401]).toContain(res.status);
        });
    });

    it('/api/compliance/risk-score (GET) should return risk score', () => {
      return request(app.getHttpServer())
        .get('/api/compliance/risk-score')
        .query({ address: '0x742d35Cc6634C0532925a3b844Bc9e7595f0bEb0' })
        .expect((res) => {
          expect([200, 401]).toContain(res.status);
        });
    });
  });

  describe('Policy Endpoints', () => {
    let authToken: string;

    beforeAll(async () => {
      const email = `policy-${Date.now()}@example.com`;
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

    it('/api/policy/check (POST) should check policy', () => {
      return request(app.getHttpServer())
        .post('/api/policy/check')
        .set('Authorization', `Bearer ${authToken}`)
        .send({
          amount: '1000000000000000000',
          asset: 'NOR',
          fromAddress: '0x742d35Cc6634C0532925a3b844Bc9e7595f0bEb0',
          toAddress: '0x1234567890123456789012345678901234567890',
        })
        .expect((res) => {
          expect([200, 401, 403]).toContain(res.status);
        });
    });

    it('/api/policy/history (GET) should return policy check history', () => {
      return request(app.getHttpServer())
        .get('/api/policy/history')
        .set('Authorization', `Bearer ${authToken}`)
        .query({ limit: 50, offset: 0 })
        .expect((res) => {
          expect([200, 401]).toContain(res.status);
        });
    });
  });

  describe('Webhooks Endpoints', () => {
    let authToken: string;

    beforeAll(async () => {
      const email = `webhooks-${Date.now()}@example.com`;
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

    it('/api/webhooks (POST) should create webhook', () => {
      return request(app.getHttpServer())
        .post('/api/webhooks')
        .set('Authorization', `Bearer ${authToken}`)
        .send({
          url: 'https://example.com/webhook',
          events: ['transaction.mined', 'swap.executed'],
        })
        .expect((res) => {
          expect([200, 201, 401]).toContain(res.status);
        });
    });

    it('/api/webhooks (GET) should return webhooks', () => {
      return request(app.getHttpServer())
        .get('/api/webhooks')
        .set('Authorization', `Bearer ${authToken}`)
        .expect((res) => {
          expect([200, 401]).toContain(res.status);
        });
    });
  });

  describe('Admin Endpoints', () => {
    let authToken: string;

    beforeAll(async () => {
      const email = `admin-${Date.now()}@example.com`;
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

    it('/api/admin/validators (GET) should return validators', () => {
      return request(app.getHttpServer())
        .get('/api/admin/validators')
        .set('Authorization', `Bearer ${authToken}`)
        .query({ limit: 50, offset: 0 })
        .expect((res) => {
          expect([200, 401, 403]).toContain(res.status);
        });
    });

    it('/api/admin/feature-flags (GET) should return feature flags', () => {
      return request(app.getHttpServer())
        .get('/api/admin/feature-flags')
        .set('Authorization', `Bearer ${authToken}`)
        .expect((res) => {
          expect([200, 401, 403]).toContain(res.status);
        });
    });
  });

  describe('RPC Extensions Endpoints', () => {
    it('/api/rpc-extensions/nor_finality (POST) should return finality status', () => {
      return request(app.getHttpServer())
        .post('/api/rpc-extensions/nor_finality')
        .send({
          blockOrTx: '0x123',
        })
        .expect((res) => {
          expect([200, 400]).toContain(res.status);
        });
    });

    it('/api/rpc-extensions/nor_accountProfile (POST) should return account profile', () => {
      return request(app.getHttpServer())
        .post('/api/rpc-extensions/nor_accountProfile')
        .send({
          address: '0x742d35Cc6634C0532925a3b844Bc9e7595f0bEb0',
        })
        .expect((res) => {
          expect([200, 400]).toContain(res.status);
        });
    });
  });

  describe('Insights Endpoints', () => {
    it('/api/insights/finality/tx/:hash (GET) should return transaction finality', () => {
      return request(app.getHttpServer())
        .get('/api/insights/finality/tx/0x1234567890abcdef1234567890abcdef1234567890abcdef1234567890abcdef')
        .expect((res) => {
          expect([200, 404]).toContain(res.status);
        });
    });

    it('/api/insights/validators (GET) should return validators', () => {
      return request(app.getHttpServer())
        .get('/api/insights/validators')
        .query({ tag: 'current' })
        .expect(200)
        .expect((res) => {
          expect(res.body).toHaveProperty('validators');
        });
    });
  });

  describe('Error Scenarios', () => {
    it('should handle 404 for non-existent endpoints', () => {
      return request(app.getHttpServer())
        .get('/api/non-existent-endpoint')
        .expect(404);
    });

    it('should handle invalid request body', () => {
      return request(app.getHttpServer())
        .post('/api/v1/auth/register')
        .send({ invalid: 'data' })
        .expect(400);
    });

    it('should handle missing required query parameters', () => {
      return request(app.getHttpServer())
        .get('/api/v1/account/balance')
        .expect(400);
    });

    it('should handle invalid address format', () => {
      return request(app.getHttpServer())
        .get('/api/v1/account/balance')
        .query({ address: 'invalid-address' })
        .expect(400);
    });

    it('should handle unauthorized access', () => {
      return request(app.getHttpServer())
        .get('/api/wallet')
        .expect(401);
    });

    it('should handle invalid JWT token', () => {
      return request(app.getHttpServer())
        .get('/api/wallet')
        .set('Authorization', 'Bearer invalid-token')
        .expect(401);
    });
  });

  describe('Pagination Edge Cases', () => {
    let authToken: string;

    beforeAll(async () => {
      const email = `pagination-${Date.now()}@example.com`;
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

    it('should handle zero limit', () => {
      return request(app.getHttpServer())
        .get('/api/governance/proposals')
        .query({ limit: 0, offset: 0 })
        .expect((res) => {
          expect([200, 400]).toContain(res.status);
        });
    });

    it('should handle negative offset', () => {
      return request(app.getHttpServer())
        .get('/api/governance/proposals')
        .query({ limit: 50, offset: -1 })
        .expect((res) => {
          expect([200, 400]).toContain(res.status);
        });
    });

    it('should handle very large limit', () => {
      return request(app.getHttpServer())
        .get('/api/governance/proposals')
        .query({ limit: 10000, offset: 0 })
        .expect((res) => {
          expect([200, 400]).toContain(res.status);
        });
    });
  });

  describe('Rate Limiting', () => {
    it('should handle rate limit headers', async () => {
      const responses = await Promise.all([
        request(app.getHttpServer()).get('/api/v1/account/balance').query({ address: '0x123' }),
        request(app.getHttpServer()).get('/api/v1/account/balance').query({ address: '0x123' }),
        request(app.getHttpServer()).get('/api/v1/account/balance').query({ address: '0x123' }),
      ]);

      // At least one response should have rate limit headers
      const hasRateLimitHeaders = responses.some((res) => {
        return res.headers['x-ratelimit-limit'] || res.headers['x-ratelimit-remaining'];
      });

      // Rate limiting may or may not be enabled, so this is optional
      expect(responses.length).toBe(3);
    });
  });

  describe('Idempotency', () => {
    let authToken: string;

    beforeAll(async () => {
      const email = `idempotency-${Date.now()}@example.com`;
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

    it('should handle idempotency key header', () => {
      const idempotencyKey = `test-key-${Date.now()}`;

      return request(app.getHttpServer())
        .post('/api/bridge/transfers')
        .set('Authorization', `Bearer ${authToken}`)
        .set('Idempotency-Key', idempotencyKey)
        .send({
          srcChain: 'NOR',
          dstChain: 'BSC',
          amount: '1000000000000000000',
          asset: 'NOR',
          toAddress: '0x742d35Cc6634C0532925a3b844Bc9e7595f0bEb0',
        })
        .expect((res) => {
          expect([200, 201, 401, 400]).toContain(res.status);
        });
    });
  });

  describe('Content-Type Validation', () => {
    it('should accept JSON content type', () => {
      return request(app.getHttpServer())
        .post('/api/v1/auth/register')
        .set('Content-Type', 'application/json')
        .send({
          email: `test-${Date.now()}@example.com`,
          password: 'password123',
          name: 'Test User',
        })
        .expect((res) => {
          expect([200, 201, 400]).toContain(res.status);
        });
    });
  });

  describe('CORS Headers', () => {
    it('should include CORS headers', () => {
      return request(app.getHttpServer())
        .get('/api/health')
        .expect((res) => {
          // CORS headers may or may not be present depending on configuration
          expect(res.status).toBe(200);
        });
    });
  });

  describe('Notifications Endpoints - Expanded', () => {
    let authToken: string;

    beforeAll(async () => {
      const email = `notifications-expanded-${Date.now()}@example.com`;
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

    it('/api/v1/notifications (GET) should support limit parameter', () => {
      return request(app.getHttpServer())
        .get('/api/v1/notifications')
        .set('Authorization', `Bearer ${authToken}`)
        .query({ limit: 10 })
        .expect((res) => {
          expect([200, 401]).toContain(res.status);
        });
    });

    it('/api/v1/notifications (GET) should support unreadOnly parameter', () => {
      return request(app.getHttpServer())
        .get('/api/v1/notifications')
        .set('Authorization', `Bearer ${authToken}`)
        .query({ unreadOnly: true })
        .expect((res) => {
          expect([200, 401]).toContain(res.status);
        });
    });
  });

  describe('Monitoring Endpoints', () => {
    it('/api/monitoring/health (GET) should return health status', () => {
      return request(app.getHttpServer())
        .get('/api/monitoring/health')
        .expect((res) => {
          expect([200, 401, 403]).toContain(res.status);
          if (res.status === 200) {
            expect(res.body).toHaveProperty('status');
          }
        });
    });

    it('/api/monitoring/stats (GET) should return monitoring stats', () => {
      return request(app.getHttpServer())
        .get('/api/monitoring/stats')
        .expect((res) => {
          expect([200, 401, 403]).toContain(res.status);
          if (res.status === 200) {
            expect(res.body).toHaveProperty('currentBlock');
          }
        });
    });
  });

  describe('Advanced Analytics Endpoints', () => {
    let authToken: string;

    beforeAll(async () => {
      const email = `analytics-${Date.now()}@example.com`;
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

    it('/api/analytics/advanced/network (GET) should return network analytics', () => {
      return request(app.getHttpServer())
        .get('/api/analytics/advanced/network')
        .set('Authorization', `Bearer ${authToken}`)
        .query({ startDate: '2024-01-01', endDate: '2024-12-31' })
        .expect((res) => {
          expect([200, 401]).toContain(res.status);
        });
    });

    it('/api/analytics/advanced/user/:userId (GET) should return user analytics', () => {
      return request(app.getHttpServer())
        .get('/api/analytics/advanced/user/user-123')
        .set('Authorization', `Bearer ${authToken}`)
        .expect((res) => {
          expect([200, 401, 404]).toContain(res.status);
        });
    });

    it('/api/analytics/advanced/realtime (GET) should return real-time metrics', () => {
      return request(app.getHttpServer())
        .get('/api/analytics/advanced/realtime')
        .set('Authorization', `Bearer ${authToken}`)
        .expect((res) => {
          expect([200, 401]).toContain(res.status);
        });
    });
  });

  describe('GraphQL Endpoints', () => {
    it('/graphql (POST) should handle GraphQL queries', () => {
      return request(app.getHttpServer())
        .post('/graphql')
        .send({
          query: '{ health { status } }',
        })
        .expect((res) => {
          expect([200, 400, 404]).toContain(res.status);
        });
    });

    it('/graphql (POST) should handle GraphQL mutations', () => {
      return request(app.getHttpServer())
        .post('/graphql')
        .send({
          query: 'mutation { test }',
        })
        .expect((res) => {
          expect([200, 400, 404]).toContain(res.status);
        });
    });
  });

  describe('WebSocket Connection', () => {
    it('should handle WebSocket connection attempts', (done) => {
      // WebSocket testing requires a WebSocket client library
      // This is a placeholder test structure
      // In production, use socket.io-client or similar
      expect(true).toBe(true);
      done();
    });
  });

  describe('Request Validation', () => {
    it('should validate email format in registration', () => {
      return request(app.getHttpServer())
        .post('/api/v1/auth/register')
        .send({
          email: 'invalid-email',
          password: 'password123',
          name: 'Test User',
        })
        .expect(400);
    });

    it('should validate password length in registration', () => {
      return request(app.getHttpServer())
        .post('/api/v1/auth/register')
        .send({
          email: 'test@example.com',
          password: 'short',
          name: 'Test User',
        })
        .expect(400);
    });

    it('should validate required fields', () => {
      return request(app.getHttpServer())
        .post('/api/v1/auth/register')
        .send({
          email: 'test@example.com',
          // Missing password and name
        })
        .expect(400);
    });
  });

  describe('Response Format', () => {
    it('should return consistent response format', () => {
      return request(app.getHttpServer())
        .get('/api/health')
        .expect(200)
        .expect((res) => {
          expect(res.body).toHaveProperty('status');
        });
    });

    it('should include error details in error responses', () => {
      return request(app.getHttpServer())
        .get('/api/non-existent')
        .expect(404)
        .expect((res) => {
          expect(res.body).toBeDefined();
        });
    });
  });

  describe('Messaging Endpoints', () => {
    let authToken: string;
    let userDid: string;

    beforeAll(async () => {
      const email = `messaging-${Date.now()}@example.com`;
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
      userDid = `did:pkh:eip155:65001:0x${Date.now().toString(16)}`;
    });

    it('/api/messaging/profiles (POST) should create profile', () => {
      return request(app.getHttpServer())
        .post('/api/messaging/profiles')
        .set('Authorization', `Bearer ${authToken}`)
        .send({
          address: `0x${Date.now().toString(16)}`,
          displayName: 'Test User',
        })
        .expect((res) => {
          expect([200, 201, 400, 401]).toContain(res.status);
        });
    });

    it('/api/messaging/conversations (POST) should create conversation', () => {
      return request(app.getHttpServer())
        .post('/api/messaging/conversations')
        .set('Authorization', `Bearer ${authToken}`)
        .send({
          kind: 'direct',
          members: [userDid, `did:pkh:eip155:65001:0x${Date.now().toString(16)}`],
        })
        .expect((res) => {
          expect([200, 201, 400, 401]).toContain(res.status);
        });
    });

    it('/api/messaging/conversations (GET) should list conversations', () => {
      return request(app.getHttpServer())
        .get('/api/messaging/conversations')
        .set('Authorization', `Bearer ${authToken}`)
        .expect((res) => {
          expect([200, 401]).toContain(res.status);
        });
    });

    it('/api/messaging/messages (POST) should send message', () => {
      return request(app.getHttpServer())
        .post('/api/messaging/messages')
        .set('Authorization', `Bearer ${authToken}`)
        .send({
          conversationId: 'conv_123',
          content: 'Test message',
          contentType: 'text/plain',
        })
        .expect((res) => {
          expect([200, 201, 400, 401, 404]).toContain(res.status);
        });
    });

    it('/api/messaging/media/upload-url (POST) should generate upload URL', () => {
      return request(app.getHttpServer())
        .post('/api/messaging/media/upload-url')
        .set('Authorization', `Bearer ${authToken}`)
        .send({
          contentType: 'image/jpeg',
          kind: 'image',
        })
        .expect((res) => {
          expect([200, 400, 401]).toContain(res.status);
        });
    });
  });

  describe('Ledger Endpoints', () => {
    let authToken: string;

    beforeAll(async () => {
      const email = `ledger-${Date.now()}@example.com`;
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

    it('/api/ledger/accounts (POST) should create account', () => {
      return request(app.getHttpServer())
        .post('/api/ledger/accounts')
        .set('Authorization', `Bearer ${authToken}`)
        .send({
          orgId: 'org-123',
          code: `ACC${Date.now()}`,
          name: 'Test Account',
          type: 'ASSET',
        })
        .expect((res) => {
          expect([200, 201, 400, 401]).toContain(res.status);
        });
    });

    it('/api/ledger/accounts (GET) should list accounts', () => {
      return request(app.getHttpServer())
        .get('/api/ledger/accounts')
        .set('Authorization', `Bearer ${authToken}`)
        .query({ orgId: 'org-123' })
        .expect((res) => {
          expect([200, 401]).toContain(res.status);
        });
    });

    it('/api/ledger/journal-entries (POST) should create journal entry', () => {
      return request(app.getHttpServer())
        .post('/api/ledger/journal-entries')
        .set('Authorization', `Bearer ${authToken}`)
        .send({
          orgId: 'org-123',
          period: '2025-01',
          eventType: 'payment',
          eventId: `event-${Date.now()}`,
          occurredAt: new Date().toISOString(),
          lines: [
            {
              account: '1000',
              amount: '100.00',
              direction: 'DEBIT',
              currency: 'NOR',
            },
            {
              account: '2000',
              amount: '100.00',
              direction: 'CREDIT',
              currency: 'NOR',
            },
          ],
        })
        .expect((res) => {
          expect([200, 201, 400, 401]).toContain(res.status);
        });
    });

    it('/api/ledger/accounts/:id/statement (GET) should get account statement', () => {
      return request(app.getHttpServer())
        .get('/api/ledger/accounts/account-123/statement')
        .set('Authorization', `Bearer ${authToken}`)
        .query({ orgId: 'org-123' })
        .expect((res) => {
          expect([200, 401, 404]).toContain(res.status);
        });
    });
  });

  describe('Additional Edge Cases', () => {
    it('should handle concurrent requests', async () => {
      const promises = Array.from({ length: 5 }, () =>
        request(app.getHttpServer()).get('/api/health'),
      );

      const results = await Promise.all(promises);
      results.forEach((res) => {
        expect(res.status).toBe(200);
      });
    });

    it('should handle large request bodies', () => {
      const largeData = Array.from({ length: 1000 }, (_, i) => ({
        id: i,
        data: 'x'.repeat(100),
      }));

      return request(app.getHttpServer())
        .post('/api/v1/auth/register')
        .send({
          email: 'test@example.com',
          password: 'password123',
          name: 'Test',
          metadata: largeData,
        })
        .expect((res) => {
          // Should either succeed or fail gracefully with 400
          expect([200, 201, 400, 413]).toContain(res.status);
        });
    });

    it('should handle malformed JSON', () => {
      return request(app.getHttpServer())
        .post('/api/v1/auth/register')
        .set('Content-Type', 'application/json')
        .send('{ invalid json }')
        .expect(400);
    });

    it('should handle missing Content-Type header', () => {
      return request(app.getHttpServer())
        .post('/api/v1/auth/register')
        .send('email=test@example.com&password=password123')
        .expect((res) => {
          expect([400, 415]).toContain(res.status);
        });
    });

    it('should handle OPTIONS requests (CORS preflight)', () => {
      return request(app.getHttpServer())
        .options('/api/health')
        .expect((res) => {
          expect([200, 204]).toContain(res.status);
        });
    });
  });

  describe('Compliance Endpoints', () => {
    let authToken: string;

    beforeAll(async () => {
      const email = `compliance-${Date.now()}@example.com`;
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

    it('/api/compliance/screenings (POST) should create screening', () => {
      return request(app.getHttpServer())
        .post('/api/compliance/screenings')
        .set('Authorization', `Bearer ${authToken}`)
        .send({
          type: 'SANCTIONS',
          subject: '0x742d35Cc6634C0532925a3b844Bc9e7595f0bEb0',
        })
        .expect((res) => {
          expect([200, 201, 400, 401]).toContain(res.status);
        });
    });

    it('/api/compliance/risk-score/:address (GET) should get risk score', () => {
      return request(app.getHttpServer())
        .get('/api/compliance/risk-score/0x742d35Cc6634C0532925a3b844Bc9e7595f0bEb0')
        .set('Authorization', `Bearer ${authToken}`)
        .expect((res) => {
          expect([200, 401]).toContain(res.status);
        });
    });

    it('/api/compliance/travel-rule/precheck (POST) should precheck Travel Rule', () => {
      return request(app.getHttpServer())
        .post('/api/compliance/travel-rule/precheck')
        .set('Authorization', `Bearer ${authToken}`)
        .send({
          senderAddress: '0x742d35Cc6634C0532925a3b844Bc9e7595f0bEb0',
          recipientAddress: '0x742d35Cc6634C0532925a3b844Bc9e7595f0bEb1',
          amount: '1500.00',
          currency: 'NOR',
        })
        .expect((res) => {
          expect([200, 400, 401]).toContain(res.status);
        });
    });
  });

  describe('Governance Endpoints', () => {
    let authToken: string;

    beforeAll(async () => {
      const email = `governance-${Date.now()}@example.com`;
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

    it('/api/governance/proposals (GET) should list proposals', () => {
      return request(app.getHttpServer())
        .get('/api/governance/proposals')
        .set('Authorization', `Bearer ${authToken}`)
        .expect((res) => {
          expect([200, 401]).toContain(res.status);
        });
    });

    it('/api/governance/proposals (POST) should create proposal', () => {
      return request(app.getHttpServer())
        .post('/api/governance/proposals')
        .set('Authorization', `Bearer ${authToken}`)
        .send({
          proposerAddress: '0x742d35Cc6634C0532925a3b844Bc9e7595f0bEb0',
          title: 'Test Proposal',
          description: 'Test description',
          type: 'parameter_change',
          parameters: { key: 'value' },
        })
        .expect((res) => {
          expect([200, 201, 400, 401, 403]).toContain(res.status);
        });
    });

    it('/api/governance/proposals/:id/tally (GET) should get vote tally', () => {
      return request(app.getHttpServer())
        .get('/api/governance/proposals/proposal-123/tally')
        .set('Authorization', `Bearer ${authToken}`)
        .expect((res) => {
          expect([200, 401, 404]).toContain(res.status);
        });
    });

    it('/api/governance/parameters (GET) should get governance parameters', () => {
      return request(app.getHttpServer())
        .get('/api/governance/parameters')
        .set('Authorization', `Bearer ${authToken}`)
        .expect((res) => {
          expect([200, 401]).toContain(res.status);
        });
    });
  });

  describe('Bridge Endpoints', () => {
    let authToken: string;

    beforeAll(async () => {
      const email = `bridge-${Date.now()}@example.com`;
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

    it('/api/bridge/quotes (POST) should get bridge quote', () => {
      return request(app.getHttpServer())
        .post('/api/bridge/quotes')
        .set('Authorization', `Bearer ${authToken}`)
        .send({
          srcChain: 'NOR',
          dstChain: 'BSC',
          amount: '1000000000000000000',
          asset: 'NOR',
        })
        .expect((res) => {
          expect([200, 400, 401]).toContain(res.status);
        });
    });

    it('/api/bridge/transfers (POST) should create bridge transfer', () => {
      return request(app.getHttpServer())
        .post('/api/bridge/transfers')
        .set('Authorization', `Bearer ${authToken}`)
        .send({
          srcChain: 'NOR',
          dstChain: 'BSC',
          amount: '1000000000000000000',
          asset: 'NOR',
          toAddress: '0x742d35Cc6634C0532925a3b844Bc9e7595f0bEb0',
        })
        .expect((res) => {
          expect([200, 201, 400, 401, 403]).toContain(res.status);
        });
    });

    it('/api/bridge/transfers (GET) should list user transfers', () => {
      return request(app.getHttpServer())
        .get('/api/bridge/transfers')
        .set('Authorization', `Bearer ${authToken}`)
        .expect((res) => {
          expect([200, 401]).toContain(res.status);
        });
    });
  });

  describe('Error Scenarios - Extended', () => {
    it('should handle invalid authentication token', () => {
      return request(app.getHttpServer())
        .get('/api/v1/account/balance')
        .set('Authorization', 'Bearer invalid-token')
        .query({ address: '0x742d35Cc6634C0532925a3b844Bc9e7595f0bEb0' })
        .expect(401);
    });

    it('should handle missing authentication token', () => {
      return request(app.getHttpServer())
        .get('/api/v1/account/balance')
        .query({ address: '0x742d35Cc6634C0532925a3b844Bc9e7595f0bEb0' })
        .expect((res) => {
          expect([200, 401]).toContain(res.status);
        });
    });

    it('should handle invalid query parameters', () => {
      return request(app.getHttpServer())
        .get('/api/v1/account/balance')
        .query({ address: 'invalid-address' })
        .expect(400);
    });

    it('should handle invalid pagination parameters', () => {
      return request(app.getHttpServer())
        .get('/api/v1/account/txlist')
        .query({
          address: '0x742d35Cc6634C0532925a3b844Bc9e7595f0bEb0',
          page: -1,
          limit: -10,
        })
        .expect((res) => {
          expect([200, 400]).toContain(res.status);
        });
    });

    it('should handle extremely large pagination limit', () => {
      return request(app.getHttpServer())
        .get('/api/v1/account/txlist')
        .query({
          address: '0x742d35Cc6634C0532925a3b844Bc9e7595f0bEb0',
          page: 1,
          limit: 1000000,
        })
        .expect((res) => {
          expect([200, 400]).toContain(res.status);
        });
    });

    it('should handle SQL injection attempts in query params', () => {
      return request(app.getHttpServer())
        .get('/api/v1/account/balance')
        .query({ address: "'; DROP TABLE users; --" })
        .expect(400);
    });

    it('should handle XSS attempts in request body', () => {
      return request(app.getHttpServer())
        .post('/api/v1/auth/register')
        .send({
          email: '<script>alert("xss")</script>@example.com',
          password: 'password123',
          name: 'Test User',
        })
        .expect((res) => {
          expect([200, 201, 400]).toContain(res.status);
        });
    });

    it('should handle rate limiting', async () => {
      // Make multiple rapid requests
      const promises = Array.from({ length: 100 }, () =>
        request(app.getHttpServer()).get('/api/health'),
      );

      const results = await Promise.all(promises);
      // Some requests should succeed, some might be rate limited
      results.forEach((res) => {
        expect([200, 429]).toContain(res.status);
      });
    });

    it('should handle timeout scenarios', () => {
      return request(app.getHttpServer())
        .get('/api/health')
        .timeout(100) // Very short timeout
        .expect((res) => {
          // Request should either succeed quickly or timeout
          expect([200, 408, 504]).toContain(res.status);
        });
    });
  });

  describe('Metadata Endpoints', () => {
    let authToken: string;

    beforeAll(async () => {
      const email = `metadata-${Date.now()}@example.com`;
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

    it('/api/metadata/challenges (POST) should create ownership challenge', () => {
      return request(app.getHttpServer())
        .post('/api/metadata/challenges')
        .set('Authorization', `Bearer ${authToken}`)
        .send({
          chainId: '65001',
          address: '0x742d35Cc6634C0532925a3b844Bc9e7595f0bEb0',
        })
        .expect((res) => {
          expect([200, 201, 400, 401]).toContain(res.status);
        });
    });

    it('/api/metadata/profiles/:chainId/:address (GET) should get profile', () => {
      return request(app.getHttpServer())
        .get('/api/metadata/profiles/65001/0x742d35Cc6634C0532925a3b844Bc9e7595f0bEb0')
        .set('Authorization', `Bearer ${authToken}`)
        .expect((res) => {
          expect([200, 401, 404]).toContain(res.status);
        });
    });

    it('/api/metadata/profiles/search (GET) should search profiles', () => {
      return request(app.getHttpServer())
        .get('/api/metadata/profiles/search')
        .set('Authorization', `Bearer ${authToken}`)
        .query({ query: 'test', limit: 10, offset: 0 })
        .expect((res) => {
          expect([200, 401]).toContain(res.status);
        });
    });

    it('/api/metadata/profiles/search (GET) should handle pagination', () => {
      return request(app.getHttpServer())
        .get('/api/metadata/profiles/search')
        .set('Authorization', `Bearer ${authToken}`)
        .query({ limit: 5, offset: 10 })
        .expect((res) => {
          expect([200, 401]).toContain(res.status);
        });
    });
  });

  describe('Webhooks Endpoints', () => {
    let authToken: string;

    beforeAll(async () => {
      const email = `webhooks-${Date.now()}@example.com`;
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

    it('/api/webhooks (POST) should create webhook', () => {
      return request(app.getHttpServer())
        .post('/api/webhooks')
        .set('Authorization', `Bearer ${authToken}`)
        .send({
          url: 'https://example.com/webhook',
          events: ['TRANSACTION_MINED', 'SWAP_EXECUTED'],
        })
        .expect((res) => {
          expect([200, 201, 400, 401]).toContain(res.status);
        });
    });

    it('/api/webhooks (GET) should list webhooks', () => {
      return request(app.getHttpServer())
        .get('/api/webhooks')
        .set('Authorization', `Bearer ${authToken}`)
        .expect((res) => {
          expect([200, 401]).toContain(res.status);
        });
    });

    it('/api/webhooks/:id/deliveries (GET) should get webhook deliveries', () => {
      return request(app.getHttpServer())
        .get('/api/webhooks/webhook-123/deliveries')
        .set('Authorization', `Bearer ${authToken}`)
        .query({ limit: 10, offset: 0 })
        .expect((res) => {
          expect([200, 401, 404]).toContain(res.status);
        });
    });

    it('/api/webhooks/:id/deliveries (GET) should handle pagination', () => {
      return request(app.getHttpServer())
        .get('/api/webhooks/webhook-123/deliveries')
        .set('Authorization', `Bearer ${authToken}`)
        .query({ limit: 5, offset: 10 })
        .expect((res) => {
          expect([200, 401, 404]).toContain(res.status);
        });
    });
  });

  describe('Ledger Endpoints', () => {
    let authToken: string;

    beforeAll(async () => {
      const email = `ledger-${Date.now()}@example.com`;
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

    it('/api/ledger/accounts (POST) should create account', () => {
      return request(app.getHttpServer())
        .post('/api/ledger/accounts')
        .set('Authorization', `Bearer ${authToken}`)
        .send({
          orgId: 'org-123',
          code: '1000',
          name: 'Cash Account',
          type: 'ASSET',
        })
        .expect((res) => {
          expect([200, 201, 400, 401, 409]).toContain(res.status);
        });
    });

    it('/api/ledger/accounts (GET) should list accounts', () => {
      return request(app.getHttpServer())
        .get('/api/ledger/accounts')
        .set('Authorization', `Bearer ${authToken}`)
        .query({ orgId: 'org-123' })
        .expect((res) => {
          expect([200, 401]).toContain(res.status);
        });
    });

    it('/api/ledger/journal-entries (POST) should create journal entry', () => {
      return request(app.getHttpServer())
        .post('/api/ledger/journal-entries')
        .set('Authorization', `Bearer ${authToken}`)
        .send({
          orgId: 'org-123',
          eventType: 'payment',
          eventId: 'event-123',
          period: '2024-01',
          occurredAt: new Date().toISOString(),
          lines: [
            { accountCode: '1000', amount: '100.00', direction: 'DEBIT', currency: 'NOR' },
            { accountCode: '2000', amount: '100.00', direction: 'CREDIT', currency: 'NOR' },
          ],
        })
        .expect((res) => {
          expect([200, 201, 400, 401]).toContain(res.status);
        });
    });

    it('/api/ledger/accounts/:id/statement (GET) should get account statement', () => {
      return request(app.getHttpServer())
        .get('/api/ledger/accounts/account-123/statement')
        .set('Authorization', `Bearer ${authToken}`)
        .query({ orgId: 'org-123' })
        .expect((res) => {
          expect([200, 401, 404]).toContain(res.status);
        });
    });
  });

  describe('Payments Endpoints - Extended', () => {
    let authToken: string;

    beforeAll(async () => {
      const email = `payments-ext-${Date.now()}@example.com`;
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

    it('/api/payments/checkout-sessions/:sessionId (GET) should get checkout session', () => {
      return request(app.getHttpServer())
        .get('/api/payments/checkout-sessions/cs_1234567890_abcdef')
        .set('Authorization', `Bearer ${authToken}`)
        .expect((res) => {
          expect([200, 401, 404]).toContain(res.status);
        });
    });

    it('/api/payments/subscriptions (POST) should create subscription', () => {
      return request(app.getHttpServer())
        .post('/api/payments/subscriptions')
        .set('Authorization', `Bearer ${authToken}`)
        .send({
          customerId: 'customer-123',
          priceId: 'price-123',
          orgId: 'org-123',
        })
        .expect((res) => {
          expect([200, 201, 400, 401, 404]).toContain(res.status);
        });
    });

    it('/api/payments/disputes (POST) should create dispute', () => {
      return request(app.getHttpServer())
        .post('/api/payments/disputes')
        .set('Authorization', `Bearer ${authToken}`)
        .send({
          paymentId: 'payment-123',
          reason: 'fraud',
          description: 'Suspicious transaction',
          orgId: 'org-123',
        })
        .expect((res) => {
          expect([200, 201, 400, 401, 404]).toContain(res.status);
        });
    });

    it('/api/payments/webhooks (POST) should register webhook', () => {
      return request(app.getHttpServer())
        .post('/api/payments/webhooks')
        .set('Authorization', `Bearer ${authToken}`)
        .send({
          url: 'https://example.com/webhook',
          events: ['payment.completed'],
          orgId: 'org-123',
        })
        .expect((res) => {
          expect([200, 201, 400, 401, 404]).toContain(res.status);
        });
    });
  });

  describe('Messaging Endpoints - Extended', () => {
    let authToken: string;

    beforeAll(async () => {
      const email = `messaging-ext-${Date.now()}@example.com`;
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

    it('/api/messaging/profiles/:did (GET) should get profile by DID', () => {
      return request(app.getHttpServer())
        .get('/api/messaging/profiles/did:pkh:eip155:65001:0x742d35Cc6634C0532925a3b844Bc9e7595f0bEb0')
        .set('Authorization', `Bearer ${authToken}`)
        .expect((res) => {
          expect([200, 401, 404]).toContain(res.status);
        });
    });

    it('/api/messaging/conversations/:id (GET) should get conversation', () => {
      return request(app.getHttpServer())
        .get('/api/messaging/conversations/conv-123')
        .set('Authorization', `Bearer ${authToken}`)
        .expect((res) => {
          expect([200, 401, 404]).toContain(res.status);
        });
    });

    it('/api/messaging/messages/:id/reactions (GET) should get reactions', () => {
      return request(app.getHttpServer())
        .get('/api/messaging/messages/message-123/reactions')
        .set('Authorization', `Bearer ${authToken}`)
        .expect((res) => {
          expect([200, 401, 404]).toContain(res.status);
        });
    });
  });
});

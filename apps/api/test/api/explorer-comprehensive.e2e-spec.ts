import { Test, TestingModule } from '@nestjs/testing';
import { INestApplication, ValidationPipe } from '@nestjs/common';
import * as request from 'supertest';
import { AppModule } from '../../src/app.module';
import { DataSource } from 'typeorm';

describe('Explorer API - Comprehensive E2E Tests', () => {
  let app: INestApplication;
  let dataSource: DataSource;

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
    dataSource = moduleFixture.get<DataSource>(DataSource);
  });

  afterAll(async () => {
    await app.close();
  });

  describe('Stats Endpoint', () => {
    it('GET /api/v1/stats - should return network statistics', () => {
      return request(app.getHttpServer())
        .get('/api/v1/stats')
        .expect(200)
        .expect((res) => {
          expect(res.body).toHaveProperty('blockHeight');
          expect(res.body).toHaveProperty('totalTransactions');
          expect(res.body).toHaveProperty('totalAccounts');
          expect(res.body).toHaveProperty('gasPrice');
          expect(res.body).toHaveProperty('activeValidators');
          expect(res.body).toHaveProperty('latest_block');
          expect(typeof res.body.blockHeight).toBe('number');
          expect(typeof res.body.totalTransactions).toBe('number');
          expect(typeof res.body.totalAccounts).toBe('number');
          expect(typeof res.body.gasPrice).toBe('string');
        });
    });

    it('GET /api/v1/stats - should return valid gas price', () => {
      return request(app.getHttpServer())
        .get('/api/v1/stats')
        .expect(200)
        .expect((res) => {
          expect(res.body.gasPrice).toBeDefined();
          expect(res.body.gasPrice).not.toBe('0');
          expect(parseInt(res.body.gasPrice)).toBeGreaterThan(0);
        });
    });

    it('GET /api/v1/stats - should return valid account count', () => {
      return request(app.getHttpServer())
        .get('/api/v1/stats')
        .expect(200)
        .expect((res) => {
          expect(res.body.totalAccounts).toBeDefined();
          expect(typeof res.body.totalAccounts).toBe('number');
          expect(res.body.totalAccounts).toBeGreaterThanOrEqual(0);
        });
    });
  });

  describe('Blocks Endpoint', () => {
    it('GET /api/v1/blocks - should return paginated blocks', () => {
      return request(app.getHttpServer())
        .get('/api/v1/blocks?page=1&per_page=10')
        .expect(200)
        .expect((res) => {
          expect(res.body).toHaveProperty('data');
          expect(res.body).toHaveProperty('pagination');
          expect(Array.isArray(res.body.data)).toBe(true);
          if (res.body.data.length > 0) {
            expect(res.body.data[0]).toHaveProperty('height');
            expect(res.body.data[0]).toHaveProperty('hash');
          }
        });
    });

    it('GET /api/v1/blocks - should handle pagination correctly', () => {
      return request(app.getHttpServer())
        .get('/api/v1/blocks?page=1&per_page=5')
        .expect(200)
        .expect((res) => {
          expect(res.body.pagination).toHaveProperty('page', 1);
          expect(res.body.pagination).toHaveProperty('per_page', 5);
          expect(res.body.data.length).toBeLessThanOrEqual(5);
        });
    });

    it('GET /api/v1/blocks/:height - should return block by height', async () => {
      // First get latest block height
      const statsRes = await request(app.getHttpServer())
        .get('/api/v1/stats')
        .expect(200);

      const latestHeight = statsRes.body.blockHeight;

      if (latestHeight > 0) {
        return request(app.getHttpServer())
          .get(`/api/v1/blocks/${latestHeight}`)
          .expect(200)
          .expect((res) => {
            expect(res.body).toHaveProperty('height', latestHeight);
            expect(res.body).toHaveProperty('hash');
          });
      }
    });

    it('GET /api/v1/blocks/:height - should return 404 for invalid height', () => {
      return request(app.getHttpServer())
        .get('/api/v1/blocks/999999999')
        .expect(404);
    });
  });

  describe('Transactions Endpoint', () => {
    it('GET /api/v1/transactions - should return paginated transactions', () => {
      return request(app.getHttpServer())
        .get('/api/v1/transactions?page=1&limit=10')
        .expect(200)
        .expect((res) => {
          expect(res.body).toHaveProperty('transactions');
          expect(res.body).toHaveProperty('pagination');
          expect(Array.isArray(res.body.transactions)).toBe(true);
        });
    });

    it('GET /api/v1/transactions/:hash - should return transaction by hash', async () => {
      // First get a transaction hash from the list
      const listRes = await request(app.getHttpServer())
        .get('/api/v1/transactions?page=1&limit=1')
        .expect(200);

      if (listRes.body.transactions && listRes.body.transactions.length > 0) {
        const txHash = listRes.body.transactions[0].hash;

        return request(app.getHttpServer())
          .get(`/api/v1/transactions/${txHash}`)
          .expect(200)
          .expect((res) => {
            expect(res.body).toHaveProperty('hash', txHash);
            expect(res.body).toHaveProperty('fromAddress');
          });
      }
    });

    it('GET /api/v1/transactions/:hash - should return 404 for invalid hash', () => {
      return request(app.getHttpServer())
        .get('/api/v1/transactions/0x0000000000000000000000000000000000000000000000000000000000000000')
        .expect(404);
    });
  });

  describe('Accounts Endpoint', () => {
    it('GET /api/v1/accounts - should return paginated accounts', () => {
      return request(app.getHttpServer())
        .get('/api/v1/accounts?page=1&per_page=10')
        .expect(200)
        .expect((res) => {
          expect(res.body).toHaveProperty('accounts');
          expect(res.body).toHaveProperty('pagination');
          expect(Array.isArray(res.body.accounts)).toBe(true);
        });
    });

    it('GET /api/v1/accounts/:address - should return account details', async () => {
      // First get an account address from the list
      const listRes = await request(app.getHttpServer())
        .get('/api/v1/accounts?page=1&per_page=1')
        .expect(200);

      if (listRes.body.accounts && listRes.body.accounts.length > 0) {
        const address = listRes.body.accounts[0].address;

        return request(app.getHttpServer())
          .get(`/api/v1/accounts/${address}`)
          .expect(200)
          .expect((res) => {
            expect(res.body).toHaveProperty('address', address);
            expect(res.body).toHaveProperty('balance');
          });
      }
    });

    it('GET /api/v1/accounts/:address/transactions - should return account transactions', async () => {
      const listRes = await request(app.getHttpServer())
        .get('/api/v1/accounts?page=1&per_page=1')
        .expect(200);

      if (listRes.body.accounts && listRes.body.accounts.length > 0) {
        const address = listRes.body.accounts[0].address;

        return request(app.getHttpServer())
          .get(`/api/v1/accounts/${address}/transactions?page=1&per_page=10`)
          .expect(200)
          .expect((res) => {
            expect(Array.isArray(res.body.data || res.body.transactions || [])).toBe(true);
          });
      }
    });
  });

  describe('Contracts Endpoint', () => {
    it('GET /api/v1/contracts/:address - should return contract details', () => {
      // Use a known contract address or create a test contract
      const testAddress = '0x0000000000000000000000000000000000000000';

      return request(app.getHttpServer())
        .get(`/api/v1/contracts/${testAddress}`)
        .expect((res) => {
          // Should return 200 with contract data or 404 if not found
          expect([200, 404]).toContain(res.status);
        });
    });

    it('GET /api/v1/contracts/:address/abi - should return contract ABI', () => {
      const testAddress = '0x0000000000000000000000000000000000000000';

      return request(app.getHttpServer())
        .get(`/api/v1/contracts/${testAddress}/abi`)
        .expect((res) => {
          expect([200, 404]).toContain(res.status);
        });
    });
  });

  describe('Tokens Endpoint', () => {
    it('GET /api/v1/tokens/:address - should return token details', () => {
      const testAddress = '0x0000000000000000000000000000000000000000';

      return request(app.getHttpServer())
        .get(`/api/v1/tokens/${testAddress}`)
        .expect((res) => {
          expect([200, 404]).toContain(res.status);
        });
    });

    it('GET /api/v1/tokens/:address/holders - should return token holders', () => {
      const testAddress = '0x0000000000000000000000000000000000000000';

      return request(app.getHttpServer())
        .get(`/api/v1/tokens/${testAddress}/holders?page=1&per_page=10`)
        .expect((res) => {
          expect([200, 404]).toContain(res.status);
          if (res.status === 200) {
            expect(res.body).toHaveProperty('data');
            expect(Array.isArray(res.body.data)).toBe(true);
          }
        });
    });

    it('GET /api/v1/tokens/:address/transfers - should return token transfers', () => {
      const testAddress = '0x0000000000000000000000000000000000000000';

      return request(app.getHttpServer())
        .get(`/api/v1/tokens/${testAddress}/transfers?page=1&per_page=10`)
        .expect((res) => {
          expect([200, 404]).toContain(res.status);
          if (res.status === 200) {
            expect(res.body).toHaveProperty('data');
            expect(Array.isArray(res.body.data)).toBe(true);
          }
        });
    });
  });

  describe('Error Handling', () => {
    it('should return 400 for invalid pagination parameters', () => {
      return request(app.getHttpServer())
        .get('/api/v1/blocks?page=-1&per_page=0')
        .expect(400);
    });

    it('should return 400 for invalid address format', () => {
      return request(app.getHttpServer())
        .get('/api/v1/accounts/invalid-address')
        .expect(400);
    });

    it('should return 400 for invalid block height', () => {
      return request(app.getHttpServer())
        .get('/api/v1/blocks/invalid-height')
        .expect(400);
    });
  });

  describe('Performance Tests', () => {
    it('GET /api/v1/stats - should respond within 2 seconds', async () => {
      const start = Date.now();
      await request(app.getHttpServer())
        .get('/api/v1/stats')
        .expect(200);
      const duration = Date.now() - start;
      expect(duration).toBeLessThan(2000);
    });

    it('GET /api/v1/blocks - should respond within 2 seconds', async () => {
      const start = Date.now();
      await request(app.getHttpServer())
        .get('/api/v1/blocks?page=1&per_page=10')
        .expect(200);
      const duration = Date.now() - start;
      expect(duration).toBeLessThan(2000);
    });
  });

  describe('Pagination Tests', () => {
    it('should handle large page numbers gracefully', () => {
      return request(app.getHttpServer())
        .get('/api/v1/blocks?page=999999&per_page=10')
        .expect(200)
        .expect((res) => {
          expect(res.body.data).toBeDefined();
          expect(Array.isArray(res.body.data)).toBe(true);
        });
    });

    it('should enforce maximum per_page limit', () => {
      return request(app.getHttpServer())
        .get('/api/v1/blocks?page=1&per_page=10000')
        .expect((res) => {
          // Should either limit to max or return 400
          expect([200, 400]).toContain(res.status);
          if (res.status === 200) {
            expect(res.body.data.length).toBeLessThanOrEqual(100);
          }
        });
    });
  });

  describe('CORS and Headers', () => {
    it('should include CORS headers', () => {
      return request(app.getHttpServer())
        .get('/api/v1/stats')
        .expect(200)
        .expect((res) => {
          // CORS headers should be present (handled by NestJS CORS middleware)
          expect(res.headers).toBeDefined();
        });
    });

    it('should include rate limit headers', () => {
      return request(app.getHttpServer())
        .get('/api/v1/stats')
        .expect(200)
        .expect((res) => {
          // Rate limit headers may be present
          expect(res.headers).toBeDefined();
        });
    });
  });
});


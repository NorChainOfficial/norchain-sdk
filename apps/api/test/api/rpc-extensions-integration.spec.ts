import { Test, TestingModule } from '@nestjs/testing';
import { INestApplication } from '@nestjs/common';
import request from 'supertest';
import { AppModule } from '../../src/app.module';

describe('RPC Extensions API Integration', () => {
  let app: INestApplication;

  beforeAll(async () => {
    const moduleFixture: TestingModule = await Test.createTestingModule({
      imports: [AppModule],
    }).compile();

    app = moduleFixture.createNestApplication();
    await app.init();
  });

  afterAll(async () => {
    await app.close();
  });

  describe('POST /api/v1/rpc/nor_finality', () => {
    it('should return finality status for block', async () => {
      const response = await request(app.getHttpServer())
        .post('/api/v1/rpc/nor_finality')
        .send({
          blockOrTx: 100,
        });

      expect(response.status).toBe(200);
      expect(response.body).toHaveProperty('status');
      expect(response.body).toHaveProperty('blockNumber');
      expect(response.body).toHaveProperty('confidence');
      expect(['unsafe', 'safe', 'final']).toContain(response.body.status);
    });
  });

  describe('POST /api/v1/rpc/nor_accountProfile', () => {
    it('should return account profile', async () => {
      const response = await request(app.getHttpServer())
        .post('/api/v1/rpc/nor_accountProfile')
        .send({
          address: '0x742d35Cc6634C0532925a3b844Bc9e7595f0bEb0',
        });

      expect(response.status).toBe(200);
      expect(response.body).toHaveProperty('address');
      expect(response.body).toHaveProperty('riskFlags');
      expect(response.body).toHaveProperty('kycTier');
      expect(response.body).toHaveProperty('velocityLimits');
    });
  });

  describe('POST /api/v1/rpc/nor_validatorSet', () => {
    it('should return validator set', async () => {
      const response = await request(app.getHttpServer())
        .post('/api/v1/rpc/nor_validatorSet')
        .send({
          tag: 'current',
        });

      expect(response.status).toBe(200);
      expect(response.body).toHaveProperty('validators');
      expect(response.body).toHaveProperty('totalStake');
      expect(response.body).toHaveProperty('activeCount');
      expect(Array.isArray(response.body.validators)).toBe(true);
    });
  });
});


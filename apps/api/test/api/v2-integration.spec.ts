import { Test, TestingModule } from '@nestjs/testing';
import { INestApplication } from '@nestjs/common';
import request from 'supertest';
import { AppModule } from '../../src/app.module';

describe('Finality, Validators & Insights API Integration', () => {
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

  describe('GET /api/finality/tx/:hash', () => {
    it('should return finality status for transaction', async () => {
      const txHash = '0x1234567890abcdef1234567890abcdef1234567890abcdef1234567890abcdef';
      const response = await request(app.getHttpServer())
        .get(`/api/finality/tx/${txHash}`);

      expect(response.status).toBe(200);
      expect(response.body).toHaveProperty('status');
      expect(response.body).toHaveProperty('blockNumber');
      expect(response.body).toHaveProperty('confidence');
    });
  });

  describe('GET /api/finality/block/:number', () => {
    it('should return finality status for block', async () => {
      const response = await request(app.getHttpServer())
        .get('/api/finality/block/100');

      expect(response.status).toBe(200);
      expect(response.body).toHaveProperty('status');
      expect(response.body).toHaveProperty('blockNumber', 100);
    });
  });

  describe('GET /api/validators', () => {
    it('should return validator set', async () => {
      const response = await request(app.getHttpServer())
        .get('/api/validators');

      expect(response.status).toBe(200);
      expect(response.body).toHaveProperty('validators');
      expect(response.body).toHaveProperty('totalStake');
      expect(Array.isArray(response.body.validators)).toBe(true);
    });
  });

  describe('GET /api/insights/holders/top', () => {
    it('should return top token holders', async () => {
      const response = await request(app.getHttpServer())
        .get('/api/insights/holders/top')
        .query({ token: '0x742d35Cc6634C0532925a3b844Bc9e7595f0bEb0' });

      expect(response.status).toBe(200);
      expect(response.body).toHaveProperty('token');
      expect(response.body).toHaveProperty('holders');
      expect(Array.isArray(response.body.holders)).toBe(true);
    });
  });

  describe('GET /api/insights/dex/tvl', () => {
    it('should return DEX TVL', async () => {
      const response = await request(app.getHttpServer())
        .get('/api/insights/dex/tvl')
        .query({ window: '7d' });

      expect(response.status).toBe(200);
      expect(response.body).toHaveProperty('range', '7d');
      expect(response.body).toHaveProperty('tvl');
    });
  });

  describe('GET /api/insights/gas/heatmap', () => {
    it('should return gas heatmap', async () => {
      const response = await request(app.getHttpServer())
        .get('/api/insights/gas/heatmap')
        .query({ days: 7 });

      expect(response.status).toBe(200);
      expect(response.body).toHaveProperty('days', 7);
      expect(response.body).toHaveProperty('heatmap');
    });
  });
});


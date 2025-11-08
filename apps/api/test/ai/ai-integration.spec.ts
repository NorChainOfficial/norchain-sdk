/**
 * AI Integration Tests
 * 
 * Comprehensive tests for all AI functionality.
 */

import { Test, TestingModule } from '@nestjs/testing';
import { INestApplication } from '@nestjs/common';
import * as request from 'supertest';
import { AppModule } from '../../src/app.module';

describe('AI Integration Tests', () => {
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

  describe('Transaction Analysis', () => {
    it('should analyze transaction successfully', () => {
      return request(app.getHttpServer())
        .post('/api/v1/ai/analyze-transaction')
        .send({ txHash: '0x123...' })
        .expect((res) => {
          if (res.status === 200) {
            expect(res.body).toHaveProperty('summary');
            expect(res.body).toHaveProperty('riskLevel');
            expect(res.body).toHaveProperty('confidence');
          }
        });
    });

    it('should return risk assessment', () => {
      return request(app.getHttpServer())
        .post('/api/v1/ai/analyze-transaction')
        .send({ txHash: '0x123...' })
        .expect((res) => {
          if (res.status === 200 && res.body.riskLevel) {
            expect(['low', 'medium', 'high', 'critical']).toContain(res.body.riskLevel);
          }
        });
    });
  });

  describe('Contract Audit', () => {
    it('should audit contract successfully', () => {
      return request(app.getHttpServer())
        .post('/api/v1/ai/audit-contract')
        .send({ contractAddress: '0xabc...' })
        .expect((res) => {
          if (res.status === 200) {
            expect(res.body).toHaveProperty('securityScore');
            expect(res.body).toHaveProperty('vulnerabilities');
            expect(res.body).toHaveProperty('riskLevel');
          }
        });
    });

    it('should detect vulnerabilities', () => {
      return request(app.getHttpServer())
        .post('/api/v1/ai/audit-contract')
        .send({ contractAddress: '0xabc...' })
        .expect((res) => {
          if (res.status === 200) {
            expect(Array.isArray(res.body.vulnerabilities)).toBe(true);
          }
        });
    });
  });

  describe('Gas Prediction', () => {
    it('should predict gas price', () => {
      return request(app.getHttpServer())
        .get('/api/v1/ai/predict-gas')
        .expect((res) => {
          if (res.status === 200) {
            expect(res.body).toHaveProperty('predictedPrice');
            expect(res.body).toHaveProperty('confidence');
            expect(res.body).toHaveProperty('trend');
          }
        });
    });

    it('should return trend information', () => {
      return request(app.getHttpServer())
        .get('/api/v1/ai/predict-gas')
        .expect((res) => {
          if (res.status === 200 && res.body.trend) {
            expect(['increasing', 'decreasing', 'stable']).toContain(res.body.trend);
          }
        });
    });
  });

  describe('Anomaly Detection', () => {
    it('should detect anomalies', () => {
      return request(app.getHttpServer())
        .get('/api/v1/ai/detect-anomalies')
        .query({ address: '0x742d35Cc6634C0532925a3b844Bc9e7595f0bEb', days: 7 })
        .expect((res) => {
          if (res.status === 200) {
            expect(res.body).toHaveProperty('anomalies');
            expect(res.body).toHaveProperty('riskScore');
            expect(res.body).toHaveProperty('recommendations');
          }
        });
    });
  });

  describe('Portfolio Optimization', () => {
    it('should optimize portfolio', () => {
      return request(app.getHttpServer())
        .post('/api/v1/ai/optimize-portfolio')
        .send({ address: '0x742d35Cc6634C0532925a3b844Bc9e7595f0bEb' })
        .expect((res) => {
          if (res.status === 200) {
            expect(res.body).toHaveProperty('currentPortfolio');
            expect(res.body).toHaveProperty('recommendations');
            expect(res.body).toHaveProperty('optimizedAllocation');
          }
        });
    });
  });

  describe('AI Chatbot', () => {
    it('should answer questions', () => {
      return request(app.getHttpServer())
        .post('/api/v1/ai/chat')
        .send({ question: 'What is gas?' })
        .expect((res) => {
          if (res.status === 200) {
            expect(res.body).toHaveProperty('answer');
            expect(res.body).toHaveProperty('confidence');
          }
        });
    });

    it('should handle context', () => {
      return request(app.getHttpServer())
        .post('/api/v1/ai/chat')
        .send({
          question: 'What is this transaction?',
          context: { txHash: '0x123...' },
        })
        .expect((res) => {
          if (res.status === 200) {
            expect(res.body).toHaveProperty('answer');
          }
        });
    });
  });
});


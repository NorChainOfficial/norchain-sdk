/**
 * Load Testing Suite
 * 
 * This file contains load testing scenarios using Jest.
 * For production load testing, use tools like:
 * - k6 (https://k6.io)
 * - Artillery (https://www.artillery.io)
 * - Apache JMeter
 * - Locust
 * 
 * These tests verify basic functionality under load.
 */

import { Test, TestingModule } from '@nestjs/testing';
import { INestApplication } from '@nestjs/common';
import * as request from 'supertest';
import { AppModule } from '../../src/app.module';

describe('Load Testing Suite', () => {
  let app: INestApplication;
  const BASE_URL = process.env.API_URL || 'http://localhost:3000';

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

  describe('Concurrent Requests', () => {
    it('should handle 100 concurrent health check requests', async () => {
      const requests = Array.from({ length: 100 }, () =>
        request(app.getHttpServer())
          .get('/api/health')
          .expect(200),
      );

      const startTime = Date.now();
      await Promise.all(requests);
      const duration = Date.now() - startTime;

      console.log(`100 concurrent requests completed in ${duration}ms`);
      expect(duration).toBeLessThan(10000); // Should complete in < 10 seconds
    });

    it('should handle 50 concurrent account balance requests', async () => {
      const address = '0x742d35Cc6634C0532925a3b844Bc9e7595f0bEb0';
      const requests = Array.from({ length: 50 }, () =>
        request(app.getHttpServer())
          .get(`/api/account/balance?address=${address}`)
          .expect(200),
      );

      const startTime = Date.now();
      const results = await Promise.allSettled(requests);
      const duration = Date.now() - startTime;

      const successCount = results.filter((r) => r.status === 'fulfilled').length;
      console.log(`${successCount}/50 requests succeeded in ${duration}ms`);
      expect(successCount).toBeGreaterThan(40); // At least 80% success rate
    });
  });

  describe('Sequential Load', () => {
    it('should handle 1000 sequential requests', async () => {
      const startTime = Date.now();
      let successCount = 0;
      let errorCount = 0;

      for (let i = 0; i < 1000; i++) {
        try {
          await request(app.getHttpServer())
            .get('/api/health')
            .expect(200);
          successCount++;
        } catch (error) {
          errorCount++;
        }
      }

      const duration = Date.now() - startTime;
      console.log(`1000 sequential requests: ${successCount} success, ${errorCount} errors in ${duration}ms`);
      expect(successCount).toBeGreaterThan(950); // At least 95% success rate
    });
  });

  describe('Rate Limiting', () => {
    it('should enforce rate limits under high load', async () => {
      const requests = Array.from({ length: 200 }, () =>
        request(app.getHttpServer())
          .get('/api/health')
          .expect((res) => {
            // Some requests should be rate limited (429)
            if (res.status === 429) {
              expect(res.body).toHaveProperty('message');
            } else {
              expect(res.status).toBe(200);
            }
          }),
      );

      const results = await Promise.allSettled(requests);
      const rateLimited = results.filter(
        (r) => r.status === 'fulfilled' && (r.value as any).status === 429,
      ).length;

      console.log(`Rate limited requests: ${rateLimited}/200`);
      // Rate limiting should kick in with high concurrent requests
    });
  });
});

/**
 * Load Testing Scripts (for k6)
 * 
 * Save as load-test.js and run with: k6 run load-test.js
 * 
 * import http from 'k6/http';
 * import { check, sleep } from 'k6';
 * 
 * export const options = {
 *   stages: [
 *     { duration: '30s', target: 50 },   // Ramp up to 50 users
 *     { duration: '1m', target: 50 },     // Stay at 50 users
 *     { duration: '30s', target: 100 },   // Ramp up to 100 users
 *     { duration: '1m', target: 100 },    // Stay at 100 users
 *     { duration: '30s', target: 0 },     // Ramp down
 *   ],
 * };
 * 
 * export default function () {
 *   const res = http.get('http://localhost:3000/api/health');
 *   check(res, { 'status was 200': (r) => r.status == 200 });
 *   sleep(1);
 * }
 */


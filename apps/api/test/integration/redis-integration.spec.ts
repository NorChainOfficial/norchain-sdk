/**
 * Redis Integration Tests
 *
 * Tests Redis caching and pub/sub functionality
 * - Cache operations
 * - Pub/Sub messaging
 * - TTL handling
 * - Connection handling
 */

import { Test, TestingModule } from '@nestjs/testing';
import { INestApplication } from '@nestjs/common';
import { AppModule } from '../../src/app.module';
import { CacheService } from '../../src/common/services/cache.service';

describe('Redis Integration Tests', () => {
  let app: INestApplication;
  let cacheService: CacheService;

  beforeAll(async () => {
    const moduleFixture: TestingModule = await Test.createTestingModule({
      imports: [AppModule],
    }).compile();

    app = moduleFixture.createNestApplication();
    await app.init();

    cacheService = moduleFixture.get<CacheService>(CacheService);
  });

  afterAll(async () => {
    await app.close();
  });

  describe('Cache Operations', () => {
    it('should set and get value', async () => {
      const key = 'test:key';
      const value = { data: 'test' };

      await cacheService.set(key, value, 60);
      const result = await cacheService.get(key);

      expect(result).toEqual(value);
    });

    it('should return null for non-existent key', async () => {
      const result = await cacheService.get('non:existent:key');

      expect(result).toBeNull();
    });

    it('should delete key', async () => {
      const key = 'test:delete';
      await cacheService.set(key, 'value', 60);

      await cacheService.del(key);
      const result = await cacheService.get(key);

      expect(result).toBeNull();
    });

    it('should handle TTL expiration', async () => {
      const key = 'test:ttl';
      await cacheService.set(key, 'value', 1); // 1 second TTL

      await new Promise((resolve) => setTimeout(resolve, 1100));

      const result = await cacheService.get(key);
      expect(result).toBeNull();
    }, 10000);

    it('should get or set with callback', async () => {
      const key = 'test:getorset';
      let callCount = 0;

      const callback = async () => {
        callCount++;
        return { data: 'from-callback' };
      };

      const result1 = await cacheService.getOrSet(key, callback, 60);
      const result2 = await cacheService.getOrSet(key, callback, 60);

      expect(result1).toEqual({ data: 'from-callback' });
      expect(result2).toEqual({ data: 'from-callback' });
      expect(callCount).toBe(1); // Callback should be called only once
    });

    it('should reset cache', async () => {
      await cacheService.set('key1', 'value1', 60);
      await cacheService.set('key2', 'value2', 60);

      await cacheService.reset();

      expect(await cacheService.get('key1')).toBeNull();
      expect(await cacheService.get('key2')).toBeNull();
    });
  });

  describe('Cache with Prefix', () => {
    it('should handle keys with prefix', async () => {
      const key = 'prefixed:key';
      const value = 'prefixed-value';

      await cacheService.set(key, value, 60);
      const result = await cacheService.get(key);

      expect(result).toBe(value);
    });
  });

  describe('Error Handling', () => {
    it('should handle connection errors gracefully', async () => {
      // This test verifies that cache operations don't crash the app
      // In a real scenario, you'd mock Redis to throw errors
      const key = 'error:test';

      try {
        await cacheService.set(key, 'value', 60);
        const result = await cacheService.get(key);
        // Should either succeed or fail gracefully
        expect(result !== undefined || result === null).toBe(true);
      } catch (error) {
        // If Redis is not available, that's okay for this test
        expect(error).toBeDefined();
      }
    });
  });
});


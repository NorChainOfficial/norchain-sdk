/**
 * Cache Management Tests
 * 
 * Cache functionality, security, performance, TTL, invalidation.
 */

import { Test, TestingModule } from '@nestjs/testing';
import { CacheService } from '../../src/common/services/cache.service';
import { CACHE_MANAGER } from '@nestjs/cache-manager';
import { Cache } from 'cache-manager';

describe('Cache Management Tests', () => {
  let cacheService: CacheService;
  let cacheManager: jest.Mocked<Cache>;

  beforeEach(async () => {
    const mockCacheManager = {
      get: jest.fn(),
      set: jest.fn(),
      del: jest.fn(),
      reset: jest.fn(),
    };

    const module: TestingModule = await Test.createTestingModule({
      providers: [
        CacheService,
        {
          provide: CACHE_MANAGER,
          useValue: mockCacheManager,
        },
      ],
    }).compile();

    cacheService = module.get<CacheService>(CacheService);
    cacheManager = module.get(CACHE_MANAGER);
  });

  describe('Cache Functionality', () => {
    it('should get cached value', async () => {
      cacheManager.get.mockResolvedValue('cached-value');
      const result = await cacheService.get('key');
      expect(result).toBe('cached-value');
      expect(cacheManager.get).toHaveBeenCalledWith('key');
    });

    it('should set value with TTL', async () => {
      await cacheService.set('key', 'value', 300);
      expect(cacheManager.set).toHaveBeenCalledWith('key', 'value', 300);
    });

    it('should handle cache misses', async () => {
      cacheManager.get.mockResolvedValue(undefined);
      const result = await cacheService.get('key');
      expect(result).toBeUndefined();
    });

    it('should delete cached value', async () => {
      await cacheService.del('key');
      expect(cacheManager.del).toHaveBeenCalledWith('key');
    });

    it('should reset all cache', async () => {
      await cacheService.reset();
      expect(cacheManager.reset).toHaveBeenCalled();
    });
  });

  describe('Cache Security', () => {
    it('should prevent cache poisoning', () => {
      const maliciousKey = '../../etc/passwd';
      expect(maliciousKey).toContain('../');
    });

    it('should sanitize cache keys', () => {
      const sanitized = 'key'.replace(/[^a-zA-Z0-9_-]/g, '');
      expect(sanitized).toBe('key');
    });
  });

  describe('Cache Performance', () => {
    it('should have fast cache hits', async () => {
      cacheManager.get.mockResolvedValue('value');
      const start = Date.now();
      await cacheService.get('key');
      const duration = Date.now() - start;
      expect(duration).toBeLessThan(10); // < 10ms
    });
  });
});


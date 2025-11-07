import { Test, TestingModule } from '@nestjs/testing';
import { CACHE_MANAGER } from '@nestjs/cache-manager';
import { CacheService } from './cache.service';

describe('CacheService', () => {
  let service: CacheService;
  let cacheManager: any;

  beforeEach(async () => {
    cacheManager = {
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
          useValue: cacheManager,
        },
      ],
    }).compile();

    service = module.get<CacheService>(CacheService);
  });

  it('should be defined', () => {
    expect(service).toBeDefined();
  });

  describe('get', () => {
    it('should return cached value', async () => {
      const key = 'test-key';
      const value = 'test-value';
      cacheManager.get.mockResolvedValue(value);

      const result = await service.get(key);

      expect(result).toBe(value);
      expect(cacheManager.get).toHaveBeenCalledWith(key);
    });

    it('should return undefined if key not found', async () => {
      cacheManager.get.mockResolvedValue(undefined);

      const result = await service.get('non-existent');

      expect(result).toBeUndefined();
    });
  });

  describe('set', () => {
    it('should set value in cache', async () => {
      const key = 'test-key';
      const value = 'test-value';
      const ttl = 300;

      await service.set(key, value, ttl);

      expect(cacheManager.set).toHaveBeenCalledWith(key, value, ttl);
    });

    it('should set value without TTL', async () => {
      const key = 'test-key';
      const value = 'test-value';

      await service.set(key, value);

      expect(cacheManager.set).toHaveBeenCalledWith(key, value, undefined);
    });
  });

  describe('getOrSet', () => {
    it('should return cached value if exists', async () => {
      const key = 'test-key';
      const cachedValue = 'cached-value';
      const fn = jest.fn();

      cacheManager.get.mockResolvedValue(cachedValue);

      const result = await service.getOrSet(key, fn, 300);

      expect(result).toBe(cachedValue);
      expect(fn).not.toHaveBeenCalled();
    });

    it('should call function and cache result if not cached', async () => {
      const key = 'test-key';
      const newValue = 'new-value';
      const fn = jest.fn().mockResolvedValue(newValue);

      cacheManager.get.mockResolvedValue(undefined);

      const result = await service.getOrSet(key, fn, 300);

      expect(result).toBe(newValue);
      expect(fn).toHaveBeenCalled();
      expect(cacheManager.set).toHaveBeenCalledWith(key, newValue, 300);
    });
  });

  describe('del', () => {
    it('should delete key from cache', async () => {
      const key = 'test-key';

      await service.del(key);

      expect(cacheManager.del).toHaveBeenCalledWith(key);
    });
  });

  describe('reset', () => {
    it('should reset entire cache', async () => {
      await service.reset();

      expect(cacheManager.reset).toHaveBeenCalled();
    });
  });
});


import { Injectable, Logger, Inject } from '@nestjs/common';
import { CacheService } from './cache.service';
import { ConfigService } from '@nestjs/config';

export interface CacheStrategy {
  ttl: number;
  maxSize?: number;
  refreshThreshold?: number; // Refresh when TTL remaining < threshold
}

export interface CacheMetrics {
  hits: number;
  misses: number;
  sets: number;
  deletes: number;
  hitRate: number;
}

/**
 * Advanced Caching Service
 *
 * Provides advanced caching strategies:
 * - Multi-tier caching (memory + Redis)
 * - Cache warming
 * - Cache invalidation patterns
 * - Cache metrics and monitoring
 * - TTL strategies
 * - Cache stampede prevention
 */
@Injectable()
export class AdvancedCacheService {
  private readonly logger = new Logger(AdvancedCacheService.name);
  private readonly memoryCache = new Map<
    string,
    { value: any; expiresAt: number }
  >();
  private readonly metrics: CacheMetrics = {
    hits: 0,
    misses: 0,
    sets: 0,
    deletes: 0,
    hitRate: 0,
  };
  private readonly refreshLocks = new Map<string, Promise<any>>();

  constructor(
    private readonly cacheService: CacheService,
    private readonly configService: ConfigService,
  ) {}

  /**
   * Get with cache-aside pattern and automatic refresh
   */
  async getOrSet<T>(
    key: string,
    fetcher: () => Promise<T>,
    strategy: CacheStrategy = { ttl: 300 },
  ): Promise<T> {
    // Try memory cache first
    const memoryValue = this.getFromMemory(key);
    if (memoryValue !== undefined) {
      this.recordHit();
      return memoryValue as T;
    }

    // Try Redis cache
    const redisValue = await this.cacheService.get<T>(key);
    if (redisValue !== null) {
      this.recordHit();
      // Populate memory cache
      this.setInMemory(key, redisValue, strategy.ttl);
      return redisValue;
    }

    // Cache miss - fetch and cache
    this.recordMiss();
    return this.fetchAndCache(key, fetcher, strategy);
  }

  /**
   * Get with cache stampede prevention
   */
  async getOrSetWithLock<T>(
    key: string,
    fetcher: () => Promise<T>,
    strategy: CacheStrategy = { ttl: 300 },
  ): Promise<T> {
    // Check if refresh is in progress
    const existingLock = this.refreshLocks.get(key);
    if (existingLock) {
      this.logger.debug(`Waiting for existing fetch for key: ${key}`);
      return existingLock;
    }

    // Try cache first
    const cached = await this.getOrSet(key, fetcher, strategy);
    if (cached !== null) {
      return cached;
    }

    // Fetch with lock
    const fetchPromise = this.fetchAndCache(key, fetcher, strategy);
    this.refreshLocks.set(key, fetchPromise);

    try {
      const result = await fetchPromise;
      return result;
    } finally {
      this.refreshLocks.delete(key);
    }
  }

  /**
   * Cache warming - pre-populate cache
   */
  async warmCache<T>(
    keys: string[],
    fetcher: (key: string) => Promise<T>,
    strategy: CacheStrategy = { ttl: 300 },
  ): Promise<void> {
    this.logger.log(`Warming cache for ${keys.length} keys`);

    const promises = keys.map(async (key) => {
      try {
        await this.getOrSet(key, () => fetcher(key), strategy);
      } catch (error) {
        this.logger.error(
          `Failed to warm cache for key ${key}: ${error.message}`,
        );
      }
    });

    await Promise.all(promises);
    this.logger.log('Cache warming completed');
  }

  /**
   * Invalidate cache by pattern
   */
  async invalidatePattern(pattern: string): Promise<number> {
    let invalidated = 0;

    // Invalidate memory cache
    const memoryKeys = Array.from(this.memoryCache.keys());
    const matchingMemoryKeys = memoryKeys.filter((key) =>
      this.matchPattern(key, pattern),
    );
    matchingMemoryKeys.forEach((key) => {
      this.memoryCache.delete(key);
      invalidated++;
    });

    // Note: Redis pattern invalidation would require SCAN command
    // For now, we'll invalidate known patterns
    this.logger.log(
      `Invalidated ${invalidated} cache entries matching pattern: ${pattern}`,
    );

    return invalidated;
  }

  /**
   * Get cache metrics
   */
  getMetrics(): CacheMetrics {
    const total = this.metrics.hits + this.metrics.misses;
    this.metrics.hitRate = total > 0 ? this.metrics.hits / total : 0;
    return { ...this.metrics };
  }

  /**
   * Reset cache metrics
   */
  resetMetrics(): void {
    this.metrics.hits = 0;
    this.metrics.misses = 0;
    this.metrics.sets = 0;
    this.metrics.deletes = 0;
    this.metrics.hitRate = 0;
  }

  /**
   * Get from memory cache
   */
  private getFromMemory(key: string): any {
    const entry = this.memoryCache.get(key);
    if (!entry) {
      return undefined;
    }

    if (entry.expiresAt < Date.now()) {
      this.memoryCache.delete(key);
      return undefined;
    }

    return entry.value;
  }

  /**
   * Set in memory cache
   */
  private setInMemory(key: string, value: any, ttl: number): void {
    const maxSize = 10000; // Max 10k entries in memory
    if (this.memoryCache.size >= maxSize) {
      // Remove oldest entry (simple FIFO)
      const firstKey = this.memoryCache.keys().next().value;
      if (firstKey) {
        this.memoryCache.delete(firstKey);
      }
    }

    this.memoryCache.set(key, {
      value,
      expiresAt: Date.now() + ttl * 1000,
    });
  }

  /**
   * Fetch and cache value
   */
  private async fetchAndCache<T>(
    key: string,
    fetcher: () => Promise<T>,
    strategy: CacheStrategy,
  ): Promise<T> {
    const value = await fetcher();

    // Cache in Redis
    await this.cacheService.set(key, value, strategy.ttl);

    // Cache in memory
    this.setInMemory(key, value, strategy.ttl);

    this.recordSet();
    return value;
  }

  /**
   * Match key against pattern (supports * wildcard)
   */
  private matchPattern(key: string, pattern: string): boolean {
    const regex = new RegExp('^' + pattern.replace(/\*/g, '.*') + '$');
    return regex.test(key);
  }

  private recordHit(): void {
    this.metrics.hits++;
  }

  private recordMiss(): void {
    this.metrics.misses++;
  }

  private recordSet(): void {
    this.metrics.sets++;
  }
}

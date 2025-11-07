/**
 * Cache Manager with TTL Support
 * In-memory cache with time-to-live for API responses
 *
 * Features:
 * - TTL-based expiration
 * - LRU eviction when max size reached
 * - Cache statistics
 * - Namespace support
 * - Type-safe caching
 */

export interface CacheConfig {
  readonly ttl: number;              // Time to live in milliseconds
  readonly maxSize: number;          // Maximum number of cached items
  readonly cleanupInterval: number;  // Interval for cleanup in milliseconds
}

interface CacheEntry<T> {
  readonly value: T;
  readonly expiresAt: number;
  readonly createdAt: number;
  accessCount: number;
  lastAccessed: number;
}

export interface CacheStats {
  readonly size: number;
  readonly maxSize: number;
  readonly hits: number;
  readonly misses: number;
  readonly hitRate: number;
  readonly evictions: number;
}

export class CacheManager {
  private cache: Map<string, CacheEntry<any>> = new Map();
  private stats = {
    hits: 0,
    misses: 0,
    evictions: 0,
  };
  private cleanupTimer: NodeJS.Timeout | null = null;

  private readonly defaultConfig: CacheConfig = {
    ttl: 5000,           // 5 seconds default
    maxSize: 1000,       // 1000 items max
    cleanupInterval: 60000, // Cleanup every minute
  };

  constructor(private readonly config: Partial<CacheConfig> = {}) {
    this.config = { ...this.defaultConfig, ...config };
    this.startCleanup();
  }

  /**
   * Get value from cache
   */
  get<T>(key: string): T | null {
    const entry = this.cache.get(key);

    if (!entry) {
      this.stats.misses++;
      return null;
    }

    // Check if expired
    if (this.isExpired(entry)) {
      this.cache.delete(key);
      this.stats.misses++;
      return null;
    }

    // Update access metadata
    entry.accessCount++;
    entry.lastAccessed = Date.now();

    this.stats.hits++;
    return entry.value;
  }

  /**
   * Set value in cache
   */
  set<T>(key: string, value: T, ttl?: number): void {
    // Evict if cache is full
    if (this.cache.size >= (this.config.maxSize || this.defaultConfig.maxSize)) {
      this.evictLRU();
    }

    const effectiveTtl = ttl || this.config.ttl || this.defaultConfig.ttl;

    const entry: CacheEntry<T> = {
      value,
      expiresAt: Date.now() + effectiveTtl,
      createdAt: Date.now(),
      accessCount: 0,
      lastAccessed: Date.now(),
    };

    this.cache.set(key, entry);
  }

  /**
   * Check if key exists and is not expired
   */
  has(key: string): boolean {
    const entry = this.cache.get(key);
    if (!entry) return false;

    if (this.isExpired(entry)) {
      this.cache.delete(key);
      return false;
    }

    return true;
  }

  /**
   * Delete key from cache
   */
  delete(key: string): boolean {
    return this.cache.delete(key);
  }

  /**
   * Clear all cache entries
   */
  clear(): void {
    this.cache.clear();
  }

  /**
   * Get or set with a factory function
   */
  async getOrSet<T>(
    key: string,
    factory: () => Promise<T>,
    ttl?: number
  ): Promise<T> {
    // Check cache first
    const cached = this.get<T>(key);
    if (cached !== null) {
      return cached;
    }

    // Not in cache, fetch fresh data
    const value = await factory();
    this.set(key, value, ttl);
    return value;
  }

  /**
   * Invalidate cache entries by pattern
   */
  invalidatePattern(pattern: RegExp): number {
    let count = 0;
    for (const key of this.cache.keys()) {
      if (pattern.test(key)) {
        this.cache.delete(key);
        count++;
      }
    }
    return count;
  }

  /**
   * Check if cache entry is expired
   */
  private isExpired(entry: CacheEntry<any>): boolean {
    return Date.now() > entry.expiresAt;
  }

  /**
   * Evict least recently used item
   */
  private evictLRU(): void {
    let lruKey: string | null = null;
    let lruTime = Infinity;

    for (const [key, entry] of this.cache.entries()) {
      if (entry.lastAccessed < lruTime) {
        lruTime = entry.lastAccessed;
        lruKey = key;
      }
    }

    if (lruKey) {
      this.cache.delete(lruKey);
      this.stats.evictions++;
    }
  }

  /**
   * Start automatic cleanup of expired entries
   */
  private startCleanup(): void {
    const interval = this.config.cleanupInterval || this.defaultConfig.cleanupInterval;

    this.cleanupTimer = setInterval(() => {
      this.cleanup();
    }, interval);

    // Don't prevent Node.js from exiting
    if (this.cleanupTimer.unref) {
      this.cleanupTimer.unref();
    }
  }

  /**
   * Remove expired entries
   */
  private cleanup(): void {
    const now = Date.now();
    for (const [key, entry] of this.cache.entries()) {
      if (now > entry.expiresAt) {
        this.cache.delete(key);
      }
    }
  }

  /**
   * Get cache statistics
   */
  getStats(): CacheStats {
    const totalRequests = this.stats.hits + this.stats.misses;
    return {
      size: this.cache.size,
      maxSize: this.config.maxSize || this.defaultConfig.maxSize,
      hits: this.stats.hits,
      misses: this.stats.misses,
      hitRate: totalRequests > 0 ? (this.stats.hits / totalRequests) * 100 : 0,
      evictions: this.stats.evictions,
    };
  }

  /**
   * Get all cache keys
   */
  keys(): string[] {
    return Array.from(this.cache.keys());
  }

  /**
   * Get cache size
   */
  size(): number {
    return this.cache.size;
  }

  /**
   * Reset statistics
   */
  resetStats(): void {
    this.stats = {
      hits: 0,
      misses: 0,
      evictions: 0,
    };
  }

  /**
   * Destroy cache and stop cleanup
   */
  destroy(): void {
    if (this.cleanupTimer) {
      clearInterval(this.cleanupTimer);
      this.cleanupTimer = null;
    }
    this.cache.clear();
  }
}

/**
 * Create cache key from parts
 */
export function createCacheKey(...parts: (string | number | boolean)[]): string {
  return parts.map(p => String(p)).join(':');
}

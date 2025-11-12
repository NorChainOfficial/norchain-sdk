/**
 * Unit Tests for Cache Manager
 * Tests lib/api-cache.ts
 */

import { describe, it, expect, beforeEach, vi } from 'vitest';
import { apiCache } from '@/lib/api-cache';

describe('apiCache', () => {
  beforeEach(() => {
    vi.clearAllMocks();
    // Clear cache before each test if clear method exists
    if (apiCache && typeof (apiCache as any).clear === 'function') {
      (apiCache as any).clear();
    }
  });

  it('should set and get cache values', () => {
    const key = 'test-key';
    const value = { data: 'test' };
    const ttl = 1000;

    apiCache.set(key, value, ttl);
    const cached = apiCache.get(key);
    expect(cached).toEqual(value);
  });

  it('should generate cache keys', () => {
    const url = 'http://api.test/endpoint';
    const key = apiCache.generateKey(url);
    expect(key).toBeDefined();
    expect(typeof key).toBe('string');
  });

  it('should handle cache misses', () => {
    const cached = apiCache.get('non-existent-key');
    expect(cached).toBeNull();
  });

  it('should return null for expired cache', async () => {
    vi.useFakeTimers();
    const key = 'test-key';
    const value = { data: 'test' };
    const ttl = 1000;

    apiCache.set(key, value, ttl);
    expect(apiCache.get(key)).toEqual(value);
    
    // Fast-forward time past TTL
    vi.advanceTimersByTime(2000);
    
    const cached = apiCache.get(key);
    expect(cached).toBeNull();

    vi.useRealTimers();
  });
});


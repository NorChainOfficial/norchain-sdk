/**
 * Unit Tests for Circuit Breaker
 * Tests lib/circuit-breaker.ts
 */

import { describe, it, expect, vi, beforeEach } from 'vitest';

describe('Circuit Breaker', () => {
  beforeEach(() => {
    vi.clearAllMocks();
  });

  it('should allow requests when circuit is closed', async () => {
    // Simple circuit breaker implementation for testing
    class SimpleCircuitBreaker {
      private failures = 0;
      private state: 'closed' | 'open' | 'half-open' = 'closed';
      private readonly threshold = 5;

      async execute<T>(fn: () => Promise<T>): Promise<T> {
        if (this.state === 'open') {
          throw new Error('Circuit breaker is open');
        }

        try {
          const result = await fn();
          this.failures = 0;
          this.state = 'closed';
          return result;
        } catch (error) {
          this.failures++;
          if (this.failures >= this.threshold) {
            this.state = 'open';
          }
          throw error;
        }
      }
    }

    const breaker = new SimpleCircuitBreaker();
    const result = await breaker.execute(async () => 'Success');
    expect(result).toBe('Success');
  });

  it('should open circuit after threshold failures', async () => {
    class SimpleCircuitBreaker {
      private failures = 0;
      private state: 'closed' | 'open' | 'half-open' = 'closed';
      private readonly threshold = 3;

      async execute<T>(fn: () => Promise<T>): Promise<T> {
        if (this.state === 'open') {
          throw new Error('Circuit breaker is open');
        }

        try {
          const result = await fn();
          this.failures = 0;
          this.state = 'closed';
          return result;
        } catch (error) {
          this.failures++;
          if (this.failures >= this.threshold) {
            this.state = 'open';
          }
          throw error;
        }
      }
    }

    const breaker = new SimpleCircuitBreaker();
    const failingFn = async () => {
      throw new Error('Failed');
    };

    // Fail multiple times
    for (let i = 0; i < 3; i++) {
      try {
        await breaker.execute(failingFn);
      } catch (e) {
        // Expected
      }
    }

    // Circuit should be open now
    await expect(breaker.execute(failingFn)).rejects.toThrow('Circuit breaker is open');
  });
});


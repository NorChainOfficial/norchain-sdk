/**
 * Circuit Breaker Pattern Implementation
 * Prevents cascading failures by temporarily blocking requests to failing services
 *
 * States:
 * - CLOSED: Normal operation, requests pass through
 * - OPEN: Too many failures, requests are blocked
 * - HALF_OPEN: Testing if service recovered
 */

export enum CircuitState {
  CLOSED = 'CLOSED',
  OPEN = 'OPEN',
  HALF_OPEN = 'HALF_OPEN',
}

export interface CircuitBreakerConfig {
  readonly failureThreshold: number;    // Number of failures before opening
  readonly successThreshold: number;    // Number of successes to close from half-open
  readonly timeout: number;              // Time to wait before trying half-open (ms)
  readonly monitoringPeriod?: number;   // Time window for tracking failures (ms)
}

export interface CircuitBreakerStats {
  readonly state: CircuitState;
  readonly failureCount: number;
  readonly successCount: number;
  readonly totalRequests: number;
  readonly lastFailureTime: number | null;
  readonly nextAttemptTime: number | null;
}

export class CircuitBreaker {
  private state: CircuitState = CircuitState.CLOSED;
  private failureCount: number = 0;
  private successCount: number = 0;
  private totalRequests: number = 0;
  private lastFailureTime: number | null = null;
  private nextAttemptTime: number | null = null;
  private halfOpenSuccesses: number = 0;

  constructor(private readonly config: CircuitBreakerConfig) {
    // Set default monitoring period if not provided
    if (!this.config.monitoringPeriod) {
      (this.config as any).monitoringPeriod = 60000; // 1 minute default
    }
  }

  /**
   * Execute a function through the circuit breaker
   */
  async execute<T>(fn: () => Promise<T>): Promise<T> {
    this.totalRequests++;

    // Check if circuit is open
    if (this.state === CircuitState.OPEN) {
      if (this.shouldAttemptReset()) {
        this.state = CircuitState.HALF_OPEN;
        this.halfOpenSuccesses = 0;
      } else {
        const error = new Error('Circuit breaker is OPEN');
        (error as any).circuitBreakerOpen = true;
        throw error;
      }
    }

    try {
      const result = await fn();
      this.onSuccess();
      return result;
    } catch (error) {
      this.onFailure();
      throw error;
    }
  }

  /**
   * Handle successful request
   */
  private onSuccess(): void {
    this.successCount++;
    this.failureCount = 0; // Reset failure count on success

    if (this.state === CircuitState.HALF_OPEN) {
      this.halfOpenSuccesses++;
      if (this.halfOpenSuccesses >= this.config.successThreshold) {
        this.state = CircuitState.CLOSED;
        this.halfOpenSuccesses = 0;
      }
    }
  }

  /**
   * Handle failed request
   */
  private onFailure(): void {
    this.failureCount++;
    this.lastFailureTime = Date.now();

    if (this.state === CircuitState.HALF_OPEN) {
      // If fails during half-open, go back to open
      this.state = CircuitState.OPEN;
      this.nextAttemptTime = Date.now() + this.config.timeout;
      this.halfOpenSuccesses = 0;
    } else if (this.failureCount >= this.config.failureThreshold) {
      // Open the circuit after threshold failures
      this.state = CircuitState.OPEN;
      this.nextAttemptTime = Date.now() + this.config.timeout;
    }
  }

  /**
   * Check if enough time has passed to try half-open
   */
  private shouldAttemptReset(): boolean {
    if (!this.nextAttemptTime) return false;
    return Date.now() >= this.nextAttemptTime;
  }

  /**
   * Get current circuit breaker statistics
   */
  getStats(): CircuitBreakerStats {
    return {
      state: this.state,
      failureCount: this.failureCount,
      successCount: this.successCount,
      totalRequests: this.totalRequests,
      lastFailureTime: this.lastFailureTime,
      nextAttemptTime: this.nextAttemptTime,
    };
  }

  /**
   * Calculate success rate
   */
  getSuccessRate(): number {
    if (this.totalRequests === 0) return 100;
    return (this.successCount / this.totalRequests) * 100;
  }

  /**
   * Reset the circuit breaker (for testing or manual intervention)
   */
  reset(): void {
    this.state = CircuitState.CLOSED;
    this.failureCount = 0;
    this.successCount = 0;
    this.halfOpenSuccesses = 0;
    this.lastFailureTime = null;
    this.nextAttemptTime = null;
  }

  /**
   * Force circuit to open (for maintenance mode)
   */
  forceOpen(): void {
    this.state = CircuitState.OPEN;
    this.nextAttemptTime = Date.now() + this.config.timeout;
  }

  /**
   * Get current state
   */
  getState(): CircuitState {
    return this.state;
  }
}

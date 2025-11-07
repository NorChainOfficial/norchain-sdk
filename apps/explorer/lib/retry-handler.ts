/**
 * Retry Handler with Exponential Backoff
 * Automatically retries failed requests with increasing delays
 *
 * Features:
 * - Exponential backoff algorithm
 * - Jitter to prevent thundering herd
 * - Configurable retry conditions
 * - Maximum retry limit
 */

export interface RetryConfig {
  readonly maxRetries: number;           // Maximum number of retry attempts
  readonly baseDelay: number;            // Initial delay in milliseconds
  readonly maxDelay: number;             // Maximum delay cap
  readonly exponentialBase: number;      // Base for exponential calculation
  readonly jitter: boolean;              // Add randomness to prevent thundering herd
  readonly retryableStatusCodes?: number[]; // HTTP status codes to retry
  readonly onRetry?: (attempt: number, delay: number, error: Error) => void;
}

export interface RetryStats {
  readonly totalAttempts: number;
  readonly successfulRetries: number;
  readonly failedRetries: number;
  readonly averageAttempts: number;
}

export class RetryHandler {
  private stats = {
    totalAttempts: 0,
    successfulRetries: 0,
    failedRetries: 0,
    totalRequests: 0,
  };

  private readonly defaultConfig: RetryConfig = {
    maxRetries: 3,
    baseDelay: 1000,
    maxDelay: 30000,
    exponentialBase: 2,
    jitter: true,
    retryableStatusCodes: [408, 429, 500, 502, 503, 504],
  };

  constructor(private readonly config: Partial<RetryConfig> = {}) {
    this.config = { ...this.defaultConfig, ...config };
  }

  /**
   * Execute a function with retry logic
   */
  async execute<T>(fn: () => Promise<T>): Promise<T> {
    this.stats.totalRequests++;
    let lastError: Error | null = null;
    let attempt = 0;

    while (attempt <= (this.config.maxRetries || this.defaultConfig.maxRetries)) {
      try {
        this.stats.totalAttempts++;
        const result = await fn();

        if (attempt > 0) {
          this.stats.successfulRetries++;
        }

        return result;
      } catch (error) {
        lastError = error as Error;
        attempt++;

        // Check if error is retryable
        if (!this.isRetryable(error as Error)) {
          this.stats.failedRetries++;
          throw error;
        }

        // Don't retry if we've exhausted attempts
        if (attempt > (this.config.maxRetries || this.defaultConfig.maxRetries)) {
          this.stats.failedRetries++;
          break;
        }

        // Calculate delay with exponential backoff
        const delay = this.calculateDelay(attempt);

        // Call retry callback if provided
        if (this.config.onRetry) {
          this.config.onRetry(attempt, delay, error as Error);
        }

        // Wait before retrying
        await this.sleep(delay);
      }
    }

    // All retries exhausted
    const error = new Error(`Max retries (${this.config.maxRetries}) exceeded`);
    (error as any).originalError = lastError;
    (error as any).attempts = attempt;
    throw error;
  }

  /**
   * Calculate delay with exponential backoff and jitter
   */
  private calculateDelay(attempt: number): number {
    const base = this.config.exponentialBase || this.defaultConfig.exponentialBase;
    const baseDelay = this.config.baseDelay || this.defaultConfig.baseDelay;
    const maxDelay = this.config.maxDelay || this.defaultConfig.maxDelay;

    // Exponential backoff: baseDelay * (base ^ attempt)
    let delay = baseDelay * Math.pow(base, attempt - 1);

    // Add jitter (randomness) if enabled
    if (this.config.jitter !== false) {
      // Add random jitter between 0% and 25% of the delay
      const jitterAmount = delay * 0.25 * Math.random();
      delay += jitterAmount;
    }

    // Cap at max delay
    return Math.min(delay, maxDelay);
  }

  /**
   * Check if an error is retryable
   */
  private isRetryable(error: Error): boolean {
    // Don't retry circuit breaker errors
    if ((error as any).circuitBreakerOpen) {
      return false;
    }

    // Check HTTP status codes
    const statusCode = (error as any).statusCode || (error as any).status;
    if (statusCode) {
      const retryableCodes = this.config.retryableStatusCodes || this.defaultConfig.retryableStatusCodes;
      return retryableCodes?.includes(statusCode) || false;
    }

    // Retry network errors
    if (
      error.message.includes('ECONNREFUSED') ||
      error.message.includes('ETIMEDOUT') ||
      error.message.includes('ENOTFOUND') ||
      error.message.includes('Failed to fetch') ||
      error.message.includes('Network request failed')
    ) {
      return true;
    }

    // Don't retry by default
    return false;
  }

  /**
   * Sleep for specified milliseconds
   */
  private sleep(ms: number): Promise<void> {
    return new Promise(resolve => setTimeout(resolve, ms));
  }

  /**
   * Get retry statistics
   */
  getStats(): RetryStats {
    return {
      totalAttempts: this.stats.totalAttempts,
      successfulRetries: this.stats.successfulRetries,
      failedRetries: this.stats.failedRetries,
      averageAttempts: this.stats.totalRequests > 0
        ? this.stats.totalAttempts / this.stats.totalRequests
        : 0,
    };
  }

  /**
   * Reset statistics
   */
  resetStats(): void {
    this.stats = {
      totalAttempts: 0,
      successfulRetries: 0,
      failedRetries: 0,
      totalRequests: 0,
    };
  }
}

/**
 * Utility function for simple retry with defaults
 */
export async function retry<T>(
  fn: () => Promise<T>,
  maxRetries: number = 3
): Promise<T> {
  const handler = new RetryHandler({ maxRetries });
  return handler.execute(fn);
}

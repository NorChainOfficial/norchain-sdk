/**
 * API client and request types
 */

import type { ApiResponse, PaginatedResponse, PaginationParams } from './common';

/**
 * API request configuration
 */
export interface RequestConfig {
  readonly baseURL?: string;
  readonly timeout?: number;
  readonly headers?: Record<string, string>;
  readonly params?: Record<string, string | number | boolean>;
  readonly apiKey?: string;
}

/**
 * API client options
 */
export interface ApiClientOptions {
  readonly baseURL: string;
  readonly apiKey?: string;
  readonly timeout?: number;
  readonly retryAttempts?: number;
  readonly retryDelay?: number;
}

/**
 * Rate limit information
 */
export interface RateLimitInfo {
  readonly limit: number;
  readonly remaining: number;
  readonly reset: number;
}

/**
 * API error details
 */
export interface ApiErrorDetails {
  readonly code: string;
  readonly message: string;
  readonly statusCode: number;
  readonly timestamp: number;
  readonly path?: string;
  readonly details?: unknown;
}

/**
 * WebSocket message
 */
export interface WebSocketMessage<T = unknown> {
  readonly event: string;
  readonly data: T;
  readonly timestamp: number;
}

/**
 * WebSocket subscription
 */
export interface WebSocketSubscription {
  readonly channel: string;
  readonly params?: Record<string, unknown>;
}

/**
 * Health check response
 */
export interface HealthCheckResponse {
  readonly status: 'ok' | 'degraded' | 'down';
  readonly timestamp: number;
  readonly version: string;
  readonly services: {
    readonly database: 'healthy' | 'unhealthy';
    readonly redis: 'healthy' | 'unhealthy';
    readonly blockchain: 'healthy' | 'unhealthy';
  };
  readonly uptime: number;
}

/**
 * API version info
 */
export interface ApiVersionInfo {
  readonly version: string;
  readonly buildDate: string;
  readonly gitCommit?: string;
  readonly environment: 'development' | 'staging' | 'production';
}

/**
 * Re-export common response types
 */
export type { ApiResponse, PaginatedResponse, PaginationParams };

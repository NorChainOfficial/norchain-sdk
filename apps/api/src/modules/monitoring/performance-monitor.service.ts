import { Injectable, Logger } from '@nestjs/common';
import { EventEmitter2 } from '@nestjs/event-emitter';

export interface PerformanceMetric {
  endpoint: string;
  method: string;
  duration: number;
  statusCode: number;
  timestamp: Date;
  userId?: string;
  ipAddress?: string;
}

export interface PerformanceStats {
  endpoint: string;
  method: string;
  requestCount: number;
  averageDuration: number;
  minDuration: number;
  maxDuration: number;
  errorRate: number;
  p50: number;
  p95: number;
  p99: number;
}

@Injectable()
export class PerformanceMonitorService {
  private readonly logger = new Logger(PerformanceMonitorService.name);
  private readonly metrics: PerformanceMetric[] = [];
  private readonly maxMetrics = 1000; // Keep last 1k metrics (reduced from 10k to prevent memory growth)

  constructor(private readonly eventEmitter: EventEmitter2) {
    // Listen for request completion events
    this.eventEmitter.on('request.completed', (metric: PerformanceMetric) => {
      this.recordMetric(metric);
    });
  }

  /**
   * Record a performance metric
   */
  recordMetric(metric: PerformanceMetric) {
    this.metrics.push(metric);

    // Keep only last maxMetrics
    if (this.metrics.length > this.maxMetrics) {
      this.metrics.shift();
    }

    // Emit metric event for external monitoring systems
    this.eventEmitter.emit('performance.metric', metric);

    // Log slow requests (> 1 second)
    if (metric.duration > 1000) {
      this.logger.warn(
        `Slow request detected: ${metric.method} ${metric.endpoint} took ${metric.duration}ms`,
      );
    }
  }

  /**
   * Get performance statistics for an endpoint
   */
  getStats(
    endpoint: string,
    method: string,
    timeWindow?: number,
  ): PerformanceStats {
    const window = timeWindow || 60 * 60 * 1000; // Default: 1 hour
    const cutoff = new Date(Date.now() - window);

    const relevantMetrics = this.metrics.filter(
      (m) =>
        m.endpoint === endpoint && m.method === method && m.timestamp >= cutoff,
    );

    if (relevantMetrics.length === 0) {
      return {
        endpoint,
        method,
        requestCount: 0,
        averageDuration: 0,
        minDuration: 0,
        maxDuration: 0,
        errorRate: 0,
        p50: 0,
        p95: 0,
        p99: 0,
      };
    }

    const durations = relevantMetrics
      .map((m) => m.duration)
      .sort((a, b) => a - b);
    const errors = relevantMetrics.filter((m) => m.statusCode >= 400).length;

    const sum = durations.reduce((a, b) => a + b, 0);
    const average = sum / durations.length;

    const p50 = durations[Math.floor(durations.length * 0.5)];
    const p95 = durations[Math.floor(durations.length * 0.95)];
    const p99 = durations[Math.floor(durations.length * 0.99)];

    return {
      endpoint,
      method,
      requestCount: relevantMetrics.length,
      averageDuration: average,
      minDuration: durations[0],
      maxDuration: durations[durations.length - 1],
      errorRate: errors / relevantMetrics.length,
      p50,
      p95,
      p99,
    };
  }

  /**
   * Get all endpoint statistics
   */
  getAllStats(timeWindow?: number): PerformanceStats[] {
    const endpoints = new Set<string>();
    this.metrics.forEach((m) => {
      endpoints.add(`${m.method}:${m.endpoint}`);
    });

    return Array.from(endpoints).map((key) => {
      const [method, endpoint] = key.split(':');
      return this.getStats(endpoint, method, timeWindow);
    });
  }

  /**
   * Get system health metrics
   */
  getHealthMetrics() {
    const last5min = new Date(Date.now() - 5 * 60 * 1000);
    const recentMetrics = this.metrics.filter((m) => m.timestamp >= last5min);

    const totalRequests = recentMetrics.length;
    const errors = recentMetrics.filter((m) => m.statusCode >= 400).length;
    const avgDuration =
      recentMetrics.length > 0
        ? recentMetrics.reduce((sum, m) => sum + m.duration, 0) /
          recentMetrics.length
        : 0;

    return {
      totalRequests,
      errors,
      errorRate: totalRequests > 0 ? errors / totalRequests : 0,
      averageResponseTime: avgDuration,
      requestsPerSecond: totalRequests / (5 * 60),
      timestamp: new Date().toISOString(),
    };
  }
}

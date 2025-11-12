import {
  Injectable,
  NestInterceptor,
  ExecutionContext,
  CallHandler,
  Inject,
  forwardRef,
} from '@nestjs/common';
import { Observable } from 'rxjs';
import { tap } from 'rxjs/operators';
import { Request } from 'express';
import { UsageService } from '../usage.service';
import { UsageType } from '../entities/api-usage.entity';

@Injectable()
export class UsageTrackingInterceptor implements NestInterceptor {
  constructor(
    @Inject(forwardRef(() => UsageService))
    private readonly usageService: UsageService,
  ) {}

  intercept(context: ExecutionContext, next: CallHandler): Observable<any> {
    const request = context.switchToHttp().getRequest<Request>();
    const startTime = Date.now();

    // Extract user ID and API key ID from request
    const userId = (request as any).user?.id || (request as any).apiKey?.userId;
    const apiKeyId = (request as any).apiKey?.id;

    // Skip tracking for health checks and public endpoints
    if (
      request.url.includes('/health') ||
      request.url.includes('/api-docs') ||
      !userId
    ) {
      return next.handle();
    }

    const endpoint = request.url.split('?')[0]; // Remove query params
    const method = request.method;

    // Determine usage type based on endpoint
    let usageType = UsageType.API_CALL;
    if (request.url.includes('/rpc/')) {
      usageType = UsageType.RPC_CALL;
    } else if (request.url.includes('/stream/')) {
      usageType = UsageType.STREAMING_CONNECTION;
    } else if (request.url.includes('/webhooks/')) {
      usageType = UsageType.WEBHOOK_DELIVERY;
    }

    return next.handle().pipe(
      tap({
        next: async (response) => {
          const responseTime = Date.now() - startTime;
          const statusCode = response?.statusCode || 200;

          // Record usage asynchronously (don't block response)
          try {
            await this.usageService.recordUsage(
              userId,
              endpoint,
              method,
              usageType,
              {
                apiKeyId,
                statusCode,
                responseTime,
                tier: (request as any).user?.tier || 'free',
              },
            );
          } catch (error) {
            // Log error but don't fail the request
            console.error('Failed to record usage:', error);
          }
        },
        error: async (error) => {
          const responseTime = Date.now() - startTime;
          const statusCode = error?.status || 500;

          // Record failed usage
          try {
            await this.usageService.recordUsage(
              userId,
              endpoint,
              method,
              usageType,
              {
                apiKeyId,
                statusCode,
                responseTime,
                tier: (request as any).user?.tier || 'free',
              },
            );
          } catch (err) {
            console.error('Failed to record usage:', err);
          }
        },
      }),
    );
  }
}


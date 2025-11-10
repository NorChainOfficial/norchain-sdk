import {
  Injectable,
  NestInterceptor,
  ExecutionContext,
  CallHandler,
  BadRequestException,
} from '@nestjs/common';
import { Observable, of } from 'rxjs';
import { tap } from 'rxjs/operators';
import { Request, Response } from 'express';
import { Reflector } from '@nestjs/core';
import { IDEMPOTENCY_KEY } from '../decorators/idempotency.decorator';
import { CacheService } from '../services/cache.service';

@Injectable()
export class IdempotencyInterceptor implements NestInterceptor {
  constructor(
    private readonly reflector: Reflector,
    private readonly cacheService: CacheService,
  ) {}

  async intercept(
    context: ExecutionContext,
    next: CallHandler,
  ): Promise<Observable<any>> {
    const request = context.switchToHttp().getRequest<Request>();
    const response = context.switchToHttp().getResponse<Response>();
    const handler = context.getHandler();

    // Check if endpoint is marked as idempotent
    const isIdempotent = this.reflector.getAllAndOverride<boolean>(
      IDEMPOTENCY_KEY,
      [handler],
    );

    if (!isIdempotent) {
      return next.handle();
    }

    // Get idempotency key from header
    const idempotencyKey = request.headers['idempotency-key'] as string;

    if (!idempotencyKey) {
      // Idempotency key is optional but recommended
      // We'll proceed without it
      return next.handle();
    }

    // Validate idempotency key format (UUID or custom format)
    if (!this.isValidIdempotencyKey(idempotencyKey)) {
      throw new BadRequestException(
        'Invalid Idempotency-Key format. Must be a valid UUID or alphanumeric string (max 255 chars)',
      );
    }

    // Check cache for existing response
    const cacheKey = `idempotency:${idempotencyKey}`;
    const cachedResponse = await this.cacheService.get(cacheKey);

    if (cachedResponse) {
      // Return cached response
      response.setHeader('Idempotency-Replay', 'true');
      return of(cachedResponse);
    }

    // Store request metadata for deduplication
    const requestMetadata = {
      method: request.method,
      path: request.path,
      userId: (request as any).user?.id,
      timestamp: new Date().toISOString(),
    };

    // Set lock to prevent concurrent requests with same key
    const lockKey = `idempotency:lock:${idempotencyKey}`;
    const existingLock = await this.cacheService.get(lockKey);

    if (existingLock) {
      // Another request is processing, wait and retry
      await new Promise((resolve) => setTimeout(resolve, 100));
      const retryResponse = await this.cacheService.get(cacheKey);
      if (retryResponse) {
        response.setHeader('Idempotency-Replay', 'true');
        return of(retryResponse);
      }
    } else {
      // Acquire lock
      await this.cacheService.set(lockKey, requestMetadata, 60); // 60 seconds lock
    }

    // Process request and cache response
    return next.handle().pipe(
      tap(async (data) => {
        // Cache successful response for 24 hours
        await this.cacheService.set(cacheKey, data, 86400); // 24 hours
        // Release lock
        await this.cacheService.del(lockKey);
      }),
    );
  }

  private isValidIdempotencyKey(key: string): boolean {
    // UUID format or alphanumeric with dashes/underscores, max 255 chars
    const uuidRegex =
      /^[0-9a-f]{8}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{12}$/i;
    const customRegex = /^[a-zA-Z0-9_-]{1,255}$/;
    return uuidRegex.test(key) || customRegex.test(key);
  }
}

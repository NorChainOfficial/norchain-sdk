import { ExecutionContext, CallHandler, BadRequestException } from '@nestjs/common';
import { Reflector } from '@nestjs/core';
import { of } from 'rxjs';
import { IdempotencyInterceptor } from './idempotency.interceptor';
import { CacheService } from '../services/cache.service';
import { IDEMPOTENCY_KEY } from '../decorators/idempotency.decorator';

describe('IdempotencyInterceptor', () => {
  let interceptor: IdempotencyInterceptor;
  let reflector: Reflector;
  let cacheService: jest.Mocked<CacheService>;

  beforeEach(() => {
    reflector = new Reflector();
    cacheService = {
      get: jest.fn(),
      set: jest.fn(),
      del: jest.fn(),
      getOrSet: jest.fn(),
    } as any;

    interceptor = new IdempotencyInterceptor(reflector, cacheService);
  });

  it('should be defined', () => {
    expect(interceptor).toBeDefined();
  });

  describe('intercept', () => {
    it('should pass through if endpoint is not idempotent', async () => {
      const context = {
        switchToHttp: jest.fn().mockReturnValue({
          getRequest: jest.fn().mockReturnValue({ headers: {} }),
          getResponse: jest.fn().mockReturnValue({ setHeader: jest.fn() }),
        }),
        getHandler: jest.fn(),
      } as unknown as ExecutionContext;

      const handler = {
        handle: jest.fn().mockReturnValue(of({ data: 'test' })),
      } as unknown as CallHandler;

      jest.spyOn(reflector, 'getAllAndOverride').mockReturnValue(false);

      const observable = await interceptor.intercept(context, handler);
      const result = await observable.toPromise();

      expect(result).toEqual({ data: 'test' });
      expect(cacheService.get).not.toHaveBeenCalled();
    });

    it('should pass through if no idempotency key provided', async () => {
      const context = {
        switchToHttp: jest.fn().mockReturnValue({
          getRequest: jest.fn().mockReturnValue({ headers: {} }),
          getResponse: jest.fn().mockReturnValue({ setHeader: jest.fn() }),
        }),
        getHandler: jest.fn(),
      } as unknown as ExecutionContext;

      const handler = {
        handle: jest.fn().mockReturnValue(of({ data: 'test' })),
      } as unknown as CallHandler;

      jest.spyOn(reflector, 'getAllAndOverride').mockReturnValue(true);

      const observable = await interceptor.intercept(context, handler);
      const result = await observable.toPromise();

      expect(result).toEqual({ data: 'test' });
      expect(cacheService.get).not.toHaveBeenCalled();
    });

    it('should throw BadRequestException for invalid idempotency key format', async () => {
      const context = {
        switchToHttp: jest.fn().mockReturnValue({
          getRequest: jest.fn().mockReturnValue({
            headers: { 'idempotency-key': 'invalid key with spaces!' },
          }),
          getResponse: jest.fn().mockReturnValue({ setHeader: jest.fn() }),
        }),
        getHandler: jest.fn(),
      } as unknown as ExecutionContext;

      const handler = {
        handle: jest.fn(),
      } as unknown as CallHandler;

      jest.spyOn(reflector, 'getAllAndOverride').mockReturnValue(true);

      const observablePromise = interceptor.intercept(context, handler);
      await expect(observablePromise.then((obs) => obs.toPromise())).rejects.toThrow(
        BadRequestException,
      );
    });

    it('should return cached response if idempotency key exists', async () => {
      const idempotencyKey = '550e8400-e29b-41d4-a716-446655440000';
      const cachedResponse = { data: 'cached' };

      const mockResponse = {
        setHeader: jest.fn(),
      };

      const context = {
        switchToHttp: jest.fn().mockReturnValue({
          getRequest: jest.fn().mockReturnValue({
            headers: { 'idempotency-key': idempotencyKey },
          }),
          getResponse: jest.fn().mockReturnValue(mockResponse),
        }),
        getHandler: jest.fn(),
      } as unknown as ExecutionContext;

      const handler = {
        handle: jest.fn(),
      } as unknown as CallHandler;

      jest.spyOn(reflector, 'getAllAndOverride').mockReturnValue(true);
      cacheService.get.mockResolvedValue(cachedResponse);

      const observable = await interceptor.intercept(context, handler);
      const result = await observable.toPromise();

      expect(result).toEqual(cachedResponse);
      expect(mockResponse.setHeader).toHaveBeenCalledWith('Idempotency-Replay', 'true');
      expect(cacheService.get).toHaveBeenCalledWith(`idempotency:${idempotencyKey}`);
    });

    it('should cache response after successful request', async () => {
      const idempotencyKey = '550e8400-e29b-41d4-a716-446655440000';
      const responseData = { data: 'new' };

      const mockResponse = {
        setHeader: jest.fn(),
      };

      const context = {
        switchToHttp: jest.fn().mockReturnValue({
          getRequest: jest.fn().mockReturnValue({
            headers: { 'idempotency-key': idempotencyKey },
            method: 'POST',
            path: '/test',
            user: { id: 'user-123' },
          }),
          getResponse: jest.fn().mockReturnValue(mockResponse),
        }),
        getHandler: jest.fn(),
      } as unknown as ExecutionContext;

      const handler = {
        handle: jest.fn().mockReturnValue(of(responseData)),
      } as unknown as CallHandler;

      jest.spyOn(reflector, 'getAllAndOverride').mockReturnValue(true);
      cacheService.get.mockResolvedValue(null);

      const observable = await interceptor.intercept(context, handler);
      const result = await observable.toPromise();

      expect(result).toEqual(responseData);
      expect(cacheService.set).toHaveBeenCalledWith(
        `idempotency:${idempotencyKey}`,
        responseData,
        86400,
      );
      expect(cacheService.del).toHaveBeenCalledWith(`idempotency:lock:${idempotencyKey}`);
    });

    it('should handle lock when concurrent request exists', async () => {
      const idempotencyKey = '550e8400-e29b-41d4-a716-446655440000';
      const cachedResponse = { data: 'cached' };

      const mockResponse = {
        setHeader: jest.fn(),
      };

      const context = {
        switchToHttp: jest.fn().mockReturnValue({
          getRequest: jest.fn().mockReturnValue({
            headers: { 'idempotency-key': idempotencyKey },
          }),
          getResponse: jest.fn().mockReturnValue(mockResponse),
        }),
        getHandler: jest.fn(),
      } as unknown as ExecutionContext;

      const handler = {
        handle: jest.fn(),
      } as unknown as CallHandler;

      jest.spyOn(reflector, 'getAllAndOverride').mockReturnValue(true);
      cacheService.get
        .mockResolvedValueOnce(null) // First check - no cached response
        .mockResolvedValueOnce('lock-exists') // Lock exists
        .mockResolvedValueOnce(cachedResponse); // After wait, cached response available

      jest.useFakeTimers();
      const observablePromise = interceptor.intercept(context, handler);
      jest.advanceTimersByTime(100);
      jest.useRealTimers();

      const observable = await observablePromise;
      const result = await observable.toPromise();

      expect(result).toEqual(cachedResponse);
      expect(mockResponse.setHeader).toHaveBeenCalledWith('Idempotency-Replay', 'true');
    });
  });

  describe('isValidIdempotencyKey', () => {
    it('should validate UUID format', () => {
      const validUUID = '550e8400-e29b-41d4-a716-446655440000';
      const result = (interceptor as any).isValidIdempotencyKey(validUUID);
      expect(result).toBe(true);
    });

    it('should validate custom alphanumeric format', () => {
      const validCustom = 'test-key_123';
      const result = (interceptor as any).isValidIdempotencyKey(validCustom);
      expect(result).toBe(true);
    });

    it('should reject invalid formats', () => {
      const invalid = 'invalid key with spaces!';
      const result = (interceptor as any).isValidIdempotencyKey(invalid);
      expect(result).toBe(false);
    });

    it('should reject keys longer than 255 characters', () => {
      const longKey = 'a'.repeat(256);
      const result = (interceptor as any).isValidIdempotencyKey(longKey);
      expect(result).toBe(false);
    });
  });
});


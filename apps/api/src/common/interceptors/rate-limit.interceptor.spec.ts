import { ExecutionContext, CallHandler } from '@nestjs/common';
import { of } from 'rxjs';
import { RateLimitInterceptor } from './rate-limit.interceptor';

describe('RateLimitInterceptor', () => {
  let interceptor: RateLimitInterceptor;

  beforeEach(() => {
    interceptor = new RateLimitInterceptor();
  });

  it('should be defined', () => {
    expect(interceptor).toBeDefined();
  });

  describe('intercept', () => {
    it('should set rate limit headers', async () => {
      const mockResponse = {
        setHeader: jest.fn(),
      };

      const context = {
        switchToHttp: jest.fn().mockReturnValue({
          getResponse: jest.fn().mockReturnValue(mockResponse),
          getRequest: jest.fn().mockReturnValue({}),
        }),
      } as unknown as ExecutionContext;

      const handler = {
        handle: jest.fn().mockReturnValue(of({ data: 'test' })),
      } as unknown as CallHandler;

      const observable = await interceptor.intercept(context, handler);
      const result = await observable.toPromise();

      expect(result).toEqual({ data: 'test' });
      expect(mockResponse.setHeader).toHaveBeenCalledWith('X-RateLimit-Limit', '100');
      expect(mockResponse.setHeader).toHaveBeenCalledWith('X-RateLimit-Remaining', '99');
      expect(mockResponse.setHeader).toHaveBeenCalledWith(
        'X-RateLimit-Reset',
        expect.any(String),
      );
    });

    it('should set reset header with future timestamp', async () => {
      const mockResponse = {
        setHeader: jest.fn(),
      };

      const context = {
        switchToHttp: jest.fn().mockReturnValue({
          getResponse: jest.fn().mockReturnValue(mockResponse),
          getRequest: jest.fn().mockReturnValue({}),
        }),
      } as unknown as ExecutionContext;

      const handler = {
        handle: jest.fn().mockReturnValue(of({})),
      } as unknown as CallHandler;

      const beforeTime = Date.now();
      await interceptor.intercept(context, handler).toPromise();
      const afterTime = Date.now();

      const resetCall = mockResponse.setHeader.mock.calls.find(
        (call) => call[0] === 'X-RateLimit-Reset',
      );
      const resetTime = new Date(resetCall[1]).getTime();

      expect(resetTime).toBeGreaterThan(beforeTime);
      expect(resetTime).toBeLessThanOrEqual(afterTime + 60000);
    });
  });
});


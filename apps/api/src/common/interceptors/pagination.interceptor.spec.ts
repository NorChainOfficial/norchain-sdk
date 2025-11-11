import { ExecutionContext, CallHandler } from '@nestjs/common';
import { of } from 'rxjs';
import { PaginationInterceptor } from './pagination.interceptor';

describe('PaginationInterceptor', () => {
  let interceptor: PaginationInterceptor;

  beforeEach(() => {
    interceptor = new PaginationInterceptor();
  });

  it('should be defined', () => {
    expect(interceptor).toBeDefined();
  });

  describe('intercept', () => {
    it('should set pagination headers for paginated response', async () => {
      const mockResponse = {
        setHeader: jest.fn(),
      };

      const context = {
        switchToHttp: jest.fn().mockReturnValue({
          getResponse: jest.fn().mockReturnValue(mockResponse),
          getRequest: jest.fn().mockReturnValue({}),
        }),
      } as unknown as ExecutionContext;

      const paginatedData = {
        data: [{ id: 1 }, { id: 2 }],
        total: 100,
        limit: 10,
        offset: 0,
        nextCursor: 'cursor-123',
        hasMore: true,
      };

      const handler = {
        handle: jest.fn().mockReturnValue(of(paginatedData)),
      } as unknown as CallHandler;

      const observable = await interceptor.intercept(context, handler);
      const result = await observable.toPromise();

      expect(result).toEqual(paginatedData);
      expect(mockResponse.setHeader).toHaveBeenCalledWith('X-Total-Count', '100');
      expect(mockResponse.setHeader).toHaveBeenCalledWith('X-Limit', '10');
      expect(mockResponse.setHeader).toHaveBeenCalledWith('X-Offset', '0');
      expect(mockResponse.setHeader).toHaveBeenCalledWith('X-Next-Cursor', 'cursor-123');
      expect(mockResponse.setHeader).toHaveBeenCalledWith('X-Has-More', 'true');
    });

    it('should not set next cursor header if not provided', async () => {
      const mockResponse = {
        setHeader: jest.fn(),
      };

      const context = {
        switchToHttp: jest.fn().mockReturnValue({
          getResponse: jest.fn().mockReturnValue(mockResponse),
          getRequest: jest.fn().mockReturnValue({}),
        }),
      } as unknown as ExecutionContext;

      const paginatedData = {
        data: [{ id: 1 }],
        total: 1,
        limit: 10,
        offset: 0,
        hasMore: false,
      };

      const handler = {
        handle: jest.fn().mockReturnValue(of(paginatedData)),
      } as unknown as CallHandler;

      await interceptor.intercept(context, handler).toPromise();

      expect(mockResponse.setHeader).not.toHaveBeenCalledWith(
        'X-Next-Cursor',
        expect.anything(),
      );
    });

    it('should pass through non-paginated responses unchanged', async () => {
      const mockResponse = {
        setHeader: jest.fn(),
      };

      const context = {
        switchToHttp: jest.fn().mockReturnValue({
          getResponse: jest.fn().mockReturnValue(mockResponse),
          getRequest: jest.fn().mockReturnValue({}),
        }),
      } as unknown as ExecutionContext;

      const nonPaginatedData = { message: 'success' };

      const handler = {
        handle: jest.fn().mockReturnValue(of(nonPaginatedData)),
      } as unknown as CallHandler;

      const observable = await interceptor.intercept(context, handler);
      const result = await observable.toPromise();

      expect(result).toEqual(nonPaginatedData);
      expect(mockResponse.setHeader).not.toHaveBeenCalled();
    });

    it('should handle empty data array', async () => {
      const mockResponse = {
        setHeader: jest.fn(),
      };

      const context = {
        switchToHttp: jest.fn().mockReturnValue({
          getResponse: jest.fn().mockReturnValue(mockResponse),
          getRequest: jest.fn().mockReturnValue({}),
        }),
      } as unknown as ExecutionContext;

      const paginatedData = {
        data: [],
        total: 0,
        limit: 10,
        offset: 0,
        hasMore: false,
      };

      const handler = {
        handle: jest.fn().mockReturnValue(of(paginatedData)),
      } as unknown as CallHandler;

      const observable = await interceptor.intercept(context, handler);
      const result = await observable.toPromise();

      expect(result).toEqual(paginatedData);
      expect(mockResponse.setHeader).toHaveBeenCalledWith('X-Total-Count', '0');
    });
  });
});


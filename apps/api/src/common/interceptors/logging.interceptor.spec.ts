import { ExecutionContext, CallHandler, Logger } from '@nestjs/common';
import { of, throwError } from 'rxjs';
import { LoggingInterceptor } from './logging.interceptor';

describe('LoggingInterceptor', () => {
  let interceptor: LoggingInterceptor;
  let loggerSpy: jest.SpyInstance;

  beforeEach(() => {
    interceptor = new LoggingInterceptor();
    loggerSpy = jest.spyOn(Logger.prototype, 'log').mockImplementation();
    jest.spyOn(Logger.prototype, 'error').mockImplementation();
  });

  afterEach(() => {
    jest.clearAllMocks();
  });

  it('should be defined', () => {
    expect(interceptor).toBeDefined();
  });

  describe('intercept', () => {
    it('should log successful request', async () => {
      const mockResponse = {
        statusCode: 200,
      };

      const context = {
        switchToHttp: jest.fn().mockReturnValue({
          getRequest: jest.fn().mockReturnValue({
            method: 'GET',
            url: '/api/test',
            ip: '127.0.0.1',
          }),
          getResponse: jest.fn().mockReturnValue(mockResponse),
        }),
      } as unknown as ExecutionContext;

      const handler = {
        handle: jest.fn().mockReturnValue(of({ data: 'test' })),
      } as unknown as CallHandler;

      const observable = await interceptor.intercept(context, handler);
      await observable.toPromise();

      expect(loggerSpy).toHaveBeenCalled();
      const logCall = loggerSpy.mock.calls[0][0];
      expect(logCall).toContain('GET');
      expect(logCall).toContain('/api/test');
      expect(logCall).toContain('200');
      expect(logCall).toContain('127.0.0.1');
    });

    it('should log error request', async () => {
      const errorLoggerSpy = jest.spyOn(Logger.prototype, 'error');
      const error = new Error('Test error');

      const context = {
        switchToHttp: jest.fn().mockReturnValue({
          getRequest: jest.fn().mockReturnValue({
            method: 'POST',
            url: '/api/test',
            ip: '192.168.1.1',
          }),
          getResponse: jest.fn().mockReturnValue({ statusCode: 500 }),
        }),
      } as unknown as ExecutionContext;

      const handler = {
        handle: jest.fn().mockReturnValue(throwError(() => error)),
      } as unknown as CallHandler;

      const observable = await interceptor.intercept(context, handler);

      await expect(observable.toPromise()).rejects.toThrow('Test error');

      expect(errorLoggerSpy).toHaveBeenCalled();
      const errorCall = errorLoggerSpy.mock.calls[0][0];
      expect(errorCall).toContain('POST');
      expect(errorCall).toContain('/api/test');
      expect(errorCall).toContain('Test error');
    });

    it('should log request duration', async () => {
      const mockResponse = {
        statusCode: 200,
      };

      const context = {
        switchToHttp: jest.fn().mockReturnValue({
          getRequest: jest.fn().mockReturnValue({
            method: 'GET',
            url: '/api/test',
            ip: '127.0.0.1',
          }),
          getResponse: jest.fn().mockReturnValue(mockResponse),
        }),
      } as unknown as ExecutionContext;

      const handler = {
        handle: jest.fn().mockReturnValue(of({ data: 'test' })),
      } as unknown as CallHandler;

      const observable = await interceptor.intercept(context, handler);
      await observable.toPromise();

      expect(loggerSpy).toHaveBeenCalled();
      const logCall = loggerSpy.mock.calls[0][0];
      expect(logCall).toMatch(/\d+ms/);
    });
  });
});


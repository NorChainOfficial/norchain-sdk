import { ExecutionContext, CallHandler } from '@nestjs/common';
import { of } from 'rxjs';
import { TransformInterceptor } from './transform.interceptor';
import { ResponseDto } from '../interfaces/api-response.interface';

describe('TransformInterceptor', () => {
  let interceptor: TransformInterceptor;

  beforeEach(() => {
    interceptor = new TransformInterceptor();
  });

  it('should be defined', () => {
    expect(interceptor).toBeDefined();
  });

  describe('intercept', () => {
    it('should wrap data in ResponseDto for plain objects', async () => {
      const context = {
        switchToHttp: jest.fn().mockReturnValue({
          getRequest: jest.fn().mockReturnValue({}),
          getResponse: jest.fn().mockReturnValue({}),
        }),
      } as unknown as ExecutionContext;

      const plainData = { id: 1, name: 'Test' };
      const handler = {
        handle: jest.fn().mockReturnValue(of(plainData)),
      } as unknown as CallHandler;

      const observable = await interceptor.intercept(context, handler);
      const result = await observable.toPromise();

      expect(result).toBeInstanceOf(ResponseDto);
      expect(result.status).toBe('1');
      expect(result.result).toEqual(plainData);
    });

    it('should return ResponseDto as-is if already wrapped', async () => {
      const context = {
        switchToHttp: jest.fn().mockReturnValue({
          getRequest: jest.fn().mockReturnValue({}),
          getResponse: jest.fn().mockReturnValue({}),
        }),
      } as unknown as ExecutionContext;

      const wrappedData = ResponseDto.success({ id: 1 });
      const handler = {
        handle: jest.fn().mockReturnValue(of(wrappedData)),
      } as unknown as CallHandler;

      const observable = await interceptor.intercept(context, handler);
      const result = await observable.toPromise();

      expect(result).toBe(wrappedData);
      expect(result).toBeInstanceOf(ResponseDto);
    });

    it('should wrap arrays in ResponseDto', async () => {
      const context = {
        switchToHttp: jest.fn().mockReturnValue({
          getRequest: jest.fn().mockReturnValue({}),
          getResponse: jest.fn().mockReturnValue({}),
        }),
      } as unknown as ExecutionContext;

      const arrayData = [{ id: 1 }, { id: 2 }];
      const handler = {
        handle: jest.fn().mockReturnValue(of(arrayData)),
      } as unknown as CallHandler;

      const observable = await interceptor.intercept(context, handler);
      const result = await observable.toPromise();

      expect(result).toBeInstanceOf(ResponseDto);
      expect(result.result).toEqual(arrayData);
    });

    it('should wrap primitives in ResponseDto', async () => {
      const context = {
        switchToHttp: jest.fn().mockReturnValue({
          getRequest: jest.fn().mockReturnValue({}),
          getResponse: jest.fn().mockReturnValue({}),
        }),
      } as unknown as ExecutionContext;

      const primitiveData = 'test string';
      const handler = {
        handle: jest.fn().mockReturnValue(of(primitiveData)),
      } as unknown as CallHandler;

      const observable = await interceptor.intercept(context, handler);
      const result = await observable.toPromise();

      expect(result).toBeInstanceOf(ResponseDto);
      expect(result.result).toBe(primitiveData);
    });
  });
});


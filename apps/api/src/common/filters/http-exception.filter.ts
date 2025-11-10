import {
  ExceptionFilter,
  Catch,
  ArgumentsHost,
  HttpException,
  HttpStatus,
} from '@nestjs/common';
import { Request, Response } from 'express';
import { randomUUID } from 'crypto';

@Catch()
export class HttpExceptionFilter implements ExceptionFilter {
  catch(exception: unknown, host: ArgumentsHost) {
    const ctx = host.switchToHttp();
    const response = ctx.getResponse<Response>();
    const request = ctx.getRequest<Request>();

    let status = HttpStatus.INTERNAL_SERVER_ERROR;
    let code = 'INTERNAL_ERROR';
    let message = 'An unexpected error occurred';
    let details: any = undefined;

    if (exception instanceof HttpException) {
      status = exception.getStatus();
      const exceptionResponse = exception.getResponse();

      if (typeof exceptionResponse === 'string') {
        message = exceptionResponse;
      } else if (typeof exceptionResponse === 'object') {
        const responseObj = exceptionResponse as any;
        message = responseObj.message || exception.message || message;
        code = responseObj.code || this.getErrorCode(status);
        details = responseObj.details || responseObj;
      } else {
        message = exception.message;
      }

      code = this.getErrorCode(status);
    } else if (exception instanceof Error) {
      message = exception.message;
    }

    // Generate trace ID
    const traceId = (request.headers['x-trace-id'] as string) || randomUUID();

    // Set trace ID in response header
    response.setHeader('X-Trace-ID', traceId);

    const errorResponse = {
      error: {
        code,
        message,
        trace_id: traceId,
        details,
        timestamp: new Date().toISOString(),
      },
    };

    response.status(status).json(errorResponse);
  }

  private getErrorCode(status: number): string {
    const codeMap: Record<number, string> = {
      400: 'BAD_REQUEST',
      401: 'UNAUTHORIZED',
      403: 'FORBIDDEN',
      404: 'NOT_FOUND',
      409: 'CONFLICT',
      422: 'VALIDATION_FAILED',
      429: 'RATE_LIMITED',
      500: 'INTERNAL_ERROR',
      503: 'SERVICE_UNAVAILABLE',
    };

    return codeMap[status] || 'INTERNAL_ERROR';
  }
}

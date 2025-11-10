import {
  Injectable,
  NestInterceptor,
  ExecutionContext,
  CallHandler,
} from '@nestjs/common';
import { Observable } from 'rxjs';
import { map } from 'rxjs/operators';
import { Response } from 'express';

export interface PaginatedResponse<T> {
  data: T[];
  total: number;
  limit: number;
  offset: number;
  nextCursor?: string;
  hasMore: boolean;
}

@Injectable()
export class PaginationInterceptor implements NestInterceptor {
  intercept(context: ExecutionContext, next: CallHandler): Observable<any> {
    const response = context.switchToHttp().getResponse<Response>();
    const request = context.switchToHttp().getRequest();

    return next.handle().pipe(
      map((data) => {
        // If data already has pagination structure, use it
        if (data && typeof data === 'object' && 'data' in data) {
          const paginated = data as PaginatedResponse<any>;
          
          // Set next cursor header if available
          if (paginated.nextCursor) {
            response.setHeader('X-Next-Cursor', paginated.nextCursor);
          }

          // Set pagination headers
          response.setHeader('X-Total-Count', paginated.total.toString());
          response.setHeader('X-Limit', paginated.limit.toString());
          response.setHeader('X-Offset', paginated.offset.toString());
          response.setHeader('X-Has-More', paginated.hasMore.toString());

          return paginated;
        }

        return data;
      }),
    );
  }
}


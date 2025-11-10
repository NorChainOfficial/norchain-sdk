import {
  Injectable,
  NestInterceptor,
  ExecutionContext,
  CallHandler,
  Logger,
} from '@nestjs/common';
import { Observable } from 'rxjs';
import { tap } from 'rxjs/operators';
import { Request, Response } from 'express';
import { PerformanceMonitorService } from './performance-monitor.service';
import { EventEmitter2 } from '@nestjs/event-emitter';

@Injectable()
export class PerformanceMonitorInterceptor implements NestInterceptor {
  private readonly logger = new Logger(PerformanceMonitorInterceptor.name);

  constructor(
    private readonly performanceMonitor: PerformanceMonitorService,
    private readonly eventEmitter: EventEmitter2,
  ) {}

  intercept(context: ExecutionContext, next: CallHandler): Observable<any> {
    const request = context.switchToHttp().getRequest<Request>();
    const response = context.switchToHttp().getResponse<Response>();
    const startTime = Date.now();

    return next.handle().pipe(
      tap({
        next: () => {
          const duration = Date.now() - startTime;
          const metric = {
            endpoint: request.path,
            method: request.method,
            duration,
            statusCode: response.statusCode,
            timestamp: new Date(),
            userId: (request as any).user?.id,
            ipAddress: request.ip || request.socket.remoteAddress,
          };

          this.performanceMonitor.recordMetric(metric);
          this.eventEmitter.emit('request.completed', metric);
        },
        error: (error) => {
          const duration = Date.now() - startTime;
          const statusCode = error.status || 500;
          
          const metric = {
            endpoint: request.path,
            method: request.method,
            duration,
            statusCode,
            timestamp: new Date(),
            userId: (request as any).user?.id,
            ipAddress: request.ip || request.socket.remoteAddress,
          };

          this.performanceMonitor.recordMetric(metric);
          this.eventEmitter.emit('request.completed', metric);
        },
      }),
    );
  }
}


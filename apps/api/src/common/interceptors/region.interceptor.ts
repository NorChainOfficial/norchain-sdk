import {
  Injectable,
  NestInterceptor,
  ExecutionContext,
  CallHandler,
} from '@nestjs/common';
import { Observable } from 'rxjs';
import { tap } from 'rxjs/operators';
import { Response } from 'express';
import { MultiRegionConfig } from '../../config/multi-region.config';

/**
 * Region Interceptor
 *
 * Adds region headers to responses for multi-region support
 */
@Injectable()
export class RegionInterceptor implements NestInterceptor {
  constructor(private readonly regionConfig: MultiRegionConfig) {}

  intercept(context: ExecutionContext, next: CallHandler): Observable<any> {
    const response = context.switchToHttp().getResponse<Response>();
    const currentRegion = this.regionConfig.getCurrentRegion();
    const enabledRegions = this.regionConfig.getEnabledRegions();

    // Add region headers
    response.setHeader('X-Region', currentRegion);
    response.setHeader(
      'X-Available-Regions',
      enabledRegions.map((r) => r.name).join(','),
    );

    return next.handle();
  }
}

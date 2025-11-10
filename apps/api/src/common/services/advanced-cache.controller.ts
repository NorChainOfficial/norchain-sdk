import { Controller, Get, Post, Body, UseGuards } from '@nestjs/common';
import {
  ApiTags,
  ApiOperation,
  ApiResponse,
  ApiBearerAuth,
} from '@nestjs/swagger';
import { AdvancedCacheService } from './advanced-cache.service';
import { JwtAuthGuard } from '../guards/jwt-auth.guard';
import { Public } from '../decorators/public.decorator';

@ApiTags('Cache')
@Controller('cache')
export class AdvancedCacheController {
  constructor(private readonly cacheService: AdvancedCacheService) {}

  @Get('metrics')
  @Public()
  @ApiOperation({ summary: 'Get cache metrics' })
  @ApiResponse({
    status: 200,
    description: 'Cache metrics retrieved successfully',
  })
  async getMetrics() {
    return this.cacheService.getMetrics();
  }

  @Post('invalidate')
  @UseGuards(JwtAuthGuard)
  @ApiBearerAuth('JWT-auth')
  @ApiOperation({ summary: 'Invalidate cache by pattern' })
  @ApiResponse({
    status: 200,
    description: 'Cache invalidated successfully',
  })
  async invalidatePattern(@Body('pattern') pattern: string) {
    const count = await this.cacheService.invalidatePattern(pattern);
    return { invalidated: count, pattern };
  }

  @Post('reset-metrics')
  @UseGuards(JwtAuthGuard)
  @ApiBearerAuth('JWT-auth')
  @ApiOperation({ summary: 'Reset cache metrics' })
  @ApiResponse({
    status: 200,
    description: 'Cache metrics reset successfully',
  })
  async resetMetrics() {
    this.cacheService.resetMetrics();
    return { message: 'Metrics reset' };
  }
}

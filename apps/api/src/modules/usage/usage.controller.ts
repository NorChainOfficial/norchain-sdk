import {
  Controller,
  Get,
  Query,
  UseGuards,
  Request,
  ParseIntPipe,
  DefaultValuePipe,
} from '@nestjs/common';
import {
  ApiTags,
  ApiOperation,
  ApiResponse,
  ApiBearerAuth,
  ApiQuery,
} from '@nestjs/swagger';
import { UsageService } from './usage.service';
import { JwtAuthGuard } from '@/common/guards/jwt-auth.guard';
import { GetUsageAnalyticsDto } from './dto/get-usage-analytics.dto';
import { BillingPeriod } from './entities/usage-billing.entity';

@ApiTags('Usage & Billing')
@Controller('usage')
@UseGuards(JwtAuthGuard)
@ApiBearerAuth('JWT-auth')
export class UsageController {
  constructor(private readonly usageService: UsageService) {}

  @Get('analytics')
  @ApiOperation({ summary: 'Get API usage analytics' })
  @ApiResponse({
    status: 200,
    description: 'Usage analytics retrieved successfully',
  })
  async getUsageAnalytics(
    @Request() req: any,
    @Query() dto: GetUsageAnalyticsDto,
  ) {
    return this.usageService.getUsageAnalytics(req.user.id, dto);
  }

  @Get('current')
  @ApiOperation({ summary: 'Get current period usage summary' })
  @ApiResponse({
    status: 200,
    description: 'Current usage retrieved successfully',
  })
  async getCurrentUsage(@Request() req: any) {
    return this.usageService.getCurrentUsage(req.user.id);
  }

  @Get('billing')
  @ApiOperation({ summary: 'Get billing history' })
  @ApiQuery({ name: 'limit', required: false, type: Number })
  @ApiQuery({ name: 'offset', required: false, type: Number })
  @ApiResponse({
    status: 200,
    description: 'Billing history retrieved successfully',
  })
  async getBillingHistory(
    @Request() req: any,
    @Query('limit', new DefaultValuePipe(50), ParseIntPipe) limit: number,
    @Query('offset', new DefaultValuePipe(0), ParseIntPipe) offset: number,
  ) {
    return this.usageService.getBillingHistory(req.user.id, limit, offset);
  }

  @Get('billing/generate')
  @ApiOperation({ summary: 'Generate billing for current period' })
  @ApiQuery({
    name: 'period',
    required: false,
    enum: BillingPeriod,
    description: 'Billing period',
  })
  @ApiResponse({
    status: 200,
    description: 'Billing generated successfully',
  })
  async generateBilling(
    @Request() req: any,
    @Query('period') period?: BillingPeriod,
  ) {
    return this.usageService.generateBilling(
      req.user.id,
      period || BillingPeriod.MONTHLY,
    );
  }
}


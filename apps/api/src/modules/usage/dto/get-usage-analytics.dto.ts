import { IsOptional, IsDateString, IsEnum, IsString } from 'class-validator';
import { ApiPropertyOptional } from '@nestjs/swagger';
import { BillingPeriod } from '../entities/usage-billing.entity';

export class GetUsageAnalyticsDto {
  @ApiPropertyOptional({
    description: 'Start date (ISO 8601)',
    example: '2024-01-01T00:00:00Z',
  })
  @IsOptional()
  @IsDateString()
  startDate?: string;

  @ApiPropertyOptional({
    description: 'End date (ISO 8601)',
    example: '2024-01-31T23:59:59Z',
  })
  @IsOptional()
  @IsDateString()
  endDate?: string;

  @ApiPropertyOptional({
    description: 'API Key ID to filter by',
  })
  @IsOptional()
  @IsString()
  apiKeyId?: string;

  @ApiPropertyOptional({
    description: 'Endpoint to filter by',
  })
  @IsOptional()
  @IsString()
  endpoint?: string;

  @ApiPropertyOptional({
    description: 'Group by period',
    enum: BillingPeriod,
  })
  @IsOptional()
  @IsEnum(BillingPeriod)
  groupBy?: BillingPeriod;
}

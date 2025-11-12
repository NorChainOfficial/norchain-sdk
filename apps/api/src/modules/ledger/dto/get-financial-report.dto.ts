import {
  IsString,
  IsOptional,
  IsDateString,
  IsEnum,
} from 'class-validator';
import { ApiProperty, ApiPropertyOptional } from '@nestjs/swagger';

export enum ReportType {
  PROFIT_LOSS = 'profit_loss',
  BALANCE_SHEET = 'balance_sheet',
  CASHFLOW = 'cashflow',
}

export enum ReportPeriod {
  MONTHLY = 'monthly',
  QUARTERLY = 'quarterly',
  YEARLY = 'yearly',
  CUSTOM = 'custom',
}

export class GetFinancialReportDto {
  @ApiProperty({
    description: 'Organization ID',
  })
  @IsString()
  orgId: string;

  @ApiProperty({
    description: 'Report type',
    enum: ReportType,
  })
  @IsEnum(ReportType)
  reportType: ReportType;

  @ApiPropertyOptional({
    description: 'Report period',
    enum: ReportPeriod,
    default: ReportPeriod.MONTHLY,
  })
  @IsOptional()
  @IsEnum(ReportPeriod)
  period?: ReportPeriod;

  @ApiPropertyOptional({
    description: 'Start date for custom period (ISO 8601)',
  })
  @IsOptional()
  @IsDateString()
  startDate?: string;

  @ApiPropertyOptional({
    description: 'End date for custom period (ISO 8601)',
  })
  @IsOptional()
  @IsDateString()
  endDate?: string;

  @ApiPropertyOptional({
    description: 'Period identifier (e.g., "2025-01" for monthly, "2025-Q1" for quarterly, "2025" for yearly)',
  })
  @IsOptional()
  @IsString()
  periodIdentifier?: string;

  @ApiPropertyOptional({
    description: 'Include comparative period',
    default: false,
  })
  @IsOptional()
  includeComparative?: boolean;

  @ApiPropertyOptional({
    description: 'Currency for report',
    default: 'NOR',
  })
  @IsOptional()
  @IsString()
  currency?: string;
}


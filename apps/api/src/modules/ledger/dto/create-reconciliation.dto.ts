import {
  IsString,
  IsEnum,
  IsDateString,
  IsOptional,
  IsUUID,
} from 'class-validator';
import { ApiProperty, ApiPropertyOptional } from '@nestjs/swagger';
import { ReconciliationType } from '../entities/reconciliation.entity';

export class CreateReconciliationDto {
  @ApiProperty({ description: 'Organization ID' })
  @IsUUID()
  orgId: string;

  @ApiProperty({
    description: 'Reconciliation type',
    enum: ReconciliationType,
  })
  @IsEnum(ReconciliationType)
  type: ReconciliationType;

  @ApiPropertyOptional({
    description: 'Ledger account code to reconcile',
  })
  @IsOptional()
  @IsString()
  accountCode?: string;

  @ApiPropertyOptional({
    description:
      'External account identifier (bank account, wallet address, etc.)',
  })
  @IsOptional()
  @IsString()
  externalAccountId?: string;

  @ApiProperty({
    description: 'Period identifier (e.g., "2025-01")',
    example: '2025-01',
  })
  @IsString()
  period: string;

  @ApiProperty({
    description: 'Start date (ISO 8601)',
    example: '2025-01-01T00:00:00Z',
  })
  @IsDateString()
  startDate: string;

  @ApiProperty({
    description: 'End date (ISO 8601)',
    example: '2025-01-31T23:59:59Z',
  })
  @IsDateString()
  endDate: string;

  @ApiPropertyOptional({
    description: 'Opening balance',
    example: '1000.00',
  })
  @IsOptional()
  @IsString()
  openingBalance?: string;

  @ApiPropertyOptional({
    description: 'Closing balance',
    example: '1500.00',
  })
  @IsOptional()
  @IsString()
  closingBalance?: string;

  @ApiPropertyOptional({
    description: 'Additional metadata',
  })
  @IsOptional()
  metadata?: Record<string, any>;
}

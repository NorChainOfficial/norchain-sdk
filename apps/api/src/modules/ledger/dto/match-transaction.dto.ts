import {
  IsString,
  IsOptional,
  IsUUID,
  IsEnum,
  IsNumber,
  Min,
  Max,
} from 'class-validator';
import { ApiProperty, ApiPropertyOptional } from '@nestjs/swagger';
import { MatchType } from '../entities/reconciliation-match.entity';

export class MatchTransactionDto {
  @ApiProperty({
    description: 'Reconciliation ID',
  })
  @IsUUID()
  reconciliationId: string;

  @ApiPropertyOptional({
    description: 'Ledger journal entry ID',
  })
  @IsOptional()
  @IsUUID()
  ledgerEntryId?: string;

  @ApiPropertyOptional({
    description: 'External transaction ID',
  })
  @IsOptional()
  @IsString()
  externalTransactionId?: string;

  @ApiProperty({
    description: 'Transaction amount',
    example: '100.00',
  })
  @IsString()
  amount: string;

  @ApiProperty({
    description: 'Transaction date (ISO 8601)',
  })
  @IsString()
  transactionDate: string;

  @ApiPropertyOptional({
    description: 'Match type',
    enum: MatchType,
    default: MatchType.EXACT,
  })
  @IsOptional()
  @IsEnum(MatchType)
  matchType?: MatchType;

  @ApiPropertyOptional({
    description: 'Confidence score (0-100) for fuzzy matches',
  })
  @IsOptional()
  @IsNumber()
  @Min(0)
  @Max(100)
  confidenceScore?: number;

  @ApiPropertyOptional({
    description: 'Additional metadata',
  })
  @IsOptional()
  metadata?: Record<string, any>;
}


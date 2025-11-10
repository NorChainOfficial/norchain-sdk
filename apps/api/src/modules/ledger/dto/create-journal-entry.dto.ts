import { ApiProperty } from '@nestjs/swagger';
import {
  IsString,
  IsUUID,
  IsEnum,
  IsArray,
  ValidateNested,
  IsOptional,
  IsNumberString,
  MaxLength,
} from 'class-validator';
import { Type } from 'class-transformer';
import { LineDirection } from '../entities/journal-line.entity';

export class JournalLineDto {
  @ApiProperty({
    example: '1100-User NOR Cash',
    description: 'Account code or ID',
  })
  @IsString()
  account: string; // Can be account code or UUID

  @ApiProperty({
    example: 'NOR',
    description: 'Currency code',
  })
  @IsString()
  @MaxLength(10)
  currency: string;

  @ApiProperty({
    example: '100.00',
    description: 'Amount (as string for precision)',
  })
  @IsNumberString()
  amount: string;

  @ApiProperty({
    example: LineDirection.DEBIT,
    enum: LineDirection,
    description: 'Line direction',
  })
  @IsEnum(LineDirection)
  direction: LineDirection;

  @ApiProperty({
    example: '1.0',
    description: 'FX rate (if different from native currency)',
    required: false,
  })
  @IsOptional()
  @IsNumberString()
  fxRate?: string;
}

export class CreateJournalEntryDto {
  @ApiProperty({
    example: 'org_123',
    description: 'Organization ID',
  })
  @IsUUID()
  orgId: string;

  @ApiProperty({
    example: 'payment.succeeded',
    description: 'Event type',
  })
  @IsString()
  @MaxLength(100)
  eventType: string;

  @ApiProperty({
    example: 'pay_01J...',
    description: 'External event ID',
  })
  @IsString()
  @MaxLength(255)
  eventId: string;

  @ApiProperty({
    example: '0xabc...',
    description: 'On-chain transaction hash',
    required: false,
  })
  @IsOptional()
  @IsString()
  @MaxLength(66)
  txHash?: string;

  @ApiProperty({
    example: 12345,
    description: 'Block number',
    required: false,
  })
  @IsOptional()
  blockNo?: number;

  @ApiProperty({
    example: '2025-01-15T12:00:00Z',
    description: 'When the event occurred',
  })
  @IsString()
  occurredAt: string; // ISO 8601 string

  @ApiProperty({
    example: '2025-01',
    description: 'Accounting period (YYYY-MM)',
  })
  @IsString()
  @MaxLength(20)
  period: string;

  @ApiProperty({
    example: 'Payment received',
    description: 'Memo/description',
    required: false,
  })
  @IsOptional()
  @IsString()
  memo?: string;

  @ApiProperty({
    type: [JournalLineDto],
    description: 'Journal lines (must balance: sum(debits) == sum(credits) per currency)',
  })
  @IsArray()
  @ValidateNested({ each: true })
  @Type(() => JournalLineDto)
  lines: JournalLineDto[];
}


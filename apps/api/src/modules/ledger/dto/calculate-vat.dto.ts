import {
  IsString,
  IsNumber,
  IsOptional,
  IsEnum,
  IsDateString,
  Min,
  Max,
} from 'class-validator';
import { ApiProperty, ApiPropertyOptional } from '@nestjs/swagger';

export enum VatRate {
  NORWAY_STANDARD = 25, // 25% MVA (standard rate)
  NORWAY_REDUCED = 15, // 15% MVA (reduced rate)
  NORWAY_LOW = 10, // 10% MVA (low rate)
  NORWAY_ZERO = 0, // 0% MVA (zero rate)
  EU_STANDARD = 20, // 20% VAT (EU standard)
  EU_REDUCED = 10, // 10% VAT (EU reduced)
  EU_SUPER_REDUCED = 5, // 5% VAT (EU super reduced)
  EU_ZERO = 0, // 0% VAT (EU zero)
  GCC_STANDARD = 5, // 5% VAT (GCC standard)
  GCC_ZERO = 0, // 0% VAT (GCC zero)
}

export enum VatType {
  INPUT = 'input', // VAT on purchases (can be reclaimed)
  OUTPUT = 'output', // VAT on sales (must be paid)
}

export class CalculateVatDto {
  @ApiProperty({
    description: 'Organization ID',
  })
  @IsString()
  orgId: string;

  @ApiProperty({
    description: 'Amount excluding VAT (in NOR)',
    example: '1000.00',
  })
  @IsString()
  amountExcludingVat: string;

  @ApiProperty({
    description: 'VAT rate percentage',
    enum: VatRate,
    example: VatRate.NORWAY_STANDARD,
  })
  @IsEnum(VatRate)
  vatRate: VatRate;

  @ApiProperty({
    description: 'VAT type',
    enum: VatType,
    example: VatType.OUTPUT,
  })
  @IsEnum(VatType)
  vatType: VatType;

  @ApiPropertyOptional({
    description: 'Country code (ISO 3166-1 alpha-2)',
    example: 'NO',
  })
  @IsOptional()
  @IsString()
  countryCode?: string;

  @ApiPropertyOptional({
    description: 'Transaction date (ISO 8601)',
  })
  @IsOptional()
  @IsDateString()
  transactionDate?: string;

  @ApiPropertyOptional({
    description: 'Account code for VAT account',
  })
  @IsOptional()
  @IsString()
  vatAccountCode?: string;
}


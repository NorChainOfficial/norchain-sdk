import {
  IsString,
  IsEnum,
  IsOptional,
  IsNumber,
  IsBoolean,
  IsDateString,
  Min,
  Max,
  Matches,
  Length,
} from 'class-validator';
import { ApiProperty, ApiPropertyOptional } from '@nestjs/swagger';
import { CouponType } from '../entities/coupon.entity';

export class CreateCouponDto {
  @ApiProperty({ description: 'Organization ID' })
  @IsString()
  orgId: string;

  @ApiProperty({
    description: 'Coupon code (alphanumeric, uppercase)',
    example: 'SUMMER2024',
  })
  @IsString()
  @Length(3, 50)
  @Matches(/^[A-Z0-9_-]+$/, {
    message: 'Code must be uppercase alphanumeric with dashes/underscores',
  })
  code: string;

  @ApiPropertyOptional({ description: 'Coupon name' })
  @IsOptional()
  @IsString()
  name?: string;

  @ApiPropertyOptional({ description: 'Coupon description' })
  @IsOptional()
  @IsString()
  description?: string;

  @ApiProperty({
    description: 'Coupon type',
    enum: CouponType,
    default: CouponType.PERCENTAGE,
  })
  @IsEnum(CouponType)
  type: CouponType;

  @ApiProperty({
    description:
      'Discount value: percentage (0-100) for percentage type, or fixed amount in NOR for fixed_amount type',
    example: '10.00',
  })
  @IsString()
  discountValue: string;

  @ApiPropertyOptional({
    description: 'Maximum number of times this coupon can be redeemed',
  })
  @IsOptional()
  @IsNumber()
  @Min(1)
  maxRedemptions?: number;

  @ApiPropertyOptional({
    description: 'Valid from date (ISO 8601)',
  })
  @IsOptional()
  @IsDateString()
  validFrom?: string;

  @ApiPropertyOptional({
    description: 'Valid until date (ISO 8601)',
  })
  @IsOptional()
  @IsDateString()
  validUntil?: string;

  @ApiPropertyOptional({
    description: 'Minimum purchase amount in NOR to use this coupon',
  })
  @IsOptional()
  @IsString()
  minimumAmount?: string;

  @ApiPropertyOptional({
    description: 'Whether this coupon applies to subscriptions',
    default: false,
  })
  @IsOptional()
  @IsBoolean()
  appliesToSubscriptions?: boolean;

  @ApiPropertyOptional({
    description: 'Whether this coupon applies to products',
    default: false,
  })
  @IsOptional()
  @IsBoolean()
  appliesToProducts?: boolean;
}


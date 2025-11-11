import { ApiProperty } from '@nestjs/swagger';
import {
  IsString,
  IsUUID,
  IsNumberString,
  IsEnum,
  IsOptional,
  MaxLength,
} from 'class-validator';
import { BillingCycle } from '../entities/price.entity';

export class CreatePriceDto {
  @ApiProperty({
    example: 'prod_01J...',
    description: 'Product ID',
  })
  @IsUUID()
  productId: string;

  @ApiProperty({
    example: '100.00',
    description: 'Price amount',
  })
  @IsNumberString()
  amount: string;

  @ApiProperty({
    example: 'NOR',
    description: 'Currency code',
    default: 'NOR',
  })
  @IsString()
  @MaxLength(10)
  currency: string;

  @ApiProperty({
    example: BillingCycle.MONTHLY,
    enum: BillingCycle,
    description: 'Billing cycle (null for one-time)',
    required: false,
  })
  @IsOptional()
  @IsEnum(BillingCycle)
  billingCycle?: BillingCycle;

  @ApiProperty({
    example: { feature: 'premium' },
    description: 'Additional metadata',
    required: false,
  })
  @IsOptional()
  metadata?: Record<string, any>;
}

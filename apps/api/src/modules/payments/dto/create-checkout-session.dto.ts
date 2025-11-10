import { ApiProperty } from '@nestjs/swagger';
import {
  IsString,
  IsUUID,
  IsNumberString,
  IsArray,
  IsOptional,
  IsUrl,
  MaxLength,
  ValidateNested,
} from 'class-validator';
import { Type } from 'class-transformer';

export class CreateCheckoutSessionDto {
  @ApiProperty({
    example: 'org_123',
    description: 'Merchant/Organization ID',
  })
  @IsUUID()
  merchantId: string;

  @ApiProperty({
    example: '100.00',
    description: 'Amount to pay',
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
    example: ['NOR', 'USDT'],
    description: 'Supported assets for payment',
    required: false,
  })
  @IsOptional()
  @IsArray()
  @IsString({ each: true })
  assets?: string[];

  @ApiProperty({
    example: { orderId: 'ORD-7788' },
    description: 'Metadata associated with the checkout',
    required: false,
  })
  @IsOptional()
  metadata?: Record<string, any>;

  @ApiProperty({
    example: 'https://merchant.com/success',
    description: 'URL to redirect after successful payment',
    required: false,
  })
  @IsOptional()
  @IsUrl()
  successUrl?: string;

  @ApiProperty({
    example: 'https://merchant.com/cancel',
    description: 'URL to redirect after cancelled payment',
    required: false,
  })
  @IsOptional()
  @IsUrl()
  cancelUrl?: string;
}


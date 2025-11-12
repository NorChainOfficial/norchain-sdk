import { IsString, IsOptional } from 'class-validator';
import { ApiProperty, ApiPropertyOptional } from '@nestjs/swagger';

export class ApplyCouponDto {
  @ApiProperty({
    description: 'Coupon code to apply',
    example: 'SUMMER2024',
  })
  @IsString()
  code: string;

  @ApiPropertyOptional({
    description: 'Amount to calculate discount for (in NOR)',
  })
  @IsOptional()
  @IsString()
  amount?: string;

  @ApiPropertyOptional({
    description: 'Price ID (for product-based discounts)',
  })
  @IsOptional()
  @IsString()
  priceId?: string;

  @ApiPropertyOptional({
    description: 'Subscription ID (for subscription-based discounts)',
  })
  @IsOptional()
  @IsString()
  subscriptionId?: string;
}


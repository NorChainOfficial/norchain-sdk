import { ApiProperty } from '@nestjs/swagger';
import { IsUUID, IsEnum, IsOptional } from 'class-validator';
import { ProrationPolicy } from '../entities/subscription.entity';

export class CreateSubscriptionDto {
  @ApiProperty({
    example: 'price_01J...',
    description: 'Price ID',
  })
  @IsUUID()
  priceId: string;

  @ApiProperty({
    example: 'cust_01J...',
    description: 'Customer ID',
  })
  @IsUUID()
  customerId: string;

  @ApiProperty({
    example: ProrationPolicy.CREATE_PRORATION,
    enum: ProrationPolicy,
    description: 'Proration policy',
    required: false,
  })
  @IsOptional()
  @IsEnum(ProrationPolicy)
  prorationPolicy?: ProrationPolicy;

  @ApiProperty({
    example: { plan: 'premium' },
    description: 'Additional metadata',
    required: false,
  })
  @IsOptional()
  metadata?: Record<string, any>;
}

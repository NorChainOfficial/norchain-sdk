import { ApiProperty } from '@nestjs/swagger';
import {
  IsString,
  IsUUID,
  IsArray,
  IsOptional,
  IsUrl,
  ValidateNested,
  IsInt,
  Min,
} from 'class-validator';
import { Type } from 'class-transformer';

export class LineItemDto {
  @ApiProperty({
    example: 'price_01J...',
    description: 'Price ID',
  })
  @IsUUID()
  priceId: string;

  @ApiProperty({
    example: 1,
    description: 'Quantity',
    minimum: 1,
  })
  @IsInt()
  @Min(1)
  quantity: number;
}

export class CreateCheckoutSessionWithLineItemsDto {
  @ApiProperty({
    example: 'org_123',
    description: 'Organization/Merchant ID',
  })
  @IsUUID()
  orgId: string;

  @ApiProperty({
    type: [LineItemDto],
    description: 'Line items (products/prices)',
  })
  @IsArray()
  @ValidateNested({ each: true })
  @Type(() => LineItemDto)
  lineItems: LineItemDto[];

  @ApiProperty({
    example: ['NOR', 'USDT'],
    description: 'Supported assets for payment',
  })
  @IsArray()
  @IsString({ each: true })
  assetSet: string[];

  @ApiProperty({
    example: 'https://merchant.com/success',
    description: 'URL to redirect after successful payment',
  })
  @IsUrl()
  successUrl: string;

  @ApiProperty({
    example: 'https://merchant.com/cancel',
    description: 'URL to redirect after cancelled payment',
  })
  @IsUrl()
  cancelUrl: string;

  @ApiProperty({
    example: { orderId: 'ORD-7788' },
    description: 'Metadata associated with the checkout',
    required: false,
  })
  @IsOptional()
  metadata?: Record<string, any>;
}

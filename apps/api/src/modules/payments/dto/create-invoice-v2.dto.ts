import { ApiProperty } from '@nestjs/swagger';
import {
  IsString,
  IsUUID,
  IsArray,
  IsOptional,
  IsDateString,
  ValidateNested,
  IsNumberString,
} from 'class-validator';
import { Type } from 'class-transformer';

export class InvoiceLineItemDto {
  @ApiProperty({
    example: 'price_01J...',
    description: 'Price ID (optional if using custom amount)',
    required: false,
  })
  @IsOptional()
  @IsUUID()
  priceId?: string;

  @ApiProperty({
    example: 'Premium Subscription',
    description: 'Item description',
  })
  @IsString()
  description: string;

  @ApiProperty({
    example: '100.00',
    description: 'Item amount',
  })
  @IsNumberString()
  amount: string;

  @ApiProperty({
    example: 1,
    description: 'Quantity',
    default: 1,
  })
  @IsOptional()
  quantity?: number;
}

export class CreateInvoiceV2Dto {
  @ApiProperty({
    example: 'org_123',
    description: 'Organization ID',
  })
  @IsUUID()
  orgId: string;

  @ApiProperty({
    example: 'cust_01J...',
    description: 'Customer ID',
  })
  @IsUUID()
  customerId: string;

  @ApiProperty({
    type: [InvoiceLineItemDto],
    description: 'Invoice line items',
  })
  @IsArray()
  @ValidateNested({ each: true })
  @Type(() => InvoiceLineItemDto)
  lineItems: InvoiceLineItemDto[];

  @ApiProperty({
    example: '2025-02-01T00:00:00Z',
    description: 'Due date (ISO 8601)',
    required: false,
  })
  @IsOptional()
  @IsDateString()
  dueDate?: string;

  @ApiProperty({
    example: { orderId: 'ORD-7788' },
    description: 'Additional metadata',
    required: false,
  })
  @IsOptional()
  metadata?: Record<string, any>;
}


import { ApiProperty } from '@nestjs/swagger';
import { IsString, IsNumberString, IsOptional, IsEnum, IsDateString, IsObject } from 'class-validator';
import { PaymentMethod } from '../entities/payment-invoice.entity';

export class CreateInvoiceDto {
  @ApiProperty({
    example: 'Payment for services rendered',
    description: 'Invoice description',
  })
  @IsString()
  description: string;

  @ApiProperty({
    example: '1000000000000000000',
    description: 'Amount in smallest unit',
  })
  @IsNumberString()
  amount: string;

  @ApiProperty({
    example: 'NOR',
    description: 'Currency (NOR, USD, NOK, AED)',
  })
  @IsString()
  currency: string;

  @ApiProperty({
    example: 'crypto',
    description: 'Payment method',
    enum: PaymentMethod,
    required: false,
  })
  @IsOptional()
  @IsEnum(PaymentMethod)
  paymentMethod?: PaymentMethod;

  @ApiProperty({
    example: '0x742d35Cc6634C0532925a3b844Bc9e7595f0bEb0',
    description: 'Recipient address for crypto payments',
    required: false,
  })
  @IsOptional()
  @IsString()
  recipientAddress?: string;

  @ApiProperty({
    example: '2025-12-31T23:59:59Z',
    description: 'Due date',
    required: false,
  })
  @IsOptional()
  @IsDateString()
  dueDate?: string;

  @ApiProperty({
    example: { customerName: 'John Doe', customerEmail: 'john@example.com' },
    description: 'Additional metadata',
    required: false,
  })
  @IsOptional()
  @IsObject()
  metadata?: Record<string, any>;
}


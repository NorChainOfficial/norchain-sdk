import { ApiProperty } from '@nestjs/swagger';
import {
  IsString,
  IsUUID,
  IsNumberString,
  IsEthereumAddress,
  IsOptional,
  MaxLength,
} from 'class-validator';

export class CreateRefundDto {
  @ApiProperty({
    example: 'pay_01J...',
    description: 'Payment ID to refund',
  })
  @IsUUID()
  paymentId: string;

  @ApiProperty({
    example: '50.00',
    description: 'Refund amount (must be <= original payment amount)',
  })
  @IsNumberString()
  amount: string;

  @ApiProperty({
    example: '0x742d35Cc6634C0532925a3b844Bc9e7595f0bEb0',
    description: 'Address to refund to',
  })
  @IsEthereumAddress()
  recipientAddress: string;

  @ApiProperty({
    example: 'Customer requested refund',
    description: 'Reason for refund',
    required: false,
  })
  @IsOptional()
  @IsString()
  @MaxLength(500)
  reason?: string;

  @ApiProperty({
    example: { refundReason: 'customer_request' },
    description: 'Metadata associated with the refund',
    required: false,
  })
  @IsOptional()
  metadata?: Record<string, any>;
}


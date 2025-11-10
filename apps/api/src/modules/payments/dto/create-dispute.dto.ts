import { ApiProperty } from '@nestjs/swagger';
import { IsUUID, IsString, IsOptional, MaxLength } from 'class-validator';

export class CreateDisputeDto {
  @ApiProperty({
    example: 'pay_01J...',
    description: 'Payment ID',
  })
  @IsUUID()
  paymentId: string;

  @ApiProperty({
    example: 'Product not received',
    description: 'Reason for dispute',
  })
  @IsString()
  @MaxLength(1000)
  reason: string;

  @ApiProperty({
    example: { evidence: ['file1.pdf', 'file2.jpg'] },
    description: 'Customer evidence',
    required: false,
  })
  @IsOptional()
  customerEvidence?: Record<string, any>;

  @ApiProperty({
    example: { orderId: 'ORD-7788' },
    description: 'Additional metadata',
    required: false,
  })
  @IsOptional()
  metadata?: Record<string, any>;
}


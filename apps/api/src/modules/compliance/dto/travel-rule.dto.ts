import { ApiProperty } from '@nestjs/swagger';
import { IsString, IsEthereumAddress, IsNumberString, IsOptional, IsEmail } from 'class-validator';

export class TravelRuleDto {
  @ApiProperty({
    example: '0x742d35Cc6634C0532925a3b844Bc9e7595f0bEb0',
    description: 'Sender address',
  })
  @IsEthereumAddress()
  senderAddress: string;

  @ApiProperty({
    example: '0x1234567890123456789012345678901234567890',
    description: 'Recipient address',
  })
  @IsEthereumAddress()
  recipientAddress: string;

  @ApiProperty({
    example: '1000000000000000000',
    description: 'Transaction amount',
  })
  @IsNumberString()
  amount: string;

  @ApiProperty({
    example: 'NOR',
    description: 'Asset symbol',
  })
  @IsString()
  asset: string;

  @ApiProperty({
    example: 'John Doe',
    description: 'Sender name',
    required: false,
  })
  @IsOptional()
  @IsString()
  senderName?: string;

  @ApiProperty({
    example: 'sender@example.com',
    description: 'Sender email',
    required: false,
  })
  @IsOptional()
  @IsEmail()
  senderEmail?: string;

  @ApiProperty({
    example: 'Jane Smith',
    description: 'Recipient name',
    required: false,
  })
  @IsOptional()
  @IsString()
  recipientName?: string;

  @ApiProperty({
    example: 'recipient@example.com',
    description: 'Recipient email',
    required: false,
  })
  @IsOptional()
  @IsEmail()
  recipientEmail?: string;
}


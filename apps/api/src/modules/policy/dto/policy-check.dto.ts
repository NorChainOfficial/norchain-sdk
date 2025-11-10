import { ApiProperty } from '@nestjs/swagger';
import {
  IsString,
  IsOptional,
  IsNumberString,
  IsEthereumAddress,
} from 'class-validator';

export class PolicyCheckDto {
  @ApiProperty({
    example: '0x742d35Cc6634C0532925a3b844Bc9e7595f0bEb0',
    description: 'Sender address',
    required: false,
  })
  @IsOptional()
  @IsEthereumAddress()
  fromAddress?: string;

  @ApiProperty({
    example: '0x742d35Cc6634C0532925a3b844Bc9e7595f0bEb0',
    description: 'Recipient address',
    required: false,
  })
  @IsOptional()
  @IsEthereumAddress()
  toAddress?: string;

  @ApiProperty({
    example: '1000000000000000000',
    description: 'Transaction amount',
    required: false,
  })
  @IsOptional()
  @IsNumberString()
  amount?: string;

  @ApiProperty({
    example: 'NOR',
    description: 'Asset symbol',
    required: false,
  })
  @IsOptional()
  @IsString()
  asset?: string;

  @ApiProperty({
    example: 'tx_abc123',
    description: 'Request/transaction identifier',
    required: false,
  })
  @IsOptional()
  @IsString()
  requestId?: string;
}

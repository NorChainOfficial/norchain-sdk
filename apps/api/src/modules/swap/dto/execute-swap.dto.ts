import { IsString, IsNotEmpty, IsOptional, IsNumberString } from 'class-validator';
import { ApiProperty } from '@nestjs/swagger';

export class ExecuteSwapDto {
  @ApiProperty({
    description: 'Quote ID from getQuote endpoint',
    example: 'quote-123',
  })
  @IsString()
  @IsNotEmpty()
  quoteId: string;

  @ApiProperty({
    description: 'Signed transaction data',
    example: '0x...',
  })
  @IsString()
  @IsNotEmpty()
  signedTx: string;

  @ApiProperty({
    description: 'User wallet address',
    example: '0x742d35Cc6634C0532925a3b844Bc9e7595f0bEb',
  })
  @IsString()
  @IsNotEmpty()
  userAddress: string;

  @ApiProperty({
    description: 'Chain ID',
    example: '65001',
    required: false,
  })
  @IsOptional()
  @IsNumberString()
  chainId?: string;
}


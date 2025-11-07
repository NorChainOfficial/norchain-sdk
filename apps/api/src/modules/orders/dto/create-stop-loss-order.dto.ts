import { IsString, IsNotEmpty, IsNumberString, IsOptional } from 'class-validator';
import { ApiProperty } from '@nestjs/swagger';

export class CreateStopLossOrderDto {
  @ApiProperty({
    description: 'User wallet address',
    example: '0x742d35Cc6634C0532925a3b844Bc9e7595f0bEb',
  })
  @IsString()
  @IsNotEmpty()
  userAddress: string;

  @ApiProperty({
    description: 'Token pair (e.g., NOR/USDT)',
    example: 'NOR/USDT',
  })
  @IsString()
  @IsNotEmpty()
  pair: string;

  @ApiProperty({
    description: 'Stop loss price',
    example: '0.00008',
  })
  @IsString()
  @IsNotEmpty()
  stopPrice: string;

  @ApiProperty({
    description: 'Amount to sell',
    example: '1000000000000000000',
  })
  @IsString()
  @IsNotEmpty()
  amount: string;

  @ApiProperty({
    description: 'Expiration timestamp',
    example: '1735689600',
    required: false,
  })
  @IsOptional()
  @IsNumberString()
  expiresAt?: string;
}


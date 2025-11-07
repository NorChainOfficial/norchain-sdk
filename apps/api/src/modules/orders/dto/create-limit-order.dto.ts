import { IsString, IsNotEmpty, IsNumberString, IsEnum, IsOptional } from 'class-validator';
import { ApiProperty } from '@nestjs/swagger';

export enum OrderSide {
  BUY = 'buy',
  SELL = 'sell',
}

export enum OrderStatus {
  PENDING = 'pending',
  FILLED = 'filled',
  CANCELLED = 'cancelled',
  EXPIRED = 'expired',
}

export class CreateLimitOrderDto {
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
    description: 'Order side',
    enum: OrderSide,
    example: OrderSide.BUY,
  })
  @IsEnum(OrderSide)
  @IsNotEmpty()
  side: OrderSide;

  @ApiProperty({
    description: 'Limit price',
    example: '0.0001',
  })
  @IsString()
  @IsNotEmpty()
  price: string;

  @ApiProperty({
    description: 'Order amount',
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


import {
  IsString,
  IsNotEmpty,
  IsOptional,
  IsNumberString,
} from 'class-validator';
import { ApiProperty } from '@nestjs/swagger';

export class GetQuoteDto {
  @ApiProperty({
    description: 'Input token address or symbol',
    example: 'NOR',
  })
  @IsString()
  @IsNotEmpty()
  tokenIn: string;

  @ApiProperty({
    description: 'Output token address or symbol',
    example: 'USDT',
  })
  @IsString()
  @IsNotEmpty()
  tokenOut: string;

  @ApiProperty({
    description: 'Amount of input token',
    example: '1000000000000000000',
  })
  @IsString()
  @IsNotEmpty()
  amountIn: string;

  @ApiProperty({
    description: 'Chain ID',
    example: '65001',
    required: false,
  })
  @IsOptional()
  @IsNumberString()
  chainId?: string;
}

import { IsString, IsNotEmpty } from 'class-validator';
import { ApiProperty } from '@nestjs/swagger';

export class OptimizePortfolioDto {
  @ApiProperty({ description: 'Address to optimize portfolio for' })
  @IsString()
  @IsNotEmpty()
  address: string;
}

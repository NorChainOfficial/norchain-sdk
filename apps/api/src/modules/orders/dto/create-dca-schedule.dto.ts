import {
  IsString,
  IsNotEmpty,
  IsNumberString,
  IsOptional,
  IsInt,
  Min,
} from 'class-validator';
import { ApiProperty } from '@nestjs/swagger';
import { Type } from 'class-transformer';

export class CreateDCAScheduleDto {
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
    description: 'Amount per DCA execution',
    example: '1000000000000000000',
  })
  @IsString()
  @IsNotEmpty()
  amountPerExecution: string;

  @ApiProperty({
    description: 'Interval in hours between executions',
    example: 24,
  })
  @Type(() => Number)
  @IsInt()
  @Min(1)
  intervalHours: number;

  @ApiProperty({
    description: 'Total number of executions',
    example: 10,
  })
  @Type(() => Number)
  @IsInt()
  @Min(1)
  totalExecutions: number;

  @ApiProperty({
    description: 'Start timestamp',
    example: '1735689600',
    required: false,
  })
  @IsOptional()
  @IsNumberString()
  startsAt?: string;
}

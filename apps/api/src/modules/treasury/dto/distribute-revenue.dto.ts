import {
  IsString,
  IsEnum,
  IsOptional,
  IsNumberString,
  Min,
  Max,
} from 'class-validator';
import { ApiProperty, ApiPropertyOptional } from '@nestjs/swagger';
import { DistributionType } from '../entities/revenue-distribution.entity';

export class DistributeRevenueDto {
  @ApiProperty({
    description: 'Period identifier (e.g., "2025-01")',
    example: '2025-01',
  })
  @IsString()
  period: string;

  @ApiProperty({
    description: 'Total revenue amount to distribute (in NOR)',
    example: '10000.00',
  })
  @IsNumberString()
  totalRevenue: string;

  @ApiPropertyOptional({
    description: 'Override distribution percentages (optional)',
  })
  @IsOptional()
  distributionPercentages?: {
    validatorRewards?: number;
    developerGrants?: number;
    aiFund?: number;
    charityEsg?: number;
    treasuryReserve?: number;
  };
}

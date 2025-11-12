import {
  IsString,
  IsEnum,
  IsOptional,
  IsNumberString,
  IsDateString,
} from 'class-validator';
import { ApiProperty, ApiPropertyOptional } from '@nestjs/swagger';
import { RewardType } from '../entities/staking-reward.entity';

export class CreateStakingRewardDto {
  @ApiProperty({
    description: 'Period identifier (e.g., "2025-01")',
    example: '2025-01',
  })
  @IsString()
  period: string;

  @ApiProperty({
    description: 'Reward type',
    enum: RewardType,
  })
  @IsEnum(RewardType)
  type: RewardType;

  @ApiProperty({
    description: 'Reward amount (in NOR)',
    example: '100.00',
  })
  @IsNumberString()
  amount: string;

  @ApiPropertyOptional({
    description: 'Validator address (for validator/delegator rewards)',
  })
  @IsOptional()
  @IsString()
  validatorAddress?: string;

  @ApiPropertyOptional({
    description: 'Delegator address (for delegator rewards)',
  })
  @IsOptional()
  @IsString()
  delegatorAddress?: string;

  @ApiPropertyOptional({
    description: 'Staked amount (for APY calculation)',
    example: '1000.00',
  })
  @IsOptional()
  @IsNumberString()
  stakedAmount?: string;

  @ApiPropertyOptional({
    description: 'Annual Percentage Yield',
    example: 12.5,
  })
  @IsOptional()
  apy?: number;

  @ApiPropertyOptional({
    description: 'Claimable until date (ISO 8601)',
  })
  @IsOptional()
  @IsDateString()
  claimableUntil?: string;

  @ApiPropertyOptional({
    description: 'Additional metadata',
  })
  @IsOptional()
  metadata?: Record<string, any>;
}


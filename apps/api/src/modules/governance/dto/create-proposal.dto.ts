import { ApiProperty } from '@nestjs/swagger';
import {
  IsEnum,
  IsString,
  IsObject,
  IsOptional,
  IsDateString,
} from 'class-validator';
import { ProposalType } from '../entities/governance-proposal.entity';

export class CreateProposalDto {
  @ApiProperty({
    example: 'Increase Validator Staking Requirement',
    description: 'Proposal title',
  })
  @IsString()
  title: string;

  @ApiProperty({
    example:
      'This proposal aims to increase the minimum staking requirement for validators from 10,000 NOR to 50,000 NOR to improve network security.',
    description: 'Proposal description',
  })
  @IsString()
  description: string;

  @ApiProperty({
    example: 'parameter_change',
    description: 'Proposal type',
    enum: ProposalType,
  })
  @IsEnum(ProposalType)
  type: ProposalType;

  @ApiProperty({
    example: { minStake: '50000000000000000000000', newValue: '50000' },
    description: 'Proposal parameters',
  })
  @IsObject()
  parameters: Record<string, any>;

  @ApiProperty({
    example: '2025-01-01T00:00:00Z',
    description: 'Voting start time',
    required: false,
  })
  @IsOptional()
  @IsDateString()
  startTime?: string;

  @ApiProperty({
    example: '2025-01-15T00:00:00Z',
    description: 'Voting end time',
    required: false,
  })
  @IsOptional()
  @IsDateString()
  endTime?: string;
}

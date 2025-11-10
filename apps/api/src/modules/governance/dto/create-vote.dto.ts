import { ApiProperty } from '@nestjs/swagger';
import { IsEnum, IsString, IsOptional } from 'class-validator';
import { VoteChoice } from '../entities/governance-vote.entity';

export class CreateVoteDto {
  @ApiProperty({
    example: 'for',
    description: 'Vote choice',
    enum: VoteChoice,
  })
  @IsEnum(VoteChoice)
  choice: VoteChoice;

  @ApiProperty({
    example: 'I support this proposal because...',
    description: 'Optional reason for vote',
    required: false,
  })
  @IsOptional()
  @IsString()
  reason?: string;
}


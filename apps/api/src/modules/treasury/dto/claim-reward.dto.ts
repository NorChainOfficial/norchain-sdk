import { IsString, IsOptional } from 'class-validator';
import { ApiProperty, ApiPropertyOptional } from '@nestjs/swagger';

export class ClaimRewardDto {
  @ApiProperty({
    description: 'Reward ID to claim',
  })
  @IsString()
  rewardId: string;

  @ApiPropertyOptional({
    description: 'Recipient address (if different from authenticated user)',
  })
  @IsOptional()
  @IsString()
  recipientAddress?: string;
}

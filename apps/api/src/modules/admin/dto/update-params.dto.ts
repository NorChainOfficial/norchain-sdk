import { ApiProperty } from '@nestjs/swagger';
import { IsObject, IsString, IsOptional } from 'class-validator';

export class UpdateParamsDto {
  @ApiProperty({
    example: { minStake: '50000', maxValidators: 100 },
    description: 'Parameters to update',
  })
  @IsObject()
  parameters: Record<string, any>;

  @ApiProperty({
    example: 'Increase minimum staking requirement',
    description: 'Reason for parameter change',
    required: false,
  })
  @IsOptional()
  @IsString()
  reason?: string;
}

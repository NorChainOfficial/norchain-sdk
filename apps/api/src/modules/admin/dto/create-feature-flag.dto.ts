import { ApiProperty } from '@nestjs/swagger';
import { IsString, IsBoolean, IsOptional, IsObject } from 'class-validator';

export class CreateFeatureFlagDto {
  @ApiProperty({
    example: 'enable_bridge_v2',
    description: 'Feature flag key',
  })
  @IsString()
  key: string;

  @ApiProperty({
    example: 'Enable Bridge V2 features',
    description: 'Feature description',
  })
  @IsString()
  description: string;

  @ApiProperty({
    example: false,
    description: 'Whether the feature is enabled',
    required: false,
  })
  @IsOptional()
  @IsBoolean()
  enabled?: boolean;

  @ApiProperty({
    example: { percentage: 10, roles: ['partner'] },
    description: 'Rollout conditions',
    required: false,
  })
  @IsOptional()
  @IsObject()
  conditions?: {
    userIds?: string[];
    roles?: string[];
    percentage?: number;
    startDate?: string;
    endDate?: string;
  };
}

import { ApiProperty } from '@nestjs/swagger';
import {
  IsString,
  IsNumberString,
  IsOptional,
  IsObject,
} from 'class-validator';

export class CreateValidatorDto {
  @ApiProperty({
    example: '0x742d35Cc6634C0532925a3b844Bc9e7595f0bEb0',
    description: 'Validator address',
  })
  @IsString()
  address: string;

  @ApiProperty({
    example: 'NorChain Validator #1',
    description: 'Validator name',
  })
  @IsString()
  name: string;

  @ApiProperty({
    example: '10000000000000000000000',
    description: 'Initial stake amount',
  })
  @IsNumberString()
  stake: string;

  @ApiProperty({
    example: 'LIC-2024-001',
    description: 'Regulatory license number',
    required: false,
  })
  @IsOptional()
  @IsString()
  licenseNumber?: string;

  @ApiProperty({
    example: 'Oslo, Norway',
    description: 'Geographic location',
    required: false,
  })
  @IsOptional()
  @IsString()
  location?: string;

  @ApiProperty({
    example: {
      organization: 'NorChain Foundation',
      website: 'https://norchain.org',
    },
    description: 'Additional metadata',
    required: false,
  })
  @IsOptional()
  @IsObject()
  metadata?: Record<string, any>;
}

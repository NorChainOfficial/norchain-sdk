import { ApiProperty } from '@nestjs/swagger';
import { IsEnum, IsString, IsOptional, IsArray } from 'class-validator';
import { CaseSeverity } from '../entities/compliance-case.entity';

export class CreateCaseDto {
  @ApiProperty({
    example: '0x742d35Cc6634C0532925a3b844Bc9e7595f0bEb0',
    description: 'Subject of the case (address, user ID, transaction hash)',
  })
  @IsString()
  subject: string;

  @ApiProperty({
    example: 'Potential sanctions list match detected',
    description: 'Case description',
  })
  @IsString()
  description: string;

  @ApiProperty({
    example: 'high',
    description: 'Case severity',
    enum: CaseSeverity,
  })
  @IsEnum(CaseSeverity)
  severity: CaseSeverity;

  @ApiProperty({
    example: ['screening-id-1', 'screening-id-2'],
    description: 'Related screening IDs',
    required: false,
    type: [String],
  })
  @IsOptional()
  @IsArray()
  @IsString({ each: true })
  relatedScreenings?: string[];
}

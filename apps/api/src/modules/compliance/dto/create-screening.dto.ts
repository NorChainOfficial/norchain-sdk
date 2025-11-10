import { ApiProperty } from '@nestjs/swagger';
import { IsEnum, IsString, IsOptional } from 'class-validator';
import { ScreeningType } from '../entities/compliance-screening.entity';

export class CreateScreeningDto {
  @ApiProperty({
    example: 'sanctions',
    description: 'Type of screening',
    enum: ScreeningType,
  })
  @IsEnum(ScreeningType)
  type: ScreeningType;

  @ApiProperty({
    example: '0x742d35Cc6634C0532925a3b844Bc9e7595f0bEb0',
    description: 'Subject to screen (address, email, etc.)',
  })
  @IsString()
  subject: string;

  @ApiProperty({
    example: 'Additional context for screening',
    description: 'Optional notes',
    required: false,
  })
  @IsOptional()
  @IsString()
  notes?: string;
}

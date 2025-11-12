import {
  IsString,
  IsEnum,
  IsOptional,
  IsEmail,
  IsUrl,
  IsArray,
} from 'class-validator';
import { ApiProperty, ApiPropertyOptional } from '@nestjs/swagger';
import { PartnerType, PartnerStatus } from '../entities/travel-rule-partner.entity';

export class CreateTravelRulePartnerDto {
  @ApiProperty({
    description: 'Partner name',
    maxLength: 255,
  })
  @IsString()
  name: string;

  @ApiProperty({
    description: 'Partner type',
    enum: PartnerType,
  })
  @IsEnum(PartnerType)
  type: PartnerType;

  @ApiPropertyOptional({
    description: 'Jurisdiction (ISO country code)',
    example: 'NO',
  })
  @IsOptional()
  @IsString()
  jurisdiction?: string;

  @ApiPropertyOptional({
    description: 'API endpoint for Travel Rule communication',
  })
  @IsOptional()
  @IsUrl()
  apiEndpoint?: string;

  @ApiPropertyOptional({
    description: 'Public key for encrypted communication',
  })
  @IsOptional()
  @IsString()
  publicKey?: string;

  @ApiPropertyOptional({
    description: 'Contact email',
  })
  @IsOptional()
  @IsEmail()
  contactEmail?: string;

  @ApiPropertyOptional({
    description: 'Contact phone',
  })
  @IsOptional()
  @IsString()
  contactPhone?: string;

  @ApiPropertyOptional({
    description: 'Partner status',
    enum: PartnerStatus,
    default: PartnerStatus.PENDING_VERIFICATION,
  })
  @IsOptional()
  @IsEnum(PartnerStatus)
  status?: PartnerStatus;

  @ApiPropertyOptional({
    description: 'Supported protocols (e.g., ["TRP", "IVMS101", "OpenVASP"])',
    type: [String],
  })
  @IsOptional()
  @IsArray()
  @IsString({ each: true })
  supportedProtocols?: string[];

  @ApiPropertyOptional({
    description: 'Additional metadata',
  })
  @IsOptional()
  metadata?: Record<string, any>;
}


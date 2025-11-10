import { ApiProperty } from '@nestjs/swagger';
import {
  IsString,
  IsEnum,
  IsOptional,
  IsObject,
  IsArray,
  MaxLength,
  ArrayMaxSize,
  ValidateNested,
  IsUrl,
  Matches,
} from 'class-validator';
import { Type } from 'class-transformer';
import { AssetType, AttestationMethod } from '../entities/asset-profile.entity';

export class DisplayDto {
  @ApiProperty({ example: 'My Token', maxLength: 64 })
  @IsString()
  @MaxLength(64)
  name: string;

  @ApiProperty({ example: 'MTK', maxLength: 16 })
  @IsString()
  @MaxLength(16)
  @IsOptional()
  symbol?: string;

  @ApiProperty({ example: 'A revolutionary token', maxLength: 160 })
  @IsString()
  @MaxLength(160)
  @IsOptional()
  shortDescription?: string;

  @ApiProperty({ example: 'Full description...', maxLength: 4096 })
  @IsString()
  @MaxLength(4096)
  @IsOptional()
  description?: string;
}

export class MediaDto {
  @ApiProperty({ example: 'https://cdn.example.com/logo.png' })
  @IsUrl()
  @IsOptional()
  logoUrl?: string;

  @ApiProperty({ example: 'https://cdn.example.com/banner.png' })
  @IsUrl()
  @IsOptional()
  bannerUrl?: string;

  @ApiProperty({ example: '#FF5733', pattern: '^#([A-Fa-f0-9]{6})$' })
  @IsString()
  @Matches(/^#([A-Fa-f0-9]{6})$/)
  @IsOptional()
  themeColor?: string;
}

export class LinksDto {
  @ApiProperty({ example: 'https://example.com' })
  @IsUrl()
  @IsOptional()
  website?: string;

  @ApiProperty({ example: 'https://docs.example.com' })
  @IsUrl()
  @IsOptional()
  docs?: string;

  @ApiProperty({ example: 'https://whitepaper.example.com' })
  @IsUrl()
  @IsOptional()
  whitepaper?: string;

  @ApiProperty({ example: 'https://github.com/example' })
  @IsUrl()
  @IsOptional()
  github?: string;

  @ApiProperty({ example: 'https://twitter.com/example' })
  @IsUrl()
  @IsOptional()
  twitter?: string;

  @ApiProperty({ example: 'https://discord.gg/example' })
  @IsUrl()
  @IsOptional()
  discord?: string;

  @ApiProperty({ example: 'https://t.me/example' })
  @IsUrl()
  @IsOptional()
  telegram?: string;
}

export class AttestationDto {
  @ApiProperty({ enum: AttestationMethod })
  @IsEnum(AttestationMethod)
  method: AttestationMethod;

  @ApiProperty({ example: '0x742d35Cc6634C0532925a3b844Bc9e7595f0bEb0' })
  @IsString()
  signer: string;

  @ApiProperty({ example: '0x...' })
  @IsString()
  signature: string;

  @ApiProperty({ example: 'challenge-uuid' })
  @IsString()
  challengeId: string;
}

export class SubmitProfileDto {
  @ApiProperty({ enum: AssetType })
  @IsEnum(AssetType)
  type: AssetType;

  @ApiProperty({ example: '65001' })
  @IsString()
  chainId: string;

  @ApiProperty({ example: '0x742d35Cc6634C0532925a3b844Bc9e7595f0bEb0' })
  @IsString()
  @IsOptional()
  address?: string;

  @ApiProperty({ example: 'my-project' })
  @IsString()
  @IsOptional()
  slug?: string;

  @ApiProperty({ type: DisplayDto })
  @ValidateNested()
  @Type(() => DisplayDto)
  display: DisplayDto;

  @ApiProperty({ type: MediaDto, required: false })
  @ValidateNested()
  @Type(() => MediaDto)
  @IsOptional()
  media?: MediaDto;

  @ApiProperty({ type: LinksDto, required: false })
  @ValidateNested()
  @Type(() => LinksDto)
  @IsOptional()
  links?: LinksDto;

  @ApiProperty({ example: ['defi', 'rwa'], type: [String], maxItems: 20 })
  @IsArray()
  @ArrayMaxSize(20)
  @IsString({ each: true })
  @IsOptional()
  tags?: string[];

  @ApiProperty({ type: AttestationDto })
  @ValidateNested()
  @Type(() => AttestationDto)
  attestation: AttestationDto;
}


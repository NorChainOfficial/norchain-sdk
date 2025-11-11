import { ApiProperty } from '@nestjs/swagger';
import {
  IsString,
  IsUUID,
  IsOptional,
  IsEmail,
  IsEthereumAddress,
  IsEnum,
  MaxLength,
} from 'class-validator';
import { KYCTier } from '../entities/merchant.entity';

export class CreateCustomerDto {
  @ApiProperty({
    example: 'org_123',
    description: 'Organization ID',
  })
  @IsUUID()
  orgId: string;

  @ApiProperty({
    example: '0x742d35Cc6634C0532925a3b844Bc9e7595f0bEb0',
    description: 'Wallet address',
    required: false,
  })
  @IsOptional()
  @IsEthereumAddress()
  address?: string;

  @ApiProperty({
    example: 'customer@example.com',
    description: 'Email address',
    required: false,
  })
  @IsOptional()
  @IsEmail()
  email?: string;

  @ApiProperty({
    example: 'John Doe',
    description: 'Display name',
    required: false,
  })
  @IsOptional()
  @IsString()
  @MaxLength(255)
  displayName?: string;

  @ApiProperty({
    example: KYCTier.TIER_1,
    enum: KYCTier,
    description: 'KYC tier',
    required: false,
  })
  @IsOptional()
  @IsEnum(KYCTier)
  kycTier?: KYCTier;

  @ApiProperty({
    example: { source: 'website' },
    description: 'Additional metadata',
    required: false,
  })
  @IsOptional()
  metadata?: Record<string, any>;
}

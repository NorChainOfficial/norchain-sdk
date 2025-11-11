import { ApiProperty } from '@nestjs/swagger';
import { IsEnum, IsOptional, IsUrl, MaxLength } from 'class-validator';
import { KYCTier, SettlementPreference } from '../entities/merchant.entity';

export class OnboardMerchantDto {
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
    example: SettlementPreference.CRYPTO_ONLY,
    enum: SettlementPreference,
    description: 'Settlement preference',
    required: false,
  })
  @IsOptional()
  @IsEnum(SettlementPreference)
  settlementPreference?: SettlementPreference;

  @ApiProperty({
    example: 'https://merchant.com/webhook',
    description: 'Webhook URL for payment notifications',
    required: false,
  })
  @IsOptional()
  @IsUrl()
  webhookUrl?: string;
}

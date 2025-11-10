import { ApiProperty, ApiPropertyOptional } from '@nestjs/swagger';
import { IsOptional, IsString, IsBoolean } from 'class-validator';

/**
 * DTO for creating a new wallet
 */
export class CreateWalletDto {
  @ApiPropertyOptional({
    description: 'Optional name for the wallet',
    example: 'My Main Wallet',
  })
  @IsOptional()
  @IsString()
  name?: string;

  @ApiPropertyOptional({
    description: 'Optional passphrase for mnemonic encryption',
    example: 'my-secure-passphrase',
  })
  @IsOptional()
  @IsString()
  passphrase?: string;

  @ApiPropertyOptional({
    description: 'Whether to derive the first account immediately',
    default: true,
  })
  @IsOptional()
  @IsBoolean()
  deriveFirstAccount?: boolean;

  @ApiPropertyOptional({
    description: 'Additional metadata to store with the wallet',
    type: 'object',
  })
  @IsOptional()
  metadata?: Record<string, any>;
}

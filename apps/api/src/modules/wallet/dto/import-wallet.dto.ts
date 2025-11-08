import { ApiProperty, ApiPropertyOptional } from '@nestjs/swagger';
import {
  IsString,
  IsOptional,
  IsBoolean,
  Matches,
  MinLength,
} from 'class-validator';

/**
 * DTO for importing an existing wallet
 */
export class ImportWalletDto {
  @ApiProperty({
    description: 'Mnemonic phrase (12 or 24 words) or private key (hex)',
    example: 'abandon abandon abandon abandon abandon abandon abandon abandon abandon abandon abandon about',
  })
  @IsString()
  @MinLength(1)
  mnemonicOrPrivateKey: string;

  @ApiPropertyOptional({
    description: 'Optional name for the wallet',
    example: 'Imported Wallet',
  })
  @IsOptional()
  @IsString()
  name?: string;

  @ApiPropertyOptional({
    description: 'Passphrase if the mnemonic was encrypted with one',
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


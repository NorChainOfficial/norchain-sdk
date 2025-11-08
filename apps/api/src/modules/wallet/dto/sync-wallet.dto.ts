import { ApiPropertyOptional } from '@nestjs/swagger';
import { IsOptional, IsArray, IsString } from 'class-validator';

/**
 * DTO for syncing wallet data
 */
export class SyncWalletDto {
  @ApiPropertyOptional({
    description: 'Specific account addresses to sync (if not provided, syncs all)',
    type: [String],
    example: ['0x742d35Cc6634C0532925a3b844Bc9e7595f0bEb0'],
  })
  @IsOptional()
  @IsArray()
  @IsString({ each: true })
  accountAddresses?: string[];

  @ApiPropertyOptional({
    description: 'Whether to force a full sync (ignore cache)',
    default: false,
  })
  @IsOptional()
  force?: boolean;
}


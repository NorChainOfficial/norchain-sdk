import { ApiPropertyOptional } from '@nestjs/swagger';
import { IsOptional, IsBoolean } from 'class-validator';

/**
 * DTO for getting wallet accounts
 */
export class GetWalletAccountsDto {
  @ApiPropertyOptional({
    description: 'Include inactive accounts',
    default: false,
  })
  @IsOptional()
  @IsBoolean()
  includeInactive?: boolean;
}


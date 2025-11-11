import { ApiProperty } from '@nestjs/swagger';
import {
  IsString,
  IsEnum,
  IsOptional,
  IsUUID,
  MaxLength,
} from 'class-validator';
import { AccountType } from '../entities/ledger-account.entity';

export class CreateAccountDto {
  @ApiProperty({
    example: '1100',
    description: 'Account code (e.g., "1100", "4000")',
  })
  @IsString()
  @MaxLength(50)
  code: string;

  @ApiProperty({
    example: 'User NOR Cash',
    description: 'Account name',
  })
  @IsString()
  @MaxLength(255)
  name: string;

  @ApiProperty({
    example: AccountType.ASSET,
    enum: AccountType,
    description: 'Account type',
  })
  @IsEnum(AccountType)
  type: AccountType;

  @ApiProperty({
    example: 'NOR',
    description: 'Currency code',
    default: 'NOR',
  })
  @IsString()
  @MaxLength(10)
  currency: string;

  @ApiProperty({
    example: 'org_123',
    description: 'Organization ID',
  })
  @IsUUID()
  orgId: string;

  @ApiProperty({
    example: null,
    description: 'Parent account ID (for hierarchical accounts)',
    required: false,
  })
  @IsOptional()
  @IsUUID()
  parentId?: string;
}

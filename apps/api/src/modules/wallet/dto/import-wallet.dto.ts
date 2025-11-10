import { IsString, MinLength, Matches } from 'class-validator';
import { ApiProperty } from '@nestjs/swagger';

export class ImportWalletDto {
  @ApiProperty({
    example: '0x1234567890abcdef1234567890abcdef12345678',
    description: 'Private key to import',
  })
  @IsString()
  @Matches(/^0x[a-fA-F0-9]{64}$/, {
    message: 'Invalid private key format',
  })
  privateKey: string;

  @ApiProperty({
    example: 'My Imported Wallet',
    description: 'Wallet name',
    required: false,
  })
  @IsString()
  name?: string;

  @ApiProperty({
    example: 'SecurePassword123!',
    description: 'Password to encrypt the wallet',
    minLength: 8,
  })
  @IsString()
  @MinLength(8)
  password: string;
}

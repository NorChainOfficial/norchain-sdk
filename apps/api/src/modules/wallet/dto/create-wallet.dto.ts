import { IsOptional, IsString, MinLength } from 'class-validator';
import { ApiProperty } from '@nestjs/swagger';

export class CreateWalletDto {
  @ApiProperty({
    example: 'My Main Wallet',
    description: 'Wallet name',
    required: false,
  })
  @IsOptional()
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

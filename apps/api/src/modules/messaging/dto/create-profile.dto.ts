import { ApiProperty } from '@nestjs/swagger';
import { IsString, IsOptional, IsEthereumAddress, MaxLength, IsUrl } from 'class-validator';

export class CreateProfileDto {
  @ApiProperty({
    example: '0x742d35Cc6634C0532925a3b844Bc9e7595f0bEb0',
    description: 'Wallet address',
  })
  @IsEthereumAddress()
  address: string;

  @ApiProperty({
    example: 'John Doe',
    description: 'Display name',
    required: false,
  })
  @IsOptional()
  @IsString()
  @MaxLength(100)
  displayName?: string;

  @ApiProperty({
    example: 'https://example.com/avatar.png',
    description: 'Avatar URL',
    required: false,
  })
  @IsOptional()
  @IsUrl()
  @MaxLength(500)
  avatarUrl?: string;

  @ApiProperty({
    example: { bio: 'Blockchain enthusiast' },
    description: 'Additional metadata',
    required: false,
  })
  @IsOptional()
  metadata?: Record<string, any>;
}


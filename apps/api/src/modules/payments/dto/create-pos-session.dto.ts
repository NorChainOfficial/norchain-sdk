import { ApiProperty } from '@nestjs/swagger';
import { IsString, IsNumberString, IsOptional, IsObject } from 'class-validator';

export class CreatePOSSessionDto {
  @ApiProperty({
    example: '1000000000000000000',
    description: 'Amount in smallest unit',
  })
  @IsNumberString()
  amount: string;

  @ApiProperty({
    example: 'NOR',
    description: 'Currency',
  })
  @IsString()
  currency: string;

  @ApiProperty({
    example: 'Coffee purchase',
    description: 'Transaction description',
    required: false,
  })
  @IsOptional()
  @IsString()
  description?: string;

  @ApiProperty({
    example: { lat: 59.9139, lng: 10.7522, address: 'Oslo, Norway' },
    description: 'Location metadata',
    required: false,
  })
  @IsOptional()
  @IsObject()
  location?: {
    lat?: number;
    lng?: number;
    address?: string;
  };

  @ApiProperty({
    example: 300,
    description: 'Session expiration in seconds',
    required: false,
  })
  @IsOptional()
  expiresIn?: number; // Seconds until expiration
}


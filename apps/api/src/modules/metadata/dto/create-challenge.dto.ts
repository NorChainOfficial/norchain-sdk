import { ApiProperty } from '@nestjs/swagger';
import { IsString, IsEthereumAddress } from 'class-validator';

export class CreateChallengeDto {
  @ApiProperty({
    example: '65001',
    description: 'Chain ID',
  })
  @IsString()
  chainId: string;

  @ApiProperty({
    example: '0x742d35Cc6634C0532925a3b844Bc9e7595f0bEb0',
    description: 'Token or contract address',
  })
  @IsEthereumAddress()
  address: string;
}

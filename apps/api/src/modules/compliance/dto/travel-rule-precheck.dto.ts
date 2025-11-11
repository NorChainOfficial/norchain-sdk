import { ApiProperty } from '@nestjs/swagger';
import {
  IsString,
  IsEthereumAddress,
  IsOptional,
  IsNumberString,
  MaxLength,
} from 'class-validator';

export class TravelRulePrecheckDto {
  @ApiProperty({
    example: '0x742d35Cc6634C0532925a3b844Bc9e7595f0bEb0',
    description: 'Sender address (VASP)',
  })
  @IsEthereumAddress()
  senderAddress: string;

  @ApiProperty({
    example: '0x742d35Cc6634C0532925a3b844Bc9e7595f0bEb0',
    description: 'Recipient address (VASP)',
  })
  @IsEthereumAddress()
  recipientAddress: string;

  @ApiProperty({
    example: '1000000000000000000',
    description: 'Transaction amount',
  })
  @IsNumberString()
  amount: string;

  @ApiProperty({
    example: 'NOR',
    description: 'Asset symbol',
  })
  @IsString()
  @MaxLength(10)
  asset: string;

  @ApiProperty({
    example: { senderVASP: 'VASP_123', recipientVASP: 'VASP_456' },
    description: 'VASP metadata',
    required: false,
  })
  @IsOptional()
  vaspMetadata?: Record<string, any>;
}

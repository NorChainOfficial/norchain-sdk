import { IsString, IsOptional, Matches, IsNumberString } from 'class-validator';
import { ApiProperty } from '@nestjs/swagger';

export class SendTransactionDto {
  @ApiProperty({
    example: '0x742d35Cc6634C0532925a3b844Bc9e7595f0bEb0',
    description: 'Recipient address',
  })
  @IsString()
  @Matches(/^0x[a-fA-F0-9]{40}$/, {
    message: 'Invalid Ethereum address',
  })
  to: string;

  @ApiProperty({
    example: '0.1',
    description: 'Amount to send in ETH',
  })
  @IsString()
  amount: string;

  @ApiProperty({
    example: 'SecurePassword123!',
    description: 'Wallet password to unlock',
  })
  @IsString()
  password: string;

  @ApiProperty({
    example: '21000',
    description: 'Gas limit',
    required: false,
  })
  @IsOptional()
  @IsNumberString()
  gasLimit?: string;
}


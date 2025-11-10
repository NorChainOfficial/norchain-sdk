import { ApiProperty } from '@nestjs/swagger';
import { IsEnum, IsString, IsEthereumAddress, IsNumberString, IsOptional } from 'class-validator';
import { BridgeChain } from '../entities/bridge-transfer.entity';

export class CreateBridgeTransferDto {
  @ApiProperty({
    example: 'NOR',
    description: 'Source chain',
    enum: BridgeChain,
  })
  @IsEnum(BridgeChain)
  srcChain: BridgeChain;

  @ApiProperty({
    example: 'BSC',
    description: 'Destination chain',
    enum: BridgeChain,
  })
  @IsEnum(BridgeChain)
  dstChain: BridgeChain;

  @ApiProperty({
    example: 'BTCBR',
    description: 'Asset to bridge (e.g., BTCBR, ETHBR, NOR)',
  })
  @IsString()
  asset: string;

  @ApiProperty({
    example: '1000000000000000000',
    description: 'Amount in smallest unit (Wei for tokens)',
  })
  @IsNumberString()
  amount: string;

  @ApiProperty({
    example: '0x742d35Cc6634C0532925a3b844Bc9e7595f0bEb0',
    description: 'Recipient address on destination chain',
  })
  @IsEthereumAddress()
  toAddress: string;

  @ApiProperty({
    example: 'optional-idempotency-key',
    description: 'Idempotency key for safe retries',
    required: false,
  })
  @IsOptional()
  @IsString()
  idempotencyKey?: string;
}


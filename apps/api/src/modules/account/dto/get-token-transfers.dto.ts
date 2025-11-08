import { IsEthereumAddress, IsOptional, IsInt, Min } from 'class-validator';
import { Type } from 'class-transformer';
import { ApiProperty } from '@nestjs/swagger';
import { PaginationDto } from '@/common/interfaces/pagination.interface';

export class GetTokenTransfersDto extends PaginationDto {
  @ApiProperty({ example: '0x742d35Cc6634C0532925a3b844Bc9e7595f0bEb0' })
  @IsEthereumAddress()
  address: string;

  @ApiProperty({
    required: false,
    example: '0xA0b86991c6218b36c1d19D4a2e9Eb0cE3606eB48',
  })
  @IsOptional()
  @IsEthereumAddress()
  contractaddress?: string;

  @ApiProperty({ required: false, example: 0 })
  @IsOptional()
  @Type(() => Number)
  @IsInt()
  @Min(0)
  startblock?: number;

  @ApiProperty({ required: false, example: 99999999 })
  @IsOptional()
  @Type(() => Number)
  @IsInt()
  @Min(0)
  endblock?: number;
}

import { IsEthereumAddress, IsArray, ArrayMinSize, ArrayMaxSize } from 'class-validator';
import { ApiProperty } from '@nestjs/swagger';
import { Transform } from 'class-transformer';

export class GetBalanceMultiDto {
  @ApiProperty({
    example: ['0x742d35Cc6634C0532925a3b844Bc9e7595f0bEb0', '0x8ba1f109551bD432803012645Hac136c22C9299'],
    description: 'Array of addresses (max 20)',
  })
  @Transform(({ value }) => {
    if (typeof value === 'string') {
      return value.split(',').map((addr: string) => addr.trim());
    }
    return value;
  })
  @IsArray()
  @ArrayMinSize(1)
  @ArrayMaxSize(20)
  @IsEthereumAddress({ each: true })
  address: string[];
}


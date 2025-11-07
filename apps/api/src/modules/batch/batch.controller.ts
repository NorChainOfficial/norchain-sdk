import { Controller, Post, Body } from '@nestjs/common';
import { ApiTags, ApiOperation, ApiResponse } from '@nestjs/swagger';
import { BatchService } from './batch.service';
import { Public } from '@/common/decorators/public.decorator';
import { IsArray, IsEthereumAddress, ArrayMaxSize, ValidateNested } from 'class-validator';
import { Type } from 'class-transformer';

class TokenBalanceRequest {
  @IsEthereumAddress()
  address: string;

  @IsEthereumAddress()
  tokenAddress: string;
}

class BatchBalancesDto {
  @IsArray()
  @ArrayMaxSize(100)
  @IsEthereumAddress({ each: true })
  addresses: string[];
}

class BatchTransactionCountsDto {
  @IsArray()
  @ArrayMaxSize(50)
  @IsEthereumAddress({ each: true })
  addresses: string[];
}

class BatchTokenBalancesDto {
  @IsArray()
  @ArrayMaxSize(50)
  @ValidateNested({ each: true })
  @Type(() => TokenBalanceRequest)
  requests: TokenBalanceRequest[];
}

class BatchBlocksDto {
  @IsArray()
  @ArrayMaxSize(20)
  blockNumbers: number[];
}

@ApiTags('Batch')
@Controller('batch')
export class BatchController {
  constructor(private readonly batchService: BatchService) {}

  @Public()
  @Post('balances')
  @ApiOperation({ summary: 'Get balances for multiple addresses (max 100)' })
  @ApiResponse({ status: 200, description: 'Balances retrieved successfully' })
  async getBalancesBatch(@Body() dto: BatchBalancesDto) {
    return this.batchService.getBalancesBatch(dto.addresses);
  }

  @Public()
  @Post('transaction-counts')
  @ApiOperation({ summary: 'Get transaction counts for multiple addresses (max 50)' })
  @ApiResponse({ status: 200, description: 'Transaction counts retrieved successfully' })
  async getTransactionCountsBatch(@Body() dto: BatchTransactionCountsDto) {
    return this.batchService.getTransactionCountsBatch(dto.addresses);
  }

  @Public()
  @Post('token-balances')
  @ApiOperation({ summary: 'Get token balances for multiple address-token pairs (max 50)' })
  @ApiResponse({ status: 200, description: 'Token balances retrieved successfully' })
  async getTokenBalancesBatch(@Body() dto: BatchTokenBalancesDto) {
    return this.batchService.getTokenBalancesBatch(dto.requests);
  }

  @Public()
  @Post('blocks')
  @ApiOperation({ summary: 'Get block information for multiple blocks (max 20)' })
  @ApiResponse({ status: 200, description: 'Blocks retrieved successfully' })
  async getBlocksBatch(@Body() dto: BatchBlocksDto) {
    return this.batchService.getBlocksBatch(dto.blockNumbers);
  }
}


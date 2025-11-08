import { Controller, Get, Query, Param } from '@nestjs/common';
import { ApiTags, ApiOperation, ApiResponse } from '@nestjs/swagger';
import { BlockchainService } from './blockchain.service';
import { Public } from '@/common/decorators/public.decorator';

@ApiTags('Blockchain')
@Controller('blockchain')
export class BlockchainController {
  constructor(private readonly blockchainService: BlockchainService) {}

  @Public()
  @Get('state-root/:blockNumber')
  @ApiOperation({ summary: 'Get state root for a block' })
  @ApiResponse({
    status: 200,
    description: 'State root retrieved successfully',
  })
  async getStateRoot(@Param('blockNumber') blockNumber: string) {
    return this.blockchainService.getStateRoot(blockNumber);
  }

  @Public()
  @Get('validators')
  @ApiOperation({ summary: 'Get validator set information' })
  @ApiResponse({
    status: 200,
    description: 'Validators retrieved successfully',
  })
  async getValidators() {
    return this.blockchainService.getValidators();
  }

  @Public()
  @Get('consensus/info')
  @ApiOperation({ summary: 'Get consensus information' })
  @ApiResponse({
    status: 200,
    description: 'Consensus info retrieved successfully',
  })
  async getConsensusInfo() {
    return this.blockchainService.getConsensusInfo();
  }
}

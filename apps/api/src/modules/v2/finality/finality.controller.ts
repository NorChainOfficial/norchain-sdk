import { Controller, Get, Param } from '@nestjs/common';
import { ApiTags, ApiOperation, ApiResponse, ApiParam } from '@nestjs/swagger';
import { RPCExtensionsService } from '../../rpc/rpc-extensions.service';
import { Public } from '@/common/decorators/public.decorator';
import { ErrorResponseDto } from '@/common/dto/error-response.dto';

@ApiTags('V2 - Finality')
@Controller('v2/finality')
@Public()
export class FinalityController {
  constructor(private readonly rpcExtensionsService: RPCExtensionsService) {}

  @Get('tx/:hash')
  @ApiOperation({ summary: 'Get finality status for a transaction' })
  @ApiParam({ name: 'hash', description: 'Transaction hash' })
  @ApiResponse({
    status: 200,
    description: 'Finality status retrieved successfully',
  })
  @ApiResponse({
    status: 404,
    description: 'Transaction not found',
    type: ErrorResponseDto,
  })
  async getTxFinality(@Param('hash') hash: string) {
    return this.rpcExtensionsService.getFinality(hash);
  }

  @Get('block/:number')
  @ApiOperation({ summary: 'Get finality status for a block' })
  @ApiParam({ name: 'number', description: 'Block number' })
  @ApiResponse({
    status: 200,
    description: 'Finality status retrieved successfully',
  })
  async getBlockFinality(@Param('number') blockNumber: string) {
    return this.rpcExtensionsService.getFinality(parseInt(blockNumber, 10));
  }
}


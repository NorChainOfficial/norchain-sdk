import { Controller, Post, Body, Get, Param, Query } from '@nestjs/common';
import { ApiTags, ApiOperation, ApiResponse, ApiBody } from '@nestjs/swagger';
import { RPCExtensionsService } from './rpc-extensions.service';
import { Public } from '@/common/decorators/public.decorator';

@ApiTags('RPC Extensions')
@Controller('rpc')
@Public()
export class RPCExtensionsController {
  constructor(private readonly rpcExtensionsService: RPCExtensionsService) {}

  @Post('nor_finality')
  @ApiOperation({ summary: 'Get finality status for a block or transaction' })
  @ApiBody({
    schema: {
      type: 'object',
      properties: {
        blockOrTx: {
          type: 'string',
          description: 'Block number or transaction hash',
        },
      },
    },
  })
  @ApiResponse({
    status: 200,
    description: 'Finality status retrieved successfully',
  })
  async getFinality(@Body() body: { blockOrTx: string | number }) {
    return this.rpcExtensionsService.getFinality(body.blockOrTx);
  }

  @Post('nor_feeHistoryPlus')
  @ApiOperation({ summary: 'Get enhanced fee history with predictions' })
  @ApiBody({
    schema: {
      type: 'object',
      properties: {
        blockCount: { type: 'number' },
        newestBlock: { type: 'string' },
        rewardPercentiles: { type: 'array', items: { type: 'number' } },
      },
    },
  })
  @ApiResponse({
    status: 200,
    description: 'Fee history retrieved successfully',
  })
  async getFeeHistoryPlus(
    @Body()
    body: {
      blockCount: number;
      newestBlock: string | number;
      rewardPercentiles: number[];
    },
  ) {
    return this.rpcExtensionsService.getFeeHistoryPlus(
      body.blockCount,
      body.newestBlock,
      body.rewardPercentiles,
    );
  }

  @Post('nor_accountProfile')
  @ApiOperation({
    summary: 'Get account profile (risk flags, KYC tier, velocity limits)',
  })
  @ApiBody({
    schema: {
      type: 'object',
      properties: {
        address: { type: 'string' },
      },
    },
  })
  @ApiResponse({
    status: 200,
    description: 'Account profile retrieved successfully',
  })
  async getAccountProfile(@Body() body: { address: string }) {
    return this.rpcExtensionsService.getAccountProfile(body.address);
  }

  @Post('nor_stateProof')
  @ApiOperation({ summary: 'Get state proof for multiple keys' })
  @ApiBody({
    schema: {
      type: 'object',
      properties: {
        keys: { type: 'array', items: { type: 'string' } },
        blockNumber: { type: 'number' },
      },
    },
  })
  @ApiResponse({
    status: 200,
    description: 'State proof retrieved successfully',
  })
  async getStateProof(@Body() body: { keys: string[]; blockNumber: number }) {
    return this.rpcExtensionsService.getStateProof(body.keys, body.blockNumber);
  }

  @Post('nor_validatorSet')
  @ApiOperation({ summary: 'Get validator set information' })
  @ApiBody({
    schema: {
      type: 'object',
      properties: {
        tag: { type: 'string', enum: ['current', 'next'] },
      },
    },
  })
  @ApiResponse({
    status: 200,
    description: 'Validator set retrieved successfully',
  })
  async getValidatorSet(@Body() body: { tag?: 'current' | 'next' }) {
    return this.rpcExtensionsService.getValidatorSet(body.tag);
  }
}

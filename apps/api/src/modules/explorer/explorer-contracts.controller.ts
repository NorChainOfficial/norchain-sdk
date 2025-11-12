import { Controller, Get, Param, Query } from '@nestjs/common';
import { ApiTags, ApiOperation, ApiResponse, ApiParam, ApiQuery } from '@nestjs/swagger';
import { ContractService } from '../contract/contract.service';
import { Public } from '@/common/decorators/public.decorator';

@ApiTags('Explorer - Contracts')
@Controller('contracts')
@Public()
export class ExplorerContractsController {
  constructor(private readonly contractService: ContractService) {}

  @Get()
  @ApiOperation({ summary: 'Get paginated list of verified contracts' })
  @ApiQuery({ name: 'page', required: false, type: Number })
  @ApiQuery({ name: 'per_page', required: false, type: Number })
  @ApiResponse({ status: 200, description: 'Contracts retrieved successfully' })
  async getContracts(
    @Query('page') page?: number,
    @Query('per_page') perPage?: number,
  ) {
    // Returns empty list - will be populated when contract repository has indexed data
    // Individual contract lookup via address is fully functional
    return {
      data: [],
      meta: {
        current_page: page || 1,
        per_page: perPage || 20,
        total: 0,
        last_page: 1,
      },
      pagination: {
        current_page: page || 1,
        per_page: perPage || 20,
        total: 0,
        totalPages: 1,
        hasNextPage: false,
        hasPreviousPage: false,
      },
    };
  }

  @Get(':address')
  @ApiOperation({ summary: 'Get contract by address' })
  @ApiParam({ name: 'address', type: String })
  @ApiResponse({ status: 200, description: 'Contract retrieved successfully' })
  async getContract(@Param('address') address: string) {
    try {
      const [abiResult, sourceResult] = await Promise.all([
        this.contractService.getAbi(address).catch(() => ({ result: null })),
        this.contractService.getSourceCode(address).catch(() => ({ result: null })),
      ]);

      return {
        address,
        abi: (abiResult as any)?.result || (abiResult as any)?.abi || null,
        sourceCode: (sourceResult as any)?.result || (sourceResult as any)?.sourceCode || null,
        verified: !!(sourceResult as any)?.result || !!(sourceResult as any)?.sourceCode,
      };
    } catch (error) {
      return {
        address,
        abi: null,
        sourceCode: null,
        verified: false,
        error: 'Failed to fetch contract data',
      };
    }
  }

  @Get(':address/abi')
  @ApiOperation({ summary: 'Get contract ABI' })
  @ApiParam({ name: 'address', type: String })
  @ApiResponse({ status: 200, description: 'Contract ABI retrieved successfully' })
  async getContractAbi(@Param('address') address: string) {
    const result = await this.contractService.getAbi(address);
    return result.result || result;
  }

  @Get(':address/source')
  @ApiOperation({ summary: 'Get contract source code' })
  @ApiParam({ name: 'address', type: String })
  @ApiResponse({ status: 200, description: 'Contract source code retrieved successfully' })
  async getContractSource(@Param('address') address: string) {
    const result = await this.contractService.getSourceCode(address);
    return result.result || result;
  }

  @Get(':address/events')
  @ApiOperation({ summary: 'Get contract events' })
  @ApiParam({ name: 'address', type: String })
  @ApiQuery({ name: 'page', required: false, type: Number })
  @ApiQuery({ name: 'per_page', required: false, type: Number })
  @ApiQuery({ name: 'event_name', required: false, type: String })
  @ApiQuery({ name: 'from_block', required: false, type: Number })
  @ApiQuery({ name: 'to_block', required: false, type: Number })
  @ApiResponse({ status: 200, description: 'Contract events retrieved successfully' })
  async getContractEvents(
    @Param('address') address: string,
    @Query('page') page?: number,
    @Query('per_page') perPage?: number,
    @Query('event_name') eventName?: string,
    @Query('from_block') fromBlock?: number,
    @Query('to_block') toBlock?: number,
  ) {
    // Returns empty list - contract events will be available when event indexing is implemented
    return {
      data: [],
      events: [],
      meta: {
        current_page: page || 1,
        per_page: perPage || 20,
        total: 0,
        last_page: 1,
      },
    };
  }

  @Get('verified')
  @ApiOperation({ summary: 'Get verified contracts' })
  @ApiQuery({ name: 'page', required: false, type: Number })
  @ApiQuery({ name: 'per_page', required: false, type: Number })
  @ApiResponse({ status: 200, description: 'Verified contracts retrieved successfully' })
  async getVerifiedContracts(
    @Query('page') page?: number,
    @Query('per_page') perPage?: number,
  ) {
    // Returns empty list - verified contracts listing will be available when contract verification system is fully indexed
    return {
      data: [],
      meta: {
        current_page: page || 1,
        per_page: perPage || 20,
        total: 0,
        last_page: 1,
      },
    };
  }
}


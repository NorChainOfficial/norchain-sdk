import { Controller, Get, Param, Query } from '@nestjs/common';
import { ApiTags, ApiOperation, ApiResponse, ApiParam, ApiQuery } from '@nestjs/swagger';
import { TokenService } from '../token/token.service';
import { Public } from '@/common/decorators/public.decorator';

@ApiTags('Explorer - Tokens')
@Controller('tokens')
@Public()
export class ExplorerTokensController {
  constructor(private readonly tokenService: TokenService) {}

  @Get()
  @ApiOperation({ summary: 'Get paginated list of tokens' })
  @ApiQuery({ name: 'page', required: false, type: Number })
  @ApiQuery({ name: 'per_page', required: false, type: Number })
  @ApiResponse({ status: 200, description: 'Tokens retrieved successfully' })
  async getTokens(
    @Query('page') page?: number,
    @Query('per_page') perPage?: number,
  ) {
    // TODO: Implement token listing when token repository has data
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
  @ApiOperation({ summary: 'Get token by contract address' })
  @ApiParam({ name: 'address', type: String })
  @ApiResponse({ status: 200, description: 'Token retrieved successfully' })
  async getToken(@Param('address') address: string) {
    try {
      const [infoResult, supplyResult] = await Promise.all([
        this.tokenService.getTokenInfo(address).catch(() => ({ result: null })),
        this.tokenService.getTokenSupply(address).catch(() => ({ result: null })),
      ]);

      return {
        address,
        ...((infoResult as any)?.result || (infoResult as any) || {}),
        totalSupply: (supplyResult as any)?.result || (supplyResult as any)?.supply || '0',
      };
    } catch (error) {
      return {
        address,
        error: 'Failed to fetch token data',
      };
    }
  }

  @Get(':address/holders')
  @ApiOperation({ summary: 'Get token holders' })
  @ApiParam({ name: 'address', type: String })
  @ApiQuery({ name: 'page', required: false, type: Number })
  @ApiQuery({ name: 'per_page', required: false, type: Number })
  @ApiResponse({ status: 200, description: 'Token holders retrieved successfully' })
  async getTokenHolders(
    @Param('address') address: string,
    @Query('page') page?: number,
    @Query('per_page') perPage?: number,
  ) {
    // TODO: Implement token holders listing
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

  @Get(':address/transfers')
  @ApiOperation({ summary: 'Get token transfers' })
  @ApiParam({ name: 'address', type: String })
  @ApiQuery({ name: 'page', required: false, type: Number })
  @ApiQuery({ name: 'per_page', required: false, type: Number })
  @ApiResponse({ status: 200, description: 'Token transfers retrieved successfully' })
  async getTokenTransfers(
    @Param('address') address: string,
    @Query('page') page?: number,
    @Query('per_page') perPage?: number,
  ) {
    // TODO: Implement token transfers listing
    return {
      data: [],
      transfers: [],
      meta: {
        current_page: page || 1,
        per_page: perPage || 20,
        total: 0,
        last_page: 1,
      },
    };
  }
}


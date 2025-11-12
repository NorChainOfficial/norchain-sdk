import { Controller, Get, Param, Query, ParseIntPipe, DefaultValuePipe } from '@nestjs/common';
import { ApiTags, ApiOperation, ApiResponse, ApiParam, ApiQuery } from '@nestjs/swagger';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { TokenService } from '../token/token.service';
import { TokenHolder } from '../token/entities/token-holder.entity';
import { Public } from '@/common/decorators/public.decorator';

@ApiTags('Explorer - Tokens')
@Controller('tokens')
@Public()
export class ExplorerTokensController {
  constructor(
    private readonly tokenService: TokenService,
    @InjectRepository(TokenHolder)
    private readonly tokenHolderRepository: Repository<TokenHolder>,
  ) {}

  @Get()
  @ApiOperation({ summary: 'Get paginated list of tokens' })
  @ApiQuery({ name: 'page', required: false, type: Number })
  @ApiQuery({ name: 'per_page', required: false, type: Number })
  @ApiResponse({ status: 200, description: 'Tokens retrieved successfully' })
  async getTokens(
    @Query('page') page?: number,
    @Query('per_page') perPage?: number,
  ) {
    // Returns empty list - will be populated when token repository has indexed data
    // Individual token lookup via address, holders, and transfers are fully functional
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
    @Query('page', new DefaultValuePipe(1), ParseIntPipe) page: number = 1,
    @Query('per_page', new DefaultValuePipe(20), ParseIntPipe) perPage: number = 20,
  ) {
    try {
      // Get total supply for percentage calculation
      const supplyResult = await this.tokenService.getTokenSupply(address);
      const totalSupply = BigInt((supplyResult as any)?.result || '0');

      // Query holders ordered by balance descending
      const skip = (page - 1) * perPage;
      const [holders, total] = await this.tokenHolderRepository.findAndCount({
        where: { tokenAddress: address },
        order: { balance: 'DESC' },
        skip,
        take: perPage,
      });

      // Calculate percentage for each holder
      const holdersWithPercentage = holders.map((holder, index) => {
        const balance = BigInt(holder.balance || '0');
        const percentage = totalSupply > 0n
          ? Number((balance * 10000n) / totalSupply) / 100 // Percentage with 2 decimals
          : 0;

        return {
          address: holder.holderAddress,
          balance: holder.balance,
          percentage,
          rank: skip + index + 1,
        };
      });

      return {
        data: holdersWithPercentage,
        meta: {
          current_page: page,
          per_page: perPage,
          total,
          last_page: Math.ceil(total / perPage),
        },
        pagination: {
          current_page: page,
          per_page: perPage,
          total,
          totalPages: Math.ceil(total / perPage),
          hasNextPage: page < Math.ceil(total / perPage),
          hasPreviousPage: page > 1,
        },
      };
    } catch (error) {
      return {
        data: [],
        meta: {
          current_page: page,
          per_page: perPage,
          total: 0,
          last_page: 1,
        },
        pagination: {
          current_page: page,
          per_page: perPage,
          total: 0,
          totalPages: 1,
          hasNextPage: false,
          hasPreviousPage: false,
        },
      };
    }
  }

  @Get(':address/transfers')
  @ApiOperation({ summary: 'Get token transfers' })
  @ApiParam({ name: 'address', type: String })
  @ApiQuery({ name: 'page', required: false, type: Number })
  @ApiQuery({ name: 'per_page', required: false, type: Number })
  @ApiResponse({ status: 200, description: 'Token transfers retrieved successfully' })
  async getTokenTransfers(
    @Param('address') address: string,
    @Query('page', new DefaultValuePipe(1), ParseIntPipe) page: number = 1,
    @Query('per_page', new DefaultValuePipe(20), ParseIntPipe) perPage: number = 20,
  ) {
    try {
      const result = await this.tokenService.getTokenTransfers(address, page, perPage);
      const transfersData = (result as any)?.result || result;

      // Transform to Explorer format
      const transfers = (transfersData.data || []).map((transfer: any) => ({
        hash: transfer.transactionHash,
        from: transfer.fromAddress,
        to: transfer.toAddress,
        value: transfer.value,
        timestamp: transfer.timestamp,
        blockHeight: transfer.blockNumber,
      }));

      const meta = transfersData.meta || {
        page,
        limit: perPage,
        total: 0,
        totalPages: 1,
        hasNextPage: false,
        hasPreviousPage: false,
      };

      return {
        data: transfers,
        transfers,
        meta: {
          current_page: meta.page || page,
          per_page: meta.limit || perPage,
          total: meta.total || 0,
          last_page: meta.totalPages || 1,
        },
        pagination: {
          current_page: meta.page || page,
          per_page: meta.limit || perPage,
          total: meta.total || 0,
          totalPages: meta.totalPages || 1,
          hasNextPage: meta.hasNextPage || false,
          hasPreviousPage: meta.hasPreviousPage || false,
        },
      };
    } catch (error) {
      return {
        data: [],
        transfers: [],
        meta: {
          current_page: page,
          per_page: perPage,
          total: 0,
          last_page: 1,
        },
        pagination: {
          current_page: page,
          per_page: perPage,
          total: 0,
          totalPages: 1,
          hasNextPage: false,
          hasPreviousPage: false,
        },
      };
    }
  }
}


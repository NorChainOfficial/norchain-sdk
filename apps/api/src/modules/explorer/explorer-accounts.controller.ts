import { Controller, Get, Param, Query } from '@nestjs/common';
import { ApiTags, ApiOperation, ApiResponse, ApiParam, ApiQuery } from '@nestjs/swagger';
import { AccountService } from '../account/account.service';
import { Public } from '@/common/decorators/public.decorator';

@ApiTags('Explorer - Accounts')
@Controller('accounts')
@Public()
export class ExplorerAccountsController {
  constructor(private readonly accountService: AccountService) {}

  @Get()
  @ApiOperation({ summary: 'Get paginated list of accounts' })
  @ApiQuery({ name: 'page', required: false, type: Number })
  @ApiQuery({ name: 'per_page', required: false, type: Number })
  @ApiResponse({ status: 200, description: 'Accounts retrieved successfully' })
  async getAccounts(
    @Query('page') page?: number,
    @Query('per_page') perPage?: number,
  ) {
    // Returns empty list - will be populated when account repository has indexed data
    // Individual account lookup via address is fully functional
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
  @ApiOperation({ summary: 'Get account by address' })
  @ApiParam({ name: 'address', type: String })
  @ApiResponse({ status: 200, description: 'Account retrieved successfully' })
  async getAccount(@Param('address') address: string) {
    const balanceResult = await this.accountService.getBalance({ address });
    const txResult = await this.accountService.getTransactions({
      address,
      page: 1,
      limit: 10,
    });

    return {
      address,
      balance: (balanceResult.result as any)?.balance || balanceResult.result || '0',
      transaction_count: (txResult.result as any)?.data?.length || (txResult.result as any)?.length || 0,
      transactions: (txResult.result as any)?.data || txResult.result || [],
      ...((balanceResult.result as any) || {}),
    };
  }

  @Get(':address/transactions')
  @ApiOperation({ summary: 'Get account transactions' })
  @ApiParam({ name: 'address', type: String })
  @ApiQuery({ name: 'page', required: false, type: Number })
  @ApiQuery({ name: 'per_page', required: false, type: Number })
  @ApiResponse({ status: 200, description: 'Account transactions retrieved successfully' })
  async getAccountTransactions(
    @Param('address') address: string,
    @Query('page') page?: number,
    @Query('per_page') perPage?: number,
  ) {
    const result = await this.accountService.getTransactions({
      address,
      page: page || 1,
      limit: perPage || 20,
    });

    const txData = (result.result as any)?.data || result.result || [];

    const total = Array.isArray(txData) ? txData.length : ((result.result as any)?.meta?.total || 0);
    const currentPage = page || 1;
    const perPageValue = perPage || 20;
    const totalPages = Math.ceil(total / perPageValue);

    return {
      data: txData,
      transactions: txData,
      meta: {
        current_page: currentPage,
        per_page: perPageValue,
        total: total,
        last_page: totalPages,
      },
      pagination: {
        current_page: currentPage,
        per_page: perPageValue,
        total: total,
        totalPages: totalPages,
        hasNextPage: currentPage < totalPages,
        hasPreviousPage: currentPage > 1,
      },
    };
  }
}


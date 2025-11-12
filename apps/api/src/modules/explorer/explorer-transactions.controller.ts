import { Controller, Get, Param, Query } from '@nestjs/common';
import { ApiTags, ApiOperation, ApiResponse, ApiParam, ApiQuery } from '@nestjs/swagger';
import { TransactionService } from '../transaction/transaction.service';
import { AccountService } from '../account/account.service';
import { Public } from '@/common/decorators/public.decorator';

@ApiTags('Explorer - Transactions')
@Controller('transactions')
@Public()
export class ExplorerTransactionsController {
  constructor(
    private readonly transactionService: TransactionService,
    private readonly accountService: AccountService,
  ) {}

  @Get()
  @ApiOperation({ summary: 'Get paginated list of transactions' })
  @ApiQuery({ name: 'page', required: false, type: Number })
  @ApiQuery({ name: 'limit', required: false, type: Number })
  @ApiQuery({ name: 'per_page', required: false, type: Number })
  @ApiQuery({ name: 'block_height', required: false, type: Number })
  @ApiResponse({ status: 200, description: 'Transactions retrieved successfully' })
  async getTransactions(
    @Query('page') page?: number,
    @Query('limit') limit?: number,
    @Query('per_page') perPage?: number,
    @Query('block_height') blockHeight?: number,
  ) {
    // Use account service to get transactions
    // TODO: Implement proper transaction listing when transaction repository has data
    const itemsPerPage = limit || perPage || 20;
    
    return {
      transactions: [],
      data: [],
      meta: {
        current_page: page || 1,
        per_page: itemsPerPage,
        total: 0,
        last_page: 1,
      },
      pagination: {
        current_page: page || 1,
        per_page: itemsPerPage,
        total: 0,
        totalPages: 1,
        hasNextPage: false,
        hasPreviousPage: false,
      },
    };
  }

  @Get(':hash')
  @ApiOperation({ summary: 'Get transaction by hash' })
  @ApiParam({ name: 'hash', type: String, description: 'Transaction hash' })
  @ApiResponse({ status: 200, description: 'Transaction retrieved successfully' })
  async getTransaction(@Param('hash') hash: string) {
    const result = await this.transactionService.getTransaction(hash);
    return result.result || result;
  }

  @Get(':hash/events')
  @ApiOperation({ summary: 'Get transaction events' })
  @ApiParam({ name: 'hash', type: String })
  @ApiResponse({ status: 200, description: 'Transaction events retrieved successfully' })
  async getTransactionEvents(@Param('hash') hash: string) {
    // TODO: Implement transaction events when available
    return {
      data: [],
      events: [],
    };
  }
}


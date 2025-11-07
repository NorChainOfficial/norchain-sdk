import { Controller, Get, Query, UseGuards } from '@nestjs/common';
import { ApiTags, ApiOperation, ApiResponse, ApiBearerAuth } from '@nestjs/swagger';
import { AccountService } from './account.service';
import { GetBalanceDto } from './dto/get-balance.dto';
import { GetTransactionsDto } from './dto/get-transactions.dto';
import { GetTokenListDto } from './dto/get-token-list.dto';
import { GetTokenTransfersDto } from './dto/get-token-transfers.dto';
import { GetBalanceMultiDto } from './dto/get-balance-multi.dto';
import { GetInternalTransactionsDto } from './dto/get-internal-transactions.dto';
import { JwtAuthGuard } from '@/common/guards/jwt-auth.guard';
import { Public } from '@/common/decorators/public.decorator';

@ApiTags('Account')
@Controller('account')
export class AccountController {
  constructor(private readonly accountService: AccountService) {}

  @Public()
  @Get('balance')
  @ApiOperation({ summary: 'Get account balance' })
  @ApiResponse({ status: 200, description: 'Balance retrieved successfully' })
  async getBalance(@Query() dto: GetBalanceDto) {
    return this.accountService.getBalance(dto);
  }

  @Public()
  @Get('txlist')
  @ApiOperation({ summary: 'Get transaction list for an address' })
  @ApiResponse({ status: 200, description: 'Transactions retrieved successfully' })
  async getTransactions(@Query() dto: GetTransactionsDto) {
    return this.accountService.getTransactions(dto);
  }

  @Public()
  @Get('tokenlist')
  @ApiOperation({ summary: 'Get list of tokens held by an address' })
  @ApiResponse({ status: 200, description: 'Token list retrieved successfully' })
  async getTokenList(@Query() dto: GetTokenListDto) {
    return this.accountService.getTokenList(dto);
  }

  @Public()
  @Get('tokentx')
  @ApiOperation({ summary: 'Get token transfers for an address' })
  @ApiResponse({ status: 200, description: 'Token transfers retrieved successfully' })
  async getTokenTransfers(@Query() dto: GetTokenTransfersDto) {
    return this.accountService.getTokenTransfers(dto);
  }

  @Public()
  @Get('balancemulti')
  @ApiOperation({ summary: 'Get balance for multiple addresses (max 20)' })
  @ApiResponse({ status: 200, description: 'Balances retrieved successfully' })
  async getBalanceMulti(@Query() dto: GetBalanceMultiDto) {
    return this.accountService.getBalanceMulti(dto);
  }

  @Public()
  @Get('txlistinternal')
  @ApiOperation({ summary: 'Get internal transactions for an address' })
  @ApiResponse({ status: 200, description: 'Internal transactions retrieved successfully' })
  async getInternalTransactions(@Query() dto: GetInternalTransactionsDto) {
    return this.accountService.getInternalTransactions(dto);
  }

  @UseGuards(JwtAuthGuard)
  @Get('summary')
  @ApiBearerAuth('JWT-auth')
  @ApiOperation({ summary: 'Get account summary (requires authentication)' })
  async getAccountSummary(@Query('address') address: string) {
    return this.accountService.getAccountSummary(address);
  }
}


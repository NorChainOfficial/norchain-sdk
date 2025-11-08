import { Controller, Get, Post, Query, Body } from '@nestjs/common';
import { ApiTags, ApiOperation, ApiResponse } from '@nestjs/swagger';
import { ProxyService } from './proxy.service';
import { Public } from '@/common/decorators/public.decorator';

@ApiTags('Proxy')
@Controller('proxy')
export class ProxyController {
  constructor(private readonly proxyService: ProxyService) {}

  @Public()
  @Get('eth_blockNumber')
  @ApiOperation({ summary: 'Returns the number of the most recent block' })
  @ApiResponse({
    status: 200,
    description: 'Block number retrieved successfully',
  })
  async eth_blockNumber() {
    return this.proxyService.eth_blockNumber();
  }

  @Public()
  @Get('eth_getBalance')
  @ApiOperation({ summary: 'Returns the balance of an account' })
  @ApiResponse({ status: 200, description: 'Balance retrieved successfully' })
  async eth_getBalance(
    @Query('address') address: string,
    @Query('tag') tag: string = 'latest',
  ) {
    return this.proxyService.eth_getBalance(address, tag);
  }

  @Public()
  @Get('eth_getBlockByNumber')
  @ApiOperation({
    summary: 'Returns information about a block by block number',
  })
  @ApiResponse({ status: 200, description: 'Block retrieved successfully' })
  async eth_getBlockByNumber(
    @Query('tag') tag: string,
    @Query('full') full: boolean = false,
  ) {
    return this.proxyService.eth_getBlockByNumber(tag, full);
  }

  @Public()
  @Get('eth_getTransactionByHash')
  @ApiOperation({ summary: 'Returns transaction information by hash' })
  @ApiResponse({
    status: 200,
    description: 'Transaction retrieved successfully',
  })
  async eth_getTransactionByHash(@Query('txhash') txhash: string) {
    return this.proxyService.eth_getTransactionByHash(txhash);
  }

  @Public()
  @Get('eth_getTransactionReceipt')
  @ApiOperation({ summary: 'Returns transaction receipt by hash' })
  @ApiResponse({
    status: 200,
    description: 'Transaction receipt retrieved successfully',
  })
  async eth_getTransactionReceipt(@Query('txhash') txhash: string) {
    return this.proxyService.eth_getTransactionReceipt(txhash);
  }

  @Public()
  @Post('eth_call')
  @ApiOperation({
    summary: 'Executes a new message call without creating a transaction',
  })
  @ApiResponse({ status: 200, description: 'Call executed successfully' })
  async eth_call(
    @Body('transaction') transaction: any,
    @Body('tag') tag?: string,
  ) {
    return this.proxyService.eth_call(transaction, tag);
  }

  @Public()
  @Post('eth_estimateGas')
  @ApiOperation({ summary: 'Estimates gas for a transaction' })
  @ApiResponse({ status: 200, description: 'Gas estimated successfully' })
  async eth_estimateGas(@Body('transaction') transaction: any) {
    return this.proxyService.eth_estimateGas(transaction);
  }

  @Public()
  @Get('eth_getCode')
  @ApiOperation({ summary: 'Returns code at a given address' })
  @ApiResponse({ status: 200, description: 'Code retrieved successfully' })
  async eth_getCode(
    @Query('address') address: string,
    @Query('tag') tag: string = 'latest',
  ) {
    return this.proxyService.eth_getCode(address, tag);
  }

  @Public()
  @Post('eth_getLogs')
  @ApiOperation({ summary: 'Returns logs matching a filter' })
  @ApiResponse({ status: 200, description: 'Logs retrieved successfully' })
  async eth_getLogs(@Body('filter') filter: any) {
    return this.proxyService.eth_getLogs(filter);
  }

  @Public()
  @Get('eth_gasPrice')
  @ApiOperation({ summary: 'Returns the current gas price' })
  @ApiResponse({ status: 200, description: 'Gas price retrieved successfully' })
  async eth_gasPrice() {
    return this.proxyService.eth_gasPrice();
  }
}

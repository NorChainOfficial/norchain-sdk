import {
  Controller,
  Get,
  Post,
  Query,
  Body,
  HttpCode,
  HttpStatus,
} from '@nestjs/common';
import { ApiTags, ApiOperation, ApiResponse } from '@nestjs/swagger';
import { TransactionService } from './transaction.service';
import { BroadcastTransactionDto } from './dto/broadcast-transaction.dto';
import { Public } from '@/common/decorators/public.decorator';
import { IsEthereumAddress } from 'class-validator';

@ApiTags('Transaction')
@Controller('transaction')
export class TransactionController {
  constructor(private readonly transactionService: TransactionService) {}

  @Public()
  @Get('gettxreceiptstatus')
  @ApiOperation({ summary: 'Get transaction receipt status' })
  @ApiResponse({
    status: 200,
    description: 'Transaction receipt status retrieved successfully',
  })
  async getTxReceiptStatus(@Query('txhash') txhash: string) {
    return this.transactionService.getTxReceiptStatus(txhash);
  }

  @Public()
  @Get('getstatus')
  @ApiOperation({
    summary: 'Get transaction status (pending/confirmed/failed)',
  })
  @ApiResponse({
    status: 200,
    description: 'Transaction status retrieved successfully',
  })
  async getStatus(@Query('txhash') txhash: string) {
    return this.transactionService.getStatus(txhash);
  }

  @Public()
  @Get('gettxinfo')
  @ApiOperation({ summary: 'Get detailed transaction information' })
  @ApiResponse({
    status: 200,
    description: 'Transaction information retrieved successfully',
  })
  async getTransaction(@Query('txhash') txhash: string) {
    return this.transactionService.getTransaction(txhash);
  }

  @Public()
  @Post('broadcast')
  @HttpCode(HttpStatus.OK)
  @ApiOperation({ summary: 'Broadcast a signed transaction to the network' })
  @ApiResponse({
    status: 200,
    description: 'Transaction broadcast successfully',
    schema: {
      type: 'object',
      properties: {
        success: { type: 'boolean' },
        result: {
          type: 'object',
          properties: {
            hash: { type: 'string' },
            from: { type: 'string' },
            to: { type: 'string', nullable: true },
            value: { type: 'string' },
            gasLimit: { type: 'string' },
            gasPrice: { type: 'string' },
            nonce: { type: 'number' },
            status: { type: 'string' },
            message: { type: 'string' },
          },
        },
      },
    },
  })
  @ApiResponse({
    status: 400,
    description: 'Bad request - Invalid transaction',
  })
  async broadcastTransaction(@Body() dto: BroadcastTransactionDto) {
    return this.transactionService.broadcastTransaction(dto);
  }
}

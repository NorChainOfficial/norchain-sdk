import {
  Controller,
  Get,
  Post,
  Body,
  Param,
  Delete,
  UseGuards,
  Request,
} from '@nestjs/common';
import {
  ApiTags,
  ApiOperation,
  ApiResponse,
  ApiBearerAuth,
  ApiParam,
} from '@nestjs/swagger';
import { WalletService } from './wallet.service';
import { JwtAuthGuard } from '@/common/guards/jwt-auth.guard';
import { CreateWalletDto } from './dto/create-wallet.dto';
import { ImportWalletDto } from './dto/import-wallet.dto';
import { SendTransactionDto } from './dto/send-transaction.dto';

@ApiTags('Wallet')
@Controller('wallet')
@UseGuards(JwtAuthGuard)
@ApiBearerAuth('JWT-auth')
export class WalletController {
  constructor(private readonly walletService: WalletService) {}

  @Post()
  @ApiOperation({ summary: 'Create a new wallet' })
  @ApiResponse({
    status: 201,
    description: 'Wallet created successfully',
  })
  async createWallet(@Request() req: any, @Body() dto: CreateWalletDto) {
    return this.walletService.createWallet(req.user.id, dto);
  }

  @Post('import')
  @ApiOperation({ summary: 'Import an existing wallet' })
  @ApiResponse({
    status: 201,
    description: 'Wallet imported successfully',
  })
  async importWallet(@Request() req: any, @Body() dto: ImportWalletDto) {
    return this.walletService.importWallet(req.user.id, dto);
  }

  @Get()
  @ApiOperation({ summary: 'Get all wallets for the authenticated user' })
  @ApiResponse({
    status: 200,
    description: 'Wallets retrieved successfully',
  })
  async getWallets(@Request() req: any) {
    return this.walletService.getUserWallets(req.user.id);
  }

  @Get(':address')
  @ApiOperation({ summary: 'Get wallet details by address' })
  @ApiParam({ name: 'address', description: 'Wallet address' })
  @ApiResponse({
    status: 200,
    description: 'Wallet details retrieved successfully',
  })
  async getWallet(@Request() req: any, @Param('address') address: string) {
    return this.walletService.getWallet(req.user.id, address);
  }

  @Get(':address/balance')
  @ApiOperation({ summary: 'Get wallet balance' })
  @ApiParam({ name: 'address', description: 'Wallet address' })
  @ApiResponse({
    status: 200,
    description: 'Balance retrieved successfully',
  })
  async getBalance(@Request() req: any, @Param('address') address: string) {
    return this.walletService.getBalance(req.user.id, address);
  }

  @Get(':address/tokens')
  @ApiOperation({ summary: 'Get all tokens in wallet' })
  @ApiParam({ name: 'address', description: 'Wallet address' })
  @ApiResponse({
    status: 200,
    description: 'Tokens retrieved successfully',
  })
  async getTokens(@Request() req: any, @Param('address') address: string) {
    return this.walletService.getTokens(req.user.id, address);
  }

  @Get(':address/transactions')
  @ApiOperation({ summary: 'Get wallet transaction history' })
  @ApiParam({ name: 'address', description: 'Wallet address' })
  @ApiResponse({
    status: 200,
    description: 'Transactions retrieved successfully',
  })
  async getTransactions(
    @Request() req: any,
    @Param('address') address: string,
  ) {
    return this.walletService.getTransactions(req.user.id, address);
  }

  @Post(':address/send')
  @ApiOperation({ summary: 'Send transaction from wallet' })
  @ApiParam({ name: 'address', description: 'Wallet address' })
  @ApiResponse({
    status: 200,
    description: 'Transaction sent successfully',
  })
  async sendTransaction(
    @Request() req: any,
    @Param('address') address: string,
    @Body() dto: SendTransactionDto,
  ) {
    return this.walletService.sendTransaction(req.user.id, address, dto);
  }

  @Delete(':address')
  @ApiOperation({ summary: 'Delete a wallet' })
  @ApiParam({ name: 'address', description: 'Wallet address' })
  @ApiResponse({
    status: 200,
    description: 'Wallet deleted successfully',
  })
  async deleteWallet(@Request() req: any, @Param('address') address: string) {
    return this.walletService.deleteWallet(req.user.id, address);
  }
}


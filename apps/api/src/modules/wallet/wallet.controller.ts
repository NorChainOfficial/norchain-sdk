import {
  Controller,
  Get,
  Post,
  Put,
  Delete,
  Body,
  Param,
  Query,
  Request,
  HttpCode,
  HttpStatus,
} from '@nestjs/common';
import { ApiTags, ApiOperation, ApiResponse, ApiParam } from '@nestjs/swagger';
import { WalletService } from './wallet.service';
import { CreateWalletDto } from './dto/create-wallet.dto';
import { ImportWalletDto } from './dto/import-wallet.dto';
import { GetWalletAccountsDto } from './dto/get-wallet-accounts.dto';
import { SyncWalletDto } from './dto/sync-wallet.dto';
import { Public } from '@/common/decorators/public.decorator';

/**
 * Wallet Controller
 *
 * Handles wallet-related HTTP endpoints for creating, importing,
 * managing accounts, and syncing wallet data.
 *
 * @class WalletController
 */
@ApiTags('Wallet')
@Controller('wallet')
export class WalletController {
  constructor(private readonly walletService: WalletService) {}

  @Public()
  @Post('create')
  @HttpCode(HttpStatus.CREATED)
  @ApiOperation({ summary: 'Create a new wallet' })
  @ApiResponse({
    status: 201,
    description: 'Wallet created successfully',
    schema: {
      type: 'object',
      properties: {
        success: { type: 'boolean' },
        result: {
          type: 'object',
          properties: {
            wallet: {
              type: 'object',
              properties: {
                id: { type: 'string' },
                name: { type: 'string', nullable: true },
                isImported: { type: 'boolean' },
                accounts: { type: 'array' },
                createdAt: { type: 'string' },
              },
            },
            mnemonic: { type: 'string' },
          },
        },
      },
    },
  })
  @ApiResponse({ status: 400, description: 'Bad request' })
  async createWallet(@Body() dto: CreateWalletDto, @Request() req?: any) {
    const userId = req?.user?.id;
    const result = await this.walletService.createWallet(dto, userId);
    return {
      success: true,
      result,
    };
  }

  @Public()
  @Post('import')
  @HttpCode(HttpStatus.CREATED)
  @ApiOperation({ summary: 'Import an existing wallet' })
  @ApiResponse({
    status: 201,
    description: 'Wallet imported successfully',
    schema: {
      type: 'object',
      properties: {
        success: { type: 'boolean' },
        result: {
          type: 'object',
          properties: {
            wallet: {
              type: 'object',
              properties: {
                id: { type: 'string' },
                name: { type: 'string', nullable: true },
                isImported: { type: 'boolean' },
                accounts: { type: 'array' },
                createdAt: { type: 'string' },
              },
            },
            mnemonic: { type: 'string', nullable: true },
          },
        },
      },
    },
  })
  @ApiResponse({ status: 400, description: 'Bad request' })
  async importWallet(@Body() dto: ImportWalletDto, @Request() req?: any) {
    const userId = req?.user?.id;
    const result = await this.walletService.importWallet(dto, userId);
    return {
      success: true,
      result,
    };
  }

  @Public()
  @Get(':id')
  @ApiOperation({ summary: 'Get wallet by ID' })
  @ApiParam({ name: 'id', description: 'Wallet ID' })
  @ApiResponse({
    status: 200,
    description: 'Wallet retrieved successfully',
  })
  @ApiResponse({ status: 404, description: 'Wallet not found' })
  async getWallet(@Param('id') id: string) {
    const wallet = await this.walletService.getWalletById(id);
    return {
      success: true,
      result: wallet,
    };
  }

  @Public()
  @Get(':id/accounts')
  @ApiOperation({ summary: 'Get all accounts for a wallet' })
  @ApiParam({ name: 'id', description: 'Wallet ID' })
  @ApiResponse({
    status: 200,
    description: 'Accounts retrieved successfully',
  })
  @ApiResponse({ status: 404, description: 'Wallet not found' })
  async getWalletAccounts(
    @Param('id') id: string,
    @Query() dto: GetWalletAccountsDto,
  ) {
    const accounts = await this.walletService.getWalletAccounts(
      id,
      dto.includeInactive,
    );
    return {
      success: true,
      result: accounts,
    };
  }

  @Public()
  @Post(':id/sync')
  @HttpCode(HttpStatus.OK)
  @ApiOperation({ summary: 'Sync wallet data (balances, transaction counts)' })
  @ApiParam({ name: 'id', description: 'Wallet ID' })
  @ApiResponse({
    status: 200,
    description: 'Wallet synced successfully',
    schema: {
      type: 'object',
      properties: {
        success: { type: 'boolean' },
        result: {
          type: 'object',
          properties: {
            wallet: { type: 'object' },
            accounts: {
              type: 'array',
              items: {
                type: 'object',
                properties: {
                  account: { type: 'object' },
                  balance: { type: 'string' },
                  transactionCount: { type: 'number' },
                },
              },
            },
          },
        },
      },
    },
  })
  @ApiResponse({ status: 404, description: 'Wallet not found' })
  async syncWallet(@Param('id') id: string, @Body() dto: SyncWalletDto) {
    const result = await this.walletService.syncWallet(id, dto);
    return {
      success: true,
      result,
    };
  }

  @Public()
  @Put(':id')
  @ApiOperation({ summary: 'Update wallet metadata' })
  @ApiParam({ name: 'id', description: 'Wallet ID' })
  @ApiResponse({
    status: 200,
    description: 'Wallet updated successfully',
  })
  @ApiResponse({ status: 404, description: 'Wallet not found' })
  async updateWallet(
    @Param('id') id: string,
    @Body() updates: { name?: string; metadata?: Record<string, any> },
  ) {
    const wallet = await this.walletService.updateWallet(id, updates);
    return {
      success: true,
      result: wallet,
    };
  }

  @Public()
  @Delete(':id')
  @HttpCode(HttpStatus.NO_CONTENT)
  @ApiOperation({ summary: 'Delete a wallet (soft delete)' })
  @ApiParam({ name: 'id', description: 'Wallet ID' })
  @ApiResponse({
    status: 204,
    description: 'Wallet deleted successfully',
  })
  @ApiResponse({ status: 404, description: 'Wallet not found' })
  async deleteWallet(@Param('id') id: string) {
    await this.walletService.deleteWallet(id);
    return {
      success: true,
      message: 'Wallet deleted successfully',
    };
  }
}

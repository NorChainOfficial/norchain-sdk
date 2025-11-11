import {
  Controller,
  Post,
  Get,
  Body,
  Param,
  Query,
  UseGuards,
  Request,
  Headers,
  ParseUUIDPipe,
} from '@nestjs/common';
import {
  ApiTags,
  ApiOperation,
  ApiResponse,
  ApiBearerAuth,
  ApiQuery,
  ApiHeader,
} from '@nestjs/swagger';
import { LedgerService } from './ledger.service';
import { CreateAccountDto } from './dto/create-account.dto';
import { CreateJournalEntryDto } from './dto/create-journal-entry.dto';
import { ClosePeriodDto } from './dto/close-period.dto';
import { JwtAuthGuard } from '@/common/guards/jwt-auth.guard';
import { Idempotent } from '@/common/decorators/idempotency.decorator';
import { AccountStatus } from './entities/ledger-account.entity';

@ApiTags('Ledger')
@Controller('ledger')
@UseGuards(JwtAuthGuard)
@ApiBearerAuth('JWT-auth')
export class LedgerController {
  constructor(private readonly ledgerService: LedgerService) {}

  @Post('accounts')
  @Idempotent()
  @ApiOperation({ summary: 'Create a ledger account' })
  @ApiHeader({
    name: 'Idempotency-Key',
    description: 'Idempotency key for safe retries',
    required: true,
  })
  @ApiResponse({ status: 201, description: 'Account created successfully' })
  @ApiResponse({ status: 409, description: 'Account code already exists' })
  async createAccount(@Request() req: any, @Body() dto: CreateAccountDto) {
    return this.ledgerService.createAccount(dto, req.user.id);
  }

  @Get('accounts')
  @ApiOperation({ summary: 'List ledger accounts for an organization' })
  @ApiQuery({
    name: 'orgId',
    required: true,
    type: String,
    description: 'Organization ID',
  })
  @ApiQuery({
    name: 'status',
    required: false,
    enum: AccountStatus,
    description: 'Filter by account status',
  })
  @ApiResponse({ status: 200, description: 'Accounts retrieved successfully' })
  async listAccounts(
    @Query('orgId', ParseUUIDPipe) orgId: string,
    @Query('status') status?: AccountStatus,
  ) {
    return this.ledgerService.listAccounts(orgId, status);
  }

  @Get('accounts/:id')
  @ApiOperation({ summary: 'Get ledger account by ID' })
  @ApiQuery({
    name: 'orgId',
    required: true,
    type: String,
    description: 'Organization ID',
  })
  @ApiResponse({ status: 200, description: 'Account retrieved successfully' })
  @ApiResponse({ status: 404, description: 'Account not found' })
  async getAccount(
    @Param('id', ParseUUIDPipe) id: string,
    @Query('orgId', ParseUUIDPipe) orgId: string,
  ) {
    return this.ledgerService.getAccount(id, orgId);
  }

  @Post('journal')
  @Idempotent()
  @ApiOperation({
    summary: 'Create a journal entry (double-entry accounting)',
    description:
      'Creates a journal entry with balanced debits and credits. Must satisfy: sum(debits) == sum(credits) per currency.',
  })
  @ApiHeader({
    name: 'Idempotency-Key',
    description: 'Idempotency key for safe retries',
    required: true,
  })
  @ApiResponse({ status: 201, description: 'Journal entry created successfully' })
  @ApiResponse({ status: 400, description: 'Double-entry validation failed' })
  @ApiResponse({ status: 409, description: 'Period is locked or entry already exists' })
  async createJournalEntry(@Request() req: any, @Body() dto: CreateJournalEntryDto) {
    return this.ledgerService.createJournalEntry(dto, req.user.id);
  }

  @Get('journal/:id')
  @ApiOperation({ summary: 'Get journal entry by ID' })
  @ApiQuery({
    name: 'orgId',
    required: true,
    type: String,
    description: 'Organization ID',
  })
  @ApiResponse({ status: 200, description: 'Journal entry retrieved successfully' })
  @ApiResponse({ status: 404, description: 'Journal entry not found' })
  async getJournalEntry(
    @Param('id', ParseUUIDPipe) id: string,
    @Query('orgId', ParseUUIDPipe) orgId: string,
  ) {
    return this.ledgerService.getJournalEntry(id, orgId);
  }

  @Get('statements')
  @ApiOperation({
    summary: 'Get account statement (trial balance / movements)',
    description: 'Returns account movements and running balance for a date range',
  })
  @ApiQuery({
    name: 'accountId',
    required: true,
    type: String,
    description: 'Account ID',
  })
  @ApiQuery({
    name: 'orgId',
    required: true,
    type: String,
    description: 'Organization ID',
  })
  @ApiQuery({
    name: 'from',
    required: false,
    type: String,
    description: 'Start date (ISO 8601)',
  })
  @ApiQuery({
    name: 'to',
    required: false,
    type: String,
    description: 'End date (ISO 8601)',
  })
  @ApiResponse({ status: 200, description: 'Statement retrieved successfully' })
  async getAccountStatement(
    @Query('accountId', ParseUUIDPipe) accountId: string,
    @Query('orgId', ParseUUIDPipe) orgId: string,
    @Query('from') from?: string,
    @Query('to') to?: string,
  ) {
    const fromDate = from ? new Date(from) : undefined;
    const toDate = to ? new Date(to) : undefined;
    return this.ledgerService.getAccountStatement(accountId, orgId, fromDate, toDate);
  }

  @Post('close-period')
  @Idempotent()
  @ApiOperation({
    summary: 'Close an accounting period and create Merkle anchor',
    description:
      'Locks a period, calculates Merkle root, and prepares for on-chain anchoring. Requires admin role.',
  })
  @ApiHeader({
    name: 'Idempotency-Key',
    description: 'Idempotency key for safe retries',
    required: true,
  })
  @ApiResponse({ status: 201, description: 'Period closed successfully' })
  @ApiResponse({ status: 409, description: 'Period already closed' })
  async closePeriod(@Request() req: any, @Body() dto: ClosePeriodDto) {
    return this.ledgerService.closePeriod(dto, req.user.id);
  }

  @Get('anchors/:period')
  @ApiOperation({
    summary: 'Get period closure with Merkle anchor',
    description: 'Returns period closure details including Merkle root and anchor transaction',
  })
  @ApiQuery({
    name: 'orgId',
    required: true,
    type: String,
    description: 'Organization ID',
  })
  @ApiResponse({ status: 200, description: 'Period closure retrieved successfully' })
  @ApiResponse({ status: 404, description: 'Period not closed' })
  async getPeriodClosure(
    @Param('period') period: string,
    @Query('orgId', ParseUUIDPipe) orgId: string,
  ) {
    return this.ledgerService.getPeriodClosure(period, orgId);
  }
}


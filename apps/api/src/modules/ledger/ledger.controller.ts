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
  ParseIntPipe,
  DefaultValuePipe,
} from '@nestjs/common';
import {
  ApiTags,
  ApiOperation,
  ApiResponse,
  ApiBearerAuth,
  ApiQuery,
  ApiHeader,
  ApiParam,
} from '@nestjs/swagger';
import { LedgerService } from './ledger.service';
import { CreateAccountDto } from './dto/create-account.dto';
import { CreateJournalEntryDto } from './dto/create-journal-entry.dto';
import { ClosePeriodDto } from './dto/close-period.dto';
import { CalculateVatDto } from './dto/calculate-vat.dto';
import { GetFinancialReportDto } from './dto/get-financial-report.dto';
import { CreateReconciliationDto } from './dto/create-reconciliation.dto';
import { MatchTransactionDto } from './dto/match-transaction.dto';
import { JwtAuthGuard } from '@/common/guards/jwt-auth.guard';
import { Idempotent } from '@/common/decorators/idempotency.decorator';
import { AccountStatus } from './entities/ledger-account.entity';
import {
  ReconciliationType,
  ReconciliationStatus,
} from './entities/reconciliation.entity';

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
  @ApiResponse({
    status: 201,
    description: 'Journal entry created successfully',
  })
  @ApiResponse({ status: 400, description: 'Double-entry validation failed' })
  @ApiResponse({
    status: 409,
    description: 'Period is locked or entry already exists',
  })
  async createJournalEntry(
    @Request() req: any,
    @Body() dto: CreateJournalEntryDto,
  ) {
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
  @ApiResponse({
    status: 200,
    description: 'Journal entry retrieved successfully',
  })
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
    description:
      'Returns account movements and running balance for a date range',
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
    return this.ledgerService.getAccountStatement(
      accountId,
      orgId,
      fromDate,
      toDate,
    );
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
    description:
      'Returns period closure details including Merkle root and anchor transaction',
  })
  @ApiQuery({
    name: 'orgId',
    required: true,
    type: String,
    description: 'Organization ID',
  })
  @ApiResponse({
    status: 200,
    description: 'Period closure retrieved successfully',
  })
  @ApiResponse({ status: 404, description: 'Period not closed' })
  async getPeriodClosure(
    @Param('period') period: string,
    @Query('orgId', ParseUUIDPipe) orgId: string,
  ) {
    return this.ledgerService.getPeriodClosure(period, orgId);
  }

  @Post('vat/calculate')
  @ApiOperation({
    summary: 'Calculate VAT/MVA',
    description:
      'Calculates VAT/MVA amount based on country, rate, and transaction type',
  })
  @ApiResponse({
    status: 200,
    description: 'VAT calculated successfully',
  })
  async calculateVat(@Body() dto: CalculateVatDto) {
    return this.ledgerService.calculateVat(dto);
  }

  @Get('reports')
  @ApiOperation({
    summary: 'Generate financial report',
    description:
      'Generates Profit & Loss, Balance Sheet, or Cashflow report for a period',
  })
  @ApiResponse({
    status: 200,
    description: 'Financial report generated successfully',
  })
  @ApiResponse({ status: 400, description: 'Invalid report parameters' })
  async getFinancialReport(@Query() dto: GetFinancialReportDto) {
    return this.ledgerService.getFinancialReport(dto);
  }

  // ========== Reconciliation Endpoints ==========

  @Post('reconciliations')
  @Idempotent()
  @ApiOperation({
    summary: 'Create a reconciliation',
    description:
      'Creates a reconciliation for bank/wallet/exchange account matching',
  })
  @ApiHeader({
    name: 'Idempotency-Key',
    description: 'Idempotency key for safe retries',
    required: true,
  })
  @ApiResponse({
    status: 201,
    description: 'Reconciliation created successfully',
  })
  async createReconciliation(
    @Request() req: any,
    @Body() dto: CreateReconciliationDto,
  ) {
    return this.ledgerService.createReconciliation(dto, req.user.id);
  }

  @Get('reconciliations')
  @ApiOperation({ summary: 'List reconciliations for organization' })
  @ApiQuery({
    name: 'orgId',
    required: true,
    type: String,
    description: 'Organization ID',
  })
  @ApiQuery({
    name: 'type',
    required: false,
    enum: ReconciliationType,
    description: 'Filter by reconciliation type',
  })
  @ApiQuery({
    name: 'status',
    required: false,
    enum: ReconciliationStatus,
    description: 'Filter by status',
  })
  @ApiQuery({ name: 'limit', required: false, type: Number })
  @ApiQuery({ name: 'offset', required: false, type: Number })
  @ApiResponse({
    status: 200,
    description: 'Reconciliations retrieved successfully',
  })
  async listReconciliations(
    @Query('orgId', ParseUUIDPipe) orgId: string,
    @Query('type') type?: ReconciliationType,
    @Query('status') status?: ReconciliationStatus,
    @Query('limit', new DefaultValuePipe(50), ParseIntPipe) limit: number = 50,
    @Query('offset', new DefaultValuePipe(0), ParseIntPipe) offset: number = 0,
  ) {
    return this.ledgerService.listReconciliations(
      orgId,
      type,
      status,
      limit,
      offset,
    );
  }

  @Get('reconciliations/:id')
  @ApiOperation({ summary: 'Get reconciliation by ID' })
  @ApiParam({ name: 'id', description: 'Reconciliation ID' })
  @ApiQuery({
    name: 'orgId',
    required: true,
    type: String,
    description: 'Organization ID',
  })
  @ApiResponse({
    status: 200,
    description: 'Reconciliation retrieved successfully',
  })
  @ApiResponse({ status: 404, description: 'Reconciliation not found' })
  async getReconciliation(
    @Param('id', ParseUUIDPipe) id: string,
    @Query('orgId', ParseUUIDPipe) orgId: string,
  ) {
    return this.ledgerService.getReconciliation(id, orgId);
  }

  @Get('reconciliations/:id/details')
  @ApiOperation({
    summary: 'Get reconciliation details with matches',
    description:
      'Returns reconciliation with matched transactions and unmatched entries',
  })
  @ApiParam({ name: 'id', description: 'Reconciliation ID' })
  @ApiQuery({
    name: 'orgId',
    required: true,
    type: String,
    description: 'Organization ID',
  })
  @ApiResponse({
    status: 200,
    description: 'Reconciliation details retrieved successfully',
  })
  async getReconciliationDetails(
    @Param('id', ParseUUIDPipe) id: string,
    @Query('orgId', ParseUUIDPipe) orgId: string,
  ) {
    return this.ledgerService.getReconciliationDetails(id, orgId);
  }

  @Post('reconciliations/:id/match')
  @Idempotent()
  @ApiOperation({
    summary: 'Match a transaction',
    description: 'Manually match a ledger entry with an external transaction',
  })
  @ApiHeader({
    name: 'Idempotency-Key',
    description: 'Idempotency key for safe retries',
    required: true,
  })
  @ApiResponse({
    status: 201,
    description: 'Transaction matched successfully',
  })
  async matchTransaction(
    @Request() req: any,
    @Body() dto: MatchTransactionDto,
  ) {
    return this.ledgerService.matchTransaction(dto, req.user.id);
  }

  @Post('reconciliations/:id/auto-match')
  @ApiOperation({
    summary: 'Auto-match transactions',
    description:
      'Automatically match ledger entries with external transactions using fuzzy matching',
  })
  @ApiParam({ name: 'id', description: 'Reconciliation ID' })
  @ApiQuery({
    name: 'orgId',
    required: true,
    type: String,
    description: 'Organization ID',
  })
  @ApiResponse({
    status: 200,
    description: 'Auto-matching completed',
  })
  async autoMatchTransactions(
    @Param('id', ParseUUIDPipe) id: string,
    @Query('orgId', ParseUUIDPipe) orgId: string,
  ) {
    return this.ledgerService.autoMatchTransactions(id, orgId);
  }
}

import {
  Controller,
  Get,
  Post,
  Patch,
  Body,
  Param,
  Query,
  UseGuards,
  Request,
  ParseUUIDPipe,
  ParseIntPipe,
  DefaultValuePipe,
} from '@nestjs/common';
import {
  ApiTags,
  ApiOperation,
  ApiResponse,
  ApiBearerAuth,
  ApiParam,
  ApiQuery,
} from '@nestjs/swagger';
import { ComplianceService } from './compliance.service';
import { JwtAuthGuard } from '@/common/guards/jwt-auth.guard';
import { Idempotent } from '@/common/decorators/idempotency.decorator';
import { CreateScreeningDto } from './dto/create-screening.dto';
import { CreateCaseDto } from './dto/create-case.dto';
import { TravelRuleDto } from './dto/travel-rule.dto';
import { TravelRulePrecheckDto } from './dto/travel-rule-precheck.dto';
import { UpdateCaseDto } from './dto/update-case.dto';
import { AddCaseNoteDto } from './dto/add-case-note.dto';
import { CreateTravelRulePartnerDto } from './dto/create-travel-rule-partner.dto';
import { CaseStatus, CaseSeverity } from './entities/compliance-case.entity';
import { PartnerStatus, PartnerType } from './entities/travel-rule-partner.entity';

@ApiTags('Compliance')
@Controller('compliance')
@UseGuards(JwtAuthGuard)
@ApiBearerAuth('JWT-auth')
export class ComplianceController {
  constructor(private readonly complianceService: ComplianceService) {}

  @Post('screenings')
  @Idempotent()
  @ApiOperation({ summary: 'Create a compliance screening' })
  @ApiResponse({
    status: 201,
    description: 'Screening created successfully',
  })
  async createScreening(@Request() req: any, @Body() dto: CreateScreeningDto) {
    return this.complianceService.createScreening(req.user.id, dto);
  }

  @Get('screenings/:id')
  @ApiOperation({ summary: 'Get screening details' })
  @ApiParam({ name: 'id', description: 'Screening ID' })
  @ApiResponse({
    status: 200,
    description: 'Screening details retrieved successfully',
  })
  async getScreening(@Request() req: any, @Param('id') screeningId: string) {
    return this.complianceService.getScreening(req.user.id, screeningId);
  }

  @Get('risk-scores/:address')
  @ApiOperation({ summary: 'Get risk score for an address' })
  @ApiParam({ name: 'address', description: 'Wallet address' })
  @ApiResponse({
    status: 200,
    description: 'Risk score retrieved successfully',
  })
  async getRiskScore(@Param('address') address: string) {
    return this.complianceService.getRiskScore(address);
  }

  @Post('cases')
  @Idempotent()
  @ApiOperation({ summary: 'Create a compliance case' })
  @ApiResponse({
    status: 201,
    description: 'Case created successfully',
  })
  async createCase(@Request() req: any, @Body() dto: CreateCaseDto) {
    return this.complianceService.createCase(req.user.id, dto);
  }

  @Get('cases/:id')
  @ApiOperation({ summary: 'Get case details' })
  @ApiParam({ name: 'id', description: 'Case ID' })
  @ApiResponse({
    status: 200,
    description: 'Case details retrieved successfully',
  })
  async getCase(@Request() req: any, @Param('id') caseId: string) {
    return this.complianceService.getCase(req.user.id, caseId);
  }

  @Post('travel-rule/precheck')
  @ApiOperation({
    summary: 'Precheck Travel Rule requirements before payment',
    description:
      'Checks if Travel Rule compliance is required for a VASP-to-VASP transfer',
  })
  @ApiResponse({
    status: 200,
    description: 'Travel Rule precheck completed',
  })
  async precheckTravelRule(@Body() dto: TravelRulePrecheckDto) {
    return this.complianceService.precheckTravelRule(dto);
  }

  @Post('travel-rule')
  @ApiOperation({ summary: 'Submit Travel Rule information' })
  @ApiResponse({
    status: 201,
    description: 'Travel Rule information submitted successfully',
  })
  async submitTravelRule(@Request() req: any, @Body() dto: TravelRuleDto) {
    return this.complianceService.submitTravelRule(req.user.id, dto);
  }

  // ========== Case Management Endpoints ==========

  @Get('cases')
  @ApiOperation({ summary: 'List compliance cases' })
  @ApiQuery({
    name: 'status',
    required: false,
    enum: CaseStatus,
    description: 'Filter by case status',
  })
  @ApiQuery({
    name: 'severity',
    required: false,
    enum: CaseSeverity,
    description: 'Filter by case severity',
  })
  @ApiQuery({
    name: 'assignedTo',
    required: false,
    type: String,
    description: 'Filter by assigned user ID',
  })
  @ApiQuery({ name: 'limit', required: false, type: Number })
  @ApiQuery({ name: 'offset', required: false, type: Number })
  @ApiResponse({
    status: 200,
    description: 'Cases retrieved successfully',
  })
  async listCases(
    @Request() req: any,
    @Query('status') status?: CaseStatus,
    @Query('severity') severity?: CaseSeverity,
    @Query('assignedTo') assignedTo?: string,
    @Query('limit', new DefaultValuePipe(50), ParseIntPipe) limit: number = 50,
    @Query('offset', new DefaultValuePipe(0), ParseIntPipe) offset: number = 0,
  ) {
    return this.complianceService.listCases(
      req.user.id,
      status,
      severity,
      assignedTo,
      limit,
      offset,
    );
  }

  @Patch('cases/:id')
  @Idempotent()
  @ApiOperation({ summary: 'Update compliance case' })
  @ApiParam({ name: 'id', description: 'Case ID' })
  @ApiResponse({
    status: 200,
    description: 'Case updated successfully',
  })
  async updateCase(
    @Request() req: any,
    @Param('id', ParseUUIDPipe) caseId: string,
    @Body() dto: UpdateCaseDto,
  ) {
    return this.complianceService.updateCase(req.user.id, caseId, dto);
  }

  @Post('cases/:id/notes')
  @Idempotent()
  @ApiOperation({ summary: 'Add note to compliance case' })
  @ApiParam({ name: 'id', description: 'Case ID' })
  @ApiResponse({
    status: 201,
    description: 'Note added successfully',
  })
  async addCaseNote(
    @Request() req: any,
    @Param('id', ParseUUIDPipe) caseId: string,
    @Body() dto: AddCaseNoteDto,
  ) {
    return this.complianceService.addCaseNote(req.user.id, caseId, dto);
  }

  // ========== Travel Rule Partner Directory Endpoints ==========

  @Post('travel-rule/partners')
  @Idempotent()
  @ApiOperation({ summary: 'Create Travel Rule partner' })
  @ApiResponse({
    status: 201,
    description: 'Partner created successfully',
  })
  async createTravelRulePartner(@Body() dto: CreateTravelRulePartnerDto) {
    return this.complianceService.createTravelRulePartner(dto);
  }

  @Get('travel-rule/partners')
  @ApiOperation({ summary: 'List Travel Rule partners' })
  @ApiQuery({
    name: 'status',
    required: false,
    enum: PartnerStatus,
    description: 'Filter by partner status',
  })
  @ApiQuery({
    name: 'type',
    required: false,
    enum: PartnerType,
    description: 'Filter by partner type',
  })
  @ApiQuery({
    name: 'jurisdiction',
    required: false,
    type: String,
    description: 'Filter by jurisdiction (ISO country code)',
  })
  @ApiQuery({ name: 'limit', required: false, type: Number })
  @ApiQuery({ name: 'offset', required: false, type: Number })
  @ApiResponse({
    status: 200,
    description: 'Partners retrieved successfully',
  })
  async listTravelRulePartners(
    @Query('status') status?: PartnerStatus,
    @Query('type') type?: PartnerType,
    @Query('jurisdiction') jurisdiction?: string,
    @Query('limit', new DefaultValuePipe(50), ParseIntPipe) limit: number = 50,
    @Query('offset', new DefaultValuePipe(0), ParseIntPipe) offset: number = 0,
  ) {
    return this.complianceService.listTravelRulePartners(
      status,
      type,
      jurisdiction,
      limit,
      offset,
    );
  }

  @Get('travel-rule/partners/:id')
  @ApiOperation({ summary: 'Get Travel Rule partner by ID' })
  @ApiParam({ name: 'id', description: 'Partner ID' })
  @ApiResponse({
    status: 200,
    description: 'Partner retrieved successfully',
  })
  async getTravelRulePartner(@Param('id', ParseUUIDPipe) partnerId: string) {
    return this.complianceService.getTravelRulePartner(partnerId);
  }

  @Patch('travel-rule/partners/:id')
  @Idempotent()
  @ApiOperation({ summary: 'Update Travel Rule partner' })
  @ApiParam({ name: 'id', description: 'Partner ID' })
  @ApiResponse({
    status: 200,
    description: 'Partner updated successfully',
  })
  async updateTravelRulePartner(
    @Param('id', ParseUUIDPipe) partnerId: string,
    @Body() updates: Partial<CreateTravelRulePartnerDto>,
  ) {
    return this.complianceService.updateTravelRulePartner(partnerId, updates);
  }

  @Patch('travel-rule/partners/:id/status')
  @ApiOperation({ summary: 'Update Travel Rule partner status' })
  @ApiParam({ name: 'id', description: 'Partner ID' })
  @ApiQuery({
    name: 'status',
    required: true,
    enum: PartnerStatus,
    description: 'New status',
  })
  @ApiResponse({
    status: 200,
    description: 'Partner status updated successfully',
  })
  async updatePartnerStatus(
    @Param('id', ParseUUIDPipe) partnerId: string,
    @Query('status') status: PartnerStatus,
  ) {
    return this.complianceService.updatePartnerStatus(partnerId, status);
  }
}

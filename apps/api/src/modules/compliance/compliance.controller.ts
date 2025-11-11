import {
  Controller,
  Get,
  Post,
  Body,
  Param,
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
import { ComplianceService } from './compliance.service';
import { JwtAuthGuard } from '@/common/guards/jwt-auth.guard';
import { Idempotent } from '@/common/decorators/idempotency.decorator';
import { CreateScreeningDto } from './dto/create-screening.dto';
import { CreateCaseDto } from './dto/create-case.dto';
import { TravelRuleDto } from './dto/travel-rule.dto';
import { TravelRulePrecheckDto } from './dto/travel-rule-precheck.dto';

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
}

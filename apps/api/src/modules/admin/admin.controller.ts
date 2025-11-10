import {
  Controller,
  Get,
  Post,
  Body,
  Param,
  Query,
  UseGuards,
  Request,
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
import { AdminService } from './admin.service';
import { JwtAuthGuard } from '@/common/guards/jwt-auth.guard';
import { CreateValidatorDto } from './dto/create-validator.dto';
import { UpdateParamsDto } from './dto/update-params.dto';
import { CreateFeatureFlagDto } from './dto/create-feature-flag.dto';
import { ValidatorStatus } from './entities/validator.entity';
import { ErrorResponseDto } from '@/common/dto/error-response.dto';
import { ApiScopes, ApiScope } from '@/common/decorators/api-scopes.decorator';

@ApiTags('Admin')
@Controller('admin')
@UseGuards(JwtAuthGuard)
@ApiBearerAuth('JWT-auth')
@ApiScopes(ApiScope.ADMIN_VALIDATOR, ApiScope.ADMIN_PARAMS) // Require admin scopes
export class AdminController {
  constructor(private readonly adminService: AdminService) {}

  @Get('validators')
  @ApiOperation({ summary: 'Get all validators' })
  @ApiQuery({ name: 'limit', required: false, type: Number })
  @ApiQuery({ name: 'offset', required: false, type: Number })
  @ApiQuery({ name: 'status', required: false, enum: ValidatorStatus })
  @ApiResponse({
    status: 200,
    description: 'Validators retrieved successfully',
  })
  @ApiResponse({
    status: 403,
    description: 'Forbidden - Admin access required',
    type: ErrorResponseDto,
  })
  async getValidators(
    @Query('limit', new DefaultValuePipe(50), ParseIntPipe) limit: number,
    @Query('offset', new DefaultValuePipe(0), ParseIntPipe) offset: number,
    @Query('status') status?: ValidatorStatus,
  ) {
    return this.adminService.getValidators(limit, offset, status);
  }

  @Get('validators/:id')
  @ApiOperation({ summary: 'Get validator details' })
  @ApiParam({ name: 'id', description: 'Validator ID' })
  @ApiResponse({
    status: 200,
    description: 'Validator details retrieved successfully',
  })
  async getValidator(@Param('id') validatorId: string) {
    return this.adminService.getValidator(validatorId);
  }

  @Post('validators')
  @ApiScopes(ApiScope.ADMIN_VALIDATOR)
  @ApiOperation({ summary: 'Create a new validator (admin only)' })
  @ApiResponse({
    status: 201,
    description: 'Validator created successfully',
  })
  @ApiResponse({
    status: 403,
    description: 'Forbidden - Admin access required',
    type: ErrorResponseDto,
  })
  async createValidator(@Request() req: any, @Body() dto: CreateValidatorDto) {
    return this.adminService.createValidator(req.user.id, dto);
  }

  @Get('slashing')
  @ApiOperation({ summary: 'Get slashing events' })
  @ApiQuery({ name: 'limit', required: false, type: Number })
  @ApiQuery({ name: 'offset', required: false, type: Number })
  @ApiResponse({
    status: 200,
    description: 'Slashing events retrieved successfully',
  })
  async getSlashingEvents(
    @Query('limit', new DefaultValuePipe(50), ParseIntPipe) limit: number,
    @Query('offset', new DefaultValuePipe(0), ParseIntPipe) offset: number,
  ) {
    return this.adminService.getSlashingEvents(limit, offset);
  }

  @Post('params')
  @ApiScopes(ApiScope.ADMIN_PARAMS)
  @ApiOperation({ summary: 'Update system parameters (creates governance proposal)' })
  @ApiResponse({
    status: 201,
    description: 'Parameter change proposal created',
  })
  @ApiResponse({
    status: 403,
    description: 'Forbidden - Admin access required',
    type: ErrorResponseDto,
  })
  async updateParams(@Request() req: any, @Body() dto: UpdateParamsDto) {
    return this.adminService.updateParams(req.user.id, dto);
  }

  @Get('feature-flags')
  @ApiOperation({ summary: 'Get all feature flags' })
  @ApiResponse({
    status: 200,
    description: 'Feature flags retrieved successfully',
  })
  async getFeatureFlags() {
    return this.adminService.getFeatureFlags();
  }

  @Post('feature-flags')
  @ApiScopes(ApiScope.ADMIN_PARAMS)
  @ApiOperation({ summary: 'Create a feature flag (admin only)' })
  @ApiResponse({
    status: 201,
    description: 'Feature flag created successfully',
  })
  async createFeatureFlag(@Request() req: any, @Body() dto: CreateFeatureFlagDto) {
    return this.adminService.createFeatureFlag(req.user.id, dto);
  }

  @Get('audit-log')
  @ApiOperation({ summary: 'Get audit log' })
  @ApiQuery({ name: 'limit', required: false, type: Number })
  @ApiQuery({ name: 'offset', required: false, type: Number })
  @ApiQuery({ name: 'userId', required: false, type: String })
  @ApiQuery({ name: 'resourceType', required: false, type: String })
  @ApiResponse({
    status: 200,
    description: 'Audit log retrieved successfully',
  })
  async getAuditLog(
    @Query('limit', new DefaultValuePipe(100), ParseIntPipe) limit: number,
    @Query('offset', new DefaultValuePipe(0), ParseIntPipe) offset: number,
    @Query('userId') userId?: string,
    @Query('resourceType') resourceType?: string,
  ) {
    return this.adminService.getAuditLog(limit, offset, userId, resourceType);
  }
}


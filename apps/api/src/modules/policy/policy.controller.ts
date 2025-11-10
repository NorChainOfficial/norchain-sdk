import {
  Controller,
  Post,
  Body,
  Get,
  Query,
  UseGuards,
  Request,
  ParseIntPipe,
  DefaultValuePipe,
  Ip,
  Headers,
} from '@nestjs/common';
import {
  ApiTags,
  ApiOperation,
  ApiResponse,
  ApiBearerAuth,
  ApiQuery,
} from '@nestjs/swagger';
import { PolicyService } from './policy.service';
import { PolicyCheckDto } from './dto/policy-check.dto';
import { JwtAuthGuard } from '@/common/guards/jwt-auth.guard';
import { ErrorResponseDto } from '@/common/dto/error-response.dto';
import { PolicyCheckStatus } from './entities/policy-check.entity';

@ApiTags('Policy')
@Controller('policy')
export class PolicyController {
  constructor(private readonly policyService: PolicyService) {}

  @Post('check')
  @UseGuards(JwtAuthGuard)
  @ApiBearerAuth('JWT-auth')
  @ApiOperation({
    summary: 'Perform policy checks before transaction',
    description:
      'Checks sanctions, KYC tier, geo-fence, velocity, RWA caps, and AML heuristics',
  })
  @ApiResponse({
    status: 200,
    description: 'Policy check completed',
    schema: {
      type: 'object',
      properties: {
        allowed: { type: 'boolean' },
        status: { type: 'string', enum: ['allowed', 'blocked', 'pending_review'] },
        checks: {
          type: 'array',
          items: {
            type: 'object',
            properties: {
              type: { type: 'string' },
              passed: { type: 'boolean' },
              reason: { type: 'string' },
              details: { type: 'object' },
            },
          },
        },
        riskScore: { type: 'number' },
        requiresReview: { type: 'boolean' },
        auditHash: { type: 'string' },
      },
    },
  })
  @ApiResponse({
    status: 403,
    description: 'Transaction blocked by policy',
    type: ErrorResponseDto,
  })
  async checkPolicy(
    @Request() req: any,
    @Body() dto: PolicyCheckDto,
    @Ip() ipAddress: string,
    @Headers('user-agent') userAgent: string,
  ) {
    const result = await this.policyService.checkPolicy(
      req.user.id,
      dto,
      ipAddress,
      userAgent,
    );

    // Note: PolicyService throws ForbiddenException for blocked transactions
    // This endpoint returns the result for allowed/pending_review cases

    return result;
  }

  @Get('history')
  @UseGuards(JwtAuthGuard)
  @ApiBearerAuth('JWT-auth')
  @ApiOperation({ summary: 'Get policy check history for authenticated user' })
  @ApiQuery({ name: 'limit', required: false, type: Number })
  @ApiQuery({ name: 'offset', required: false, type: Number })
  @ApiResponse({
    status: 200,
    description: 'Policy check history retrieved successfully',
  })
  async getHistory(
    @Request() req: any,
    @Query('limit', new DefaultValuePipe(50), ParseIntPipe) limit: number,
    @Query('offset', new DefaultValuePipe(0), ParseIntPipe) offset: number,
  ) {
    return this.policyService.getPolicyCheckHistory(req.user.id, limit, offset);
  }
}


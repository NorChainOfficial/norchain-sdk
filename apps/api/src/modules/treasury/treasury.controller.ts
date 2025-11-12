import {
  Controller,
  Post,
  Get,
  Body,
  Param,
  Query,
  UseGuards,
  Request,
  ParseUUIDPipe,
} from '@nestjs/common';
import {
  ApiTags,
  ApiOperation,
  ApiResponse,
  ApiBearerAuth,
  ApiQuery,
  ApiParam,
} from '@nestjs/swagger';
import { TreasuryService } from './treasury.service';
import { DistributeRevenueDto } from './dto/distribute-revenue.dto';
import { CreateStakingRewardDto } from './dto/create-staking-reward.dto';
import { ClaimRewardDto } from './dto/claim-reward.dto';
import { JwtAuthGuard } from '@/common/guards/jwt-auth.guard';
import { Idempotent } from '@/common/decorators/idempotency.decorator';
import { DistributionType } from './entities/revenue-distribution.entity';

@ApiTags('Treasury')
@Controller('treasury')
@UseGuards(JwtAuthGuard)
@ApiBearerAuth('JWT-auth')
export class TreasuryController {
  constructor(private readonly treasuryService: TreasuryService) {}

  @Post('revenue/distribute')
  @Idempotent()
  @ApiOperation({
    summary: 'Distribute revenue according to configured percentages',
    description:
      'Distributes revenue to validators (25%), developers (20%), AI fund (10%), charity/ESG (5%), and treasury reserve (40%)',
  })
  @ApiResponse({
    status: 201,
    description: 'Revenue distributed successfully',
  })
  @ApiResponse({ status: 400, description: 'Invalid distribution percentages' })
  async distributeRevenue(@Body() dto: DistributeRevenueDto) {
    return this.treasuryService.distributeRevenue(dto);
  }

  @Get('revenue/distributions')
  @ApiOperation({ summary: 'Get revenue distributions for a period' })
  @ApiQuery({
    name: 'period',
    required: true,
    type: String,
    description: 'Period identifier (e.g., "2025-01")',
  })
  @ApiQuery({
    name: 'type',
    required: false,
    enum: DistributionType,
    description: 'Filter by distribution type',
  })
  @ApiResponse({
    status: 200,
    description: 'Revenue distributions retrieved successfully',
  })
  async getRevenueDistributions(
    @Query('period') period: string,
    @Query('type') type?: DistributionType,
  ) {
    return this.treasuryService.getRevenueDistributions(period, type);
  }

  @Post('staking/rewards')
  @Idempotent()
  @ApiOperation({ summary: 'Create staking reward' })
  @ApiResponse({
    status: 201,
    description: 'Staking reward created successfully',
  })
  async createStakingReward(@Body() dto: CreateStakingRewardDto) {
    return this.treasuryService.createStakingReward(dto);
  }

  @Post('staking/rewards/:id/claim')
  @Idempotent()
  @ApiOperation({ summary: 'Claim staking reward' })
  @ApiParam({ name: 'id', description: 'Reward ID' })
  @ApiResponse({
    status: 200,
    description: 'Reward claimed successfully',
  })
  @ApiResponse({
    status: 400,
    description: 'Reward already claimed or expired',
  })
  async claimReward(
    @Param('id', ParseUUIDPipe) rewardId: string,
    @Body() dto: ClaimRewardDto,
    @Request() req: any,
  ) {
    const recipientAddress =
      dto.recipientAddress || req.user.address?.toLowerCase() || req.user.id;
    return this.treasuryService.claimReward(rewardId, recipientAddress);
  }

  @Get('staking/rewards/validator/:address')
  @ApiOperation({ summary: 'Get staking rewards for a validator' })
  @ApiParam({ name: 'address', description: 'Validator address' })
  @ApiQuery({
    name: 'period',
    required: false,
    type: String,
    description: 'Filter by period',
  })
  @ApiResponse({
    status: 200,
    description: 'Validator rewards retrieved successfully',
  })
  async getValidatorRewards(
    @Param('address') validatorAddress: string,
    @Query('period') period?: string,
  ) {
    return this.treasuryService.getValidatorRewards(validatorAddress, period);
  }

  @Get('staking/rewards/delegator/:address')
  @ApiOperation({ summary: 'Get staking rewards for a delegator' })
  @ApiParam({ name: 'address', description: 'Delegator address' })
  @ApiQuery({
    name: 'period',
    required: false,
    type: String,
    description: 'Filter by period',
  })
  @ApiResponse({
    status: 200,
    description: 'Delegator rewards retrieved successfully',
  })
  async getDelegatorRewards(
    @Param('address') delegatorAddress: string,
    @Query('period') period?: string,
  ) {
    return this.treasuryService.getDelegatorRewards(delegatorAddress, period);
  }

  @Get('staking/rewards/claimable')
  @ApiOperation({ summary: 'Get claimable rewards for authenticated user' })
  @ApiResponse({
    status: 200,
    description: 'Claimable rewards retrieved successfully',
  })
  async getClaimableRewards(@Request() req: any) {
    const address = req.user.address?.toLowerCase() || req.user.id;
    return this.treasuryService.getClaimableRewards(address);
  }

  @Get('staking/rewards/period/:period/summary')
  @ApiOperation({ summary: 'Get rewards summary for a period' })
  @ApiParam({ name: 'period', description: 'Period identifier' })
  @ApiResponse({
    status: 200,
    description: 'Rewards summary retrieved successfully',
  })
  async getPeriodRewardsSummary(@Param('period') period: string) {
    return this.treasuryService.getPeriodRewardsSummary(period);
  }
}

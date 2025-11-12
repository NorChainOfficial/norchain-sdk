import {
  Injectable,
  Logger,
  BadRequestException,
  NotFoundException,
} from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { RevenueDistribution, DistributionType, DistributionStatus } from './entities/revenue-distribution.entity';
import { StakingReward, RewardType, RewardStatus } from './entities/staking-reward.entity';
import { DistributeRevenueDto } from './dto/distribute-revenue.dto';
import { CreateStakingRewardDto } from './dto/create-staking-reward.dto';
import { EventEmitter2 } from '@nestjs/event-emitter';
import { ethers } from 'ethers';

@Injectable()
export class TreasuryService {
  private readonly logger = new Logger(TreasuryService.name);

  // Default distribution percentages (from overview.md)
  private readonly DEFAULT_DISTRIBUTION = {
    validatorRewards: 25.0,
    developerGrants: 20.0,
    aiFund: 10.0,
    charityEsg: 5.0,
    treasuryReserve: 40.0,
  };

  constructor(
    @InjectRepository(RevenueDistribution)
    private readonly revenueDistributionRepository: Repository<RevenueDistribution>,
    @InjectRepository(StakingReward)
    private readonly stakingRewardRepository: Repository<StakingReward>,
    private readonly eventEmitter: EventEmitter2,
  ) {}

  /**
   * Distribute revenue according to configured percentages
   */
  async distributeRevenue(dto: DistributeRevenueDto): Promise<RevenueDistribution[]> {
    const totalRevenue = parseFloat(dto.totalRevenue);
    if (totalRevenue <= 0) {
      throw new BadRequestException('Total revenue must be greater than 0');
    }

    // Use custom percentages if provided, otherwise use defaults
    const percentages = {
      validatorRewards: dto.distributionPercentages?.validatorRewards ?? this.DEFAULT_DISTRIBUTION.validatorRewards,
      developerGrants: dto.distributionPercentages?.developerGrants ?? this.DEFAULT_DISTRIBUTION.developerGrants,
      aiFund: dto.distributionPercentages?.aiFund ?? this.DEFAULT_DISTRIBUTION.aiFund,
      charityEsg: dto.distributionPercentages?.charityEsg ?? this.DEFAULT_DISTRIBUTION.charityEsg,
      treasuryReserve: dto.distributionPercentages?.treasuryReserve ?? this.DEFAULT_DISTRIBUTION.treasuryReserve,
    };

    // Validate percentages sum to 100%
    const totalPercentage = Object.values(percentages).reduce((sum, p) => sum + p, 0);
    if (Math.abs(totalPercentage - 100.0) > 0.01) {
      throw new BadRequestException(`Distribution percentages must sum to 100% (got ${totalPercentage}%)`);
    }

    const distributions: RevenueDistribution[] = [];

    // Create distribution records
    const distributionTypes = [
      { type: DistributionType.VALIDATOR_REWARDS, percentage: percentages.validatorRewards },
      { type: DistributionType.DEVELOPER_GRANTS, percentage: percentages.developerGrants },
      { type: DistributionType.AI_FUND, percentage: percentages.aiFund },
      { type: DistributionType.CHARITY_ESG, percentage: percentages.charityEsg },
      { type: DistributionType.TREASURY_RESERVE, percentage: percentages.treasuryReserve },
    ];

    for (const { type, percentage } of distributionTypes) {
      const amount = (totalRevenue * percentage) / 100;
      const distribution = this.revenueDistributionRepository.create({
        period: dto.period,
        type,
        amount: amount.toFixed(18),
        percentage,
        status: DistributionStatus.PENDING,
      });

      const saved = await this.revenueDistributionRepository.save(distribution);
      distributions.push(saved);

      this.logger.log(
        `Created revenue distribution: ${type} - ${amount.toFixed(2)} NOR (${percentage}%)`,
      );
    }

    // Emit event for processing
    this.eventEmitter.emit('treasury.revenue.distributed', {
      period: dto.period,
      totalRevenue: dto.totalRevenue,
      distributions: distributions.map((d) => ({
        id: d.id,
        type: d.type,
        amount: d.amount,
        percentage: d.percentage,
      })),
    });

    return distributions;
  }

  /**
   * Get revenue distributions for a period
   */
  async getRevenueDistributions(
    period: string,
    type?: DistributionType,
  ): Promise<RevenueDistribution[]> {
    const where: any = { period };
    if (type) {
      where.type = type;
    }

    return this.revenueDistributionRepository.find({
      where,
      order: { createdAt: 'DESC' },
    });
  }

  /**
   * Create staking reward
   */
  async createStakingReward(dto: CreateStakingRewardDto): Promise<StakingReward> {
    // Validate addresses based on reward type
    if (
      (dto.type === RewardType.VALIDATOR_STAKING || dto.type === RewardType.DELEGATOR_STAKING) &&
      !dto.validatorAddress
    ) {
      throw new BadRequestException('Validator address required for validator/delegator rewards');
    }

    if (dto.type === RewardType.DELEGATOR_STAKING && !dto.delegatorAddress) {
      throw new BadRequestException('Delegator address required for delegator rewards');
    }

    const reward = this.stakingRewardRepository.create({
      ...dto,
      claimableUntil: dto.claimableUntil ? new Date(dto.claimableUntil) : undefined,
      status: RewardStatus.PENDING,
    });

    const saved = await this.stakingRewardRepository.save(reward);

    this.logger.log(
      `Created staking reward: ${dto.type} - ${dto.amount} NOR for period ${dto.period}`,
    );

    this.eventEmitter.emit('treasury.staking.reward.created', {
      rewardId: saved.id,
      type: dto.type,
      amount: dto.amount,
      period: dto.period,
    });

    return saved;
  }

  /**
   * Claim staking reward
   */
  async claimReward(rewardId: string, recipientAddress: string): Promise<StakingReward> {
    const reward = await this.stakingRewardRepository.findOne({
      where: { id: rewardId },
    });

    if (!reward) {
      throw new NotFoundException(`Reward ${rewardId} not found`);
    }

    if (reward.status === RewardStatus.CLAIMED) {
      throw new BadRequestException('Reward already claimed');
    }

    if (reward.status === RewardStatus.EXPIRED) {
      throw new BadRequestException('Reward has expired');
    }

    if (reward.claimableUntil && new Date(reward.claimableUntil) < new Date()) {
      reward.status = RewardStatus.EXPIRED;
      await this.stakingRewardRepository.save(reward);
      throw new BadRequestException('Reward has expired');
    }

    // In production, this would trigger an on-chain transaction
    // For now, just mark as claimed
    reward.status = RewardStatus.CLAIMED;
    // reward.claimTxHash = '0x...'; // Would be set after on-chain confirmation
    // reward.claimBlockNo = 12345; // Would be set after on-chain confirmation

    const saved = await this.stakingRewardRepository.save(reward);

    this.logger.log(`Reward ${rewardId} claimed by ${recipientAddress}`);

    this.eventEmitter.emit('treasury.staking.reward.claimed', {
      rewardId: saved.id,
      recipientAddress,
      amount: saved.amount,
    });

    return saved;
  }

  /**
   * Get staking rewards for a validator
   */
  async getValidatorRewards(
    validatorAddress: string,
    period?: string,
  ): Promise<StakingReward[]> {
    const where: any = { validatorAddress };
    if (period) {
      where.period = period;
    }

    return this.stakingRewardRepository.find({
      where,
      order: { createdAt: 'DESC' },
    });
  }

  /**
   * Get staking rewards for a delegator
   */
  async getDelegatorRewards(
    delegatorAddress: string,
    period?: string,
  ): Promise<StakingReward[]> {
    const where: any = { delegatorAddress };
    if (period) {
      where.period = period;
    }

    return this.stakingRewardRepository.find({
      where,
      order: { createdAt: 'DESC' },
    });
  }

  /**
   * Get claimable rewards for an address
   */
  async getClaimableRewards(address: string): Promise<StakingReward[]> {
    const now = new Date();

    return this.stakingRewardRepository.find({
      where: [
        { delegatorAddress: address, status: RewardStatus.PENDING },
        { validatorAddress: address, status: RewardStatus.PENDING },
      ],
      order: { createdAt: 'DESC' },
    }).then((rewards) =>
      rewards.filter(
        (reward) =>
          !reward.claimableUntil || new Date(reward.claimableUntil) >= now,
      ),
    );
  }

  /**
   * Calculate total rewards for a period
   */
  async getPeriodRewardsSummary(period: string): Promise<{
    totalRewards: string;
    byType: Record<RewardType, { count: number; total: string }>;
    claimable: string;
    claimed: string;
  }> {
    const rewards = await this.stakingRewardRepository.find({
      where: { period },
    });

    const byType: Record<RewardType, { count: number; total: string }> = {
      [RewardType.VALIDATOR_STAKING]: { count: 0, total: '0' },
      [RewardType.DELEGATOR_STAKING]: { count: 0, total: '0' },
      [RewardType.LIQUIDITY_PROVIDER]: { count: 0, total: '0' },
      [RewardType.GOVERNANCE_PARTICIPATION]: { count: 0, total: '0' },
    };

    let totalRewards = 0;
    let claimable = 0;
    let claimed = 0;

    for (const reward of rewards) {
      const amount = parseFloat(reward.amount);
      totalRewards += amount;

      if (reward.status === RewardStatus.PENDING) {
        claimable += amount;
      } else if (reward.status === RewardStatus.CLAIMED) {
        claimed += amount;
      }

      byType[reward.type].count++;
      byType[reward.type].total = (
        parseFloat(byType[reward.type].total) + amount
      ).toFixed(18);
    }

    return {
      totalRewards: totalRewards.toFixed(18),
      byType,
      claimable: claimable.toFixed(18),
      claimed: claimed.toFixed(18),
    };
  }
}


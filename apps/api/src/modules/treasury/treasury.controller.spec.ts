import { Test, TestingModule } from '@nestjs/testing';
import { TreasuryController } from './treasury.controller';
import { TreasuryService } from './treasury.service';
import { DistributeRevenueDto } from './dto/distribute-revenue.dto';
import { CreateStakingRewardDto } from './dto/create-staking-reward.dto';
import { ClaimRewardDto } from './dto/claim-reward.dto';
import {
  RevenueDistribution,
  DistributionType,
} from './entities/revenue-distribution.entity';
import {
  StakingReward,
  RewardType,
  RewardStatus,
} from './entities/staking-reward.entity';

describe('TreasuryController', () => {
  let controller: TreasuryController;
  let service: TreasuryService;

  const mockTreasuryService = {
    distributeRevenue: jest.fn(),
    getRevenueDistributions: jest.fn(),
    createStakingReward: jest.fn(),
    claimReward: jest.fn(),
    getValidatorRewards: jest.fn(),
    getDelegatorRewards: jest.fn(),
    getClaimableRewards: jest.fn(),
    getPeriodRewardsSummary: jest.fn(),
  };

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      controllers: [TreasuryController],
      providers: [
        {
          provide: TreasuryService,
          useValue: mockTreasuryService,
        },
      ],
    }).compile();

    controller = module.get<TreasuryController>(TreasuryController);
    service = module.get<TreasuryService>(TreasuryService);
  });

  afterEach(() => {
    jest.clearAllMocks();
  });

  describe('distributeRevenue', () => {
    it('should distribute revenue', async () => {
      const dto: DistributeRevenueDto = {
        period: '2025-01',
        totalRevenue: '10000.00',
      };

      const mockDistributions: RevenueDistribution[] = [
        {
          id: 'dist-1',
          period: '2025-01',
          type: DistributionType.VALIDATOR_REWARDS,
          amount: '2500.00',
          percentage: 25.0,
        } as RevenueDistribution,
      ];

      mockTreasuryService.distributeRevenue.mockResolvedValue(mockDistributions);

      const result = await controller.distributeRevenue(dto);

      expect(result).toEqual(mockDistributions);
      expect(service.distributeRevenue).toHaveBeenCalledWith(dto);
    });
  });

  describe('getRevenueDistributions', () => {
    it('should get revenue distributions', async () => {
      const period = '2025-01';
      const mockDistributions: RevenueDistribution[] = [];

      mockTreasuryService.getRevenueDistributions.mockResolvedValue(
        mockDistributions,
      );

      const result = await controller.getRevenueDistributions(period);

      expect(result).toEqual(mockDistributions);
      expect(service.getRevenueDistributions).toHaveBeenCalledWith(period, undefined);
    });

    it('should filter by type when provided', async () => {
      const period = '2025-01';
      const type = DistributionType.VALIDATOR_REWARDS;

      mockTreasuryService.getRevenueDistributions.mockResolvedValue([]);

      await controller.getRevenueDistributions(period, type);

      expect(service.getRevenueDistributions).toHaveBeenCalledWith(period, type);
    });
  });

  describe('createStakingReward', () => {
    it('should create a staking reward', async () => {
      const dto: CreateStakingRewardDto = {
        period: '2025-01',
        type: RewardType.VALIDATOR_STAKING,
        amount: '100.00',
        validatorAddress: '0x742d35Cc6634C0532925a3b844Bc9e7595f0bEb0',
      };

      const mockReward: StakingReward = {
        id: 'reward-1',
        period: dto.period,
        type: dto.type,
        amount: dto.amount,
        validatorAddress: dto.validatorAddress,
        delegatorAddress: dto.delegatorAddress,
        stakedAmount: dto.stakedAmount,
        apy: dto.apy,
        claimableUntil: dto.claimableUntil ? new Date(dto.claimableUntil) : null,
        metadata: dto.metadata,
        status: RewardStatus.PENDING,
        createdAt: new Date(),
        updatedAt: new Date(),
      } as StakingReward;

      mockTreasuryService.createStakingReward.mockResolvedValue(mockReward);

      const result = await controller.createStakingReward(dto);

      expect(result).toEqual(mockReward);
      expect(service.createStakingReward).toHaveBeenCalledWith(dto);
    });
  });

  describe('claimReward', () => {
    it('should claim a reward', async () => {
      const rewardId = 'reward-1';
      const dto: ClaimRewardDto = {
        rewardId: 'reward-1',
        recipientAddress: '0x742d35Cc6634C0532925a3b844Bc9e7595f0bEb0',
      };

      const mockReward: StakingReward = {
        id: rewardId,
        amount: '100.00',
      } as StakingReward;

      const mockRequest = {
        user: {
          id: 'user-1',
          address: '0x742d35Cc6634C0532925a3b844Bc9e7595f0bEb0',
        },
      };

      mockTreasuryService.claimReward.mockResolvedValue(mockReward);

      const result = await controller.claimReward(rewardId, dto, mockRequest);

      expect(result).toEqual(mockReward);
      expect(service.claimReward).toHaveBeenCalledWith(
        rewardId,
        dto.recipientAddress || mockRequest.user.address.toLowerCase(),
      );
    });

    it('should use user address from request if recipientAddress not provided', async () => {
      const rewardId = 'reward-1';
      const dto: ClaimRewardDto = {
        rewardId: 'reward-1',
      };

      const mockRequest = {
        user: {
          id: 'user-1',
          address: '0x742d35Cc6634C0532925a3b844Bc9e7595f0bEb0',
        },
      };

      mockTreasuryService.claimReward.mockResolvedValue({} as StakingReward);

      await controller.claimReward(rewardId, dto, mockRequest);

      expect(service.claimReward).toHaveBeenCalledWith(
        rewardId,
        '0x742d35cc6634c0532925a3b844bc9e7595f0beb0',
      );
    });
  });

  describe('getValidatorRewards', () => {
    it('should get validator rewards', async () => {
      const validatorAddress = '0x742d35Cc6634C0532925a3b844Bc9e7595f0bEb0';
      const mockRewards: StakingReward[] = [];

      mockTreasuryService.getValidatorRewards.mockResolvedValue(mockRewards);

      const result = await controller.getValidatorRewards(validatorAddress);

      expect(result).toEqual(mockRewards);
      expect(service.getValidatorRewards).toHaveBeenCalledWith(
        validatorAddress,
        undefined,
      );
    });

    it('should filter by period when provided', async () => {
      const validatorAddress = '0x742d35Cc6634C0532925a3b844Bc9e7595f0bEb0';
      const period = '2025-01';

      mockTreasuryService.getValidatorRewards.mockResolvedValue([]);

      await controller.getValidatorRewards(validatorAddress, period);

      expect(service.getValidatorRewards).toHaveBeenCalledWith(
        validatorAddress,
        period,
      );
    });
  });

  describe('getDelegatorRewards', () => {
    it('should get delegator rewards', async () => {
      const delegatorAddress = '0x1234567890123456789012345678901234567890';
      const mockRewards: StakingReward[] = [];

      mockTreasuryService.getDelegatorRewards.mockResolvedValue(mockRewards);

      const result = await controller.getDelegatorRewards(delegatorAddress);

      expect(result).toEqual(mockRewards);
      expect(service.getDelegatorRewards).toHaveBeenCalledWith(
        delegatorAddress,
        undefined,
      );
    });
  });

  describe('getClaimableRewards', () => {
    it('should get claimable rewards for authenticated user', async () => {
      const mockRequest = {
        user: {
          id: 'user-1',
          address: '0x742d35Cc6634C0532925a3b844Bc9e7595f0bEb0',
        },
      };

      const mockRewards: StakingReward[] = [];

      mockTreasuryService.getClaimableRewards.mockResolvedValue(mockRewards);

      const result = await controller.getClaimableRewards(mockRequest);

      expect(result).toEqual(mockRewards);
      expect(service.getClaimableRewards).toHaveBeenCalledWith(
        '0x742d35cc6634c0532925a3b844bc9e7595f0beb0',
      );
    });

    it('should use user id if address not available', async () => {
      const mockRequest = {
        user: {
          id: 'user-1',
        },
      };

      mockTreasuryService.getClaimableRewards.mockResolvedValue([]);

      await controller.getClaimableRewards(mockRequest);

      expect(service.getClaimableRewards).toHaveBeenCalledWith('user-1');
    });
  });

  describe('getPeriodRewardsSummary', () => {
    it('should get rewards summary for a period', async () => {
      const period = '2025-01';
      const mockSummary = {
        totalRewards: '225.00',
        byType: {
          [RewardType.VALIDATOR_STAKING]: { count: 2, total: '175.00' },
          [RewardType.DELEGATOR_STAKING]: { count: 1, total: '50.00' },
          [RewardType.LIQUIDITY_PROVIDER]: { count: 0, total: '0' },
          [RewardType.GOVERNANCE_PARTICIPATION]: { count: 0, total: '0' },
        },
        claimable: '175.00',
        claimed: '50.00',
      };

      mockTreasuryService.getPeriodRewardsSummary.mockResolvedValue(mockSummary);

      const result = await controller.getPeriodRewardsSummary(period);

      expect(result).toEqual(mockSummary);
      expect(service.getPeriodRewardsSummary).toHaveBeenCalledWith(period);
    });
  });
});


import { Test, TestingModule } from '@nestjs/testing';
import { getRepositoryToken } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { TreasuryService } from './treasury.service';
import {
  RevenueDistribution,
  DistributionType,
  DistributionStatus,
} from './entities/revenue-distribution.entity';
import {
  StakingReward,
  RewardType,
  RewardStatus,
} from './entities/staking-reward.entity';
import { DistributeRevenueDto } from './dto/distribute-revenue.dto';
import { CreateStakingRewardDto } from './dto/create-staking-reward.dto';
import { BadRequestException, NotFoundException } from '@nestjs/common';
import { EventEmitter2 } from '@nestjs/event-emitter';

describe('TreasuryService', () => {
  let service: TreasuryService;
  let revenueDistributionRepository: Repository<RevenueDistribution>;
  let stakingRewardRepository: Repository<StakingReward>;
  let eventEmitter: EventEmitter2;

  const mockRevenueDistributionRepository = {
    create: jest.fn(),
    save: jest.fn(),
    find: jest.fn(),
    findOne: jest.fn(),
  };

  const mockStakingRewardRepository = {
    create: jest.fn(),
    save: jest.fn(),
    find: jest.fn(),
    findOne: jest.fn(),
  };

  const mockEventEmitter = {
    emit: jest.fn(),
  };

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      providers: [
        TreasuryService,
        {
          provide: getRepositoryToken(RevenueDistribution),
          useValue: mockRevenueDistributionRepository,
        },
        {
          provide: getRepositoryToken(StakingReward),
          useValue: mockStakingRewardRepository,
        },
        {
          provide: EventEmitter2,
          useValue: mockEventEmitter,
        },
      ],
    }).compile();

    service = module.get<TreasuryService>(TreasuryService);
    revenueDistributionRepository = module.get<Repository<RevenueDistribution>>(
      getRepositoryToken(RevenueDistribution),
    );
    stakingRewardRepository = module.get<Repository<StakingReward>>(
      getRepositoryToken(StakingReward),
    );
    eventEmitter = module.get<EventEmitter2>(EventEmitter2);
  });

  afterEach(() => {
    jest.clearAllMocks();
  });

  describe('distributeRevenue', () => {
    it('should distribute revenue with default percentages', async () => {
      const dto: DistributeRevenueDto = {
        period: '2025-01',
        totalRevenue: '10000.00',
      };

      const mockDistributions = [
        {
          id: 'dist-1',
          period: '2025-01',
          type: DistributionType.VALIDATOR_REWARDS,
          amount: '2500.000000000000000000',
          percentage: 25.0,
          status: DistributionStatus.PENDING,
        },
        {
          id: 'dist-2',
          period: '2025-01',
          type: DistributionType.DEVELOPER_GRANTS,
          amount: '2000.000000000000000000',
          percentage: 20.0,
          status: DistributionStatus.PENDING,
        },
      ];

      mockRevenueDistributionRepository.create.mockReturnValue({});
      mockRevenueDistributionRepository.save
        .mockResolvedValueOnce(mockDistributions[0])
        .mockResolvedValueOnce(mockDistributions[1])
        .mockResolvedValueOnce({ id: 'dist-3' })
        .mockResolvedValueOnce({ id: 'dist-4' })
        .mockResolvedValueOnce({ id: 'dist-5' });

      const result = await service.distributeRevenue(dto);

      expect(result).toHaveLength(5);
      expect(mockRevenueDistributionRepository.save).toHaveBeenCalledTimes(5);
      expect(mockEventEmitter.emit).toHaveBeenCalledWith(
        'treasury.revenue.distributed',
        expect.objectContaining({
          period: '2025-01',
          totalRevenue: '10000.00',
        }),
      );
    });

    it('should distribute revenue with custom percentages', async () => {
      const dto: DistributeRevenueDto = {
        period: '2025-01',
        totalRevenue: '10000.00',
        distributionPercentages: {
          validatorRewards: 30.0,
          developerGrants: 25.0,
          aiFund: 15.0,
          charityEsg: 10.0,
          treasuryReserve: 20.0,
        },
      };

      mockRevenueDistributionRepository.create.mockReturnValue({});
      mockRevenueDistributionRepository.save.mockResolvedValue({ id: 'dist-1' });

      const result = await service.distributeRevenue(dto);

      expect(result).toHaveLength(5);
      expect(mockEventEmitter.emit).toHaveBeenCalled();
    });

    it('should throw BadRequestException if total revenue is zero', async () => {
      const dto: DistributeRevenueDto = {
        period: '2025-01',
        totalRevenue: '0',
      };

      await expect(service.distributeRevenue(dto)).rejects.toThrow(
        BadRequestException,
      );
    });

    it('should throw BadRequestException if total revenue is negative', async () => {
      const dto: DistributeRevenueDto = {
        period: '2025-01',
        totalRevenue: '-1000.00',
      };

      await expect(service.distributeRevenue(dto)).rejects.toThrow(
        BadRequestException,
      );
    });

    it('should throw BadRequestException if percentages do not sum to 100%', async () => {
      const dto: DistributeRevenueDto = {
        period: '2025-01',
        totalRevenue: '10000.00',
        distributionPercentages: {
          validatorRewards: 30.0,
          developerGrants: 30.0,
          aiFund: 20.0,
          charityEsg: 10.0,
          treasuryReserve: 5.0, // Total = 95%
        },
      };

      await expect(service.distributeRevenue(dto)).rejects.toThrow(
        BadRequestException,
      );
    });
  });

  describe('getRevenueDistributions', () => {
    it('should return revenue distributions for a period', async () => {
      const period = '2025-01';
      const mockDistributions = [
        {
          id: 'dist-1',
          period,
          type: DistributionType.VALIDATOR_REWARDS,
          amount: '2500.00',
        },
      ];

      mockRevenueDistributionRepository.find.mockResolvedValue(
        mockDistributions,
      );

      const result = await service.getRevenueDistributions(period);

      expect(result).toEqual(mockDistributions);
      expect(mockRevenueDistributionRepository.find).toHaveBeenCalledWith({
        where: { period },
        order: { createdAt: 'DESC' },
      });
    });

    it('should filter by distribution type when provided', async () => {
      const period = '2025-01';
      const type = DistributionType.VALIDATOR_REWARDS;

      mockRevenueDistributionRepository.find.mockResolvedValue([]);

      await service.getRevenueDistributions(period, type);

      expect(mockRevenueDistributionRepository.find).toHaveBeenCalledWith({
        where: { period, type },
        order: { createdAt: 'DESC' },
      });
    });
  });

  describe('createStakingReward', () => {
    it('should create a validator staking reward', async () => {
      const dto: CreateStakingRewardDto = {
        period: '2025-01',
        type: RewardType.VALIDATOR_STAKING,
        amount: '100.00',
        validatorAddress: '0x742d35Cc6634C0532925a3b844Bc9e7595f0bEb0',
        apy: 12.5,
      };

      const mockReward = {
        id: 'reward-1',
        ...dto,
        status: RewardStatus.PENDING,
      };

      mockStakingRewardRepository.create.mockReturnValue(mockReward);
      mockStakingRewardRepository.save.mockResolvedValue(mockReward);

      const result = await service.createStakingReward(dto);

      expect(result).toEqual(mockReward);
      expect(mockStakingRewardRepository.save).toHaveBeenCalled();
      expect(mockEventEmitter.emit).toHaveBeenCalledWith(
        'treasury.staking.reward.created',
        expect.objectContaining({
          rewardId: 'reward-1',
          type: RewardType.VALIDATOR_STAKING,
        }),
      );
    });

    it('should create a delegator staking reward', async () => {
      const dto: CreateStakingRewardDto = {
        period: '2025-01',
        type: RewardType.DELEGATOR_STAKING,
        amount: '50.00',
        validatorAddress: '0x742d35Cc6634C0532925a3b844Bc9e7595f0bEb0',
        delegatorAddress: '0x1234567890123456789012345678901234567890',
      };

      const mockReward = {
        id: 'reward-2',
        ...dto,
        status: RewardStatus.PENDING,
      };

      mockStakingRewardRepository.create.mockReturnValue(mockReward);
      mockStakingRewardRepository.save.mockResolvedValue(mockReward);

      const result = await service.createStakingReward(dto);

      expect(result).toEqual(mockReward);
    });

    it('should throw BadRequestException if validator address missing for validator reward', async () => {
      const dto: CreateStakingRewardDto = {
        period: '2025-01',
        type: RewardType.VALIDATOR_STAKING,
        amount: '100.00',
      };

      await expect(service.createStakingReward(dto)).rejects.toThrow(
        BadRequestException,
      );
    });

    it('should throw BadRequestException if delegator address missing for delegator reward', async () => {
      const dto: CreateStakingRewardDto = {
        period: '2025-01',
        type: RewardType.DELEGATOR_STAKING,
        amount: '50.00',
        validatorAddress: '0x742d35Cc6634C0532925a3b844Bc9e7595f0bEb0',
      };

      await expect(service.createStakingReward(dto)).rejects.toThrow(
        BadRequestException,
      );
    });

    it('should handle claimableUntil date', async () => {
      const dto: CreateStakingRewardDto = {
        period: '2025-01',
        type: RewardType.VALIDATOR_STAKING,
        amount: '100.00',
        validatorAddress: '0x742d35Cc6634C0532925a3b844Bc9e7595f0bEb0',
        claimableUntil: '2025-12-31T23:59:59Z',
      };

      const mockReward = {
        id: 'reward-3',
        ...dto,
        claimableUntil: new Date('2025-12-31T23:59:59Z'),
        status: RewardStatus.PENDING,
      };

      mockStakingRewardRepository.create.mockReturnValue(mockReward);
      mockStakingRewardRepository.save.mockResolvedValue(mockReward);

      const result = await service.createStakingReward(dto);

      expect(result).toEqual(mockReward);
    });
  });

  describe('claimReward', () => {
    it('should claim a reward successfully', async () => {
      const rewardId = 'reward-1';
      const recipientAddress = '0x742d35Cc6634C0532925a3b844Bc9e7595f0bEb0';

      const mockReward = {
        id: rewardId,
        amount: '100.00',
        status: RewardStatus.PENDING,
        claimableUntil: null,
      };

      mockStakingRewardRepository.findOne.mockResolvedValue(mockReward);
      mockStakingRewardRepository.save.mockResolvedValue({
        ...mockReward,
        status: RewardStatus.CLAIMED,
      });

      const result = await service.claimReward(rewardId, recipientAddress);

      expect(result.status).toBe(RewardStatus.CLAIMED);
      expect(mockEventEmitter.emit).toHaveBeenCalledWith(
        'treasury.staking.reward.claimed',
        expect.objectContaining({
          rewardId,
          recipientAddress,
        }),
      );
    });

    it('should throw NotFoundException if reward not found', async () => {
      mockStakingRewardRepository.findOne.mockResolvedValue(null);

      await expect(
        service.claimReward('invalid-id', '0x123'),
      ).rejects.toThrow(NotFoundException);
    });

    it('should throw BadRequestException if reward already claimed', async () => {
      const mockReward = {
        id: 'reward-1',
        status: RewardStatus.CLAIMED,
      };

      mockStakingRewardRepository.findOne.mockResolvedValue(mockReward);

      await expect(
        service.claimReward('reward-1', '0x123'),
      ).rejects.toThrow(BadRequestException);
    });

    it('should throw BadRequestException if reward expired', async () => {
      const mockReward = {
        id: 'reward-1',
        status: RewardStatus.EXPIRED,
      };

      mockStakingRewardRepository.findOne.mockResolvedValue(mockReward);

      await expect(
        service.claimReward('reward-1', '0x123'),
      ).rejects.toThrow(BadRequestException);
    });

    it('should expire reward if claimableUntil date passed', async () => {
      const pastDate = new Date('2020-01-01');
      const mockReward = {
        id: 'reward-1',
        status: RewardStatus.PENDING,
        claimableUntil: pastDate,
      };

      mockStakingRewardRepository.findOne.mockResolvedValue(mockReward);
      mockStakingRewardRepository.save.mockResolvedValue({
        ...mockReward,
        status: RewardStatus.EXPIRED,
      });

      await expect(
        service.claimReward('reward-1', '0x123'),
      ).rejects.toThrow(BadRequestException);

      expect(mockStakingRewardRepository.save).toHaveBeenCalledWith(
        expect.objectContaining({ status: RewardStatus.EXPIRED }),
      );
    });
  });

  describe('getValidatorRewards', () => {
    it('should return rewards for a validator', async () => {
      const validatorAddress = '0x742d35Cc6634C0532925a3b844Bc9e7595f0bEb0';
      const mockRewards = [
        {
          id: 'reward-1',
          validatorAddress,
          amount: '100.00',
        },
      ];

      mockStakingRewardRepository.find.mockResolvedValue(mockRewards);

      const result = await service.getValidatorRewards(validatorAddress);

      expect(result).toEqual(mockRewards);
      expect(mockStakingRewardRepository.find).toHaveBeenCalledWith({
        where: { validatorAddress },
        order: { createdAt: 'DESC' },
      });
    });

    it('should filter by period when provided', async () => {
      const validatorAddress = '0x742d35Cc6634C0532925a3b844Bc9e7595f0bEb0';
      const period = '2025-01';

      mockStakingRewardRepository.find.mockResolvedValue([]);

      await service.getValidatorRewards(validatorAddress, period);

      expect(mockStakingRewardRepository.find).toHaveBeenCalledWith({
        where: { validatorAddress, period },
        order: { createdAt: 'DESC' },
      });
    });
  });

  describe('getDelegatorRewards', () => {
    it('should return rewards for a delegator', async () => {
      const delegatorAddress = '0x1234567890123456789012345678901234567890';
      const mockRewards = [
        {
          id: 'reward-1',
          delegatorAddress,
          amount: '50.00',
        },
      ];

      mockStakingRewardRepository.find.mockResolvedValue(mockRewards);

      const result = await service.getDelegatorRewards(delegatorAddress);

      expect(result).toEqual(mockRewards);
    });

    it('should filter by period when provided', async () => {
      const delegatorAddress = '0x1234567890123456789012345678901234567890';
      const period = '2025-01';

      mockStakingRewardRepository.find.mockResolvedValue([]);

      await service.getDelegatorRewards(delegatorAddress, period);

      expect(mockStakingRewardRepository.find).toHaveBeenCalledWith({
        where: { delegatorAddress, period },
        order: { createdAt: 'DESC' },
      });
    });
  });

  describe('getClaimableRewards', () => {
    it('should return claimable rewards for an address', async () => {
      const address = '0x742d35Cc6634C0532925a3b844Bc9e7595f0bEb0';
      const futureDate = new Date();
      futureDate.setFullYear(futureDate.getFullYear() + 1);

      const mockRewards = [
        {
          id: 'reward-1',
          delegatorAddress: address,
          status: RewardStatus.PENDING,
          claimableUntil: futureDate,
        },
        {
          id: 'reward-2',
          validatorAddress: address,
          status: RewardStatus.PENDING,
          claimableUntil: null,
        },
      ];

      mockStakingRewardRepository.find.mockResolvedValue(mockRewards);

      const result = await service.getClaimableRewards(address);

      expect(result).toHaveLength(2);
    });

    it('should filter out expired rewards', async () => {
      const address = '0x742d35Cc6634C0532925a3b844Bc9e7595f0bEb0';
      const pastDate = new Date('2020-01-01');

      const mockRewards = [
        {
          id: 'reward-1',
          delegatorAddress: address,
          status: RewardStatus.PENDING,
          claimableUntil: pastDate,
        },
        {
          id: 'reward-2',
          validatorAddress: address,
          status: RewardStatus.PENDING,
          claimableUntil: null,
        },
      ];

      mockStakingRewardRepository.find.mockResolvedValue(mockRewards);

      const result = await service.getClaimableRewards(address);

      expect(result).toHaveLength(1);
      expect(result[0].id).toBe('reward-2');
    });
  });

  describe('getPeriodRewardsSummary', () => {
    it('should calculate rewards summary for a period', async () => {
      const period = '2025-01';
      const mockRewards = [
        {
          id: 'reward-1',
          period,
          type: RewardType.VALIDATOR_STAKING,
          amount: '100.00',
          status: RewardStatus.PENDING,
        },
        {
          id: 'reward-2',
          period,
          type: RewardType.DELEGATOR_STAKING,
          amount: '50.00',
          status: RewardStatus.CLAIMED,
        },
        {
          id: 'reward-3',
          period,
          type: RewardType.VALIDATOR_STAKING,
          amount: '75.00',
          status: RewardStatus.PENDING,
        },
      ];

      mockStakingRewardRepository.find.mockResolvedValue(mockRewards);

      const result = await service.getPeriodRewardsSummary(period);

      expect(result.totalRewards).toBe('225.000000000000000000');
      expect(result.byType[RewardType.VALIDATOR_STAKING].count).toBe(2);
      expect(result.byType[RewardType.VALIDATOR_STAKING].total).toBe(
        '175.000000000000000000',
      );
      expect(result.claimable).toBe('175.000000000000000000');
      expect(result.claimed).toBe('50.000000000000000000');
    });

    it('should handle empty rewards', async () => {
      const period = '2025-01';
      mockStakingRewardRepository.find.mockResolvedValue([]);

      const result = await service.getPeriodRewardsSummary(period);

      expect(result.totalRewards).toBe('0.000000000000000000');
      expect(result.claimable).toBe('0.000000000000000000');
      expect(result.claimed).toBe('0.000000000000000000');
    });
  });
});


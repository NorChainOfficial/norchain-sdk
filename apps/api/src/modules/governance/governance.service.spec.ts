import { Test, TestingModule } from '@nestjs/testing';
import { getRepositoryToken } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { GovernanceService } from './governance.service';
import {
  GovernanceProposal,
  ProposalStatus,
} from './entities/governance-proposal.entity';
import { GovernanceVote } from './entities/governance-vote.entity';
import { CreateProposalDto } from './dto/create-proposal.dto';
import { CreateVoteDto } from './dto/create-vote.dto';
import { NotFoundException, BadRequestException } from '@nestjs/common';
import { RpcService } from '@/common/services/rpc.service';

describe('GovernanceService', () => {
  let service: GovernanceService;
  let proposalRepository: Repository<GovernanceProposal>;
  let voteRepository: Repository<GovernanceVote>;

  const mockProposalRepository = {
    create: jest.fn(),
    save: jest.fn(),
    findOne: jest.fn(),
    find: jest.fn(),
    findAndCount: jest.fn(),
  };

  const mockVoteRepository = {
    create: jest.fn(),
    save: jest.fn(),
    findOne: jest.fn(),
    find: jest.fn(),
    findAndCount: jest.fn(),
  };

  const mockRpcService = {
    getBalance: jest.fn().mockResolvedValue(BigInt('1000000000000000000')),
  };

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      providers: [
        GovernanceService,
        {
          provide: getRepositoryToken(GovernanceProposal),
          useValue: mockProposalRepository,
        },
        {
          provide: getRepositoryToken(GovernanceVote),
          useValue: mockVoteRepository,
        },
        {
          provide: RpcService,
          useValue: mockRpcService,
        },
      ],
    }).compile();

    service = module.get<GovernanceService>(GovernanceService);
    proposalRepository = module.get<Repository<GovernanceProposal>>(
      getRepositoryToken(GovernanceProposal),
    );
    voteRepository = module.get<Repository<GovernanceVote>>(
      getRepositoryToken(GovernanceVote),
    );
  });

  afterEach(() => {
    jest.clearAllMocks();
  });

  describe('createProposal', () => {
    it('should create a governance proposal', async () => {
      const dto: CreateProposalDto = {
        title: 'Test Proposal',
        description: 'Test description',
        type: 'parameter_change' as any,
        parameters: { key: 'value' },
      };

      const mockProposal = {
        id: 'proposal-123',
        proposer: '0x742d35Cc6634C0532925a3b844Bc9e7595f0bEb0',
        ...dto,
        status: ProposalStatus.DRAFT,
        createdAt: new Date(),
        forVotes: '0',
        againstVotes: '0',
        abstainVotes: '0',
        quorum: '1000000000000000000000',
        threshold: '500000000000000000000',
      };

      // Mock checkProposalPermission to return true
      jest.spyOn(service as any, 'checkProposalPermission').mockResolvedValue(true);
      mockProposalRepository.create.mockReturnValue(mockProposal);
      mockProposalRepository.save.mockResolvedValue(mockProposal);

      const result = await service.createProposal(
        'user-123',
        '0x742d35Cc6634C0532925a3b844Bc9e7595f0bEb0',
        dto,
      );

      expect(result).toHaveProperty('proposal_id');
      expect(result).toHaveProperty('status', ProposalStatus.DRAFT);
      expect(mockProposalRepository.save).toHaveBeenCalled();
    });
  });

  describe('getProposal', () => {
    it('should return proposal details', async () => {
      const proposalId = 'proposal-123';
      const mockProposal = {
        id: proposalId,
        title: 'Test Proposal',
        description: 'Test description',
        type: 'parameter_change' as any,
        status: ProposalStatus.ACTIVE,
        proposer: '0x742d35Cc6634C0532925a3b844Bc9e7595f0bEb0',
        parameters: {},
        forVotes: '0',
        againstVotes: '0',
        abstainVotes: '0',
        quorum: '1000000000000000000000',
        threshold: '500000000000000000000',
        startTime: null,
        endTime: null,
        votes: [],
        createdAt: new Date(),
        executedAt: null,
        executionTxHash: null,
      };

      mockProposalRepository.findOne.mockResolvedValue(mockProposal);

      const result = await service.getProposal(proposalId);

      expect(result).toHaveProperty('proposal_id', proposalId);
    });

    it('should throw NotFoundException if proposal not found', async () => {
      mockProposalRepository.findOne.mockResolvedValue(null);

      await expect(service.getProposal('invalid-id')).rejects.toThrow(
        NotFoundException,
      );
    });
  });

  describe('submitVote', () => {
    it('should cast a vote on a proposal', async () => {
      const dto: CreateVoteDto = {
        choice: 'for' as any,
        reason: 'Test reason',
      };

      const mockProposal = {
        id: 'proposal-123',
        status: ProposalStatus.ACTIVE,
        forVotes: '0',
        againstVotes: '0',
        abstainVotes: '0',
        quorum: '1000000000000000000000',
        threshold: '500000000000000000000',
        startTime: null,
        endTime: null,
      };

      const mockVote = {
        id: 'vote-123',
        proposalId: 'proposal-123',
        voter: '0x742d35Cc6634C0532925a3b844Bc9e7595f0bEb0',
        choice: 'for',
        weight: '1000000000000000000',
        createdAt: new Date(),
      };

      mockProposalRepository.findOne.mockResolvedValue(mockProposal);
      mockVoteRepository.findOne.mockResolvedValue(null); // No existing vote
      mockVoteRepository.create.mockReturnValue(mockVote);
      mockVoteRepository.save.mockResolvedValue(mockVote);
      mockProposalRepository.save.mockResolvedValue(mockProposal);

      const result = await service.submitVote(
        'user-123',
        '0x742d35Cc6634C0532925a3b844Bc9e7595f0bEb0',
        'proposal-123',
        dto,
      );

      expect(result).toHaveProperty('vote_id');
      expect(mockVoteRepository.save).toHaveBeenCalled();
    });

    it('should throw NotFoundException if proposal not found', async () => {
      const dto: CreateVoteDto = {
        choice: 'for' as any,
        reason: 'Test',
      };

      mockProposalRepository.findOne.mockResolvedValue(null);

      await expect(
        service.submitVote(
          'user-123',
          '0x742d35Cc6634C0532925a3b844Bc9e7595f0bEb0',
          'invalid-id',
          dto,
        ),
      ).rejects.toThrow(NotFoundException);
    });

    it('should throw BadRequestException if proposal is not active', async () => {
      const dto: CreateVoteDto = {
        choice: 'for' as any,
        reason: 'Test',
      };

      mockProposalRepository.findOne.mockResolvedValue({
        id: 'proposal-123',
        status: ProposalStatus.EXECUTED,
      });

      await expect(
        service.submitVote(
          'user-123',
          '0x742d35Cc6634C0532925a3b844Bc9e7595f0bEb0',
          'proposal-123',
          dto,
        ),
      ).rejects.toThrow(BadRequestException);
    });

    it('should throw BadRequestException if user already voted', async () => {
      const dto: CreateVoteDto = {
        choice: 'for' as any,
        reason: 'Test',
      };

      mockProposalRepository.findOne.mockResolvedValue({
        id: 'proposal-123',
        status: ProposalStatus.ACTIVE,
        forVotes: '0',
        againstVotes: '0',
        abstainVotes: '0',
        quorum: '1000000000000000000000',
        threshold: '500000000000000000000',
        startTime: null,
        endTime: null,
      });
      mockVoteRepository.findOne.mockResolvedValue({
        id: 'vote-123',
        voter: '0x742d35Cc6634C0532925a3b844Bc9e7595f0bEb0',
      });

      await expect(
        service.submitVote(
          'user-123',
          '0x742d35Cc6634C0532925a3b844Bc9e7595f0bEb0',
          'proposal-123',
          dto,
        ),
      ).rejects.toThrow(BadRequestException);
    });
  });

  describe('getProposals', () => {
    it('should return paginated proposals', async () => {
      const mockProposals = [
        {
          id: 'proposal-1',
          title: 'Test Proposal',
          status: ProposalStatus.ACTIVE,
        },
      ];

      mockProposalRepository.findAndCount.mockResolvedValue([
        mockProposals,
        1,
      ]);

      const result = await service.getProposals(50, 0);

      expect(result).toHaveProperty('proposals');
      expect(result).toHaveProperty('total', 1);
    });
  });

  describe('getTally', () => {
    it('should tally votes for a proposal', async () => {
      const proposalId = 'proposal-123';
      const mockProposal = {
        id: proposalId,
        status: ProposalStatus.ACTIVE,
        forVotes: '1000000000000000000',
        againstVotes: '500000000000000000',
        abstainVotes: '0',
        quorum: '1000000000000000000000',
        threshold: '500000000000000000000',
        votes: [],
      };

      mockProposalRepository.findOne.mockResolvedValue(mockProposal);

      const result = await service.getTally(proposalId);

      expect(result).toHaveProperty('forVotes');
      expect(result).toHaveProperty('againstVotes');
      expect(result).toHaveProperty('totalVotes');
    });

    it('should throw NotFoundException if proposal not found', async () => {
      mockProposalRepository.findOne.mockResolvedValue(null);

      await expect(service.getTally('invalid-id')).rejects.toThrow(
        NotFoundException,
      );
    });
  });

  describe('getParameters', () => {
    it('should return governance parameters', async () => {
      const result = await service.getParameters();

      expect(result).toHaveProperty('minProposalDeposit');
      expect(result).toHaveProperty('votingPeriod');
      expect(result).toHaveProperty('quorumPercentage');
    });
  });

  describe('getProposals', () => {
    it('should filter proposals by status', async () => {
      const mockProposals = [
        {
          id: 'proposal-1',
          title: 'Active Proposal',
          status: ProposalStatus.ACTIVE,
        },
      ];

      mockProposalRepository.findAndCount.mockResolvedValue([
        mockProposals,
        1,
      ]);

      const result = await service.getProposals(50, 0, ProposalStatus.ACTIVE);

      expect(result.proposals).toHaveLength(1);
      expect(mockProposalRepository.findAndCount).toHaveBeenCalledWith(
        expect.objectContaining({
          where: { status: ProposalStatus.ACTIVE },
        }),
      );
    });

    it('should return empty array when no proposals', async () => {
      mockProposalRepository.findAndCount.mockResolvedValue([[], 0]);

      const result = await service.getProposals(50, 0);

      expect(result.proposals).toEqual([]);
      expect(result.total).toBe(0);
    });

    it('should handle pagination correctly', async () => {
      mockProposalRepository.findAndCount.mockResolvedValue([[], 100]);

      const result = await service.getProposals(10, 5);

      expect(result.total).toBe(100);
      expect(mockProposalRepository.findAndCount).toHaveBeenCalledWith(
        expect.objectContaining({
          take: 10,
          skip: 5,
        }),
      );
    });
  });

  describe('createProposal', () => {
    it('should throw ForbiddenException if insufficient voting power', async () => {
      const dto: CreateProposalDto = {
        title: 'Test Proposal',
        description: 'Test description',
        type: 'parameter_change' as any,
        parameters: { key: 'value' },
      };

      jest.spyOn(service as any, 'checkProposalPermission').mockResolvedValue(false);

      await expect(
        service.createProposal(
          'user-123',
          '0x742d35Cc6634C0532925a3b844Bc9e7595f0bEb0',
          dto,
        ),
      ).rejects.toThrow('Insufficient voting power');
    });

    it('should handle proposal with start and end times', async () => {
      const dto: CreateProposalDto = {
        title: 'Test Proposal',
        description: 'Test description',
        type: 'parameter_change' as any,
        parameters: { key: 'value' },
        startTime: new Date().toISOString(),
        endTime: new Date(Date.now() + 7 * 24 * 60 * 60 * 1000).toISOString(),
      };

      const mockProposal = {
        id: 'proposal-123',
        ...dto,
        status: ProposalStatus.DRAFT,
      };

      jest.spyOn(service as any, 'checkProposalPermission').mockResolvedValue(true);
      mockProposalRepository.create.mockReturnValue(mockProposal);
      mockProposalRepository.save.mockResolvedValue(mockProposal);

      const result = await service.createProposal(
        'user-123',
        '0x742d35Cc6634C0532925a3b844Bc9e7595f0bEb0',
        dto,
      );

      expect(result).toHaveProperty('proposal_id');
    });
  });

  describe('getTally', () => {
    it('should calculate total votes correctly', async () => {
      const proposalId = 'proposal-123';
      const mockProposal = {
        id: proposalId,
        status: ProposalStatus.ACTIVE,
        forVotes: '1000000000000000000',
        againstVotes: '500000000000000000',
        abstainVotes: '200000000000000000',
        quorum: '1000000000000000000000',
        threshold: '500000000000000000000',
        votes: [],
      };

      mockProposalRepository.findOne.mockResolvedValue(mockProposal);

      const result = await service.getTally(proposalId);

      expect(result.totalVotes).toBe('1700000000000000000');
    });

    it('should calculate quorum met correctly', async () => {
      const proposalId = 'proposal-123';
      const mockProposal = {
        id: proposalId,
        status: ProposalStatus.ACTIVE,
        forVotes: '600000000000000000000',
        againstVotes: '400000000000000000000',
        abstainVotes: '0',
        quorum: '1000000000000000000000',
        threshold: '500000000000000000000',
        votes: [],
      };

      mockProposalRepository.findOne.mockResolvedValue(mockProposal);

      const result = await service.getTally(proposalId);

      expect(result.quorumMet).toBe(true);
      expect(result.passed).toBe(true);
    });

    it('should calculate quorum not met correctly', async () => {
      const proposalId = 'proposal-123';
      const mockProposal = {
        id: proposalId,
        status: ProposalStatus.ACTIVE,
        forVotes: '100000000000000000000',
        againstVotes: '50000000000000000000',
        abstainVotes: '0',
        quorum: '1000000000000000000000',
        threshold: '500000000000000000000',
        votes: [],
      };

      mockProposalRepository.findOne.mockResolvedValue(mockProposal);

      const result = await service.getTally(proposalId);

      expect(result.quorumMet).toBe(false);
      expect(result.passed).toBe(false);
    });

    it('should handle proposal with zero votes', async () => {
      const proposalId = 'proposal-123';
      const mockProposal = {
        id: proposalId,
        status: ProposalStatus.ACTIVE,
        forVotes: '0',
        againstVotes: '0',
        abstainVotes: '0',
        quorum: '1000000000000000000000',
        threshold: '500000000000000000000',
        votes: [],
      };

      mockProposalRepository.findOne.mockResolvedValue(mockProposal);

      const result = await service.getTally(proposalId);

      expect(result.totalVotes).toBe('0');
      expect(result.quorumMet).toBe(false);
      expect(result.passed).toBe(false);
    });
  });

  describe('getParameters', () => {
    it('should return governance parameters', async () => {
      const result = await service.getParameters();

      expect(result).toHaveProperty('minProposalDeposit');
      expect(result).toHaveProperty('votingPeriod');
      expect(result).toHaveProperty('quorumPercentage');
      expect(result).toHaveProperty('thresholdPercentage');
      expect(result).toHaveProperty('executionDelay');
    });
  });

  describe('Edge Cases', () => {
    it('should handle getProposal with invalid proposal ID', async () => {
      mockProposalRepository.findOne.mockResolvedValue(null);

      await expect(service.getProposal('non-existent')).rejects.toThrow(
        NotFoundException,
      );
    });

    it('should handle getTally with invalid proposal ID', async () => {
      mockProposalRepository.findOne.mockResolvedValue(null);

      await expect(service.getTally('non-existent')).rejects.toThrow(
        NotFoundException,
      );
    });

    it('should handle getProposals with empty result', async () => {
      mockProposalRepository.findAndCount.mockResolvedValue([[], 0]);

      const result = await service.getProposals(50, 0);

      expect(result.proposals).toEqual([]);
      expect(result.total).toBe(0);
    });

    it('should handle getProposals with status filter', async () => {
      const mockProposals = [
        {
          id: 'proposal-1',
          status: ProposalStatus.ACTIVE,
          forVotes: '0',
          againstVotes: '0',
          abstainVotes: '0',
        },
      ];

      mockProposalRepository.findAndCount.mockResolvedValue([mockProposals, 1]);

      const result = await service.getProposals(50, 0, ProposalStatus.ACTIVE);

      expect(result.proposals).toHaveLength(1);
      expect(result.proposals[0].status).toBe(ProposalStatus.ACTIVE);
    });
  });
});


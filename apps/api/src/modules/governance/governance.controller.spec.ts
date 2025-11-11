import { Test, TestingModule } from '@nestjs/testing';
import { GovernanceController } from './governance.controller';
import { GovernanceService } from './governance.service';
import { ProposalStatus } from './entities/governance-proposal.entity';
import { CreateProposalDto } from './dto/create-proposal.dto';
import { CreateVoteDto } from './dto/create-vote.dto';

describe('GovernanceController', () => {
  let controller: GovernanceController;
  let governanceService: GovernanceService;

  const mockGovernanceService = {
    createProposal: jest.fn(),
    getProposal: jest.fn(),
    getProposals: jest.fn(),
    submitVote: jest.fn(),
    getTally: jest.fn(),
    getParameters: jest.fn(),
  };

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      controllers: [GovernanceController],
      providers: [
        {
          provide: GovernanceService,
          useValue: mockGovernanceService,
        },
      ],
    }).compile();

    controller = module.get<GovernanceController>(GovernanceController);
    governanceService = module.get<GovernanceService>(GovernanceService);
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

      const mockResult = {
        proposal_id: 'proposal-123',
        status: 'draft',
      };

      mockGovernanceService.createProposal.mockResolvedValue(mockResult);

      const result = await controller.createProposal(
        { user: { id: 'user-123' } },
        dto,
        '0x742d35Cc6634C0532925a3b844Bc9e7595f0bEb0',
      );

      expect(result).toEqual(mockResult);
    });
  });

  describe('getProposal', () => {
    it('should return proposal details', async () => {
      const proposalId = 'proposal-123';
      const mockProposal = {
        proposalId,
        title: 'Test Proposal',
      };

      mockGovernanceService.getProposal.mockResolvedValue(mockProposal);

      const result = await controller.getProposal(proposalId);

      expect(result).toEqual(mockProposal);
    });
  });

  describe('submitVote', () => {
    it('should cast a vote', async () => {
      const dto: CreateVoteDto = {
        choice: 'for' as any,
        reason: 'Test reason',
      };

      const mockResult = {
        vote_id: 'vote-123',
        proposal_id: 'proposal-123',
        choice: 'for',
        weight: '1000000000000000000',
        message: 'Vote submitted successfully',
      };

      mockGovernanceService.submitVote.mockResolvedValue(mockResult);

      const result = await controller.submitVote(
        { user: { id: 'user-123' } },
        'proposal-123',
        dto,
        '0x742d35Cc6634C0532925a3b844Bc9e7595f0bEb0',
      );

      expect(result).toEqual(mockResult);
    });
  });

  describe('getTally', () => {
    it('should return vote tally', async () => {
      const proposalId = 'proposal-123';
      const mockTally = {
        proposal_id: proposalId,
        forVotes: '1000000000000000000',
        againstVotes: '500000000000000000',
        abstainVotes: '0',
        totalVotes: '1500000000000000000',
        quorum: '1000000000000000000000',
        quorumMet: false,
        threshold: '500000000000000000000',
        passed: false,
        status: ProposalStatus.ACTIVE,
      };

      mockGovernanceService.getTally.mockResolvedValue(mockTally);

      const result = await controller.getTally(proposalId);

      expect(result).toEqual(mockTally);
    });
  });
});


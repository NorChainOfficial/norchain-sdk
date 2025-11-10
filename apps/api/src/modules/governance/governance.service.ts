import {
  Injectable,
  NotFoundException,
  BadRequestException,
  ForbiddenException,
} from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import {
  GovernanceProposal,
  ProposalStatus,
  ProposalType,
} from './entities/governance-proposal.entity';
import { GovernanceVote, VoteChoice } from './entities/governance-vote.entity';
import { CreateProposalDto } from './dto/create-proposal.dto';
import { CreateVoteDto } from './dto/create-vote.dto';
import { RpcService } from '@/common/services/rpc.service';

@Injectable()
export class GovernanceService {
  constructor(
    @InjectRepository(GovernanceProposal)
    private readonly proposalRepository: Repository<GovernanceProposal>,
    @InjectRepository(GovernanceVote)
    private readonly voteRepository: Repository<GovernanceVote>,
    private readonly rpcService: RpcService,
  ) {}

  /**
   * Create a governance proposal
   */
  async createProposal(
    userId: string,
    proposerAddress: string,
    dto: CreateProposalDto,
  ) {
    // Check if user has enough voting power to create proposal
    // In production, this would check staked tokens or governance token balance
    const hasPermission = await this.checkProposalPermission(proposerAddress);
    if (!hasPermission) {
      throw new ForbiddenException(
        'Insufficient voting power to create proposal',
      );
    }

    const proposal = this.proposalRepository.create({
      proposer: proposerAddress,
      title: dto.title,
      description: dto.description,
      type: dto.type,
      status: ProposalStatus.DRAFT,
      parameters: dto.parameters,
      startTime: dto.startTime ? new Date(dto.startTime) : null,
      endTime: dto.endTime ? new Date(dto.endTime) : null,
      quorum: '1000000000000000000000', // Default quorum (1000 tokens)
      threshold: '500000000000000000000', // Default threshold (500 tokens, 50% of quorum)
    });

    const savedProposal = await this.proposalRepository.save(proposal);

    return {
      proposal_id: savedProposal.id,
      title: savedProposal.title,
      status: savedProposal.status,
      type: savedProposal.type,
      createdAt: savedProposal.createdAt,
    };
  }

  /**
   * Get all proposals
   */
  async getProposals(
    limit: number = 50,
    offset: number = 0,
    status?: ProposalStatus,
  ) {
    const where: any = {};
    if (status) {
      where.status = status;
    }

    const [proposals, total] = await this.proposalRepository.findAndCount({
      where,
      order: { createdAt: 'DESC' },
      take: limit,
      skip: offset,
      relations: ['votes'],
    });

    return {
      proposals: proposals.map((p) => ({
        proposal_id: p.id,
        title: p.title,
        type: p.type,
        status: p.status,
        proposer: p.proposer,
        forVotes: p.forVotes,
        againstVotes: p.againstVotes,
        abstainVotes: p.abstainVotes,
        startTime: p.startTime,
        endTime: p.endTime,
        createdAt: p.createdAt,
      })),
      total,
      limit,
      offset,
    };
  }

  /**
   * Get proposal details
   */
  async getProposal(proposalId: string) {
    const proposal = await this.proposalRepository.findOne({
      where: { id: proposalId },
      relations: ['votes'],
    });

    if (!proposal) {
      throw new NotFoundException('Proposal not found');
    }

    return {
      proposal_id: proposal.id,
      title: proposal.title,
      description: proposal.description,
      type: proposal.type,
      status: proposal.status,
      proposer: proposal.proposer,
      parameters: proposal.parameters,
      forVotes: proposal.forVotes,
      againstVotes: proposal.againstVotes,
      abstainVotes: proposal.abstainVotes,
      quorum: proposal.quorum,
      threshold: proposal.threshold,
      startTime: proposal.startTime,
      endTime: proposal.endTime,
      votes:
        proposal.votes?.map((v) => ({
          voter: v.voter,
          choice: v.choice,
          weight: v.weight,
          reason: v.reason,
          createdAt: v.createdAt,
        })) || [],
      createdAt: proposal.createdAt,
      executedAt: proposal.executedAt,
    };
  }

  /**
   * Submit a vote on a proposal
   */
  async submitVote(
    userId: string,
    voterAddress: string,
    proposalId: string,
    dto: CreateVoteDto,
  ) {
    const proposal = await this.proposalRepository.findOne({
      where: { id: proposalId },
    });

    if (!proposal) {
      throw new NotFoundException('Proposal not found');
    }

    // Check if proposal is active
    if (proposal.status !== ProposalStatus.ACTIVE) {
      throw new BadRequestException('Proposal is not active for voting');
    }

    // Check if voting period is open
    const now = new Date();
    if (proposal.startTime && now < proposal.startTime) {
      throw new BadRequestException('Voting has not started yet');
    }
    if (proposal.endTime && now > proposal.endTime) {
      throw new BadRequestException('Voting period has ended');
    }

    // Check if user already voted
    const existingVote = await this.voteRepository.findOne({
      where: { proposalId, voter: voterAddress },
    });

    if (existingVote) {
      throw new BadRequestException('You have already voted on this proposal');
    }

    // Get voting weight (in production, this would check staked tokens)
    const votingWeight = await this.getVotingWeight(voterAddress);

    // Create vote
    const vote = this.voteRepository.create({
      proposalId,
      voter: voterAddress,
      choice: dto.choice,
      weight: votingWeight.toString(),
      reason: dto.reason,
    });

    await this.voteRepository.save(vote);

    // Update proposal vote counts
    const voteValue = BigInt(votingWeight);
    if (dto.choice === VoteChoice.FOR) {
      proposal.forVotes = (BigInt(proposal.forVotes) + voteValue).toString();
    } else if (dto.choice === VoteChoice.AGAINST) {
      proposal.againstVotes = (
        BigInt(proposal.againstVotes) + voteValue
      ).toString();
    } else {
      proposal.abstainVotes = (
        BigInt(proposal.abstainVotes) + voteValue
      ).toString();
    }

    // Check if proposal passed
    const totalVotes =
      BigInt(proposal.forVotes) +
      BigInt(proposal.againstVotes) +
      BigInt(proposal.abstainVotes);
    if (totalVotes >= BigInt(proposal.quorum)) {
      const forVotes = BigInt(proposal.forVotes);
      if (forVotes >= BigInt(proposal.threshold)) {
        proposal.status = ProposalStatus.PASSED;
      } else {
        proposal.status = ProposalStatus.REJECTED;
      }
    }

    await this.proposalRepository.save(proposal);

    return {
      vote_id: vote.id,
      proposal_id: proposalId,
      choice: vote.choice,
      weight: vote.weight,
      message: 'Vote submitted successfully',
    };
  }

  /**
   * Get vote tally for a proposal
   */
  async getTally(proposalId: string) {
    const proposal = await this.proposalRepository.findOne({
      where: { id: proposalId },
      relations: ['votes'],
    });

    if (!proposal) {
      throw new NotFoundException('Proposal not found');
    }

    const totalVotes =
      BigInt(proposal.forVotes) +
      BigInt(proposal.againstVotes) +
      BigInt(proposal.abstainVotes);
    const quorumMet = totalVotes >= BigInt(proposal.quorum);
    const passed =
      quorumMet && BigInt(proposal.forVotes) >= BigInt(proposal.threshold);

    return {
      proposal_id: proposalId,
      forVotes: proposal.forVotes,
      againstVotes: proposal.againstVotes,
      abstainVotes: proposal.abstainVotes,
      totalVotes: totalVotes.toString(),
      quorum: proposal.quorum,
      quorumMet,
      threshold: proposal.threshold,
      passed,
      status: proposal.status,
    };
  }

  /**
   * Get governance parameters
   */
  async getParameters() {
    // In production, this would fetch from on-chain governance contract
    return {
      minProposalDeposit: '100000000000000000000', // 100 tokens
      votingPeriod: 7 * 24 * 60 * 60 * 1000, // 7 days in milliseconds
      quorumPercentage: 10, // 10% of total supply
      thresholdPercentage: 50, // 50% of votes must be "for"
      executionDelay: 24 * 60 * 60 * 1000, // 24 hours
    };
  }

  /**
   * Check if address has permission to create proposals
   */
  private async checkProposalPermission(address: string): Promise<boolean> {
    // In production, check staked tokens or governance token balance
    // For now, allow all addresses
    return true;
  }

  /**
   * Get voting weight for an address
   */
  private async getVotingWeight(address: string): Promise<bigint> {
    // In production, this would check staked tokens or governance token balance
    // For now, return a mock value
    const balance = await this.rpcService.getBalance(address);
    return balance; // Use balance as voting weight
  }
}

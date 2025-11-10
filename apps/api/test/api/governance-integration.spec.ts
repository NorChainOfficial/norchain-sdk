import { Test, TestingModule } from '@nestjs/testing';
import { INestApplication } from '@nestjs/common';
import * as request from 'supertest';
import { AppModule } from '../../src/app.module';
import { GovernanceProposal, ProposalStatus, ProposalType } from '../../src/modules/governance/entities/governance-proposal.entity';
import { GovernanceVote, VoteChoice } from '../../src/modules/governance/entities/governance-vote.entity';
import { getRepositoryToken } from '@nestjs/typeorm';
import { Repository } from 'typeorm';

describe('Governance API Integration (e2e)', () => {
  let app: INestApplication;
  let proposalRepository: Repository<GovernanceProposal>;
  let voteRepository: Repository<GovernanceVote>;
  let authToken: string;
  let userId: string;

  beforeAll(async () => {
    const moduleFixture: TestingModule = await Test.createTestingModule({
      imports: [AppModule],
    }).compile();

    app = moduleFixture.createNestApplication();
    await app.init();

    proposalRepository = moduleFixture.get<Repository<GovernanceProposal>>(
      getRepositoryToken(GovernanceProposal),
    );
    voteRepository = moduleFixture.get<Repository<GovernanceVote>>(
      getRepositoryToken(GovernanceVote),
    );

    // Get auth token
    const authResponse = await request(app.getHttpServer())
      .post('/api/v1/auth/login')
      .send({
        email: 'test@example.com',
        password: 'testpassword',
      });

    if (authResponse.status === 200) {
      authToken = authResponse.body.access_token;
      userId = authResponse.body.user.id;
    }
  });

  afterAll(async () => {
    await app.close();
  });

  describe('GET /api/v1/governance/proposals', () => {
    it('should list all proposals', async () => {
      const response = await request(app.getHttpServer())
        .get('/api/v1/governance/proposals')
        .expect(200);

      expect(response.body).toHaveProperty('proposals');
      expect(response.body).toHaveProperty('total');
      expect(Array.isArray(response.body.proposals)).toBe(true);
    });

    it('should filter by status', async () => {
      const response = await request(app.getHttpServer())
        .get('/api/v1/governance/proposals?status=active')
        .expect(200);

      expect(response.body).toHaveProperty('proposals');
      expect(Array.isArray(response.body.proposals)).toBe(true);
    });
  });

  describe('POST /api/v1/governance/proposals', () => {
    it('should create a proposal', async () => {
      const proposalDto = {
        title: 'Test Proposal',
        description: 'This is a test proposal',
        type: ProposalType.PARAMETER_CHANGE,
        parameters: {
          minStake: '50000000000000000000000',
        },
      };

      const response = await request(app.getHttpServer())
        .post('/api/v1/governance/proposals')
        .set('Authorization', `Bearer ${authToken}`)
        .query({ proposer: '0x742d35Cc6634C0532925a3b844Bc9e7595f0bEb0' })
        .send(proposalDto)
        .expect(201);

      expect(response.body).toHaveProperty('proposal_id');
      expect(response.body).toHaveProperty('title', proposalDto.title);
      expect(response.body).toHaveProperty('status', ProposalStatus.DRAFT);
    });
  });

  describe('GET /api/v1/governance/proposals/:id', () => {
    it('should get proposal details', async () => {
      // Create proposal first
      const proposalDto = {
        title: 'Test Proposal Details',
        description: 'Test description',
        type: ProposalType.GENERAL,
        parameters: {},
      };

      const createResponse = await request(app.getHttpServer())
        .post('/api/v1/governance/proposals')
        .set('Authorization', `Bearer ${authToken}`)
        .query({ proposer: '0x742d35Cc6634C0532925a3b844Bc9e7595f0bEb0' })
        .send(proposalDto);

      const proposalId = createResponse.body.proposal_id;

      const response = await request(app.getHttpServer())
        .get(`/api/v1/governance/proposals/${proposalId}`)
        .expect(200);

      expect(response.body).toHaveProperty('proposal_id', proposalId);
      expect(response.body).toHaveProperty('title', proposalDto.title);
      expect(response.body).toHaveProperty('votes');
      expect(Array.isArray(response.body.votes)).toBe(true);
    });
  });

  describe('POST /api/v1/governance/proposals/:id/votes', () => {
    it('should submit a vote', async () => {
      // Create proposal first
      const proposalDto = {
        title: 'Voting Test Proposal',
        description: 'Test voting',
        type: ProposalType.GENERAL,
        parameters: {},
        startTime: new Date().toISOString(),
        endTime: new Date(Date.now() + 7 * 24 * 60 * 60 * 1000).toISOString(),
      };

      const createResponse = await request(app.getHttpServer())
        .post('/api/v1/governance/proposals')
        .set('Authorization', `Bearer ${authToken}`)
        .query({ proposer: '0x742d35Cc6634C0532925a3b844Bc9e7595f0bEb0' })
        .send(proposalDto);

      const proposalId = createResponse.body.proposal_id;

      // Activate proposal (would normally be done by admin or automatically)
      await proposalRepository.update(proposalId, { status: ProposalStatus.ACTIVE });

      const voteDto = {
        choice: VoteChoice.FOR,
        reason: 'I support this proposal',
      };

      const response = await request(app.getHttpServer())
        .post(`/api/v1/governance/proposals/${proposalId}/votes`)
        .set('Authorization', `Bearer ${authToken}`)
        .query({ voter: '0x742d35Cc6634C0532925a3b844Bc9e7595f0bEb0' })
        .send(voteDto)
        .expect(201);

      expect(response.body).toHaveProperty('vote_id');
      expect(response.body).toHaveProperty('choice', VoteChoice.FOR);
      expect(response.body).toHaveProperty('weight');
    });
  });

  describe('GET /api/v1/governance/proposals/:id/tally', () => {
    it('should get vote tally', async () => {
      // Create proposal first
      const proposalDto = {
        title: 'Tally Test Proposal',
        description: 'Test tally',
        type: ProposalType.GENERAL,
        parameters: {},
      };

      const createResponse = await request(app.getHttpServer())
        .post('/api/v1/governance/proposals')
        .set('Authorization', `Bearer ${authToken}`)
        .query({ proposer: '0x742d35Cc6634C0532925a3b844Bc9e7595f0bEb0' })
        .send(proposalDto);

      const proposalId = createResponse.body.proposal_id;

      const response = await request(app.getHttpServer())
        .get(`/api/v1/governance/proposals/${proposalId}/tally`)
        .expect(200);

      expect(response.body).toHaveProperty('proposal_id', proposalId);
      expect(response.body).toHaveProperty('forVotes');
      expect(response.body).toHaveProperty('againstVotes');
      expect(response.body).toHaveProperty('totalVotes');
      expect(response.body).toHaveProperty('quorumMet');
      expect(response.body).toHaveProperty('passed');
    });
  });

  describe('GET /api/v1/governance/params', () => {
    it('should get governance parameters', async () => {
      const response = await request(app.getHttpServer())
        .get('/api/v1/governance/params')
        .expect(200);

      expect(response.body).toHaveProperty('minProposalDeposit');
      expect(response.body).toHaveProperty('votingPeriod');
      expect(response.body).toHaveProperty('quorumPercentage');
      expect(response.body).toHaveProperty('thresholdPercentage');
    });
  });
});


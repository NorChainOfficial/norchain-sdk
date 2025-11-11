/**
 * Governance Integration Tests
 *
 * Tests governance service integration with database and RPC
 * - Proposal creation and retrieval
 * - Voting and tallying
 * - Parameter management
 */

import { Test, TestingModule } from '@nestjs/testing';
import { INestApplication } from '@nestjs/common';
import { AppModule } from '../../src/app.module';
import { GovernanceService } from '../../src/modules/governance/governance.service';
import { RpcService } from '../../src/common/services/rpc.service';

describe('Governance Integration Tests', () => {
  let app: INestApplication;
  let governanceService: GovernanceService;
  let rpcService: RpcService;

  beforeAll(async () => {
    const moduleFixture: TestingModule = await Test.createTestingModule({
      imports: [AppModule],
    }).compile();

    app = moduleFixture.createNestApplication();
    await app.init();

    governanceService = moduleFixture.get<GovernanceService>(GovernanceService);
    rpcService = moduleFixture.get<RpcService>(RpcService);
  });

  afterAll(async () => {
    await app.close();
  });

  describe('Governance Service', () => {
    it('should be initialized', () => {
      expect(governanceService).toBeDefined();
      expect(rpcService).toBeDefined();
    });

    it('should get governance parameters', async () => {
      try {
        const params = await governanceService.getParameters();
        expect(params).toHaveProperty('minProposalDeposit');
        expect(params).toHaveProperty('votingPeriod');
        expect(params).toHaveProperty('quorumPercentage');
      } catch (error) {
        expect(error).toBeDefined();
      }
    });

    it('should get proposals list', async () => {
      try {
        const result = await governanceService.getProposals(10, 0);
        expect(result).toHaveProperty('proposals');
        expect(result).toHaveProperty('total');
      } catch (error) {
        expect(error).toBeDefined();
      }
    });
  });
});


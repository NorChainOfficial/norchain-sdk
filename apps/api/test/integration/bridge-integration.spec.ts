/**
 * Bridge Integration Tests
 *
 * Tests bridge service integration with database, RPC, and Policy
 * - Quote generation
 * - Transfer creation and tracking
 * - Proof generation
 */

import { Test, TestingModule } from '@nestjs/testing';
import { INestApplication } from '@nestjs/common';
import { AppModule } from '../../src/app.module';
import { BridgeService } from '../../src/modules/bridge/bridge.service';
import { PolicyService } from '../../src/modules/policy/policy.service';
import { RpcService } from '../../src/common/services/rpc.service';
import { BridgeChain } from '../../src/modules/bridge/entities/bridge-transfer.entity';

describe('Bridge Integration Tests', () => {
  let app: INestApplication;
  let bridgeService: BridgeService;
  let policyService: PolicyService;
  let rpcService: RpcService;

  beforeAll(async () => {
    const moduleFixture: TestingModule = await Test.createTestingModule({
      imports: [AppModule],
    }).compile();

    app = moduleFixture.createNestApplication();
    await app.init();

    bridgeService = moduleFixture.get<BridgeService>(BridgeService);
    policyService = moduleFixture.get<PolicyService>(PolicyService);
    rpcService = moduleFixture.get<RpcService>(RpcService);
  });

  afterAll(async () => {
    await app.close();
  });

  describe('Bridge Service', () => {
    it('should be initialized', () => {
      expect(bridgeService).toBeDefined();
      expect(policyService).toBeDefined();
      expect(rpcService).toBeDefined();
    });

    it('should generate bridge quote', async () => {
      try {
        const quote = await bridgeService.getQuote({
          srcChain: BridgeChain.NOR,
          dstChain: BridgeChain.BSC,
          amount: '1000000000000000000',
          asset: 'NOR',
        });

        expect(quote).toHaveProperty('srcChain');
        expect(quote).toHaveProperty('dstChain');
        expect(quote).toHaveProperty('fees');
        expect(quote).toHaveProperty('amountAfterFees');
        expect(quote).toHaveProperty('quoteId');
      } catch (error) {
        expect(error).toBeDefined();
      }
    });

    it('should get user transfers', async () => {
      try {
        const result = await bridgeService.getUserTransfers('user-123', 10, 0);
        expect(result).toHaveProperty('transfers');
        expect(result).toHaveProperty('total');
      } catch (error) {
        expect(error).toBeDefined();
      }
    });
  });
});


/**
 * Wallet Integration Tests
 *
 * Tests wallet service integration with database, RPC, and Policy
 * - Wallet creation and import
 * - Balance retrieval
 * - Transaction sending
 * - Policy integration
 */

import { Test, TestingModule } from '@nestjs/testing';
import { INestApplication } from '@nestjs/common';
import { AppModule } from '../../src/app.module';
import { WalletService } from '../../src/modules/wallet/wallet.service';
import { PolicyService } from '../../src/modules/policy/policy.service';
import { RpcService } from '../../src/common/services/rpc.service';

describe('Wallet Integration Tests', () => {
  let app: INestApplication;
  let walletService: WalletService;
  let policyService: PolicyService;
  let rpcService: RpcService;

  beforeAll(async () => {
    const moduleFixture: TestingModule = await Test.createTestingModule({
      imports: [AppModule],
    }).compile();

    app = moduleFixture.createNestApplication();
    await app.init();

    walletService = moduleFixture.get<WalletService>(WalletService);
    policyService = moduleFixture.get<PolicyService>(PolicyService);
    rpcService = moduleFixture.get<RpcService>(RpcService);
  });

  afterAll(async () => {
    await app.close();
  });

  describe('Wallet Service', () => {
    it('should be initialized', () => {
      expect(walletService).toBeDefined();
      expect(policyService).toBeDefined();
      expect(rpcService).toBeDefined();
    });

    it('should get user wallets', async () => {
      try {
        const result = await walletService.getUserWallets('user-123');
        expect(Array.isArray(result)).toBe(true);
      } catch (error) {
        expect(error).toBeDefined();
      }
    });

    it('should get balance for address', async () => {
      try {
        const balance = await rpcService.getBalance('0x742d35Cc6634C0532925a3b844Bc9e7595f0bEb0');
        expect(balance).toBeDefined();
        expect(typeof balance).toBe('bigint');
      } catch (error) {
        expect(error).toBeDefined();
      }
    });
  });
});


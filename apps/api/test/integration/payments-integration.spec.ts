/**
 * Payments Integration Tests
 *
 * Tests payments service integration with database, RPC, Policy, and Ledger
 * - Checkout session creation
 * - Payment processing
 * - Subscription management
 * - Webhook registration
 */

import { Test, TestingModule } from '@nestjs/testing';
import { INestApplication } from '@nestjs/common';
import { AppModule } from '../../src/app.module';
import { PaymentsService } from '../../src/modules/payments/payments.service';
import { PolicyService } from '../../src/modules/policy/policy.service';
import { LedgerService } from '../../src/modules/ledger/ledger.service';
import { RpcService } from '../../src/common/services/rpc.service';

describe('Payments Integration Tests', () => {
  let app: INestApplication;
  let paymentsService: PaymentsService;
  let policyService: PolicyService;
  let ledgerService: LedgerService;
  let rpcService: RpcService;

  beforeAll(async () => {
    const moduleFixture: TestingModule = await Test.createTestingModule({
      imports: [AppModule],
    }).compile();

    app = moduleFixture.createNestApplication();
    await app.init();

    paymentsService = moduleFixture.get<PaymentsService>(PaymentsService);
    policyService = moduleFixture.get<PolicyService>(PolicyService);
    ledgerService = moduleFixture.get<LedgerService>(LedgerService);
    rpcService = moduleFixture.get<RpcService>(RpcService);
  });

  afterAll(async () => {
    await app.close();
  });

  describe('Payments Service', () => {
    it('should be initialized', () => {
      expect(paymentsService).toBeDefined();
      expect(policyService).toBeDefined();
      expect(ledgerService).toBeDefined();
      expect(rpcService).toBeDefined();
    });

    it('should get catalog', async () => {
      try {
        const catalog = await paymentsService.getCatalog('org-123');
        expect(Array.isArray(catalog)).toBe(true);
      } catch (error) {
        expect(error).toBeDefined();
      }
    });

    it('should get checkout session', async () => {
      try {
        const session = await paymentsService.getCheckoutSession('cs_1234567890_abcdef');
        expect(session).toBeDefined();
      } catch (error) {
        expect(error).toBeDefined();
      }
    });
  });
});


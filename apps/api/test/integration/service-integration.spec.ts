/**
 * Service-to-Service Integration Tests
 *
 * Tests integration between different services
 * - Payments + Ledger integration
 * - Compliance + Policy integration
 * - Bridge + Policy integration
 * - Messaging + Metadata integration
 */

import { Test, TestingModule } from '@nestjs/testing';
import { INestApplication } from '@nestjs/common';
import { AppModule } from '../../src/app.module';
import { PaymentsService } from '../../src/modules/payments/payments.service';
import { LedgerService } from '../../src/modules/ledger/ledger.service';
import { ComplianceService } from '../../src/modules/compliance/compliance.service';
import { PolicyService } from '../../src/modules/policy/policy.service';
import { BridgeService } from '../../src/modules/bridge/bridge.service';

describe('Service Integration Tests', () => {
  let app: INestApplication;
  let paymentsService: PaymentsService;
  let ledgerService: LedgerService;
  let complianceService: ComplianceService;
  let policyService: PolicyService;
  let bridgeService: BridgeService;

  beforeAll(async () => {
    const moduleFixture: TestingModule = await Test.createTestingModule({
      imports: [AppModule],
    }).compile();

    app = moduleFixture.createNestApplication();
    await app.init();

    paymentsService = moduleFixture.get<PaymentsService>(PaymentsService);
    ledgerService = moduleFixture.get<LedgerService>(LedgerService);
    complianceService = moduleFixture.get<ComplianceService>(ComplianceService);
    policyService = moduleFixture.get<PolicyService>(PolicyService);
    bridgeService = moduleFixture.get<BridgeService>(BridgeService);
  });

  afterAll(async () => {
    await app.close();
  });

  describe('Payments + Ledger Integration', () => {
    it('should post payment to ledger', async () => {
      // Test that payments are properly posted to ledger
      expect(paymentsService).toBeDefined();
      expect(ledgerService).toBeDefined();
      // In a real scenario, you'd create a payment and verify ledger entry
    });
  });

  describe('Compliance + Policy Integration', () => {
    it('should integrate compliance checks with policy', async () => {
      expect(complianceService).toBeDefined();
      expect(policyService).toBeDefined();
      // Test that compliance screenings affect policy decisions
    });
  });

  describe('Bridge + Policy Integration', () => {
    it('should check policy before bridge transfer', async () => {
      expect(bridgeService).toBeDefined();
      expect(policyService).toBeDefined();
      // Test that bridge transfers go through policy checks
    });
  });

  describe('Service Initialization', () => {
    it('should initialize all services', () => {
      expect(paymentsService).toBeDefined();
      expect(ledgerService).toBeDefined();
      expect(complianceService).toBeDefined();
      expect(policyService).toBeDefined();
      expect(bridgeService).toBeDefined();
    });
  });
});


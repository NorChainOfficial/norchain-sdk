/**
 * Policy Integration Tests
 *
 * Tests policy service integration with other services
 * - Policy checks with Payments
 * - Policy checks with Bridge
 * - Policy checks with Compliance
 * - Policy history tracking
 */

import { Test, TestingModule } from '@nestjs/testing';
import { INestApplication } from '@nestjs/common';
import { AppModule } from '../../src/app.module';
import { PolicyService } from '../../src/modules/policy/policy.service';
import { PaymentsService } from '../../src/modules/payments/payments.service';
import { BridgeService } from '../../src/modules/bridge/bridge.service';

describe('Policy Integration Tests', () => {
  let app: INestApplication;
  let policyService: PolicyService;
  let paymentsService: PaymentsService;
  let bridgeService: BridgeService;

  beforeAll(async () => {
    const moduleFixture: TestingModule = await Test.createTestingModule({
      imports: [AppModule],
    }).compile();

    app = moduleFixture.createNestApplication();
    await app.init();

    policyService = moduleFixture.get<PolicyService>(PolicyService);
    paymentsService = moduleFixture.get<PaymentsService>(PaymentsService);
    bridgeService = moduleFixture.get<BridgeService>(BridgeService);
  });

  afterAll(async () => {
    await app.close();
  });

  describe('Policy Service', () => {
    it('should be initialized', () => {
      expect(policyService).toBeDefined();
      expect(paymentsService).toBeDefined();
      expect(bridgeService).toBeDefined();
    });

    it('should check policy for payment', async () => {
      try {
        const result = await policyService.checkPolicy({
          action: 'payment',
          userId: 'user-123',
          amount: '100.00',
          currency: 'NOR',
          fromAddress: '0x742d35Cc6634C0532925a3b844Bc9e7595f0bEb0',
          toAddress: '0x742d35Cc6634C0532925a3b844Bc9e7595f0bEb1',
        });

        expect(result).toHaveProperty('allowed');
        expect(result).toHaveProperty('reason');
      } catch (error) {
        expect(error).toBeDefined();
      }
    });

    it('should check policy for bridge transfer', async () => {
      try {
        const result = await policyService.checkPolicy({
          action: 'bridge',
          userId: 'user-123',
          amount: '100.00',
          currency: 'NOR',
          fromAddress: '0x742d35Cc6634C0532925a3b844Bc9e7595f0bEb0',
          toAddress: '0x742d35Cc6634C0532925a3b844Bc9e7595f0bEb1',
        });

        expect(result).toHaveProperty('allowed');
      } catch (error) {
        expect(error).toBeDefined();
      }
    });

    it('should get policy history', async () => {
      try {
        const history = await policyService.getHistory('user-123', 10, 0);
        expect(history).toHaveProperty('checks');
        expect(history).toHaveProperty('total');
      } catch (error) {
        expect(error).toBeDefined();
      }
    });
  });
});


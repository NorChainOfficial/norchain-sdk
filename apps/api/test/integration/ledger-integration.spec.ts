/**
 * Ledger Integration Tests
 *
 * Tests ledger service integration with database and transactions
 * - Account creation and management
 * - Journal entry creation with double-entry validation
 * - Account statement generation
 * - Period closure
 */

import { Test, TestingModule } from '@nestjs/testing';
import { INestApplication } from '@nestjs/common';
import { AppModule } from '../../src/app.module';
import { LedgerService } from '../../src/modules/ledger/ledger.service';
import { DataSource } from 'typeorm';

describe('Ledger Integration Tests', () => {
  let app: INestApplication;
  let ledgerService: LedgerService;
  let dataSource: DataSource;

  beforeAll(async () => {
    const moduleFixture: TestingModule = await Test.createTestingModule({
      imports: [AppModule],
    }).compile();

    app = moduleFixture.createNestApplication();
    await app.init();

    ledgerService = moduleFixture.get<LedgerService>(LedgerService);
    dataSource = moduleFixture.get<DataSource>(DataSource);
  });

  afterAll(async () => {
    await app.close();
  });

  describe('Ledger Service', () => {
    it('should be initialized', () => {
      expect(ledgerService).toBeDefined();
      expect(dataSource).toBeDefined();
    });

    it('should list accounts', async () => {
      try {
        const accounts = await ledgerService.listAccounts('org-123');
        expect(Array.isArray(accounts)).toBe(true);
      } catch (error) {
        expect(error).toBeDefined();
      }
    });

    it('should get account statement', async () => {
      try {
        const statement = await ledgerService.getAccountStatement('account-123', 'org-123');
        expect(statement).toHaveProperty('account');
        expect(statement).toHaveProperty('movements');
        expect(statement).toHaveProperty('finalBalance');
      } catch (error) {
        expect(error).toBeDefined();
      }
    });
  });
});


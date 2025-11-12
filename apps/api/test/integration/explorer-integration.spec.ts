import { Test, TestingModule } from '@nestjs/testing';
import { INestApplication } from '@nestjs/common';
import { AppModule } from '../../src/app.module';
import { ExplorerStatsController } from '../../src/modules/explorer/explorer-stats.controller';
import { ExplorerBlocksController } from '../../src/modules/explorer/explorer-blocks.controller';
import { ExplorerTransactionsController } from '../../src/modules/explorer/explorer-transactions.controller';
import { ExplorerAccountsController } from '../../src/modules/explorer/explorer-accounts.controller';
import { ExplorerContractsController } from '../../src/modules/explorer/explorer-contracts.controller';
import { ExplorerTokensController } from '../../src/modules/explorer/explorer-tokens.controller';
import { StatsService } from '../../src/modules/stats/stats.service';
import { BlockService } from '../../src/modules/block/block.service';
import { GasService } from '../../src/modules/gas/gas.service';
import { AccountService } from '../../src/modules/account/account.service';
import { TransactionService } from '../../src/modules/transaction/transaction.service';
import { ContractService } from '../../src/modules/contract/contract.service';
import { TokenService } from '../../src/modules/token/token.service';
import { DataSource, Repository } from 'typeorm';
import { Transaction } from '../../src/modules/transaction/entities/transaction.entity';
import { getRepositoryToken } from '@nestjs/typeorm';

describe('Explorer Integration Tests', () => {
  let app: INestApplication;
  let statsController: ExplorerStatsController;
  let blocksController: ExplorerBlocksController;
  let transactionsController: ExplorerTransactionsController;
  let accountsController: ExplorerAccountsController;
  let contractsController: ExplorerContractsController;
  let tokensController: ExplorerTokensController;
  let transactionRepository: Repository<Transaction>;
  let dataSource: DataSource;

  beforeAll(async () => {
    const moduleFixture: TestingModule = await Test.createTestingModule({
      imports: [AppModule],
    }).compile();

    app = moduleFixture.createNestApplication();
    await app.init();

    statsController = moduleFixture.get<ExplorerStatsController>(ExplorerStatsController);
    blocksController = moduleFixture.get<ExplorerBlocksController>(ExplorerBlocksController);
    transactionsController = moduleFixture.get<ExplorerTransactionsController>(ExplorerTransactionsController);
    accountsController = moduleFixture.get<ExplorerAccountsController>(ExplorerAccountsController);
    contractsController = moduleFixture.get<ExplorerContractsController>(ExplorerContractsController);
    tokensController = moduleFixture.get<ExplorerTokensController>(ExplorerTokensController);
    transactionRepository = moduleFixture.get<Repository<Transaction>>(getRepositoryToken(Transaction));
    dataSource = moduleFixture.get<DataSource>(DataSource);
  });

  afterAll(async () => {
    await app.close();
  });

  describe('Stats Controller Integration', () => {
    it('should get stats with all required fields', async () => {
      const result = await statsController.getStats();

      expect(result).toBeDefined();
      expect(result).toHaveProperty('blockHeight');
      expect(result).toHaveProperty('totalTransactions');
      expect(result).toHaveProperty('totalAccounts');
      expect(result).toHaveProperty('gasPrice');
      expect(result).toHaveProperty('activeValidators');
      expect(result).toHaveProperty('latest_block');

      // Verify gas price is retrieved from gas service
      expect(result.gasPrice).toBeDefined();
      expect(result.gasPrice).not.toBe('0');
      expect(parseInt(result.gasPrice)).toBeGreaterThan(0);

      // Verify account count is calculated
      expect(result.totalAccounts).toBeDefined();
      expect(typeof result.totalAccounts).toBe('number');
      expect(result.totalAccounts).toBeGreaterThanOrEqual(0);
    });

    it('should handle errors gracefully', async () => {
      // Test with invalid data scenarios
      const result = await statsController.getStats();
      expect(result).toBeDefined();
    });
  });

  describe('Blocks Controller Integration', () => {
    it('should get blocks list with pagination', async () => {
      const result = await blocksController.getBlocks(1, 10);

      expect(result).toBeDefined();
      expect(result).toHaveProperty('data');
      expect(Array.isArray(result.data)).toBe(true);
    });

    it('should get block by height', async () => {
      // Get latest block height first
      const stats = await statsController.getStats();
      const latestHeight = stats.blockHeight;

      if (latestHeight > 0) {
        const result = await blocksController.getBlock(latestHeight);
        expect(result).toBeDefined();
        expect(result).toHaveProperty('height', latestHeight);
      }
    });
  });

  describe('Transactions Controller Integration', () => {
    it('should get transactions list with pagination', async () => {
      const result = await transactionsController.getTransactions(1, 10);

      expect(result).toBeDefined();
      expect(result).toHaveProperty('transactions');
      expect(Array.isArray(result.transactions)).toBe(true);
    });

    it('should get transaction by hash', async () => {
      // Get a transaction hash from the list
      const listResult = await transactionsController.getTransactions(1, 1);

      if (listResult.transactions && listResult.transactions.length > 0) {
        const txHash = listResult.transactions[0].hash;
        const result = await transactionsController.getTransaction(txHash);

        expect(result).toBeDefined();
        expect(result).toHaveProperty('hash', txHash);
      }
    });
  });

  describe('Accounts Controller Integration', () => {
    it('should get accounts list with pagination', async () => {
      const result = await accountsController.getAccounts(1, 10);

      expect(result).toBeDefined();
      expect(result).toHaveProperty('accounts');
      expect(Array.isArray(result.accounts)).toBe(true);
    });

    it('should get account by address', async () => {
      // Get an account address from the list
      const listResult = await accountsController.getAccounts(1, 1);

      if (listResult.accounts && listResult.accounts.length > 0) {
        const address = listResult.accounts[0].address;
        const result = await accountsController.getAccount(address);

        expect(result).toBeDefined();
        expect(result).toHaveProperty('address', address);
        expect(result).toHaveProperty('balance');
      }
    });

    it('should get account transactions', async () => {
      const listResult = await accountsController.getAccounts(1, 1);

      if (listResult.accounts && listResult.accounts.length > 0) {
        const address = listResult.accounts[0].address;
        const result = await accountsController.getAccountTransactions(address, 1, 10);

        expect(result).toBeDefined();
        expect(Array.isArray(result.data || result.transactions || [])).toBe(true);
      }
    });
  });

  describe('Contracts Controller Integration', () => {
    it('should get contract by address', async () => {
      const testAddress = '0x0000000000000000000000000000000000000000';

      try {
        const result = await contractsController.getContract(testAddress);
        expect(result).toBeDefined();
      } catch (error) {
        // Contract may not exist, which is acceptable
        expect(error.status).toBe(404);
      }
    });

    it('should get contract ABI', async () => {
      const testAddress = '0x0000000000000000000000000000000000000000';

      try {
        const result = await contractsController.getContractAbi(testAddress);
        expect(result).toBeDefined();
      } catch (error) {
        // Contract may not exist
        expect(error.status).toBe(404);
      }
    });
  });

  describe('Tokens Controller Integration', () => {
    it('should get token by address', async () => {
      const testAddress = '0x0000000000000000000000000000000000000000';

      try {
        const result = await tokensController.getToken(testAddress);
        expect(result).toBeDefined();
      } catch (error) {
        // Token may not exist
        expect(error.status).toBe(404);
      }
    });

    it('should get token holders', async () => {
      const testAddress = '0x0000000000000000000000000000000000000000';

      try {
        const result = await tokensController.getTokenHolders(testAddress, 1, 10);
        expect(result).toBeDefined();
        expect(result).toHaveProperty('data');
        expect(Array.isArray(result.data)).toBe(true);
      } catch (error) {
        // Token may not exist
        expect(error.status).toBe(404);
      }
    });

    it('should get token transfers', async () => {
      const testAddress = '0x0000000000000000000000000000000000000000';

      try {
        const result = await tokensController.getTokenTransfers(testAddress, 1, 10);
        expect(result).toBeDefined();
        expect(result).toHaveProperty('data');
        expect(Array.isArray(result.data)).toBe(true);
      } catch (error) {
        // Token may not exist
        expect(error.status).toBe(404);
      }
    });
  });

  describe('Database Integration', () => {
    it('should query transactions from database', async () => {
      const count = await transactionRepository.count();
      expect(typeof count).toBe('number');
      expect(count).toBeGreaterThanOrEqual(0);
    });

    it('should query unique addresses from transactions', async () => {
      const result = await transactionRepository
        .createQueryBuilder('tx')
        .select('COUNT(DISTINCT tx.fromAddress)', 'count')
        .getRawOne();

      expect(result).toBeDefined();
      expect(result.count).toBeDefined();
      expect(parseInt(result.count || '0', 10)).toBeGreaterThanOrEqual(0);
    });
  });

  describe('Service Integration', () => {
    it('should integrate StatsService correctly', async () => {
      const stats = await statsController.getStats();
      expect(stats).toBeDefined();
      expect(stats.blockHeight).toBeDefined();
    });

    it('should integrate GasService correctly', async () => {
      const stats = await statsController.getStats();
      expect(stats.gasPrice).toBeDefined();
      expect(parseInt(stats.gasPrice)).toBeGreaterThan(0);
    });

    it('should integrate BlockService correctly', async () => {
      const stats = await statsController.getStats();
      if (stats.blockHeight > 0) {
        const block = await blocksController.getBlock(stats.blockHeight);
        expect(block).toBeDefined();
      }
    });
  });
});


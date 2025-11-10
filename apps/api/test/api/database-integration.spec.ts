/**
 * Database Integration Tests
 * 
 * Tests database operations with real database connections
 * - CRUD operations
 * - Transactions
 * - Relationships
 * - Data integrity
 */

import { Test, TestingModule } from '@nestjs/testing';
import { INestApplication } from '@nestjs/common';
import { getRepositoryToken } from '@nestjs/typeorm';
import { Repository, DataSource } from 'typeorm';
import { AppModule } from '../../src/app.module';
import { Block } from '../../src/modules/block/entities/block.entity';
import { Transaction } from '../../src/modules/transaction/entities/transaction.entity';
import { User } from '../../src/modules/auth/entities/user.entity';
import { ApiKey } from '../../src/modules/auth/entities/api-key.entity';
import { LimitOrder } from '../../src/modules/orders/entities/limit-order.entity';
import { Notification } from '../../src/modules/notifications/entities/notification.entity';

describe('Database Integration Tests', () => {
  let app: INestApplication;
  let dataSource: DataSource;
  let blockRepository: Repository<Block>;
  let transactionRepository: Repository<Transaction>;
  let userRepository: Repository<User>;
  let apiKeyRepository: Repository<ApiKey>;
  let limitOrderRepository: Repository<LimitOrder>;
  let notificationRepository: Repository<Notification>;

  beforeAll(async () => {
    const moduleFixture: TestingModule = await Test.createTestingModule({
      imports: [AppModule],
    }).compile();

    app = moduleFixture.createNestApplication();
    await app.init();

    dataSource = moduleFixture.get<DataSource>(DataSource);
    blockRepository = moduleFixture.get<Repository<Block>>(getRepositoryToken(Block));
    transactionRepository = moduleFixture.get<Repository<Transaction>>(
      getRepositoryToken(Transaction),
    );
    userRepository = moduleFixture.get<Repository<User>>(getRepositoryToken(User));
    apiKeyRepository = moduleFixture.get<Repository<ApiKey>>(getRepositoryToken(ApiKey));
    limitOrderRepository = moduleFixture.get<Repository<LimitOrder>>(
      getRepositoryToken(LimitOrder),
    );
    notificationRepository = moduleFixture.get<Repository<Notification>>(
      getRepositoryToken(Notification),
    );
  });

  afterAll(async () => {
    // Cleanup test data
    if (dataSource && dataSource.isInitialized) {
      await notificationRepository.delete({});
      await limitOrderRepository.delete({});
      await apiKeyRepository.delete({});
      await userRepository.delete({});
      await transactionRepository.delete({});
      await blockRepository.delete({});
      await app.close();
    }
  });

  describe('Block Entity Operations', () => {
    let testBlock: Block;

    it('should create a block', async () => {
      testBlock = blockRepository.create({
        number: 999999,
        hash: '0x' + 'a'.repeat(64),
        parentHash: '0x' + 'b'.repeat(64),
        timestamp: Math.floor(Date.now() / 1000),
        miner: '0x' + 'c'.repeat(40),
        transactionCount: 0,
        gasUsed: '0',
        gasLimit: '0',
        baseFeePerGas: '0',
        extraData: '0x',
      });

      const saved = await blockRepository.save(testBlock);
      expect(saved.id).toBeDefined();
      expect(saved.number).toBe(999999);
      testBlock = saved;
    });

    it('should read a block', async () => {
      const found = await blockRepository.findOne({
        where: { number: 999999 },
      });
      expect(found).toBeDefined();
      expect(found?.number).toBe(999999);
    });

    it('should update a block', async () => {
      testBlock.transactionCount = 5;
      const updated = await blockRepository.save(testBlock);
      expect(updated.transactionCount).toBe(5);
    });

    it('should delete a block', async () => {
      await blockRepository.remove(testBlock);
      const found = await blockRepository.findOne({
        where: { number: 999999 },
      });
      expect(found).toBeNull();
    });
  });

  describe('Transaction Entity Operations', () => {
    let testTransaction: Transaction;
    let testBlock: Block;

    beforeEach(async () => {
      // Create a test block first
      testBlock = blockRepository.create({
        number: 999998,
        hash: '0x' + 'd'.repeat(64),
        parentHash: '0x' + 'e'.repeat(64),
        timestamp: Math.floor(Date.now() / 1000),
        miner: '0x' + 'f'.repeat(40),
        transactionCount: 1,
        gasUsed: '0',
        gasLimit: '0',
        baseFeePerGas: '0',
        extraData: '0x',
      });
      testBlock = await blockRepository.save(testBlock);
    });

    afterEach(async () => {
      if (testTransaction) {
        await transactionRepository.remove(testTransaction);
      }
      if (testBlock) {
        await blockRepository.remove(testBlock);
      }
    });

    it('should create a transaction', async () => {
      testTransaction = transactionRepository.create({
        hash: '0x' + '1'.repeat(64),
        blockNumber: testBlock.number,
        blockHash: testBlock.hash,
        from: '0x' + '2'.repeat(40),
        to: '0x' + '3'.repeat(40),
        value: '1000000000000000000',
        gasPrice: '20000000000',
        gasLimit: '21000',
        nonce: 0,
        input: '0x',
        transactionIndex: 0,
        status: 1,
      });

      const saved = await transactionRepository.save(testTransaction);
      expect(saved.id).toBeDefined();
      expect(saved.hash).toBe('0x' + '1'.repeat(64));
      testTransaction = saved;
    });

    it('should find transactions by block number', async () => {
      const transactions = await transactionRepository.find({
        where: { blockNumber: testBlock.number },
      });
      expect(transactions.length).toBeGreaterThan(0);
    });

    it('should find transactions by address', async () => {
      const fromTransactions = await transactionRepository.find({
        where: { from: testTransaction.from },
      });
      expect(fromTransactions.length).toBeGreaterThan(0);
    });
  });

  describe('User Entity Operations', () => {
    let testUser: User;

    it('should create a user', async () => {
      testUser = userRepository.create({
        email: `test-${Date.now()}@example.com`,
        password: 'hashed_password',
        name: 'Test User',
      });

      const saved = await userRepository.save(testUser);
      expect(saved.id).toBeDefined();
      expect(saved.email).toBe(testUser.email);
      testUser = saved;
    });

    it('should find user by email', async () => {
      const found = await userRepository.findOne({
        where: { email: testUser.email },
      });
      expect(found).toBeDefined();
      expect(found?.email).toBe(testUser.email);
    });

    it('should update user', async () => {
      testUser.name = 'Updated Name';
      const updated = await userRepository.save(testUser);
      expect(updated.name).toBe('Updated Name');
    });

    it('should delete user', async () => {
      await userRepository.remove(testUser);
      const found = await userRepository.findOne({
        where: { email: testUser.email },
      });
      expect(found).toBeNull();
    });
  });

  describe('ApiKey Entity Operations', () => {
    let testUser: User;
    let testApiKey: ApiKey;

    beforeAll(async () => {
      testUser = userRepository.create({
        email: `apikey-test-${Date.now()}@example.com`,
        password: 'hashed_password',
        name: 'API Key Test User',
      });
      testUser = await userRepository.save(testUser);
    });

    afterAll(async () => {
      if (testApiKey) {
        await apiKeyRepository.remove(testApiKey);
      }
      if (testUser) {
        await userRepository.remove(testUser);
      }
    });

    it('should create an API key', async () => {
      testApiKey = apiKeyRepository.create({
        userId: testUser.id,
        key: 'test-api-key-' + Date.now(),
        name: 'Test API Key',
        lastUsedAt: null,
      });

      const saved = await apiKeyRepository.save(testApiKey);
      expect(saved.id).toBeDefined();
      expect(saved.userId).toBe(testUser.id);
      testApiKey = saved;
    });

    it('should find API keys by user', async () => {
      const keys = await apiKeyRepository.find({
        where: { userId: testUser.id },
      });
      expect(keys.length).toBeGreaterThan(0);
    });

    it('should update API key last used', async () => {
      testApiKey.lastUsedAt = new Date();
      const updated = await apiKeyRepository.save(testApiKey);
      expect(updated.lastUsedAt).toBeDefined();
    });
  });

  describe('LimitOrder Entity Operations', () => {
    let testOrder: LimitOrder;
    const testAddress = '0x' + 'a'.repeat(40);

    it('should create a limit order', async () => {
      testOrder = limitOrderRepository.create({
        userAddress: testAddress,
        pair: 'NOR/USDT',
        side: 'buy',
        price: '0.0001',
        amount: '1000000000000000000',
        status: 'pending',
      });

      const saved = await limitOrderRepository.save(testOrder);
      expect(saved.id).toBeDefined();
      expect(saved.userAddress).toBe(testAddress);
      testOrder = saved;
    });

    it('should find orders by user address', async () => {
      const orders = await limitOrderRepository.find({
        where: { userAddress: testAddress },
      });
      expect(orders.length).toBeGreaterThan(0);
    });

    it('should update order status', async () => {
      testOrder.status = 'filled';
      const updated = await limitOrderRepository.save(testOrder);
      expect(updated.status).toBe('filled');
    });

    it('should delete order', async () => {
      await limitOrderRepository.remove(testOrder);
      const found = await limitOrderRepository.findOne({
        where: { id: testOrder.id },
      });
      expect(found).toBeNull();
    });
  });

  describe('Notification Entity Operations', () => {
    let testUser: User;
    let testNotification: Notification;

    beforeAll(async () => {
      testUser = userRepository.create({
        email: `notification-test-${Date.now()}@example.com`,
        password: 'hashed_password',
        name: 'Notification Test User',
      });
      testUser = await userRepository.save(testUser);
    });

    afterAll(async () => {
      if (testNotification) {
        await notificationRepository.remove(testNotification);
      }
      if (testUser) {
        await userRepository.remove(testUser);
      }
    });

    it('should create a notification', async () => {
      testNotification = notificationRepository.create({
        userId: testUser.id,
        type: 'transaction',
        title: 'Test Notification',
        message: 'This is a test notification',
        read: false,
      });

      const saved = await notificationRepository.save(testNotification);
      expect(saved.id).toBeDefined();
      expect(saved.userId).toBe(testUser.id);
      testNotification = saved;
    });

    it('should find notifications by user', async () => {
      const notifications = await notificationRepository.find({
        where: { userId: testUser.id },
      });
      expect(notifications.length).toBeGreaterThan(0);
    });

    it('should mark notification as read', async () => {
      testNotification.read = true;
      const updated = await notificationRepository.save(testNotification);
      expect(updated.read).toBe(true);
    });

    it('should find unread notifications', async () => {
      const unread = await notificationRepository.find({
        where: { userId: testUser.id, read: false },
      });
      expect(Array.isArray(unread)).toBe(true);
    });
  });

  describe('Database Transactions', () => {
    it('should rollback on error', async () => {
      const queryRunner = dataSource.createQueryRunner();
      await queryRunner.connect();
      await queryRunner.startTransaction();

      try {
        const testBlock = blockRepository.create({
          number: 999997,
          hash: '0x' + 'g'.repeat(64),
          parentHash: '0x' + 'h'.repeat(64),
          timestamp: Math.floor(Date.now() / 1000),
          miner: '0x' + 'i'.repeat(40),
          transactionCount: 0,
          gasUsed: '0',
          gasLimit: '0',
          baseFeePerGas: '0',
          extraData: '0x',
        });

        await queryRunner.manager.save(testBlock);
        // Simulate error
        throw new Error('Test error');
      } catch (error) {
        await queryRunner.rollbackTransaction();
      } finally {
        await queryRunner.release();
      }

      // Verify block was not saved
      const found = await blockRepository.findOne({
        where: { number: 999997 },
      });
      expect(found).toBeNull();
    });
  });

  describe('Database Relationships', () => {
    let testUser: User;
    let testApiKey: ApiKey;
    let testNotification: Notification;

    beforeAll(async () => {
      testUser = userRepository.create({
        email: `relationship-test-${Date.now()}@example.com`,
        password: 'hashed_password',
        name: 'Relationship Test User',
      });
      testUser = await userRepository.save(testUser);
    });

    afterAll(async () => {
      if (testNotification) {
        await notificationRepository.remove(testNotification);
      }
      if (testApiKey) {
        await apiKeyRepository.remove(testApiKey);
      }
      if (testUser) {
        await userRepository.remove(testUser);
      }
    });

    it('should maintain user-apiKey relationship', async () => {
      testApiKey = apiKeyRepository.create({
        userId: testUser.id,
        key: 'relationship-key-' + Date.now(),
        name: 'Relationship API Key',
      });
      testApiKey = await apiKeyRepository.save(testApiKey);

      const keys = await apiKeyRepository.find({
        where: { userId: testUser.id },
      });
      expect(keys.length).toBeGreaterThan(0);
      expect(keys[0].userId).toBe(testUser.id);
    });

    it('should maintain user-notification relationship', async () => {
      testNotification = notificationRepository.create({
        userId: testUser.id,
        type: 'transaction',
        title: 'Relationship Test',
        message: 'Test message',
        read: false,
      });
      testNotification = await notificationRepository.save(testNotification);

      const notifications = await notificationRepository.find({
        where: { userId: testUser.id },
      });
      expect(notifications.length).toBeGreaterThan(0);
      expect(notifications[0].userId).toBe(testUser.id);
    });
  });

  describe('Database Constraints', () => {
    it('should enforce unique email constraint', async () => {
      const email = `unique-test-${Date.now()}@example.com`;
      const user1 = userRepository.create({
        email,
        password: 'hashed_password',
        name: 'User 1',
      });
      await userRepository.save(user1);

      const user2 = userRepository.create({
        email, // Same email
        password: 'hashed_password',
        name: 'User 2',
      });

      await expect(userRepository.save(user2)).rejects.toThrow();

      // Cleanup
      await userRepository.remove(user1);
    });

    it('should enforce foreign key constraints', async () => {
      const invalidApiKey = apiKeyRepository.create({
        userId: 999999, // Non-existent user ID
        key: 'invalid-key',
        name: 'Invalid Key',
      });

      await expect(apiKeyRepository.save(invalidApiKey)).rejects.toThrow();
    });
  });
});


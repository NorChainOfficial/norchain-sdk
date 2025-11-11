import { Test, TestingModule } from '@nestjs/testing';
import { getRepositoryToken } from '@nestjs/typeorm';
import { Repository, SelectQueryBuilder } from 'typeorm';
import { AccountRepository } from './account.repository';
import { Transaction } from '@/modules/transaction/entities/transaction.entity';
import { TokenTransfer } from '@/modules/token/entities/token-transfer.entity';
import { TokenHolder } from '@/modules/token/entities/token-holder.entity';
import { TokenMetadata } from '@/modules/token/entities/token-metadata.entity';
import { TransactionLog } from '@/modules/transaction/entities/transaction-log.entity';

describe('AccountRepository', () => {
  let repository: AccountRepository;
  let transactionRepository: Repository<Transaction>;
  let tokenTransferRepository: Repository<TokenTransfer>;
  let tokenHolderRepository: Repository<TokenHolder>;
  let tokenMetadataRepository: Repository<TokenMetadata>;
  let transactionLogRepository: Repository<TransactionLog>;

  const mockTransactionRepository = {
    count: jest.fn(),
    createQueryBuilder: jest.fn(),
  };

  const mockTokenTransferRepository = {
    createQueryBuilder: jest.fn(),
  };

  const mockTokenHolderRepository = {
    createQueryBuilder: jest.fn(),
  };

  const mockTokenMetadataRepository = {
    findOne: jest.fn(),
  };

  const mockTransactionLogRepository = {
    createQueryBuilder: jest.fn(),
  };

  const mockQueryBuilder = {
    where: jest.fn().mockReturnThis(),
    andWhere: jest.fn().mockReturnThis(),
    orWhere: jest.fn().mockReturnThis(),
    leftJoinAndSelect: jest.fn().mockReturnThis(),
    orderBy: jest.fn().mockReturnThis(),
    addOrderBy: jest.fn().mockReturnThis(),
    skip: jest.fn().mockReturnThis(),
    take: jest.fn().mockReturnThis(),
    select: jest.fn().mockReturnThis(),
    getRawOne: jest.fn(),
    getManyAndCount: jest.fn(),
  };

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      providers: [
        AccountRepository,
        {
          provide: getRepositoryToken(Transaction),
          useValue: mockTransactionRepository,
        },
        {
          provide: getRepositoryToken(TokenTransfer),
          useValue: mockTokenTransferRepository,
        },
        {
          provide: getRepositoryToken(TokenHolder),
          useValue: mockTokenHolderRepository,
        },
        {
          provide: getRepositoryToken(TokenMetadata),
          useValue: mockTokenMetadataRepository,
        },
        {
          provide: getRepositoryToken(TransactionLog),
          useValue: mockTransactionLogRepository,
        },
      ],
    }).compile();

    repository = module.get<AccountRepository>(AccountRepository);
    transactionRepository = module.get(getRepositoryToken(Transaction));
    tokenTransferRepository = module.get(getRepositoryToken(TokenTransfer));
    tokenHolderRepository = module.get(getRepositoryToken(TokenHolder));
    tokenMetadataRepository = module.get(getRepositoryToken(TokenMetadata));
    transactionLogRepository = module.get(getRepositoryToken(TransactionLog));
  });

  afterEach(() => {
    jest.clearAllMocks();
  });

  it('should be defined', () => {
    expect(repository).toBeDefined();
  });

  describe('getBalance', () => {
    it('should return balance', async () => {
      const result = await repository.getBalance('0x123');

      expect(result).toBe('0');
    });
  });

  describe('getTransactionCount', () => {
    it('should return total transaction count', async () => {
      const address = '0x742d35Cc6634C0532925a3b844Bc9e7595f0bEb0';
      mockTransactionRepository.count
        .mockResolvedValueOnce(10)
        .mockResolvedValueOnce(5);

      const result = await repository.getTransactionCount(address);

      expect(result).toBe(15);
      expect(mockTransactionRepository.count).toHaveBeenCalledTimes(2);
    });

    it('should handle zero transactions', async () => {
      const address = '0x123';
      mockTransactionRepository.count
        .mockResolvedValueOnce(0)
        .mockResolvedValueOnce(0);

      const result = await repository.getTransactionCount(address);

      expect(result).toBe(0);
    });
  });

  describe('getTokenCount', () => {
    it('should return token count', async () => {
      const address = '0x742d35Cc6634C0532925a3b844Bc9e7595f0bEb0';
      mockTokenTransferRepository.createQueryBuilder.mockReturnValue({
        ...mockQueryBuilder,
        getRawOne: jest.fn().mockResolvedValue({ count: '5' }),
      });

      const result = await repository.getTokenCount(address);

      expect(result).toBe(5);
    });

    it('should handle zero tokens', async () => {
      const address = '0x123';
      mockTokenTransferRepository.createQueryBuilder.mockReturnValue({
        ...mockQueryBuilder,
        getRawOne: jest.fn().mockResolvedValue({ count: '0' }),
      });

      const result = await repository.getTokenCount(address);

      expect(result).toBe(0);
    });

    it('should handle null result', async () => {
      const address = '0x123';
      mockTokenTransferRepository.createQueryBuilder.mockReturnValue({
        ...mockQueryBuilder,
        getRawOne: jest.fn().mockResolvedValue(null),
      });

      const result = await repository.getTokenCount(address);

      expect(result).toBe(0);
    });
  });

  describe('getAccountSummary', () => {
    it('should return account summary', async () => {
      const address = '0x742d35Cc6634C0532925a3b844Bc9e7595f0bEb0';
      mockTransactionRepository.count
        .mockResolvedValueOnce(10)
        .mockResolvedValueOnce(5);
      mockTokenTransferRepository.createQueryBuilder.mockReturnValue({
        ...mockQueryBuilder,
        getRawOne: jest.fn().mockResolvedValue({ count: '3' }),
      });

      const result = await repository.getAccountSummary(address);

      expect(result).toHaveProperty('address', address);
      expect(result).toHaveProperty('balance');
      expect(result).toHaveProperty('transactionCount', 15);
      expect(result).toHaveProperty('tokenCount', 3);
    });
  });

  describe('getTransactionsByAddress', () => {
    it('should return paginated transactions', async () => {
      const address = '0x742d35Cc6634C0532925a3b844Bc9e7595f0bEb0';
      const mockTransactions = [{ id: '1', fromAddress: address }];
      mockTransactionRepository.createQueryBuilder.mockReturnValue({
        ...mockQueryBuilder,
        getManyAndCount: jest.fn().mockResolvedValue([mockTransactions, 100]),
      });

      const result = await repository.getTransactionsByAddress(address, undefined, undefined, 1, 10);

      expect(result.data).toEqual(mockTransactions);
      expect(result.meta.total).toBe(100);
      expect(result.meta.page).toBe(1);
      expect(result.meta.limit).toBe(10);
    });

    it('should filter by block range', async () => {
      const address = '0x123';
      mockTransactionRepository.createQueryBuilder.mockReturnValue({
        ...mockQueryBuilder,
        getManyAndCount: jest.fn().mockResolvedValue([[], 0]),
      });

      await repository.getTransactionsByAddress(address, 1000, 2000, 1, 10);

      expect(mockQueryBuilder.andWhere).toHaveBeenCalledWith(
        'tx.blockNumber >= :startBlock',
        { startBlock: 1000 },
      );
      expect(mockQueryBuilder.andWhere).toHaveBeenCalledWith(
        'tx.blockNumber <= :endBlock',
        { endBlock: 2000 },
      );
    });
  });

  describe('getTokenList', () => {
    it('should return token list with metadata', async () => {
      const address = '0x123';
      const mockHolders = [
        {
          tokenAddress: '0xtoken1',
          balance: '100',
          holderAddress: address,
        },
      ];
      const mockMetadata = {
        address: '0xtoken1',
        name: 'Test Token',
        symbol: 'TEST',
        decimals: 18,
      };

      mockTokenHolderRepository.createQueryBuilder.mockReturnValue({
        ...mockQueryBuilder,
        getManyAndCount: jest.fn().mockResolvedValue([mockHolders, 1]),
      });
      mockTokenMetadataRepository.findOne.mockResolvedValue(mockMetadata);

      const result = await repository.getTokenList(address);

      expect(result.data).toHaveLength(1);
      expect(result.data[0]).toHaveProperty('token');
      expect(result.data[0].token).toEqual(mockMetadata);
    });

    it('should handle missing metadata', async () => {
      const address = '0x123';
      const mockHolders = [
        {
          tokenAddress: '0xtoken1',
          balance: '100',
          holderAddress: address,
        },
      ];

      mockTokenHolderRepository.createQueryBuilder.mockReturnValue({
        ...mockQueryBuilder,
        getManyAndCount: jest.fn().mockResolvedValue([mockHolders, 1]),
      });
      mockTokenMetadataRepository.findOne.mockResolvedValue(null);

      const result = await repository.getTokenList(address);

      expect(result.data[0].token).toEqual({
        address: '0xtoken1',
        name: null,
        symbol: null,
        decimals: 18,
      });
    });
  });

  describe('getTokenTransfers', () => {
    it('should return token transfers', async () => {
      const address = '0x123';
      const mockTransfers = [{ id: '1', fromAddress: address }];
      mockTokenTransferRepository.createQueryBuilder.mockReturnValue({
        ...mockQueryBuilder,
        getManyAndCount: jest.fn().mockResolvedValue([mockTransfers, 50]),
      });

      const result = await repository.getTokenTransfers(address);

      expect(result.data).toEqual(mockTransfers);
      expect(result.meta.total).toBe(50);
    });

    it('should filter by contract address', async () => {
      const address = '0x123';
      const contractAddress = '0xtoken';
      mockTokenTransferRepository.createQueryBuilder.mockReturnValue({
        ...mockQueryBuilder,
        getManyAndCount: jest.fn().mockResolvedValue([[], 0]),
      });

      await repository.getTokenTransfers(address, contractAddress);

      expect(mockQueryBuilder.andWhere).toHaveBeenCalledWith(
        'transfer.tokenAddress = :contractAddress',
        { contractAddress },
      );
    });
  });

  describe('getInternalTransactions', () => {
    it('should return internal transactions', async () => {
      const address = '0x123';
      const mockLogs = [{ id: '1', address }];
      mockTransactionLogRepository.createQueryBuilder.mockReturnValue({
        ...mockQueryBuilder,
        getManyAndCount: jest.fn().mockResolvedValue([mockLogs, 20]),
      });

      const result = await repository.getInternalTransactions(address);

      expect(result.data).toEqual(mockLogs);
      expect(result.meta.total).toBe(20);
    });

    it('should filter by block range', async () => {
      const address = '0x123';
      mockTransactionLogRepository.createQueryBuilder.mockReturnValue({
        ...mockQueryBuilder,
        getManyAndCount: jest.fn().mockResolvedValue([[], 0]),
      });

      await repository.getInternalTransactions(address, 1000, 2000);

      expect(mockQueryBuilder.andWhere).toHaveBeenCalledWith(
        'log.blockNumber >= :startBlock',
        { startBlock: 1000 },
      );
      expect(mockQueryBuilder.andWhere).toHaveBeenCalledWith(
        'log.blockNumber <= :endBlock',
        { endBlock: 2000 },
      );
    });
  });
});

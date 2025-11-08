import { Test, TestingModule } from '@nestjs/testing';
import { getRepositoryToken } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { AccountRepository } from './account.repository';
import { Transaction } from '@/modules/transaction/entities/transaction.entity';
import { TokenTransfer } from '@/modules/token/entities/token-transfer.entity';
import { TokenHolder } from '@/modules/token/entities/token-holder.entity';
import { TokenMetadata } from '@/modules/token/entities/token-metadata.entity';
import { TransactionLog } from '@/modules/transaction/entities/transaction-log.entity';

describe('AccountRepository', () => {
  let repository: AccountRepository;
  let transactionRepository: jest.Mocked<Repository<Transaction>>;
  let tokenTransferRepository: jest.Mocked<Repository<TokenTransfer>>;
  let tokenHolderRepository: jest.Mocked<Repository<TokenHolder>>;
  let tokenMetadataRepository: jest.Mocked<Repository<TokenMetadata>>;
  let transactionLogRepository: jest.Mocked<Repository<TransactionLog>>;

  beforeEach(async () => {
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
    it('should return balance (placeholder)', async () => {
      const address = '0x742d35Cc6634C0532925a3b844Bc9e7595f0bEb';
      const result = await repository.getBalance(address);
      expect(result).toBe('0');
    });
  });

  describe('getTransactionCount', () => {
    it('should return transaction count', async () => {
      const address = '0x742d35Cc6634C0532925a3b844Bc9e7595f0bEb';
      transactionRepository.count
        .mockResolvedValueOnce(5) // sent
        .mockResolvedValueOnce(3); // received

      const result = await repository.getTransactionCount(address);

      expect(result).toBe(8);
      expect(transactionRepository.count).toHaveBeenCalledTimes(2);
      expect(transactionRepository.count).toHaveBeenCalledWith({
        where: { fromAddress: address },
      });
      expect(transactionRepository.count).toHaveBeenCalledWith({
        where: { toAddress: address },
      });
    });
  });

  describe('getTokenCount', () => {
    it('should return token count', async () => {
      const address = '0x742d35Cc6634C0532925a3b844Bc9e7595f0bEb';
      const mockQueryBuilder = {
        where: jest.fn().mockReturnThis(),
        select: jest.fn().mockReturnThis(),
        getRawOne: jest.fn().mockResolvedValue({ count: '5' }),
      };

      tokenTransferRepository.createQueryBuilder.mockReturnValue(
        mockQueryBuilder as any,
      );

      const result = await repository.getTokenCount(address);

      expect(result).toBe(5);
      expect(tokenTransferRepository.createQueryBuilder).toHaveBeenCalled();
      expect(mockQueryBuilder.where).toHaveBeenCalled();
    });

    it('should return 0 when no tokens found', async () => {
      const address = '0x742d35Cc6634C0532925a3b844Bc9e7595f0bEb';
      const mockQueryBuilder = {
        where: jest.fn().mockReturnThis(),
        select: jest.fn().mockReturnThis(),
        getRawOne: jest.fn().mockResolvedValue(null),
      };

      tokenTransferRepository.createQueryBuilder.mockReturnValue(
        mockQueryBuilder as any,
      );

      const result = await repository.getTokenCount(address);

      expect(result).toBe(0);
    });
  });

  describe('getAccountSummary', () => {
    it('should return account summary', async () => {
      const address = '0x742d35Cc6634C0532925a3b844Bc9e7595f0bEb';
      const balance = '1000000000000000000';
      const txCount = 10;
      const tokenCount = 5;

      jest.spyOn(repository, 'getBalance').mockResolvedValue(balance);
      jest.spyOn(repository, 'getTransactionCount').mockResolvedValue(txCount);
      jest.spyOn(repository, 'getTokenCount').mockResolvedValue(tokenCount);

      const result = await repository.getAccountSummary(address);

      expect(result).toEqual({
        address,
        balance,
        transactionCount: txCount,
        tokenCount,
      });
    });
  });

  describe('getTransactionsByAddress', () => {
    it('should return paginated transactions', async () => {
      const address = '0x742d35Cc6634C0532925a3b844Bc9e7595f0bEb';
      const page = 1;
      const limit = 10;
      const mockTransactions = [
        {
          hash: '0x123',
          fromAddress: address,
          toAddress: '0x456',
          blockNumber: 1000,
        },
      ];
      const total = 1;

      const mockQueryBuilder = {
        where: jest.fn().mockReturnThis(),
        orderBy: jest.fn().mockReturnThis(),
        addOrderBy: jest.fn().mockReturnThis(),
        andWhere: jest.fn().mockReturnThis(),
        skip: jest.fn().mockReturnThis(),
        take: jest.fn().mockReturnThis(),
        getManyAndCount: jest.fn().mockResolvedValue([mockTransactions, total]),
      };

      transactionRepository.createQueryBuilder.mockReturnValue(
        mockQueryBuilder as any,
      );

      const result = await repository.getTransactionsByAddress(
        address,
        undefined,
        undefined,
        page,
        limit,
      );

      expect(result.data).toEqual(mockTransactions);
      expect(result.meta.total).toBe(total);
      expect(result.meta.page).toBe(page);
      expect(result.meta.limit).toBe(limit);
      expect(mockQueryBuilder.where).toHaveBeenCalled();
      expect(mockQueryBuilder.orderBy).toHaveBeenCalled();
    });

    it('should filter by block range', async () => {
      const address = '0x742d35Cc6634C0532925a3b844Bc9e7595f0bEb';
      const startBlock = 100;
      const endBlock = 200;

      const mockQueryBuilder = {
        where: jest.fn().mockReturnThis(),
        orderBy: jest.fn().mockReturnThis(),
        addOrderBy: jest.fn().mockReturnThis(),
        andWhere: jest.fn().mockReturnThis(),
        skip: jest.fn().mockReturnThis(),
        take: jest.fn().mockReturnThis(),
        getManyAndCount: jest.fn().mockResolvedValue([[], 0]),
      };

      transactionRepository.createQueryBuilder.mockReturnValue(
        mockQueryBuilder as any,
      );

      await repository.getTransactionsByAddress(
        address,
        startBlock,
        endBlock,
        1,
        10,
      );

      expect(mockQueryBuilder.andWhere).toHaveBeenCalledWith(
        'tx.blockNumber >= :startBlock',
        { startBlock },
      );
      expect(mockQueryBuilder.andWhere).toHaveBeenCalledWith(
        'tx.blockNumber <= :endBlock',
        { endBlock },
      );
    });
  });

  describe('getTokenList', () => {
    it('should return paginated token list with metadata', async () => {
      const address = '0x742d35Cc6634C0532925a3b844Bc9e7595f0bEb';
      const page = 1;
      const limit = 10;
      const mockHolders = [
        {
          tokenAddress: '0xToken1',
          holderAddress: address,
          balance: '1000',
        },
      ];
      const mockMetadata = {
        address: '0xToken1',
        name: 'Test Token',
        symbol: 'TEST',
        decimals: 18,
      };

      const mockQueryBuilder = {
        where: jest.fn().mockReturnThis(),
        andWhere: jest.fn().mockReturnThis(),
        orderBy: jest.fn().mockReturnThis(),
        skip: jest.fn().mockReturnThis(),
        take: jest.fn().mockReturnThis(),
        getManyAndCount: jest.fn().mockResolvedValue([mockHolders, 1]),
      };

      tokenHolderRepository.createQueryBuilder.mockReturnValue(
        mockQueryBuilder as any,
      );
      tokenMetadataRepository.findOne.mockResolvedValue(mockMetadata as any);

      const result = await repository.getTokenList(address, undefined, undefined, page, limit);

      expect(result.data).toHaveLength(1);
      expect(result.data[0]).toHaveProperty('token');
      expect(result.meta.total).toBe(1);
    });
  });

  describe('getTokenTransfers', () => {
    it('should return paginated token transfers', async () => {
      const address = '0x742d35Cc6634C0532925a3b844Bc9e7595f0bEb';
      const contractAddress = '0xToken1';
      const page = 1;
      const limit = 10;
      const mockTransfers = [
        {
          tokenAddress: contractAddress,
          fromAddress: address,
          toAddress: '0x456',
          blockNumber: 1000,
        },
      ];
      const total = 1;

      const mockQueryBuilder = {
        where: jest.fn().mockReturnThis(),
        andWhere: jest.fn().mockReturnThis(),
        orderBy: jest.fn().mockReturnThis(),
        addOrderBy: jest.fn().mockReturnThis(),
        skip: jest.fn().mockReturnThis(),
        take: jest.fn().mockReturnThis(),
        getManyAndCount: jest.fn().mockResolvedValue([mockTransfers, total]),
      };

      tokenTransferRepository.createQueryBuilder.mockReturnValue(
        mockQueryBuilder as any,
      );

      const result = await repository.getTokenTransfers(
        address,
        contractAddress,
        undefined,
        undefined,
        page,
        limit,
      );

      expect(result.data).toEqual(mockTransfers);
      expect(result.meta.total).toBe(total);
      expect(mockQueryBuilder.andWhere).toHaveBeenCalledWith(
        'transfer.tokenAddress = :contractAddress',
        { contractAddress },
      );
    });
  });

  describe('getInternalTransactions', () => {
    it('should return paginated internal transactions', async () => {
      const address = '0x742d35Cc6634C0532925a3b844Bc9e7595f0bEb';
      const page = 1;
      const limit = 10;
      const mockLogs = [
        {
          address,
          blockNumber: 1000,
          logIndex: 0,
          transaction: {
            hash: '0x123',
            fromAddress: address,
          },
        },
      ];
      const total = 1;

      const mockQueryBuilder = {
        leftJoinAndSelect: jest.fn().mockReturnThis(),
        where: jest.fn().mockReturnThis(),
        orWhere: jest.fn().mockReturnThis(),
        orderBy: jest.fn().mockReturnThis(),
        addOrderBy: jest.fn().mockReturnThis(),
        andWhere: jest.fn().mockReturnThis(),
        skip: jest.fn().mockReturnThis(),
        take: jest.fn().mockReturnThis(),
        getManyAndCount: jest.fn().mockResolvedValue([mockLogs, total]),
      };

      transactionLogRepository.createQueryBuilder.mockReturnValue(
        mockQueryBuilder as any,
      );

      const result = await repository.getInternalTransactions(
        address,
        undefined,
        undefined,
        page,
        limit,
      );

      expect(result.data).toEqual(mockLogs);
      expect(result.meta.total).toBe(total);
      expect(mockQueryBuilder.leftJoinAndSelect).toHaveBeenCalled();
    });
  });
});


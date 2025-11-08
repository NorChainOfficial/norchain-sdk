import { Test, TestingModule } from '@nestjs/testing';
import { getRepositoryToken } from '@nestjs/typeorm';
import { TransactionService } from './transaction.service';
import { Transaction } from './entities/transaction.entity';
import { RpcService } from '@/common/services/rpc.service';
import { CacheService } from '@/common/services/cache.service';

describe('TransactionService', () => {
  let service: TransactionService;
  let transactionRepository: any;
  let rpcService: jest.Mocked<RpcService>;
  let cacheService: jest.Mocked<CacheService>;

  beforeEach(async () => {
    const mockTransactionRepository = {
      findOne: jest.fn(),
    };

    const mockRpcService = {
      getTransaction: jest.fn(),
      getTransactionReceipt: jest.fn(),
    };

    const mockCacheService = {
      getOrSet: jest.fn(),
    };

    const module: TestingModule = await Test.createTestingModule({
      providers: [
        TransactionService,
        {
          provide: getRepositoryToken(Transaction),
          useValue: mockTransactionRepository,
        },
        {
          provide: RpcService,
          useValue: mockRpcService,
        },
        {
          provide: CacheService,
          useValue: mockCacheService,
        },
      ],
    }).compile();

    service = module.get<TransactionService>(TransactionService);
    transactionRepository = module.get(getRepositoryToken(Transaction));
    rpcService = module.get(RpcService);
    cacheService = module.get(CacheService);
  });

  it('should be defined', () => {
    expect(service).toBeDefined();
  });

  describe('getTransaction', () => {
    it('should return transaction from database', async () => {
      const txHash = '0x123';
      const mockTx = {
        hash: txHash,
        blockNumber: 12345,
        blockHash: '0xabc',
        transactionIndex: 0,
        fromAddress: '0xfrom',
        toAddress: '0xto',
        value: '1000000000000000000',
        gas: '21000',
        gasPrice: '20000000000',
        gasUsed: '21000',
        nonce: 0,
        inputData: '0x',
        status: 1,
        block: { timestamp: 1234567890 },
        logs: [],
      };

      cacheService.getOrSet.mockImplementation(async (key, fn) => {
        transactionRepository.findOne.mockResolvedValue(mockTx);
        return fn();
      });

      const result = await service.getTransaction(txHash);

      expect(result.status).toBe('1');
      expect(result.result).toBeDefined();
    });

    it('should return transaction from RPC if not in database', async () => {
      const txHash = '0x123';
      const mockRpcTx = {
        hash: txHash,
        blockNumber: 12345,
        blockHash: '0xabc',
        index: 0,
        from: '0xfrom',
        to: '0xto',
        value: BigInt('1000000000000000000'),
        gasLimit: BigInt('21000'),
        gasPrice: BigInt('20000000000'),
        data: '0x',
        nonce: 0,
        type: 2,
        maxPriorityFeePerGas: null,
        maxFeePerGas: null,
        chainId: 1,
        toJSON: jest.fn(),
        wait: jest.fn(),
        provider: null,
      } as any;

      const mockReceipt = {
        hash: txHash,
        status: 1,
        gasUsed: BigInt('21000'),
        cumulativeGasUsed: BigInt('21000'),
        logs: [],
        to: '0xto',
        from: '0xfrom',
        contractAddress: null,
        blockNumber: 12345,
        blockHash: '0xabc',
        transactionIndex: 0,
        type: 2,
        toJSON: jest.fn(),
      } as any;

      cacheService.getOrSet.mockImplementation(async (key, fn) => {
        transactionRepository.findOne.mockResolvedValue(null);
        rpcService.getTransaction.mockResolvedValue(mockRpcTx);
        rpcService.getTransactionReceipt.mockResolvedValue(mockReceipt);
        return fn();
      });

      const result = await service.getTransaction(txHash);

      expect(result.status).toBe('1');
      expect(result.result).toBeDefined();
    });
  });

  describe('getTxReceiptStatus', () => {
    it('should return receipt status from database', async () => {
      const txHash = '0x123';
      const mockTx = {
        hash: txHash,
        status: 1,
      };

      cacheService.getOrSet.mockImplementation(async (key, fn) => {
        transactionRepository.findOne.mockResolvedValue(mockTx);
        return fn();
      });

      const result = await service.getTxReceiptStatus(txHash);

      expect(result.status).toBe('1');
      expect(result.result.status).toBe('1');
      expect(result.result.message).toBe('Pass');
    });

    it('should return receipt status from RPC', async () => {
      const txHash = '0x123';
      const mockReceipt = {
        hash: txHash,
        status: 1,
        gasUsed: BigInt('21000'),
        cumulativeGasUsed: BigInt('21000'),
        logs: [],
        to: '0xto',
        from: '0xfrom',
        contractAddress: null,
        blockNumber: 12345,
        blockHash: '0xabc',
        transactionIndex: 0,
        type: 2,
        toJSON: jest.fn(),
      } as any;

      cacheService.getOrSet.mockImplementation(async (key, fn) => {
        transactionRepository.findOne.mockResolvedValue(null);
        rpcService.getTransactionReceipt.mockResolvedValue(mockReceipt);
        return fn();
      });

      const result = await service.getTxReceiptStatus(txHash);

      expect(result.status).toBe('1');
      expect(result.result.status).toBe('1');
    });
  });

  describe('getStatus', () => {
    it('should return pending status for pending transaction', async () => {
      const txHash = '0x123';
      const mockTx = {
        hash: txHash,
        blockNumber: null,
        blockHash: null,
        index: null,
        from: '0xfrom',
        to: '0xto',
        value: BigInt('0'),
        gasLimit: BigInt('21000'),
        gasPrice: BigInt('20000000000'),
        data: '0x',
        nonce: 0,
        type: 2,
        toJSON: jest.fn(),
        wait: jest.fn(),
        provider: null,
      } as any;

      rpcService.getTransaction.mockResolvedValue(mockTx);

      const result = await service.getStatus(txHash);

      expect(result.status).toBe('1');
      expect(result.result.status).toBe('pending');
    });

    it('should return confirmed status for confirmed transaction', async () => {
      const txHash = '0x123';
      const mockTx = {
        hash: txHash,
        blockNumber: 12345,
        blockHash: '0xabc',
        index: 0,
        from: '0xfrom',
        to: '0xto',
        value: BigInt('0'),
        gasLimit: BigInt('21000'),
        gasPrice: BigInt('20000000000'),
        data: '0x',
        nonce: 0,
        type: 2,
        toJSON: jest.fn(),
        wait: jest.fn(),
        provider: null,
      } as any;

      const mockReceipt = {
        hash: txHash,
        status: 1,
        gasUsed: BigInt('21000'),
        cumulativeGasUsed: BigInt('21000'),
        logs: [],
        to: '0xto',
        from: '0xfrom',
        contractAddress: null,
        blockNumber: 12345,
        blockHash: '0xabc',
        transactionIndex: 0,
        type: 2,
        toJSON: jest.fn(),
      } as any;

      rpcService.getTransaction.mockResolvedValue(mockTx);
      rpcService.getTransactionReceipt.mockResolvedValue(mockReceipt);

      const result = await service.getStatus(txHash);

      expect(result.status).toBe('1');
      if (result.result) {
        expect(result.result.status).toBe('confirmed');
        expect(result.result.isError).toBe('0');
      }
    });
  });
});


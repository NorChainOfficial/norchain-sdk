import { Test, TestingModule } from '@nestjs/testing';
import { getRepositoryToken } from '@nestjs/typeorm';
import { BadRequestException } from '@nestjs/common';
import { TransactionService } from './transaction.service';
import { Transaction } from './entities/transaction.entity';
import { RpcService } from '@/common/services/rpc.service';
import { CacheService } from '@/common/services/cache.service';
import { BroadcastTransactionDto } from './dto/broadcast-transaction.dto';

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
      broadcastTransaction: jest.fn(),
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

  describe('broadcastTransaction', () => {
    it('should broadcast a signed transaction successfully', async () => {
      const dto: BroadcastTransactionDto = {
        signedTransaction:
          '0xf86c808502540be400825208943535353535353535353535353535353535353535880de0b6b3a76400008025a028ef61340bd939bc2195fe537567866003e1a15d3c71ff63e1590620aa636276a067cbe9d8997f761aecb703304b24e8ddbdc05c6dff2790f53122fd4a99d7c1c0',
      };

      const mockResponse = {
        hash: '0x1234567890abcdef1234567890abcdef1234567890abcdef1234567890abcdef',
        from: '0x742d35Cc6634C0532925a3b844Bc9e7595f0bEb0',
        to: '0x3535353535353535353535353535353535353535',
        value: BigInt('1000000000000000000'),
        gasLimit: BigInt('21000'),
        gasPrice: BigInt('1000000000'),
        nonce: 0,
        toJSON: jest.fn(),
        wait: jest.fn(),
        provider: null,
      } as any;

      rpcService.broadcastTransaction.mockResolvedValue(mockResponse);

      const result = await service.broadcastTransaction(dto);

      expect(result.status).toBe('1');
      expect(result.result).toBeDefined();
      expect(result.result.hash).toBe(mockResponse.hash);
      expect(result.result.from).toBe(mockResponse.from);
      expect(result.result.status).toBe('pending');
      expect(result.result.message).toBe('Transaction broadcast successfully');
      expect(rpcService.broadcastTransaction).toHaveBeenCalledWith(
        dto.signedTransaction,
      );
    });

    it('should throw BadRequestException for invalid transaction', async () => {
      const dto: BroadcastTransactionDto = {
        signedTransaction: '0xinvalid',
      };

      rpcService.broadcastTransaction.mockRejectedValue(
        new Error('Invalid transaction'),
      );

      await expect(service.broadcastTransaction(dto)).rejects.toThrow(
        BadRequestException,
      );
    });

    it('should handle RPC errors gracefully', async () => {
      const dto: BroadcastTransactionDto = {
        signedTransaction:
          '0xf86c808502540be400825208943535353535353535353535353535353535353535880de0b6b3a76400008025a028ef61340bd939bc2195fe537567866003e1a15d3c71ff63e1590620aa636276a067cbe9d8997f761aecb703304b24e8ddbdc05c6dff2790f53122fd4a99d7c1c0',
      };

      rpcService.broadcastTransaction.mockRejectedValue(
        new Error('Network error'),
      );

      await expect(service.broadcastTransaction(dto)).rejects.toThrow(
        BadRequestException,
      );
    });

    it('should handle transaction with null to address (contract creation)', async () => {
      const dto: BroadcastTransactionDto = {
        signedTransaction:
          '0xf86c808502540be400825208943535353535353535353535353535353535353535880de0b6b3a76400008025a028ef61340bd939bc2195fe537567866003e1a15d3c71ff63e1590620aa636276a067cbe9d8997f761aecb703304b24e8ddbdc05c6dff2790f53122fd4a99d7c1c0',
      };

      const mockResponse = {
        hash: '0x1234567890abcdef1234567890abcdef1234567890abcdef1234567890abcdef',
        from: '0x742d35Cc6634C0532925a3b844Bc9e7595f0bEb0',
        to: null,
        value: BigInt('0'),
        gasLimit: BigInt('100000'),
        gasPrice: BigInt('1000000000'),
        nonce: 0,
        toJSON: jest.fn(),
        wait: jest.fn(),
        provider: null,
      } as any;

      rpcService.broadcastTransaction.mockResolvedValue(mockResponse);

      const result = await service.broadcastTransaction(dto);

      expect(result.status).toBe('1');
      expect(result.result.to).toBeNull();
    });
  });
});


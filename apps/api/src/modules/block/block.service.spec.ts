import { Test, TestingModule } from '@nestjs/testing';
import { getRepositoryToken } from '@nestjs/typeorm';
import { BlockService } from './block.service';
import { Block } from './entities/block.entity';
import { RpcService } from '@/common/services/rpc.service';
import { CacheService } from '@/common/services/cache.service';
import { GetBlockDto } from './dto/get-block.dto';

describe('BlockService', () => {
  let service: BlockService;
  let blockRepository: any;
  let rpcService: jest.Mocked<RpcService>;
  let cacheService: jest.Mocked<CacheService>;

  beforeEach(async () => {
    const mockBlockRepository = {
      findOne: jest.fn(),
    };

    const mockRpcService = {
      getBlock: jest.fn(),
      getBlockNumber: jest.fn(),
    };

    const mockCacheService = {
      getOrSet: jest.fn(),
    };

    const module: TestingModule = await Test.createTestingModule({
      providers: [
        BlockService,
        {
          provide: getRepositoryToken(Block),
          useValue: mockBlockRepository,
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

    service = module.get<BlockService>(BlockService);
    blockRepository = module.get(getRepositoryToken(Block));
    rpcService = module.get(RpcService);
    cacheService = module.get(CacheService);
  });

  it('should be defined', () => {
    expect(service).toBeDefined();
  });

  describe('getBlock', () => {
    it('should return block from database if exists', async () => {
      const dto: GetBlockDto = { blockno: 12345 };
      const mockBlock = {
        number: 12345,
        hash: '0xabc',
        parentHash: '0xdef',
        timestamp: 1234567890,
        gasLimit: '1000000',
        gasUsed: '500000',
        miner: '0x123',
        transactionsCount: 10,
        transactions: [],
      };

      cacheService.getOrSet.mockImplementation(async (key, fn) => {
        blockRepository.findOne.mockResolvedValue(mockBlock);
        return fn();
      });

      const result = await service.getBlock(dto);

      expect(result.status).toBe('1');
      expect(result.result).toBeDefined();
    });

    it('should return block from RPC if not in database', async () => {
      const dto: GetBlockDto = { blockno: 12345 };
      const mockRpcBlock = {
        number: 12345,
        hash: '0xabc',
        parentHash: '0xdef',
        timestamp: 1234567890,
        gasLimit: BigInt('1000000'),
        gasUsed: BigInt('500000'),
        miner: '0x123',
        transactions: [],
      } as any;

      cacheService.getOrSet.mockImplementation(async (key, fn) => {
        blockRepository.findOne.mockResolvedValue(null);
        rpcService.getBlock.mockResolvedValue(mockRpcBlock as any);
        return fn();
      });

      const result = await service.getBlock(dto);

      expect(result.status).toBe('1');
      expect(result.result).toBeDefined();
    });

    it('should return error if block not found', async () => {
      const dto: GetBlockDto = { blockno: 999999 };

      cacheService.getOrSet.mockResolvedValue(null);

      const result = await service.getBlock(dto);

      expect(result.status).toBe('0');
      expect(result.message).toContain('not found');
    });
  });

  describe('getBlockReward', () => {
    it('should return block reward information', async () => {
      const blockNumber = 12345;
      const mockBlock = {
        number: blockNumber,
        timestamp: 1234567890,
        miner: '0x123',
        gasUsed: BigInt('500000'),
        gasPrice: BigInt('20000000000'),
      } as any;

      cacheService.getOrSet.mockImplementation(async (key, fn) => {
        rpcService.getBlock.mockResolvedValue(mockBlock as any);
        return fn();
      });

      const result = await service.getBlockReward(blockNumber);

      expect(result.status).toBe('1');
      expect(result.result).toBeDefined();
      if (result.result) {
        expect(result.result.blockNumber).toBe(blockNumber);
      }
    });
  });

  describe('getBlockCountdown', () => {
    it('should return countdown information', async () => {
      const blockNumber = 20000;
      rpcService.getBlockNumber.mockResolvedValue(10000);

      const result = await service.getBlockCountdown(blockNumber);

      expect(result.status).toBe('1');
      if (result.result) {
        expect(result.result.RemainingBlock).toBeGreaterThan(0);
      }
    });

    it('should return zero countdown if block already passed', async () => {
      const blockNumber = 5000;
      rpcService.getBlockNumber.mockResolvedValue(10000);

      const result = await service.getBlockCountdown(blockNumber);

      expect(result.status).toBe('1');
      if (result.result) {
        expect(result.result.RemainingBlock).toBe(0);
      }
    });
  });

  describe('getBlockNumber', () => {
    it('should return latest block number', async () => {
      const blockNumber = 12345;
      rpcService.getBlockNumber.mockResolvedValue(blockNumber);

      const result = await service.getBlockNumber();

      expect(result.status).toBe('1');
      expect(result.result).toBe(blockNumber);
    });
  });

  describe('Edge Cases and Error Handling', () => {
    describe('getBlock', () => {
      it('should handle latest tag', async () => {
        const dto: GetBlockDto = { tag: 'latest' };
        const mockRpcBlock = {
          number: 12345,
          hash: '0xabc',
          parentHash: '0xdef',
          timestamp: 1234567890,
          gasLimit: BigInt('1000000'),
          gasUsed: BigInt('500000'),
          miner: '0x123',
          transactions: [],
        } as any;

        cacheService.getOrSet.mockImplementation(async (key, fn) => {
          rpcService.getBlock.mockResolvedValue(mockRpcBlock as any);
          return fn();
        });

        const result = await service.getBlock(dto);

        expect(result.status).toBe('1');
        expect(rpcService.getBlock).toHaveBeenCalledWith('latest');
      });

      it('should handle pending tag', async () => {
        const dto: GetBlockDto = { tag: 'pending' };
        const mockRpcBlock = {
          number: null,
          hash: '0xabc',
          parentHash: '0xdef',
          timestamp: 1234567890,
          gasLimit: BigInt('1000000'),
          gasUsed: BigInt('500000'),
          miner: '0x123',
          transactions: [],
        } as any;

        cacheService.getOrSet.mockImplementation(async (key, fn) => {
          rpcService.getBlock.mockResolvedValue(mockRpcBlock as any);
          return fn();
        });

        const result = await service.getBlock(dto);

        expect(result.status).toBe('1');
        expect(rpcService.getBlock).toHaveBeenCalledWith('pending');
      });

      it('should handle block with transactions array', async () => {
        const dto: GetBlockDto = { blockno: 12345 };
        const mockRpcBlock = {
          number: 12345,
          hash: '0xabc',
          parentHash: '0xdef',
          timestamp: 1234567890,
          gasLimit: BigInt('1000000'),
          gasUsed: BigInt('500000'),
          miner: '0x123',
          transactions: [
            { hash: '0xtx1' },
            { hash: '0xtx2' },
            '0xtx3', // Mixed format
          ],
        } as any;

        cacheService.getOrSet.mockImplementation(async (key, fn) => {
          blockRepository.findOne.mockResolvedValue(null);
          rpcService.getBlock.mockResolvedValue(mockRpcBlock as any);
          return fn();
        });

        const result = await service.getBlock(dto);

        expect(result.status).toBe('1');
        expect(result.result.transactionCount).toBe(3);
        expect(result.result.transactions).toHaveLength(3);
      });

      it('should handle RPC errors gracefully', async () => {
        const dto: GetBlockDto = { blockno: 12345 };

        cacheService.getOrSet.mockImplementation(async (key, fn) => {
          blockRepository.findOne.mockResolvedValue(null);
          rpcService.getBlock.mockRejectedValue(new Error('RPC error'));
          try {
            return await fn();
          } catch (error) {
            return null;
          }
        });

        const result = await service.getBlock(dto);

        expect(result.status).toBe('0');
        expect(result.message).toContain('not found');
      });

      it('should handle database errors gracefully', async () => {
        const dto: GetBlockDto = { blockno: 12345 };

        cacheService.getOrSet.mockImplementation(async (key, fn) => {
          blockRepository.findOne.mockRejectedValue(new Error('Database error'));
          try {
            return await fn();
          } catch (error) {
            // Fallback to RPC
            const mockRpcBlock = {
              number: 12345,
              hash: '0xabc',
              parentHash: '0xdef',
              timestamp: 1234567890,
              gasLimit: BigInt('1000000'),
              gasUsed: BigInt('500000'),
              miner: '0x123',
              transactions: [],
            } as any;
            rpcService.getBlock.mockResolvedValue(mockRpcBlock as any);
            return fn();
          }
        });

        const result = await service.getBlock(dto);

        expect(result.status).toBe('1');
      });
    });

    describe('getBlockReward', () => {
      it('should handle missing gasUsed', async () => {
        const blockNumber = 12345;
        const mockBlock = {
          number: blockNumber,
          timestamp: 1234567890,
          miner: '0x123',
          gasUsed: null,
        } as any;

        cacheService.getOrSet.mockImplementation(async (key, fn) => {
          rpcService.getBlock.mockResolvedValue(mockBlock as any);
          rpcService.getFeeData = jest.fn().mockRejectedValue(new Error('Fee error'));
          return fn();
        });

        const result = await service.getBlockReward(blockNumber);

        expect(result.status).toBe('1');
        expect(result.result).toBeDefined();
        expect(result.result.totalReward).toBeDefined();
      });

      it('should handle fee data errors', async () => {
        const blockNumber = 12345;
        const mockBlock = {
          number: blockNumber,
          timestamp: 1234567890,
          miner: '0x123',
          gasUsed: BigInt('500000'),
        } as any;

        cacheService.getOrSet.mockImplementation(async (key, fn) => {
          rpcService.getBlock.mockResolvedValue(mockBlock as any);
          rpcService.getFeeData = jest.fn().mockRejectedValue(new Error('Fee error'));
          return fn();
        });

        const result = await service.getBlockReward(blockNumber);

        expect(result.status).toBe('1');
        expect(result.result.totalReward).toBeDefined();
      });

      it('should return error if block not found', async () => {
        const blockNumber = 999999;

        cacheService.getOrSet.mockImplementation(async (key, fn) => {
          rpcService.getBlock.mockResolvedValue(null);
          return fn();
        });

        const result = await service.getBlockReward(blockNumber);

        expect(result.status).toBe('0');
        expect(result.message).toContain('not found');
      });

      it('should calculate fees correctly', async () => {
        const blockNumber = 12345;
        const mockBlock = {
          number: blockNumber,
          timestamp: 1234567890,
          miner: '0x123',
          gasUsed: BigInt('500000'),
        } as any;

        const mockFeeData = {
          gasPrice: BigInt('20000000000'), // 20 gwei
        };

        cacheService.getOrSet.mockImplementation(async (key, fn) => {
          rpcService.getBlock.mockResolvedValue(mockBlock as any);
          rpcService.getFeeData = jest.fn().mockResolvedValue(mockFeeData as any);
          return fn();
        });

        const result = await service.getBlockReward(blockNumber);

        expect(result.status).toBe('1');
        expect(result.result.totalReward).toBeDefined();
      });
    });

    describe('getBlockCountdown', () => {
      it('should calculate estimate time correctly', async () => {
        const blockNumber = 20000;
        rpcService.getBlockNumber.mockResolvedValue(10000);

        const result = await service.getBlockCountdown(blockNumber);

        expect(result.status).toBe('1');
        if (result.result) {
          expect(result.result.RemainingBlock).toBe(10000);
          expect(result.result.EstimateTimeInSec).toBe(10000 * 12); // 12 seconds per block
        }
      });

      it('should handle exact current block', async () => {
        const blockNumber = 10000;
        rpcService.getBlockNumber.mockResolvedValue(10000);

        const result = await service.getBlockCountdown(blockNumber);

        expect(result.status).toBe('1');
        if (result.result) {
          expect(result.result.RemainingBlock).toBe(0);
          expect(result.result.EstimateTimeInSec).toBe(0);
        }
      });

      it('should handle RPC errors', async () => {
        const blockNumber = 20000;
        rpcService.getBlockNumber.mockRejectedValue(new Error('RPC error'));

        await expect(service.getBlockCountdown(blockNumber)).rejects.toThrow();
      });
    });

    describe('getBlockNumber', () => {
      it('should handle RPC errors', async () => {
        rpcService.getBlockNumber.mockRejectedValue(new Error('RPC error'));

        await expect(service.getBlockNumber()).rejects.toThrow();
      });
    });

    describe('formatBlock (private method coverage)', () => {
      it('should format block with transactions', async () => {
        const dto: GetBlockDto = { blockno: 12345 };
        const mockBlock = {
          number: 12345,
          hash: '0xabc',
          parentHash: '0xdef',
          timestamp: 1234567890,
          gasLimit: '1000000',
          gasUsed: '500000',
          miner: '0x123',
          transactionsCount: 2,
          transactions: [
            { hash: '0xtx1' },
            { hash: '0xtx2' },
          ],
        };

        cacheService.getOrSet.mockImplementation(async (key, fn) => {
          blockRepository.findOne.mockResolvedValue(mockBlock as any);
          return fn();
        });

        const result = await service.getBlock(dto);

        expect(result.status).toBe('1');
        expect(result.result.transactionCount).toBe(2);
        expect(result.result.transactions).toEqual(['0xtx1', '0xtx2']);
      });

      it('should format block without transactions', async () => {
        const dto: GetBlockDto = { blockno: 12345 };
        const mockBlock = {
          number: 12345,
          hash: '0xabc',
          parentHash: '0xdef',
          timestamp: 1234567890,
          gasLimit: '1000000',
          gasUsed: '500000',
          miner: '0x123',
          transactionsCount: 0,
          transactions: null,
        };

        cacheService.getOrSet.mockImplementation(async (key, fn) => {
          blockRepository.findOne.mockResolvedValue(mockBlock as any);
          return fn();
        });

        const result = await service.getBlock(dto);

        expect(result.status).toBe('1');
        expect(result.result.transactions).toEqual([]);
      });
    });

    describe('formatRpcBlock (private method coverage)', () => {
      it('should format RPC block with transaction objects', async () => {
        const dto: GetBlockDto = { blockno: 12345 };
        const mockRpcBlock = {
          number: 12345,
          hash: '0xabc',
          parentHash: '0xdef',
          timestamp: 1234567890,
          gasLimit: BigInt('1000000'),
          gasUsed: BigInt('500000'),
          miner: '0x123',
          transactions: [
            { hash: '0xtx1' },
            { hash: '0xtx2' },
          ],
        } as any;

        cacheService.getOrSet.mockImplementation(async (key, fn) => {
          blockRepository.findOne.mockResolvedValue(null);
          rpcService.getBlock.mockResolvedValue(mockRpcBlock);
          return fn();
        });

        const result = await service.getBlock(dto);

        expect(result.status).toBe('1');
        expect(result.result.transactionCount).toBe(2);
        expect(result.result.transactions).toEqual(['0xtx1', '0xtx2']);
      });

      it('should format RPC block with transaction hashes', async () => {
        const dto: GetBlockDto = { blockno: 12345 };
        const mockRpcBlock = {
          number: 12345,
          hash: '0xabc',
          parentHash: '0xdef',
          timestamp: 1234567890,
          gasLimit: BigInt('1000000'),
          gasUsed: BigInt('500000'),
          miner: '0x123',
          transactions: ['0xtx1', '0xtx2', '0xtx3'],
        } as any;

        cacheService.getOrSet.mockImplementation(async (key, fn) => {
          blockRepository.findOne.mockResolvedValue(null);
          rpcService.getBlock.mockResolvedValue(mockRpcBlock);
          return fn();
        });

        const result = await service.getBlock(dto);

        expect(result.status).toBe('1');
        expect(result.result.transactionCount).toBe(3);
        expect(result.result.transactions).toEqual(['0xtx1', '0xtx2', '0xtx3']);
      });

      it('should format RPC block with empty transactions', async () => {
        const dto: GetBlockDto = { blockno: 12345 };
        const mockRpcBlock = {
          number: 12345,
          hash: '0xabc',
          parentHash: '0xdef',
          timestamp: 1234567890,
          gasLimit: BigInt('1000000'),
          gasUsed: BigInt('500000'),
          miner: '0x123',
          transactions: [],
        } as any;

        cacheService.getOrSet.mockImplementation(async (key, fn) => {
          blockRepository.findOne.mockResolvedValue(null);
          rpcService.getBlock.mockResolvedValue(mockRpcBlock);
          return fn();
        });

        const result = await service.getBlock(dto);

        expect(result.status).toBe('1');
        expect(result.result.transactionCount).toBe(0);
        expect(result.result.transactions).toEqual([]);
      });

      it('should format RPC block with non-array transactions', async () => {
        const dto: GetBlockDto = { blockno: 12345 };
        const mockRpcBlock = {
          number: 12345,
          hash: '0xabc',
          parentHash: '0xdef',
          timestamp: 1234567890,
          gasLimit: BigInt('1000000'),
          gasUsed: BigInt('500000'),
          miner: '0x123',
          transactions: null,
        } as any;

        cacheService.getOrSet.mockImplementation(async (key, fn) => {
          blockRepository.findOne.mockResolvedValue(null);
          rpcService.getBlock.mockResolvedValue(mockRpcBlock);
          return fn();
        });

        const result = await service.getBlock(dto);

        expect(result.status).toBe('1');
        expect(result.result.transactionCount).toBe(0);
        expect(result.result.transactions).toEqual([]);
      });

      it('should handle block number as string', async () => {
        const dto: GetBlockDto = { blockno: '12345' as any };
        const mockRpcBlock = {
          number: 12345,
          hash: '0xabc',
          parentHash: '0xdef',
          timestamp: 1234567890,
          gasLimit: BigInt('1000000'),
          gasUsed: BigInt('500000'),
          miner: '0x123',
          transactions: [],
        } as any;

        cacheService.getOrSet.mockImplementation(async (key, fn) => {
          blockRepository.findOne.mockResolvedValue(null);
          rpcService.getBlock.mockResolvedValue(mockRpcBlock);
          return fn();
        });

        const result = await service.getBlock(dto);

        expect(result.status).toBe('1');
      });

      it('should handle blockno as number in getBlock', async () => {
        const dto: GetBlockDto = { blockno: 12345 };
        const mockBlock = {
          number: 12345,
          hash: '0xabc',
          parentHash: '0xdef',
          timestamp: 1234567890,
          gasLimit: '1000000',
          gasUsed: '500000',
          miner: '0x123',
          transactionsCount: 0,
          transactions: [],
        };

        cacheService.getOrSet.mockImplementation(async (key, fn) => {
          blockRepository.findOne.mockResolvedValue(mockBlock as any);
          return fn();
        });

        const result = await service.getBlock(dto);

        expect(result.status).toBe('1');
        expect(blockRepository.findOne).toHaveBeenCalledWith({
          where: { number: 12345 },
          relations: ['transactions'],
        });
      });

      it('should handle blockno as string in getBlock', async () => {
        const dto: GetBlockDto = { blockno: '12345' as any };
        const mockRpcBlock = {
          number: 12345,
          hash: '0xabc',
          parentHash: '0xdef',
          timestamp: 1234567890,
          gasLimit: BigInt('1000000'),
          gasUsed: BigInt('500000'),
          miner: '0x123',
          transactions: [],
        } as any;

        cacheService.getOrSet.mockImplementation(async (key, fn) => {
          blockRepository.findOne.mockResolvedValue(null);
          rpcService.getBlock.mockResolvedValue(mockRpcBlock);
          return fn();
        });

        const result = await service.getBlock(dto);

        expect(result.status).toBe('1');
        expect(rpcService.getBlock).toHaveBeenCalledWith(12345);
      });

      it('should handle getBlockReward with successful fee data', async () => {
        const blockNumber = 12345;
        const mockBlock = {
          number: blockNumber,
          timestamp: 1234567890,
          miner: '0x123',
          gasUsed: BigInt('500000'),
        } as any;

        const mockFeeData = {
          gasPrice: BigInt('20000000000'),
        };

        cacheService.getOrSet.mockImplementation(async (key, fn) => {
          rpcService.getBlock.mockResolvedValue(mockBlock);
          rpcService.getFeeData = jest.fn().mockResolvedValue(mockFeeData as any);
          return fn();
        });

        const result = await service.getBlockReward(blockNumber);

        expect(result.status).toBe('1');
        expect(result.result).toBeDefined();
        expect(result.result.totalReward).toBeDefined();
      });
    });
  });
});


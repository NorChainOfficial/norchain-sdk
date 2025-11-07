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
});


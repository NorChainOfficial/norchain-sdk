import { Test, TestingModule } from '@nestjs/testing';
import { BlockController } from './block.controller';
import { BlockService } from './block.service';
import { ResponseDto } from '@/common/interfaces/api-response.interface';

describe('BlockController', () => {
  let controller: BlockController;
  let service: jest.Mocked<BlockService>;

  beforeEach(async () => {
    const mockBlockService = {
      getBlock: jest.fn(),
      getBlockReward: jest.fn(),
      getBlockCountdown: jest.fn(),
      getBlockNumber: jest.fn(),
    };

    const module: TestingModule = await Test.createTestingModule({
      controllers: [BlockController],
      providers: [
        {
          provide: BlockService,
          useValue: mockBlockService,
        },
      ],
    }).compile();

    controller = module.get<BlockController>(BlockController);
    service = module.get(BlockService);
  });

  it('should be defined', () => {
    expect(controller).toBeDefined();
  });

  describe('getBlock', () => {
    it('should return block by number', async () => {
      const dto = { blockno: 12345 };
      const mockResponse = ResponseDto.success({
        blockNumber: '12345',
        timeStamp: '1234567890',
        blockReward: '0',
        blockMiner: '0x123',
        blockHash: '0xabc',
        parentHash: '0xdef',
        gasLimit: '1000000',
        gasUsed: '500000',
        transactions: [],
        transactionCount: 0,
      });
      service.getBlock.mockResolvedValue(mockResponse);

      const result = await controller.getBlock(dto);

      expect(result).toEqual(mockResponse);
      expect(service.getBlock).toHaveBeenCalledWith(dto);
    });
  });

  describe('getBlockReward', () => {
    it('should return block reward', async () => {
      const blockno = 12345;
      const mockResponse = ResponseDto.success({
        blockNumber: 12345,
        timeStamp: 1234567890,
        blockMiner: '0x123',
        blockReward: '2000000000000000000',
        uncles: [],
        uncleInclusionReward: '0',
        totalReward: '2000000000000000000',
      });
      service.getBlockReward.mockResolvedValue(mockResponse);

      const result = await controller.getBlockReward(blockno);

      expect(result).toEqual(mockResponse);
      expect(service.getBlockReward).toHaveBeenCalledWith(blockno);
    });
  });

  describe('getBlockCountdown', () => {
    it('should return block countdown', async () => {
      const blockno = 12345;
      const mockResponse = ResponseDto.success({
        CurrentBlock: 12340,
        CountdownBlock: 12345,
        RemainingBlock: 5,
        EstimateTimeInSec: 60,
      });
      service.getBlockCountdown.mockResolvedValue(mockResponse);

      const result = await controller.getBlockCountdown(blockno);

      expect(result).toEqual(mockResponse);
      expect(service.getBlockCountdown).toHaveBeenCalledWith(blockno);
    });
  });

  describe('getBlockNumber', () => {
    it('should return current block number', async () => {
      const mockResponse = ResponseDto.success(12345);
      service.getBlockNumber.mockResolvedValue(mockResponse);

      const result = await controller.getBlockNumber();

      expect(result).toEqual(mockResponse);
      expect(service.getBlockNumber).toHaveBeenCalled();
    });
  });
});


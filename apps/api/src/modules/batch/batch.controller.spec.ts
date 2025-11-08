import { Test, TestingModule } from '@nestjs/testing';
import { BatchController } from './batch.controller';
import { BatchService } from './batch.service';
import { ResponseDto } from '@/common/interfaces/api-response.interface';

describe('BatchController', () => {
  let controller: BatchController;
  let service: jest.Mocked<BatchService>;

  beforeEach(async () => {
    const mockBatchService = {
      getBalancesBatch: jest.fn(),
      getTransactionCountsBatch: jest.fn(),
      getTokenBalancesBatch: jest.fn(),
      getBlocksBatch: jest.fn(),
    };

    const module: TestingModule = await Test.createTestingModule({
      controllers: [BatchController],
      providers: [
        {
          provide: BatchService,
          useValue: mockBatchService,
        },
      ],
    }).compile();

    controller = module.get<BatchController>(BatchController);
    service = module.get(BatchService);
  });

  it('should be defined', () => {
    expect(controller).toBeDefined();
  });

  describe('getBalancesBatch', () => {
    it('should get balances for multiple addresses', async () => {
      const dto = { addresses: ['0x123', '0x456'] };
      const mockResponse = ResponseDto.success([
        { address: '0x123', balance: '1000000000000000000' },
        { address: '0x456', balance: '2000000000000000000' },
      ]);
      service.getBalancesBatch.mockResolvedValue(mockResponse);

      const result = await controller.getBalancesBatch(dto);

      expect(result).toEqual(mockResponse);
      expect(service.getBalancesBatch).toHaveBeenCalledWith(dto.addresses);
    });
  });

  describe('getTransactionCountsBatch', () => {
    it('should get transaction counts for multiple addresses', async () => {
      const dto = { addresses: ['0x123', '0x456'] };
      const mockResponse = ResponseDto.success([
        { address: '0x123', transactionCount: 10 },
        { address: '0x456', transactionCount: 5 },
      ]);
      service.getTransactionCountsBatch.mockResolvedValue(mockResponse);

      const result = await controller.getTransactionCountsBatch(dto);

      expect(result).toEqual(mockResponse);
      expect(service.getTransactionCountsBatch).toHaveBeenCalledWith(dto.addresses);
    });
  });

  describe('getTokenBalancesBatch', () => {
    it('should get token balances for multiple pairs', async () => {
      const dto = { requests: [{ address: '0x123', tokenAddress: '0x456' }] };
      const mockResponse = ResponseDto.success([
        { address: '0x123', tokenAddress: '0x456', balance: '1000' },
      ]);
      service.getTokenBalancesBatch.mockResolvedValue(mockResponse);

      const result = await controller.getTokenBalancesBatch(dto);

      expect(result).toEqual(mockResponse);
      expect(service.getTokenBalancesBatch).toHaveBeenCalledWith(dto.requests);
    });
  });

  describe('getBlocksBatch', () => {
    it('should get blocks for multiple block numbers', async () => {
      const dto = { blockNumbers: [12345, 12346] };
      const mockResponse = ResponseDto.success([
        {
          blockNumber: 12345,
          hash: '0xabc',
          timestamp: 1234567890,
          gasUsed: '500000',
          gasLimit: '1000000',
          transactionCount: 10,
        },
        {
          blockNumber: 12346,
          hash: '0xdef',
          timestamp: 1234567902,
          gasUsed: '600000',
          gasLimit: '1000000',
          transactionCount: 12,
        },
      ]);
      service.getBlocksBatch.mockResolvedValue(mockResponse);

      const result = await controller.getBlocksBatch(dto);

      expect(result).toEqual(mockResponse);
      expect(service.getBlocksBatch).toHaveBeenCalledWith(dto.blockNumbers);
    });
  });
});


import { Test, TestingModule } from '@nestjs/testing';
import { ProxyController } from './proxy.controller';
import { ProxyService } from './proxy.service';
import { ResponseDto } from '@/common/interfaces/api-response.interface';

describe('ProxyController', () => {
  let controller: ProxyController;
  let service: jest.Mocked<ProxyService>;

  beforeEach(async () => {
    const mockProxyService = {
      eth_blockNumber: jest.fn(),
      eth_getBalance: jest.fn(),
      eth_getBlockByNumber: jest.fn(),
      eth_getTransactionByHash: jest.fn(),
      eth_getTransactionReceipt: jest.fn(),
      eth_call: jest.fn(),
      eth_estimateGas: jest.fn(),
      eth_getCode: jest.fn(),
      eth_getLogs: jest.fn(),
      eth_gasPrice: jest.fn(),
    };

    const module: TestingModule = await Test.createTestingModule({
      controllers: [ProxyController],
      providers: [
        {
          provide: ProxyService,
          useValue: mockProxyService,
        },
      ],
    }).compile();

    controller = module.get<ProxyController>(ProxyController);
    service = module.get(ProxyService);
  });

  it('should be defined', () => {
    expect(controller).toBeDefined();
  });

  describe('eth_blockNumber', () => {
    it('should return block number', async () => {
      const mockResponse = ResponseDto.success('0x12345');
      service.eth_blockNumber.mockResolvedValue(mockResponse);

      const result = await controller.eth_blockNumber();

      expect(result).toEqual(mockResponse);
      expect(service.eth_blockNumber).toHaveBeenCalled();
    });
  });

  describe('eth_getBalance', () => {
    it('should return balance', async () => {
      const address = '0x123';
      const tag = 'latest';
      const mockResponse = ResponseDto.success('0x1000');
      service.eth_getBalance.mockResolvedValue(mockResponse);

      const result = await controller.eth_getBalance(address, tag);

      expect(result).toEqual(mockResponse);
      expect(service.eth_getBalance).toHaveBeenCalledWith(address, tag);
    });
  });
});


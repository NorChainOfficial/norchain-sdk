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

    it('should use default tag when not provided', async () => {
      const address = '0x123';
      const mockResponse = ResponseDto.success('0x1000');
      service.eth_getBalance.mockResolvedValue(mockResponse);

      const result = await controller.eth_getBalance(address);

      expect(result).toEqual(mockResponse);
      expect(service.eth_getBalance).toHaveBeenCalledWith(address, 'latest');
    });
  });

  describe('eth_getBlockByNumber', () => {
    it('should return block', async () => {
      const tag = '0x12345';
      const full = false;
      const mockResponse = ResponseDto.success({ number: '0x12345' });
      service.eth_getBlockByNumber.mockResolvedValue(mockResponse);

      const result = await controller.eth_getBlockByNumber(tag, full);

      expect(result).toEqual(mockResponse);
      expect(service.eth_getBlockByNumber).toHaveBeenCalledWith(tag, full);
    });

    it('should use default full when not provided', async () => {
      const tag = '0x12345';
      const mockResponse = ResponseDto.success({ number: '0x12345' });
      service.eth_getBlockByNumber.mockResolvedValue(mockResponse);

      const result = await controller.eth_getBlockByNumber(tag);

      expect(result).toEqual(mockResponse);
      expect(service.eth_getBlockByNumber).toHaveBeenCalledWith(tag, false);
    });
  });

  describe('eth_getTransactionByHash', () => {
    it('should return transaction', async () => {
      const txhash = '0xabc123';
      const mockResponse = ResponseDto.success({ hash: txhash });
      service.eth_getTransactionByHash.mockResolvedValue(mockResponse);

      const result = await controller.eth_getTransactionByHash(txhash);

      expect(result).toEqual(mockResponse);
      expect(service.eth_getTransactionByHash).toHaveBeenCalledWith(txhash);
    });
  });

  describe('eth_getTransactionReceipt', () => {
    it('should return transaction receipt', async () => {
      const txhash = '0xabc123';
      const mockResponse = ResponseDto.success({ transactionHash: txhash });
      service.eth_getTransactionReceipt.mockResolvedValue(mockResponse);

      const result = await controller.eth_getTransactionReceipt(txhash);

      expect(result).toEqual(mockResponse);
      expect(service.eth_getTransactionReceipt).toHaveBeenCalledWith(txhash);
    });
  });

  describe('eth_call', () => {
    it('should execute call', async () => {
      const transaction = { to: '0x123', data: '0x' };
      const tag = 'latest';
      const mockResponse = ResponseDto.success('0xresult');
      service.eth_call.mockResolvedValue(mockResponse);

      const result = await controller.eth_call(transaction, tag);

      expect(result).toEqual(mockResponse);
      expect(service.eth_call).toHaveBeenCalledWith(transaction, tag);
    });

    it('should use default tag when not provided', async () => {
      const transaction = { to: '0x123', data: '0x' };
      const mockResponse = ResponseDto.success('0xresult');
      service.eth_call.mockResolvedValue(mockResponse);

      const result = await controller.eth_call(transaction);

      expect(result).toEqual(mockResponse);
      expect(service.eth_call).toHaveBeenCalledWith(transaction, undefined);
    });
  });

  describe('eth_estimateGas', () => {
    it('should estimate gas', async () => {
      const transaction = { to: '0x123', value: '1000' };
      const mockResponse = ResponseDto.success('0x5208');
      service.eth_estimateGas.mockResolvedValue(mockResponse);

      const result = await controller.eth_estimateGas(transaction);

      expect(result).toEqual(mockResponse);
      expect(service.eth_estimateGas).toHaveBeenCalledWith(transaction);
    });
  });

  describe('eth_getCode', () => {
    it('should return code', async () => {
      const address = '0x123';
      const tag = 'latest';
      const mockResponse = ResponseDto.success('0x6080604052');
      service.eth_getCode.mockResolvedValue(mockResponse);

      const result = await controller.eth_getCode(address, tag);

      expect(result).toEqual(mockResponse);
      expect(service.eth_getCode).toHaveBeenCalledWith(address, tag);
    });

    it('should use default tag when not provided', async () => {
      const address = '0x123';
      const mockResponse = ResponseDto.success('0x6080604052');
      service.eth_getCode.mockResolvedValue(mockResponse);

      const result = await controller.eth_getCode(address);

      expect(result).toEqual(mockResponse);
      expect(service.eth_getCode).toHaveBeenCalledWith(address, 'latest');
    });
  });

  describe('eth_getLogs', () => {
    it('should return logs', async () => {
      const filter = { fromBlock: 1000, toBlock: 2000, address: '0x123' };
      const mockResponse = ResponseDto.success([]);
      service.eth_getLogs.mockResolvedValue(mockResponse);

      const result = await controller.eth_getLogs(filter);

      expect(result).toEqual(mockResponse);
      expect(service.eth_getLogs).toHaveBeenCalledWith(filter);
    });
  });

  describe('eth_gasPrice', () => {
    it('should return gas price', async () => {
      const mockResponse = ResponseDto.success('0x4a817c800');
      service.eth_gasPrice.mockResolvedValue(mockResponse);

      const result = await controller.eth_gasPrice();

      expect(result).toEqual(mockResponse);
      expect(service.eth_gasPrice).toHaveBeenCalled();
    });
  });
});


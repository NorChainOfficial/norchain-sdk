import { Test, TestingModule } from '@nestjs/testing';
import { TokenController } from './token.controller';
import { TokenService } from './token.service';
import { ResponseDto } from '@/common/interfaces/api-response.interface';

describe('TokenController', () => {
  let controller: TokenController;
  let service: jest.Mocked<TokenService>;

  beforeEach(async () => {
    const mockTokenService = {
      getTokenSupply: jest.fn(),
      getTokenAccountBalance: jest.fn(),
      getTokenInfo: jest.fn(),
      getTokenTransfers: jest.fn(),
    };

    const module: TestingModule = await Test.createTestingModule({
      controllers: [TokenController],
      providers: [
        {
          provide: TokenService,
          useValue: mockTokenService,
        },
      ],
    }).compile();

    controller = module.get<TokenController>(TokenController);
    service = module.get(TokenService);
  });

  it('should be defined', () => {
    expect(controller).toBeDefined();
  });

  describe('getTokenSupply', () => {
    it('should return token supply', async () => {
      const contractAddress = '0x123';
      const mockResponse = ResponseDto.success('1000000');
      service.getTokenSupply.mockResolvedValue(mockResponse);

      const result = await controller.getTokenSupply(contractAddress);

      expect(result).toEqual(mockResponse);
      expect(service.getTokenSupply).toHaveBeenCalledWith(contractAddress);
    });
  });

  describe('getTokenAccountBalance', () => {
    it('should return token balance', async () => {
      const contractAddress = '0x123';
      const address = '0x456';
      const mockResponse = ResponseDto.success('1000');
      service.getTokenAccountBalance.mockResolvedValue(mockResponse);

      const result = await controller.getTokenAccountBalance(contractAddress, address);

      expect(result).toEqual(mockResponse);
      expect(service.getTokenAccountBalance).toHaveBeenCalledWith(contractAddress, address);
    });
  });

  describe('getTokenInfo', () => {
    it('should return token info', async () => {
      const contractAddress = '0x123';
      const mockResponse = ResponseDto.success({
        address: '0x123',
        name: 'Test Token',
        symbol: 'TEST',
        decimals: 18,
        totalSupply: '1000000',
        tokenType: 'ERC20',
      });
      service.getTokenInfo.mockResolvedValue(mockResponse);

      const result = await controller.getTokenInfo(contractAddress);

      expect(result).toEqual(mockResponse);
      expect(service.getTokenInfo).toHaveBeenCalledWith(contractAddress);
    });
  });

  describe('getTokenTransfers', () => {
    it('should return token transfers', async () => {
      const contractAddress = '0x123';
      const page = 1;
      const limit = 10;
      const mockResponse = ResponseDto.success({
        data: [],
        meta: {
          page: 1,
          limit: 10,
          total: 0,
          totalPages: 0,
          hasNextPage: false,
          hasPreviousPage: false,
        },
      });
      service.getTokenTransfers.mockResolvedValue(mockResponse);

      const result = await controller.getTokenTransfers(contractAddress, page, limit);

      expect(result).toEqual(mockResponse);
      expect(service.getTokenTransfers).toHaveBeenCalledWith(contractAddress, page, limit);
    });
  });
});


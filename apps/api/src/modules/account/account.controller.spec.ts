import { Test, TestingModule } from '@nestjs/testing';
import { AccountController } from './account.controller';
import { AccountService } from './account.service';
import { GetBalanceDto } from './dto/get-balance.dto';
import { GetTransactionsDto } from './dto/get-transactions.dto';
import { ResponseDto } from '@/common/interfaces/api-response.interface';

describe('AccountController', () => {
  let controller: AccountController;
  let service: jest.Mocked<AccountService>;

  beforeEach(async () => {
    const mockAccountService = {
      getBalance: jest.fn(),
      getTransactions: jest.fn(),
      getAccountSummary: jest.fn(),
      getTokenList: jest.fn(),
      getBalanceMulti: jest.fn(),
      getTokenTransfers: jest.fn(),
      getInternalTransactions: jest.fn(),
    };

    const module: TestingModule = await Test.createTestingModule({
      controllers: [AccountController],
      providers: [
        {
          provide: AccountService,
          useValue: mockAccountService,
        },
      ],
    }).compile();

    controller = module.get<AccountController>(AccountController);
    service = module.get(AccountService);
  });

  it('should be defined', () => {
    expect(controller).toBeDefined();
  });

  describe('getBalance', () => {
    it('should return balance', async () => {
      const dto: GetBalanceDto = { address: '0x123' };
      const mockResponse = ResponseDto.success('1000000000000000000');
      
      service.getBalance.mockResolvedValue(mockResponse);

      const result = await controller.getBalance(dto);

      expect(result).toEqual(mockResponse);
      expect(service.getBalance).toHaveBeenCalledWith(dto);
    });
  });

  describe('getTransactions', () => {
    it('should return transactions', async () => {
      const dto: GetTransactionsDto = { address: '0x123', page: 1, limit: 10 };
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
      
      service.getTransactions.mockResolvedValue(mockResponse);

      const result = await controller.getTransactions(dto);

      expect(result).toEqual(mockResponse);
      expect(service.getTransactions).toHaveBeenCalledWith(dto);
    });
  });

  describe('getAccountSummary', () => {
    it('should return account summary', async () => {
      const address = '0x123';
      const mockResponse = ResponseDto.success({
        address: '0x123',
        balance: '1000000000000000000',
        transactionCount: 10,
        tokenCount: 5,
      });
      
      service.getAccountSummary.mockResolvedValue(mockResponse);

      const result = await controller.getAccountSummary(address);

      expect(result).toEqual(mockResponse);
      expect(service.getAccountSummary).toHaveBeenCalledWith(address);
    });
  });

  describe('getTokenList', () => {
    it('should return token list', async () => {
      const dto = { address: '0x123' };
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
      
      service.getTokenList.mockResolvedValue(mockResponse);

      const result = await controller.getTokenList(dto);

      expect(result).toEqual(mockResponse);
      expect(service.getTokenList).toHaveBeenCalledWith(dto);
    });
  });

  describe('getTokenTransfers', () => {
    it('should return token transfers', async () => {
      const dto = { address: '0x123' };
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

      const result = await controller.getTokenTransfers(dto);

      expect(result).toEqual(mockResponse);
      expect(service.getTokenTransfers).toHaveBeenCalledWith(dto);
    });
  });

  describe('getBalanceMulti', () => {
    it('should return multi balance', async () => {
      const dto = { address: ['0x123', '0x456'] };
      const mockResponse = ResponseDto.success([]);
      
      service.getBalanceMulti.mockResolvedValue(mockResponse);

      const result = await controller.getBalanceMulti(dto);

      expect(result).toEqual(mockResponse);
      expect(service.getBalanceMulti).toHaveBeenCalledWith(dto);
    });
  });

  describe('getInternalTransactions', () => {
    it('should return internal transactions', async () => {
      const dto = { address: '0x123' };
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
      
      service.getInternalTransactions.mockResolvedValue(mockResponse);

      const result = await controller.getInternalTransactions(dto);

      expect(result).toEqual(mockResponse);
      expect(service.getInternalTransactions).toHaveBeenCalledWith(dto);
    });
  });
});


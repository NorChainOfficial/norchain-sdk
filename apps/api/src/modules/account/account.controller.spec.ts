import { Test, TestingModule } from '@nestjs/testing';
import { AccountController } from './account.controller';
import { AccountService } from './account.service';
import { GetBalanceDto } from './dto/get-balance.dto';
import { GetTransactionsDto } from './dto/get-transactions.dto';
import { GetTokenListDto } from './dto/get-token-list.dto';
import { GetTokenTransfersDto } from './dto/get-token-transfers.dto';
import { GetBalanceMultiDto } from './dto/get-balance-multi.dto';
import { GetInternalTransactionsDto } from './dto/get-internal-transactions.dto';
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
      const dto: GetBalanceDto = { address: '0x742d35Cc6634C0532925a3b844Bc9e7595f0bEb0' };
      const mockResponse = ResponseDto.success('1000000000000000000');
      
      service.getBalance.mockResolvedValue(mockResponse);

      const result = await controller.getBalance(dto);

      expect(result).toEqual(mockResponse);
      expect(service.getBalance).toHaveBeenCalledWith(dto);
    });

    it('should handle zero balance', async () => {
      const dto: GetBalanceDto = { address: '0x742d35Cc6634C0532925a3b844Bc9e7595f0bEb0' };
      const mockResponse = ResponseDto.success('0');
      
      service.getBalance.mockResolvedValue(mockResponse);

      const result = await controller.getBalance(dto);

      expect(result.result).toBe('0');
    });
  });

  describe('getTransactions', () => {
    it('should return transactions', async () => {
      const dto: GetTransactionsDto = { 
        address: '0x742d35Cc6634C0532925a3b844Bc9e7595f0bEb0', 
        page: 1, 
        limit: 10 
      };
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

    it('should handle transactions with pagination', async () => {
      const dto: GetTransactionsDto = { 
        address: '0x742d35Cc6634C0532925a3b844Bc9e7595f0bEb0', 
        page: 2, 
        limit: 20,
        startblock: 0,
        endblock: 1000000,
      };
      const mockResponse = ResponseDto.success({
        data: [],
        meta: {
          page: 2,
          limit: 20,
          total: 0,
          totalPages: 0,
          hasNextPage: false,
          hasPreviousPage: false,
        },
      });
      
      service.getTransactions.mockResolvedValue(mockResponse);

      const result = await controller.getTransactions(dto);

      expect(result.result.meta.page).toBe(2);
      expect(result.result.meta.limit).toBe(20);
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
      const dto: GetTokenListDto = { 
        address: '0x742d35Cc6634C0532925a3b844Bc9e7595f0bEb0',
        page: 1,
        limit: 10,
      };
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

    it('should handle token list with block range', async () => {
      const dto: GetTokenListDto = { 
        address: '0x742d35Cc6634C0532925a3b844Bc9e7595f0bEb0',
        startblock: 1000,
        endblock: 2000,
        page: 1,
        limit: 10,
      };
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

      await controller.getTokenList(dto);

      expect(service.getTokenList).toHaveBeenCalledWith(dto);
    });
  });

  describe('getTokenTransfers', () => {
    it('should return token transfers', async () => {
      const dto: GetTokenTransfersDto = { 
        address: '0x742d35Cc6634C0532925a3b844Bc9e7595f0bEb0',
        page: 1,
        limit: 10,
      };
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

    it('should handle token transfers with contract filter', async () => {
      const dto: GetTokenTransfersDto = { 
        address: '0x742d35Cc6634C0532925a3b844Bc9e7595f0bEb0',
        contractaddress: '0x1234567890123456789012345678901234567890',
        page: 1,
        limit: 10,
      };
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

      await controller.getTokenTransfers(dto);

      expect(service.getTokenTransfers).toHaveBeenCalledWith(dto);
    });
  });

  describe('getBalanceMulti', () => {
    it('should return multi balance', async () => {
      const dto: GetBalanceMultiDto = { 
        address: [
          '0x742d35Cc6634C0532925a3b844Bc9e7595f0bEb0',
          '0x1234567890123456789012345678901234567890',
        ] 
      };
      const mockResponse = ResponseDto.success([
        { account: dto.address[0], balance: '1000000000000000000' },
        { account: dto.address[1], balance: '2000000000000000000' },
      ]);
      
      service.getBalanceMulti.mockResolvedValue(mockResponse);

      const result = await controller.getBalanceMulti(dto);

      expect(result).toEqual(mockResponse);
      expect(service.getBalanceMulti).toHaveBeenCalledWith(dto);
      expect(result.result).toHaveLength(2);
    });

    it('should handle single address', async () => {
      const dto: GetBalanceMultiDto = { 
        address: ['0x742d35Cc6634C0532925a3b844Bc9e7595f0bEb0'] 
      };
      const mockResponse = ResponseDto.success([
        { account: dto.address[0], balance: '1000000000000000000' },
      ]);
      
      service.getBalanceMulti.mockResolvedValue(mockResponse);

      const result = await controller.getBalanceMulti(dto);

      expect(result.result).toHaveLength(1);
    });
  });

  describe('getInternalTransactions', () => {
    it('should return internal transactions', async () => {
      const dto: GetInternalTransactionsDto = { 
        address: '0x742d35Cc6634C0532925a3b844Bc9e7595f0bEb0',
        page: 1,
        limit: 10,
      };
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

    it('should handle internal transactions with block range', async () => {
      const dto: GetInternalTransactionsDto = { 
        address: '0x742d35Cc6634C0532925a3b844Bc9e7595f0bEb0',
        startblock: 1000,
        endblock: 2000,
        page: 1,
        limit: 10,
      };
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

      await controller.getInternalTransactions(dto);

      expect(service.getInternalTransactions).toHaveBeenCalledWith(dto);
    });
  });
});


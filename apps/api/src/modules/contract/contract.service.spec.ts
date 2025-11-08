import { Test, TestingModule } from '@nestjs/testing';
import { ContractService } from './contract.service';
import { getRepositoryToken } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { Contract } from './entities/contract.entity';
import { RpcService } from '@/common/services/rpc.service';
import { CacheService } from '@/common/services/cache.service';
import { ResponseDto } from '@/common/interfaces/api-response.interface';

describe('ContractService', () => {
  let service: ContractService;
  let contractRepository: jest.Mocked<Repository<Contract>>;
  let rpcService: jest.Mocked<RpcService>;
  let cacheService: jest.Mocked<CacheService>;

  beforeEach(async () => {
    const mockContractRepository = {
      findOne: jest.fn(),
      save: jest.fn(),
      create: jest.fn(),
    };

    const mockRpcService = {
      getCode: jest.fn(),
    };

    const mockCacheService = {
      get: jest.fn(),
      set: jest.fn(),
      getOrSet: jest.fn(),
      del: jest.fn(),
      reset: jest.fn(),
    };

    const module: TestingModule = await Test.createTestingModule({
      providers: [
        ContractService,
        {
          provide: getRepositoryToken(Contract),
          useValue: mockContractRepository,
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

    service = module.get<ContractService>(ContractService);
    contractRepository = module.get(getRepositoryToken(Contract));
    rpcService = module.get(RpcService);
    cacheService = module.get(CacheService);
  });

  afterEach(() => {
    jest.clearAllMocks();
  });

  it('should be defined', () => {
    expect(service).toBeDefined();
  });

  describe('getAbi', () => {
    it('should return contract ABI from database', async () => {
      const address = '0xdAC17F958D2ee523a2206206994597C13D831ec7';
      const contract = {
        address,
        abi: [{ type: 'function', name: 'transfer' }],
      };

      cacheService.getOrSet.mockImplementation(async (key, fn) => {
        contractRepository.findOne.mockResolvedValue(contract as any);
        return fn();
      });

      const result = await service.getAbi(address);

      expect(result).toBeDefined();
      expect(result.status).toBe('1');
      expect(result.result).toEqual(contract.abi);
      expect(contractRepository.findOne).toHaveBeenCalledWith({
        where: { address },
      });
    });

    it('should return error if contract not found', async () => {
      const address = '0xdAC17F958D2ee523a2206206994597C13D831ec7';

      cacheService.getOrSet.mockImplementation(async (key, fn) => {
        contractRepository.findOne.mockResolvedValue(null);
        return fn();
      });

      const result = await service.getAbi(address);

      expect(result).toBeDefined();
      expect(result.status).toBe('0');
      expect(result.message).toBeDefined();
    });
  });

  describe('getSourceCode', () => {
    it('should return contract source code', async () => {
      const address = '0xdAC17F958D2ee523a2206206994597C13D831ec7';
      const contract = {
        address,
        sourceCode: 'contract Test {}',
        contractName: 'Test',
        compilerVersion: '0.8.0',
        optimizationUsed: false,
        abi: [],
        runs: 200,
      };

      cacheService.getOrSet.mockImplementation(async (key, fn) => {
        contractRepository.findOne.mockResolvedValue(contract as any);
        return fn();
      });

      const result = await service.getSourceCode(address);

      expect(result).toBeDefined();
      expect(result.status).toBe('1');
      expect(Array.isArray(result.result)).toBe(true);
      expect(result.result[0]).toHaveProperty('SourceCode');
    });

    it('should return error if contract not found', async () => {
      const address = '0xdAC17F958D2ee523a2206206994597C13D831ec7';

      cacheService.getOrSet.mockImplementation(async (key, fn) => {
        contractRepository.findOne.mockResolvedValue(null);
        return fn();
      });

      const result = await service.getSourceCode(address);

      expect(result).toBeDefined();
      expect(result.status).toBe('0');
      expect(result.message).toBeDefined();
    });
  });

  describe('verifyContract', () => {
    it('should verify and save new contract', async () => {
      const verificationData = {
        address: '0xdAC17F958D2ee523a2206206994597C13D831ec7',
        sourceCode: 'contract Test {}',
        contractName: 'Test',
        compilerVersion: '0.8.0',
        optimizationUsed: false,
        runs: 200,
        abi: [],
      };

      contractRepository.findOne.mockResolvedValue(null);
      contractRepository.create.mockReturnValue({
        ...verificationData,
        isVerified: true,
      } as any);
      contractRepository.save.mockResolvedValue({
        id: '1',
        ...verificationData,
        isVerified: true,
      } as any);
      cacheService.del.mockResolvedValue(undefined);

      const result = await service.verifyContract(verificationData);

      expect(result).toBeDefined();
      expect(result.status).toBe('1');
      expect(contractRepository.save).toHaveBeenCalled();
      expect(cacheService.del).toHaveBeenCalledTimes(2);
    });

    it('should update existing contract', async () => {
      const verificationData = {
        address: '0xdAC17F958D2ee523a2206206994597C13D831ec7',
        sourceCode: 'contract Test {}',
        contractName: 'Test',
        compilerVersion: '0.8.0',
        optimizationUsed: false,
        runs: 200,
        abi: [],
      };

      const existingContract = {
        id: '1',
        address: verificationData.address,
        isVerified: false,
      };

      contractRepository.findOne.mockResolvedValue(existingContract as any);
      contractRepository.save.mockResolvedValue({
        ...existingContract,
        ...verificationData,
        isVerified: true,
      } as any);
      cacheService.del.mockResolvedValue(undefined);

      const result = await service.verifyContract(verificationData);

      expect(result).toBeDefined();
      expect(result.status).toBe('1');
      expect(contractRepository.save).toHaveBeenCalled();
    });
  });
});

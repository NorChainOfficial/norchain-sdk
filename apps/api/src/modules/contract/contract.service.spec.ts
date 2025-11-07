import { Test, TestingModule } from '@nestjs/testing';
import { getRepositoryToken } from '@nestjs/typeorm';
import { ContractService } from './contract.service';
import { Contract } from './entities/contract.entity';
import { RpcService } from '@/common/services/rpc.service';
import { CacheService } from '@/common/services/cache.service';

describe('ContractService', () => {
  let service: ContractService;
  let contractRepository: any;
  let rpcService: jest.Mocked<RpcService>;
  let cacheService: jest.Mocked<CacheService>;

  beforeEach(async () => {
    const mockContractRepository = {
      findOne: jest.fn(),
      create: jest.fn(),
      save: jest.fn(),
    };

    const mockRpcService = {
      getCode: jest.fn(),
    };

    const mockCacheService = {
      getOrSet: jest.fn(),
      del: jest.fn(),
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

  it('should be defined', () => {
    expect(service).toBeDefined();
  });

  describe('getAbi', () => {
    it('should return ABI from database', async () => {
      const address = '0x123';
      const mockAbi = [{ type: 'function', name: 'transfer' }];

      cacheService.getOrSet.mockImplementation(async (key, fn) => {
        contractRepository.findOne.mockResolvedValue({
          address,
          abi: mockAbi,
        });
        return fn();
      });

      const result = await service.getAbi(address);

      expect(result.status).toBe('1');
      expect(result.result).toEqual(mockAbi);
    });

    it('should return error if ABI not found', async () => {
      const address = '0x123';

      cacheService.getOrSet.mockResolvedValue(null);

      const result = await service.getAbi(address);

      expect(result.status).toBe('0');
      expect(result.message).toContain('not found');
    });
  });

  describe('getSourceCode', () => {
    it('should return source code from database', async () => {
      const address = '0x123';
      const mockContract = {
        address,
        sourceCode: 'pragma solidity ^0.8.0;',
        abi: [{ type: 'function' }],
        contractName: 'TestContract',
        compilerVersion: '0.8.0',
        optimizationUsed: true,
        runs: 200,
      };

      cacheService.getOrSet.mockImplementation(async (key, fn) => {
        contractRepository.findOne.mockResolvedValue(mockContract);
        return fn();
      });

      const result = await service.getSourceCode(address);

      expect(result.status).toBe('1');
      expect(result.result).toBeDefined();
      if (result.result && Array.isArray(result.result)) {
        expect(result.result[0]).toHaveProperty('SourceCode');
        expect(result.result[0]).toHaveProperty('ContractName');
      }
    });
  });

  describe('verifyContract', () => {
    it('should verify and save contract', async () => {
      const verificationData = {
        address: '0x123',
        sourceCode: 'pragma solidity ^0.8.0;',
        contractName: 'TestContract',
        compilerVersion: '0.8.0',
        optimizationUsed: true,
        runs: 200,
        abi: [{ type: 'function' }],
      };

      contractRepository.findOne.mockResolvedValue(null);
      contractRepository.create.mockReturnValue(verificationData);
      contractRepository.save.mockResolvedValue(verificationData);

      const result = await service.verifyContract(verificationData);

      expect(result.status).toBe('1');
      expect(result.result).toHaveProperty('message');
      expect(cacheService.del).toHaveBeenCalled();
    });
  });
});


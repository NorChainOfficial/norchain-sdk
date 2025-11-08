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

    it('should handle missing optional fields', async () => {
      const verificationData = {
        address: '0xdAC17F958D2ee523a2206206994597C13D831ec7',
        sourceCode: 'contract Test {}',
        contractName: 'Test',
        compilerVersion: '0.8.0',
        optimizationUsed: false,
        abi: [],
      };

      contractRepository.findOne.mockResolvedValue(null);
      contractRepository.create.mockReturnValue({
        ...verificationData,
        runs: undefined,
        isVerified: true,
      } as any);
      contractRepository.save.mockResolvedValue({
        id: '1',
        ...verificationData,
        isVerified: true,
      } as any);
      cacheService.del.mockResolvedValue(undefined);

      const result = await service.verifyContract(verificationData as any);

      expect(result.status).toBe('1');
      expect(contractRepository.save).toHaveBeenCalled();
    });
  });

  describe('Edge Cases and Error Handling', () => {
    describe('getAbi', () => {
      it('should handle contract without ABI', async () => {
        const address = '0xdAC17F958D2ee523a2206206994597C13D831ec7';
        const contract = {
          address,
          abi: null,
        };

        cacheService.getOrSet.mockImplementation(async (key, fn) => {
          contractRepository.findOne.mockResolvedValue(contract as any);
          return fn();
        });

        const result = await service.getAbi(address);

        expect(result.status).toBe('0');
        expect(result.message).toContain('not found');
      });

      it('should handle database errors', async () => {
        const address = '0xdAC17F958D2ee523a2206206994597C13D831ec7';

        cacheService.getOrSet.mockImplementation(async (key, fn) => {
          contractRepository.findOne.mockRejectedValue(
            new Error('Database error'),
          );
          try {
            return await fn();
          } catch (error) {
            return null;
          }
        });

        const result = await service.getAbi(address);

        expect(result.status).toBe('0');
      });

      it('should handle cache errors', async () => {
        const address = '0xdAC17F958D2ee523a2206206994597C13D831ec7';
        const contract = {
          address,
          abi: [{ type: 'function', name: 'transfer' }],
        };

        cacheService.getOrSet.mockRejectedValue(new Error('Cache error'));

        await expect(service.getAbi(address)).rejects.toThrow();
      });
    });

    describe('getSourceCode', () => {
      it('should handle contract with minimal data', async () => {
        const address = '0xdAC17F958D2ee523a2206206994597C13D831ec7';
        const contract = {
          address,
          sourceCode: null,
          contractName: null,
          compilerVersion: null,
          optimizationUsed: false,
          abi: null,
          runs: null,
        };

        cacheService.getOrSet.mockImplementation(async (key, fn) => {
          contractRepository.findOne.mockResolvedValue(contract as any);
          return fn();
        });

        const result = await service.getSourceCode(address);

        expect(result.status).toBe('1');
        expect(result.result[0].SourceCode).toBe('');
        expect(result.result[0].ABI).toBe('');
        expect(result.result[0].ContractName).toBe('');
      });

      it('should format ABI as JSON string', async () => {
        const address = '0xdAC17F958D2ee523a2206206994597C13D831ec7';
        const abi = [{ type: 'function', name: 'transfer' }];
        const contract = {
          address,
          sourceCode: 'contract Test {}',
          contractName: 'Test',
          compilerVersion: '0.8.0',
          optimizationUsed: true,
          abi,
          runs: 200,
        };

        cacheService.getOrSet.mockImplementation(async (key, fn) => {
          contractRepository.findOne.mockResolvedValue(contract as any);
          return fn();
        });

        const result = await service.getSourceCode(address);

        expect(result.status).toBe('1');
        expect(result.result[0].ABI).toBe(JSON.stringify(abi));
        expect(result.result[0].OptimizationUsed).toBe('1');
        expect(result.result[0].Runs).toBe('200');
      });

      it('should handle database errors', async () => {
        const address = '0xdAC17F958D2ee523a2206206994597C13D831ec7';

        cacheService.getOrSet.mockImplementation(async (key, fn) => {
          contractRepository.findOne.mockRejectedValue(
            new Error('Database error'),
          );
          try {
            return await fn();
          } catch (error) {
            return null;
          }
        });

        const result = await service.getSourceCode(address);

        expect(result.status).toBe('0');
      });
    });

    describe('verifyContract', () => {
      it('should handle save errors', async () => {
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
        contractRepository.save.mockRejectedValue(new Error('Save error'));
        cacheService.del.mockResolvedValue(undefined);

        await expect(service.verifyContract(verificationData)).rejects.toThrow();
      });

      it('should handle cache deletion errors gracefully', async () => {
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
        cacheService.del.mockRejectedValue(new Error('Cache error'));

        // Should still succeed even if cache deletion fails
        const result = await service.verifyContract(verificationData);

        expect(result.status).toBe('1');
      });

      it('should update all contract fields', async () => {
        const existingContract = {
          id: '1',
          address: '0xdAC17F958D2ee523a2206206994597C13D831ec7',
          sourceCode: 'old code',
          contractName: 'OldName',
          compilerVersion: '0.7.0',
          optimizationUsed: false,
          runs: 100,
          abi: [],
          isVerified: false,
        };

        const verificationData = {
          address: '0xdAC17F958D2ee523a2206206994597C13D831ec7',
          sourceCode: 'new code',
          contractName: 'NewName',
          compilerVersion: '0.8.0',
          optimizationUsed: true,
          runs: 200,
          abi: [{ type: 'function' }],
        };

        contractRepository.findOne.mockResolvedValue(existingContract as any);
        contractRepository.save.mockResolvedValue({
          ...existingContract,
          ...verificationData,
          isVerified: true,
        } as any);
        cacheService.del.mockResolvedValue(undefined);

        const result = await service.verifyContract(verificationData);

        expect(result.status).toBe('1');
        expect(contractRepository.save).toHaveBeenCalledWith(
          expect.objectContaining({
            sourceCode: verificationData.sourceCode,
            contractName: verificationData.contractName,
            compilerVersion: verificationData.compilerVersion,
            optimizationUsed: verificationData.optimizationUsed,
            runs: verificationData.runs,
            abi: verificationData.abi,
            isVerified: true,
          }),
        );
      });
    });
  });

  describe('Additional Coverage for 100%', () => {
    describe('getSourceCode', () => {
      it('should handle contract with all fields populated', async () => {
        const address = '0xdAC17F958D2ee523a2206206994597C13D831ec7';
        const contract = {
          address,
          sourceCode: 'contract Test { function test() {} }',
          contractName: 'TestContract',
          compilerVersion: '0.8.20',
          optimizationUsed: true,
          abi: [{ type: 'function', name: 'test' }],
          runs: 200,
        };

        cacheService.getOrSet.mockImplementation(async (key, fn) => {
          contractRepository.findOne.mockResolvedValue(contract as any);
          return fn();
        });

        const result = await service.getSourceCode(address);

        expect(result.status).toBe('1');
        expect(result.result[0].SourceCode).toBe(contract.sourceCode);
        expect(result.result[0].ContractName).toBe(contract.contractName);
        expect(result.result[0].CompilerVersion).toBe(contract.compilerVersion);
        expect(result.result[0].OptimizationUsed).toBe('1');
        expect(result.result[0].Runs).toBe('200');
        expect(result.result[0].ABI).toBe(JSON.stringify(contract.abi));
      });

      it('should handle contract with empty source code', async () => {
        const address = '0xdAC17F958D2ee523a2206206994597C13D831ec7';
        const contract = {
          address,
          sourceCode: '',
          contractName: '',
          compilerVersion: '',
          optimizationUsed: false,
          abi: null,
          runs: null,
        };

        cacheService.getOrSet.mockImplementation(async (key, fn) => {
          contractRepository.findOne.mockResolvedValue(contract as any);
          return fn();
        });

        const result = await service.getSourceCode(address);

        expect(result.status).toBe('1');
        expect(result.result[0].SourceCode).toBe('');
        expect(result.result[0].ABI).toBe('');
      });
    });

    describe('verifyContract', () => {
      it('should handle verification with all optional fields', async () => {
        const verificationData = {
          address: '0xdAC17F958D2ee523a2206206994597C13D831ec7',
          sourceCode: 'contract Test {}',
          contractName: 'Test',
          compilerVersion: '0.8.0',
          optimizationUsed: true,
          runs: 200,
          abi: [{ type: 'function' }],
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

        expect(result.status).toBe('1');
        expect(contractRepository.save).toHaveBeenCalled();
      });

      it('should handle verification without runs', async () => {
        const verificationData = {
          address: '0xdAC17F958D2ee523a2206206994597C13D831ec7',
          sourceCode: 'contract Test {}',
          contractName: 'Test',
          compilerVersion: '0.8.0',
          optimizationUsed: false,
          abi: [],
        };

        contractRepository.findOne.mockResolvedValue(null);
        contractRepository.create.mockReturnValue({
          ...verificationData,
          runs: undefined,
          isVerified: true,
        } as any);
        contractRepository.save.mockResolvedValue({
          id: '1',
          ...verificationData,
          isVerified: true,
        } as any);
        cacheService.del.mockResolvedValue(undefined);

        const result = await service.verifyContract(verificationData as any);

        expect(result.status).toBe('1');
      });
    });
  });
});

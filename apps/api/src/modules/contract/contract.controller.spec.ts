import { Test, TestingModule } from '@nestjs/testing';
import { ContractController } from './contract.controller';
import { ContractService } from './contract.service';
import { ResponseDto } from '@/common/interfaces/api-response.interface';

describe('ContractController', () => {
  let controller: ContractController;
  let service: jest.Mocked<ContractService>;

  beforeEach(async () => {
    const mockContractService = {
      getAbi: jest.fn(),
      getSourceCode: jest.fn(),
      verifyContract: jest.fn(),
    };

    const module: TestingModule = await Test.createTestingModule({
      controllers: [ContractController],
      providers: [
        {
          provide: ContractService,
          useValue: mockContractService,
        },
      ],
    }).compile();

    controller = module.get<ContractController>(ContractController);
    service = module.get(ContractService);
  });

  it('should be defined', () => {
    expect(controller).toBeDefined();
  });

  describe('getAbi', () => {
    it('should return contract ABI', async () => {
      const address = '0x123';
      const mockResponse = ResponseDto.success([]);
      service.getAbi.mockResolvedValue(mockResponse);

      const result = await controller.getAbi(address);

      expect(result).toEqual(mockResponse);
      expect(service.getAbi).toHaveBeenCalledWith(address);
    });
  });

  describe('getSourceCode', () => {
    it('should return contract source code', async () => {
      const address = '0x123';
      const mockResponse = ResponseDto.success([{
        SourceCode: '',
        ABI: '',
        ContractName: '',
        CompilerVersion: '',
        OptimizationUsed: '0',
        Runs: '0',
        ConstructorArguments: '',
        EVMVersion: 'Default',
        Library: '',
        LicenseType: '',
        Proxy: '0',
        Implementation: '',
        SwarmSource: '',
      }]);
      service.getSourceCode.mockResolvedValue(mockResponse);

      const result = await controller.getSourceCode(address);

      expect(result).toEqual(mockResponse);
      expect(service.getSourceCode).toHaveBeenCalledWith(address);
    });
  });

  describe('verifyContract', () => {
    it('should verify contract', async () => {
      const verificationData = {
        address: '0x123',
        sourceCode: 'contract Test {}',
        contractName: 'Test',
        compilerVersion: '0.8.0',
        optimizationUsed: false,
        abi: [],
      };
      const mockResponse = ResponseDto.success({
        message: 'Contract verified successfully',
        address: '0x123',
      });
      service.verifyContract.mockResolvedValue(mockResponse);

      const result = await controller.verifyContract(verificationData);

      expect(result).toEqual(mockResponse);
      expect(service.verifyContract).toHaveBeenCalledWith(verificationData);
    });
  });
});


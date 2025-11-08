import { Test, TestingModule } from '@nestjs/testing';
import { GasController } from './gas.controller';
import { GasService } from './gas.service';
import { ResponseDto } from '@/common/interfaces/api-response.interface';

describe('GasController', () => {
  let controller: GasController;
  let service: jest.Mocked<GasService>;

  beforeEach(async () => {
    const mockGasService = {
      getGasOracle: jest.fn(),
      estimateGas: jest.fn(),
    };

    const module: TestingModule = await Test.createTestingModule({
      controllers: [GasController],
      providers: [
        {
          provide: GasService,
          useValue: mockGasService,
        },
      ],
    }).compile();

    controller = module.get<GasController>(GasController);
    service = module.get(GasService);
  });

  it('should be defined', () => {
    expect(controller).toBeDefined();
  });

  describe('getGasOracle', () => {
    it('should return gas oracle data', async () => {
      const mockResponse = ResponseDto.success({
        LastBlock: '12345',
        SafeGasPrice: '20000000000',
        ProposeGasPrice: '25000000000',
        FastGasPrice: '30000000000',
        suggestBaseFee: '20000000000',
        gasUsedRatio: 0.5,
      });
      service.getGasOracle.mockResolvedValue(mockResponse);

      const result = await controller.getGasOracle();

      expect(result).toEqual(mockResponse);
      expect(service.getGasOracle).toHaveBeenCalled();
    });
  });

  describe('estimateGas', () => {
    it('should estimate gas for transaction', async () => {
      const transaction = {
        to: '0x123',
        from: '0x456',
        value: '1000000000000000000',
      };
      const mockResponse = ResponseDto.success({
        gasEstimate: '21000',
        gasUsed: '21000',
      });
      service.estimateGas.mockResolvedValue(mockResponse);

      const result = await controller.estimateGas(transaction);

      expect(result).toEqual(mockResponse);
      expect(service.estimateGas).toHaveBeenCalledWith(transaction);
    });
  });
});


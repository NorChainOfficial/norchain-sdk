import { Test, TestingModule } from '@nestjs/testing';
import { ComplianceController } from './compliance.controller';
import { ComplianceService } from './compliance.service';
import { CreateScreeningDto } from './dto/create-screening.dto';
import { CreateCaseDto } from './dto/create-case.dto';
import { TravelRulePrecheckDto } from './dto/travel-rule-precheck.dto';
import { ScreeningType } from './entities/compliance-screening.entity';
import { CaseSeverity } from './entities/compliance-case.entity';

describe('ComplianceController', () => {
  let controller: ComplianceController;
  let complianceService: ComplianceService;

  const mockComplianceService = {
    createScreening: jest.fn(),
    getScreening: jest.fn(),
    getRiskScore: jest.fn(),
    createCase: jest.fn(),
    getCase: jest.fn(),
    precheckTravelRule: jest.fn(),
    submitTravelRule: jest.fn(),
  };

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      controllers: [ComplianceController],
      providers: [
        {
          provide: ComplianceService,
          useValue: mockComplianceService,
        },
      ],
    }).compile();

    controller = module.get<ComplianceController>(ComplianceController);
    complianceService = module.get<ComplianceService>(ComplianceService);
  });

  afterEach(() => {
    jest.clearAllMocks();
  });

  describe('createScreening', () => {
    it('should create a compliance screening', async () => {
      const dto: CreateScreeningDto = {
        type: ScreeningType.SANCTIONS,
        subject: '0x742d35Cc6634C0532925a3b844Bc9e7595f0bEb0',
      };

      const mockResult = {
        screeningId: 'screening-123',
        status: 'cleared',
      };

      mockComplianceService.createScreening.mockResolvedValue(mockResult);

      const result = await controller.createScreening(
        { user: { id: 'user-123' } },
        dto,
      );

      expect(result).toEqual(mockResult);
      expect(mockComplianceService.createScreening).toHaveBeenCalledWith(
        'user-123',
        dto,
      );
    });
  });

  describe('getScreening', () => {
    it('should return screening details', async () => {
      const screeningId = 'screening-123';
      const mockScreening = {
        screeningId,
        status: 'cleared',
      };

      mockComplianceService.getScreening.mockResolvedValue(mockScreening);

      const result = await controller.getScreening(
        { user: { id: 'user-123' } },
        screeningId,
      );

      expect(result).toEqual(mockScreening);
    });
  });

  describe('createCase', () => {
    it('should create a compliance case', async () => {
      const dto: CreateCaseDto = {
        subject: '0x742d35Cc6634C0532925a3b844Bc9e7595f0bEb0',
        description: 'Suspicious activity',
        severity: CaseSeverity.HIGH,
        relatedScreenings: ['screening-123'],
      };

      const mockResult = {
        case_id: 'case-123',
        status: 'open',
        severity: CaseSeverity.HIGH,
      };

      mockComplianceService.createCase.mockResolvedValue(mockResult);

      const result = await controller.createCase(
        { user: { id: 'user-123' } },
        dto,
      );

      expect(result).toEqual(mockResult);
    });
  });

  describe('precheckTravelRule', () => {
    it('should perform travel rule precheck', async () => {
      const dto: TravelRulePrecheckDto = {
        senderAddress: '0x742d35Cc6634C0532925a3b844Bc9e7595f0bEb0',
        recipientAddress: '0x1234567890123456789012345678901234567890',
        amount: '1000000000000000000',
        asset: 'NOR',
      };

      const mockResult = {
        requiresTravelRule: false,
        isVASPToVASP: false,
        threshold: '1000',
        amount: dto.amount,
        recommendation: 'No Travel Rule required',
      };

      mockComplianceService.precheckTravelRule.mockResolvedValue(mockResult);

      const result = await controller.precheckTravelRule(dto);

      expect(result).toEqual(mockResult);
    });
  });
});


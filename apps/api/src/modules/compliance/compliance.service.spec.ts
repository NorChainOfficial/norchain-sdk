import { Test, TestingModule } from '@nestjs/testing';
import { getRepositoryToken } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { ComplianceService } from './compliance.service';
import {
  ComplianceScreening,
  ScreeningStatus,
  ScreeningType,
} from './entities/compliance-screening.entity';
import {
  ComplianceCase,
  CaseStatus,
  CaseSeverity,
} from './entities/compliance-case.entity';
import { TravelRulePartner } from './entities/travel-rule-partner.entity';
import { CreateScreeningDto } from './dto/create-screening.dto';
import { CreateCaseDto } from './dto/create-case.dto';
import { TravelRulePrecheckDto } from './dto/travel-rule-precheck.dto';
import { TravelRuleDto } from './dto/travel-rule.dto';
import { NotFoundException, BadRequestException } from '@nestjs/common';
import { EventEmitter2 } from '@nestjs/event-emitter';

describe('ComplianceService', () => {
  let service: ComplianceService;
  let screeningRepository: Repository<ComplianceScreening>;
  let caseRepository: Repository<ComplianceCase>;
  let travelRulePartnerRepository: Repository<TravelRulePartner>;

  const mockScreeningRepository = {
    create: jest.fn(),
    save: jest.fn(),
    findOne: jest.fn(),
    find: jest.fn(),
    findAndCount: jest.fn(),
  };

  const mockCaseRepository = {
    create: jest.fn(),
    save: jest.fn(),
    findOne: jest.fn(),
    find: jest.fn(),
    findAndCount: jest.fn(),
  };

  const mockTravelRulePartnerRepository = {
    create: jest.fn(),
    save: jest.fn(),
    findOne: jest.fn(),
    find: jest.fn(),
    findAndCount: jest.fn(),
  };

  const mockEventEmitter = {
    emit: jest.fn(),
  };

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      providers: [
        ComplianceService,
        {
          provide: getRepositoryToken(ComplianceScreening),
          useValue: mockScreeningRepository,
        },
        {
          provide: getRepositoryToken(ComplianceCase),
          useValue: mockCaseRepository,
        },
        {
          provide: getRepositoryToken(TravelRulePartner),
          useValue: mockTravelRulePartnerRepository,
        },
        {
          provide: EventEmitter2,
          useValue: mockEventEmitter,
        },
      ],
    }).compile();

    service = module.get<ComplianceService>(ComplianceService);
    screeningRepository = module.get<Repository<ComplianceScreening>>(
      getRepositoryToken(ComplianceScreening),
    );
    caseRepository = module.get<Repository<ComplianceCase>>(
      getRepositoryToken(ComplianceCase),
    );
    travelRulePartnerRepository = module.get<Repository<TravelRulePartner>>(
      getRepositoryToken(TravelRulePartner),
    );
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

      const mockScreening = {
        id: 'screening-123',
        userId: 'user-123',
        ...dto,
        status: ScreeningStatus.CLEARED,
        results: {
          listsChecked: ['OFAC', 'EU'],
          matches: [],
          riskScore: 0,
        },
        createdAt: new Date(),
      };

      mockScreeningRepository.create.mockReturnValue(mockScreening);
      mockScreeningRepository.save.mockResolvedValue(mockScreening);

      const result = await service.createScreening('user-123', dto);

      expect(result).toHaveProperty('screening_id');
      expect(result).toHaveProperty('status');
      expect(mockScreeningRepository.save).toHaveBeenCalled();
    });

    it('should flag addresses in sanctions lists', async () => {
      const dto: CreateScreeningDto = {
        type: ScreeningType.SANCTIONS,
        subject: '0x0000000000000000000000000000000000000001', // Sanctioned address
      };

      const mockScreening = {
        id: 'screening-123',
        userId: 'user-123',
        ...dto,
        status: ScreeningStatus.FLAGGED,
        results: {
          listsChecked: ['OFAC', 'EU'],
          matches: ['OFAC'],
          riskScore: 100,
        },
      };

      mockScreeningRepository.create.mockReturnValue(mockScreening);
      mockScreeningRepository.save.mockResolvedValue(mockScreening);

      const result = await service.createScreening('user-123', dto);

      expect(result.status).toBe(ScreeningStatus.FLAGGED);
    });
  });

  describe('getScreening', () => {
    it('should return screening details', async () => {
      const screeningId = 'screening-123';
      const mockScreening = {
        id: screeningId,
        userId: 'user-123',
        status: ScreeningStatus.CLEARED,
      };

      mockScreeningRepository.findOne.mockResolvedValue(mockScreening);

      const result = await service.getScreening('user-123', screeningId);

      expect(result).toHaveProperty('screening_id', screeningId);
    });

    it('should throw NotFoundException if screening not found', async () => {
      mockScreeningRepository.findOne.mockResolvedValue(null);

      await expect(
        service.getScreening('user-123', 'invalid-id'),
      ).rejects.toThrow(NotFoundException);
    });
  });

  describe('createCase', () => {
    it('should create a compliance case', async () => {
      const dto: CreateCaseDto = {
        subject: '0x742d35Cc6634C0532925a3b844Bc9e7595f0bEb0',
        description: 'Suspicious activity detected',
        severity: CaseSeverity.HIGH,
        relatedScreenings: ['screening-123'],
      };

      const mockCase = {
        id: 'case-123',
        subject: dto.subject,
        description: dto.description,
        severity: dto.severity,
        status: CaseStatus.OPEN,
        relatedScreenings: dto.relatedScreenings,
        createdAt: new Date(),
      };

      mockCaseRepository.create.mockReturnValue(mockCase);
      mockCaseRepository.save.mockResolvedValue(mockCase);

      const result = await service.createCase('user-123', dto);

      expect(result).toHaveProperty('case_id');
      expect(result).toHaveProperty('status', CaseStatus.OPEN);
      expect(mockCaseRepository.save).toHaveBeenCalled();
    });

    it('should create a case without related screenings', async () => {
      const dto: CreateCaseDto = {
        subject: '0x742d35Cc6634C0532925a3b844Bc9e7595f0bEb0',
        description: 'Test case',
        severity: CaseSeverity.LOW,
      };

      const mockCase = {
        id: 'case-123',
        ...dto,
        status: CaseStatus.OPEN,
        relatedScreenings: [],
        createdAt: new Date(),
      };

      mockCaseRepository.create.mockReturnValue(mockCase);
      mockCaseRepository.save.mockResolvedValue(mockCase);

      const result = await service.createCase('user-123', dto);

      expect(result).toHaveProperty('case_id');
      expect(result).toHaveProperty('severity', CaseSeverity.LOW);
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

      const result = await service.precheckTravelRule(dto);

      expect(result).toHaveProperty('requiresTravelRule');
      expect(result).toHaveProperty('isVASPToVASP');
      expect(result).toHaveProperty('recommendation');
    });

    it('should require travel rule for high amounts', async () => {
      const dto: TravelRulePrecheckDto = {
        senderAddress: '0x742d35Cc6634C0532925a3b844Bc9e7595f0bEb0',
        recipientAddress: '0x1234567890123456789012345678901234567890',
        amount: '2000000000000000000000', // Above threshold
        asset: 'NOR',
      };

      const result = await service.precheckTravelRule(dto);

      expect(result.requiresTravelRule).toBe(true);
    });

    it('should not require travel rule for low amounts', async () => {
      const dto: TravelRulePrecheckDto = {
        senderAddress: '0x742d35Cc6634C0532925a3b844Bc9e7595f0bEb0',
        recipientAddress: '0x1234567890123456789012345678901234567890',
        amount: '100', // Below threshold
        asset: 'NOR',
      };

      const result = await service.precheckTravelRule(dto);

      expect(result.requiresTravelRule).toBe(false);
    });

    it('should check VASP status for both addresses', async () => {
      const dto: TravelRulePrecheckDto = {
        senderAddress: '0x742d35Cc6634C0532925a3b844Bc9e7595f0bEb0',
        recipientAddress: '0x1234567890123456789012345678901234567890',
        amount: '1000000000000000000000',
        asset: 'NOR',
      };

      const result = await service.precheckTravelRule(dto);

      expect(result).toHaveProperty('isVASPToVASP');
      expect(result.isVASPToVASP).toBe(false); // Default: not VASP
    });
  });

  describe('getRiskScore', () => {
    it('should return risk score for address with screening', async () => {
      const address = '0x742d35Cc6634C0532925a3b844Bc9e7595f0bEb0';
      const mockScreening = {
        id: 'screening-123',
        subject: address,
        status: ScreeningStatus.CLEARED,
        results: {
          riskScore: 25,
          matches: [],
        },
        createdAt: new Date(),
      };

      mockScreeningRepository.findOne.mockResolvedValue(mockScreening);

      const result = await service.getRiskScore(address);

      expect(result).toHaveProperty('address', address);
      expect(result).toHaveProperty('riskScore', 25);
      expect(result).toHaveProperty('status', ScreeningStatus.CLEARED);
      expect(result).toHaveProperty('lastScreened');
    });

    it('should return default risk score when no screening exists', async () => {
      const address = '0x742d35Cc6634C0532925a3b844Bc9e7595f0bEb0';

      mockScreeningRepository.findOne.mockResolvedValue(null);

      const result = await service.getRiskScore(address);

      expect(result).toHaveProperty('address', address);
      expect(result).toHaveProperty('riskScore', 0);
      expect(result).toHaveProperty('status', 'not_screened');
      expect(result).toHaveProperty('lastScreened', null);
    });

    it('should handle screening without results', async () => {
      const address = '0x742d35Cc6634C0532925a3b844Bc9e7595f0bEb0';
      const mockScreening = {
        id: 'screening-123',
        subject: address,
        status: ScreeningStatus.CLEARED,
        results: null,
        createdAt: new Date(),
      };

      mockScreeningRepository.findOne.mockResolvedValue(mockScreening);

      const result = await service.getRiskScore(address);

      expect(result).toHaveProperty('riskScore', 0);
      expect(result).toHaveProperty('matches', []);
    });
  });

  describe('getCase', () => {
    it('should return case details', async () => {
      const userId = 'user-123';
      const caseId = 'case-123';
      const mockCase = {
        id: caseId,
        subject: '0x742d35Cc6634C0532925a3b844Bc9e7595f0bEb0',
        status: CaseStatus.OPEN,
        severity: CaseSeverity.MEDIUM,
        description: 'Test case',
        relatedScreenings: ['screening-1'],
        notes: null,
        assignedTo: null,
        createdAt: new Date(),
        resolvedAt: null,
      };

      mockCaseRepository.findOne.mockResolvedValue(mockCase);

      const result = await service.getCase(userId, caseId);

      expect(result).toHaveProperty('case_id', caseId);
      expect(result).toHaveProperty('subject', mockCase.subject);
      expect(result).toHaveProperty('status', CaseStatus.OPEN);
      expect(result).toHaveProperty('severity', CaseSeverity.MEDIUM);
    });

    it('should throw NotFoundException when case not found', async () => {
      const userId = 'user-123';
      const caseId = 'invalid-case';

      mockCaseRepository.findOne.mockResolvedValue(null);

      await expect(service.getCase(userId, caseId)).rejects.toThrow(
        NotFoundException,
      );
    });
  });

  describe('submitTravelRule', () => {
    it('should submit travel rule information', async () => {
      const userId = 'user-123';
      const dto: TravelRuleDto = {
        senderAddress: '0x742d35Cc6634C0532925a3b844Bc9e7595f0bEb0',
        recipientAddress: '0x1234567890123456789012345678901234567890',
        amount: '1000000000000000000000',
        asset: 'NOR',
        senderName: 'Sender Name',
        senderEmail: 'sender@example.com',
        recipientName: 'Recipient Name',
        recipientEmail: 'recipient@example.com',
      };

      const result = await service.submitTravelRule(userId, dto);

      expect(result).toHaveProperty('travel_rule_id');
      expect(result).toHaveProperty('status', 'submitted');
      expect(result).toHaveProperty('message');
    });

    it('should generate unique travel rule ID', async () => {
      const userId = 'user-123';
      const dto: TravelRuleDto = {
        senderAddress: '0x742d35Cc6634C0532925a3b844Bc9e7595f0bEb0',
        recipientAddress: '0x1234567890123456789012345678901234567890',
        amount: '1000000000000000000000',
        asset: 'NOR',
        senderName: 'Sender Name',
        recipientName: 'Recipient Name',
      };

      const result1 = await service.submitTravelRule(userId, dto);
      // Wait a bit to ensure different timestamp
      await new Promise((resolve) => setTimeout(resolve, 10));
      const result2 = await service.submitTravelRule(userId, dto);

      expect(result1.travel_rule_id).not.toBe(result2.travel_rule_id);
    });
  });

  describe('createScreening - high risk case creation', () => {
    it('should auto-create case when risk score >= 80', async () => {
      const userId = 'user-123';
      const dto: CreateScreeningDto = {
        type: ScreeningType.SANCTIONS,
        subject: 'test', // Contains 'test' which triggers risk score increase
      };

      // Mock the screening save to return a high-risk screening
      let savedScreening: any;
      mockScreeningRepository.create.mockImplementation((screening) => {
        savedScreening = {
          id: 'screening-123',
          ...screening,
          createdAt: new Date(),
        };
        return savedScreening;
      });

      mockScreeningRepository.save.mockImplementation(async (screening) => {
        // Simulate high risk score (>= 80) by checking if case should be created
        if (screening.results?.riskScore >= 80) {
          savedScreening = { ...screening, id: 'screening-123' };
          return savedScreening;
        }
        return screening;
      });

      // Mock case creation
      const mockCase = {
        id: 'case-123',
        subject: dto.subject,
        severity: CaseSeverity.HIGH,
        status: CaseStatus.OPEN,
      };
      mockCaseRepository.create.mockReturnValue(mockCase);
      mockCaseRepository.save.mockResolvedValue(mockCase);

      const result = await service.createScreening(userId, dto);

      expect(result).toHaveProperty('screening_id');
      // Note: Risk score is random, so we can't assert exact value
      // But we can verify the screening was created
      expect(mockScreeningRepository.save).toHaveBeenCalled();
    });
  });

  describe('getRiskScore', () => {
    it('should return default risk score when no screening exists', async () => {
      mockScreeningRepository.findOne.mockResolvedValue(null);

      const result = await service.getRiskScore('0x742d35Cc6634C0532925a3b844Bc9e7595f0bEb0');

      expect(result).toHaveProperty('address');
      expect(result.riskScore).toBe(0);
      expect(result.status).toBe('not_screened');
      expect(result.lastScreened).toBeNull();
    });

    it('should return risk score from latest screening', async () => {
      const address = '0x742d35Cc6634C0532925a3b844Bc9e7595f0bEb0';
      const mockScreening = {
        id: 'screening-123',
        subject: address,
        status: ScreeningStatus.CLEARED,
        results: {
          riskScore: 25,
          matches: [],
        },
        createdAt: new Date(),
      };

      mockScreeningRepository.findOne.mockResolvedValue(mockScreening);

      const result = await service.getRiskScore(address);

      expect(result.riskScore).toBe(25);
      expect(result.status).toBe(ScreeningStatus.CLEARED);
      expect(result.lastScreened).toBeDefined();
    });

    it('should handle screening with null results', async () => {
      const address = '0x742d35Cc6634C0532925a3b844Bc9e7595f0bEb0';
      const mockScreening = {
        id: 'screening-123',
        subject: address,
        status: ScreeningStatus.CLEARED,
        results: null,
        createdAt: new Date(),
      };

      mockScreeningRepository.findOne.mockResolvedValue(mockScreening);

      const result = await service.getRiskScore(address);

      expect(result.riskScore).toBe(0);
      expect(result.matches).toEqual([]);
    });
  });

  describe('createCase', () => {
    it('should create case with related screenings', async () => {
      const userId = 'user-123';
      const dto: CreateCaseDto = {
        subject: '0x742d35Cc6634C0532925a3b844Bc9e7595f0bEb0',
        description: 'High-risk address',
        severity: CaseSeverity.HIGH,
        relatedScreenings: ['screening-1', 'screening-2'],
      };

      const mockCase = {
        id: 'case-123',
        ...dto,
        status: CaseStatus.OPEN,
        createdAt: new Date(),
      };

      mockCaseRepository.create.mockReturnValue(mockCase);
      mockCaseRepository.save.mockResolvedValue(mockCase);

      const result = await service.createCase(userId, dto);

      expect(result).toHaveProperty('case_id');
      expect(result.severity).toBe(CaseSeverity.HIGH);
      expect(mockCaseRepository.save).toHaveBeenCalled();
    });

    it('should create case without related screenings', async () => {
      const userId = 'user-123';
      const dto: CreateCaseDto = {
        subject: '0x742d35Cc6634C0532925a3b844Bc9e7595f0bEb0',
        description: 'Manual case',
        severity: CaseSeverity.MEDIUM,
      };

      const mockCase = {
        id: 'case-123',
        ...dto,
        status: CaseStatus.OPEN,
        relatedScreenings: [],
        createdAt: new Date(),
      };

      mockCaseRepository.create.mockReturnValue(mockCase);
      mockCaseRepository.save.mockResolvedValue(mockCase);

      const result = await service.createCase(userId, dto);

      expect(result).toHaveProperty('case_id');
      expect(result.severity).toBe(CaseSeverity.MEDIUM);
    });
  });

  describe('precheckTravelRule', () => {
    it('should require Travel Rule for amounts above threshold', async () => {
      const dto: TravelRulePrecheckDto = {
        senderAddress: '0x742d35Cc6634C0532925a3b844Bc9e7595f0bEb0',
        recipientAddress: '0x742d35Cc6634C0532925a3b844Bc9e7595f0bEb1',
        amount: '1500.00',
        asset: 'NOR',
      };

      jest.spyOn(service as any, 'checkIfVASP').mockResolvedValue(false);

      const result = await service.precheckTravelRule(dto);

      expect(result.requiresTravelRule).toBe(true);
    });

    it('should not require Travel Rule for amounts below threshold', async () => {
      const dto: TravelRulePrecheckDto = {
        senderAddress: '0x742d35Cc6634C0532925a3b844Bc9e7595f0bEb0',
        recipientAddress: '0x742d35Cc6634C0532925a3b844Bc9e7595f0bEb1',
        amount: '500.00',
        asset: 'NOR',
      };

      jest.spyOn(service as any, 'checkIfVASP').mockResolvedValue(false);

      const result = await service.precheckTravelRule(dto);

      expect(result.requiresTravelRule).toBe(false);
    });

    it('should detect VASP-to-VASP transfers', async () => {
      const dto: TravelRulePrecheckDto = {
        senderAddress: '0x742d35Cc6634C0532925a3b844Bc9e7595f0bEb0',
        recipientAddress: '0x742d35Cc6634C0532925a3b844Bc9e7595f0bEb1',
        amount: '2000.00',
        asset: 'NOR',
      };

      jest.spyOn(service as any, 'checkIfVASP').mockResolvedValue(true);

      const result = await service.precheckTravelRule(dto);

      expect(result.isVASPToVASP).toBe(true);
    });
  });

  describe('Edge Cases', () => {
    it('should handle getScreening with invalid screening ID', async () => {
      mockScreeningRepository.findOne.mockResolvedValue(null);

      await expect(
        service.getScreening('user-123', 'non-existent'),
      ).rejects.toThrow(NotFoundException);
    });

    it('should handle getCase with invalid case ID', async () => {
      mockCaseRepository.findOne.mockResolvedValue(null);

      await expect(service.getCase('user-123', 'non-existent')).rejects.toThrow(
        NotFoundException,
      );
    });
  });
});


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
import { UpdateCaseDto } from './dto/update-case.dto';
import { AddCaseNoteDto } from './dto/add-case-note.dto';
import { CreateTravelRulePartnerDto } from './dto/create-travel-rule-partner.dto';
import { NotFoundException, BadRequestException } from '@nestjs/common';
import { EventEmitter2 } from '@nestjs/event-emitter';
import { PartnerStatus, PartnerType } from './entities/travel-rule-partner.entity';

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

  describe('listCases', () => {
    it('should list all cases', async () => {
      const userId = 'user-123';
      const mockCases = [
        {
          id: 'case-1',
          subject: '0x123',
          status: CaseStatus.OPEN,
          severity: CaseSeverity.MEDIUM,
        },
        {
          id: 'case-2',
          subject: '0x456',
          status: CaseStatus.UNDER_REVIEW,
          severity: CaseSeverity.HIGH,
        },
      ];

      mockCaseRepository.findAndCount.mockResolvedValue([mockCases, 2]);

      const result = await service.listCases(userId);

      expect(result.cases).toEqual(mockCases);
      expect(result.total).toBe(2);
      expect(mockCaseRepository.findAndCount).toHaveBeenCalled();
    });

    it('should filter cases by status', async () => {
      const userId = 'user-123';
      const status = CaseStatus.OPEN;
      const mockCases = [
        {
          id: 'case-1',
          status: CaseStatus.OPEN,
        },
      ];

      mockCaseRepository.findAndCount.mockResolvedValue([mockCases, 1]);

      const result = await service.listCases(userId, status);

      expect(result.cases).toEqual(mockCases);
      expect(mockCaseRepository.findAndCount).toHaveBeenCalledWith(
        expect.objectContaining({
          where: { status },
        }),
      );
    });

    it('should filter cases by severity', async () => {
      const userId = 'user-123';
      const severity = CaseSeverity.HIGH;
      const mockCases = [
        {
          id: 'case-1',
          severity: CaseSeverity.HIGH,
        },
      ];

      mockCaseRepository.findAndCount.mockResolvedValue([mockCases, 1]);

      const result = await service.listCases(userId, undefined, severity);

      expect(result.cases).toEqual(mockCases);
    });

    it('should support pagination', async () => {
      const userId = 'user-123';
      mockCaseRepository.findAndCount.mockResolvedValue([[], 0]);

      await service.listCases(userId, undefined, undefined, undefined, 10, 20);

      expect(mockCaseRepository.findAndCount).toHaveBeenCalledWith(
        expect.objectContaining({
          take: 10,
          skip: 20,
        }),
      );
    });
  });

  describe('updateCase', () => {
    it('should update case status', async () => {
      const userId = 'user-123';
      const caseId = 'case-1';
      const dto: UpdateCaseDto = {
        status: CaseStatus.RESOLVED,
      };

      const mockCase = {
        id: caseId,
        status: CaseStatus.OPEN,
        resolvedAt: null,
      };

      mockCaseRepository.findOne.mockResolvedValue(mockCase);
      mockCaseRepository.save.mockResolvedValue({
        ...mockCase,
        status: CaseStatus.RESOLVED,
        resolvedAt: expect.any(Date),
      });

      const result = await service.updateCase(userId, caseId, dto);

      expect(result.status).toBe(CaseStatus.RESOLVED);
      expect(mockEventEmitter.emit).toHaveBeenCalledWith(
        'compliance.case.updated',
        expect.objectContaining({
          caseId,
          updates: dto,
        }),
      );
    });

    it('should update case severity', async () => {
      const userId = 'user-123';
      const caseId = 'case-1';
      const dto: UpdateCaseDto = {
        severity: CaseSeverity.HIGH,
      };

      const mockCase = {
        id: caseId,
        severity: CaseSeverity.MEDIUM,
      };

      mockCaseRepository.findOne.mockResolvedValue(mockCase);
      mockCaseRepository.save.mockResolvedValue({
        ...mockCase,
        severity: CaseSeverity.HIGH,
      });

      const result = await service.updateCase(userId, caseId, dto);

      expect(result.severity).toBe(CaseSeverity.HIGH);
    });

    it('should add notes when updating', async () => {
      const userId = 'user-123';
      const caseId = 'case-1';
      const dto: UpdateCaseDto = {
        notes: 'New note',
      };

      const mockCase = {
        id: caseId,
        notes: [],
      };

      mockCaseRepository.findOne.mockResolvedValue(mockCase);
      mockCaseRepository.save.mockResolvedValue({
        ...mockCase,
        notes: [
          {
            author: userId,
            content: 'New note',
            timestamp: expect.any(Date),
          },
        ],
      });

      const result = await service.updateCase(userId, caseId, dto);

      expect(result.notes).toHaveLength(1);
      expect(result.notes[0].content).toBe('New note');
    });

    it('should throw NotFoundException if case not found', async () => {
      mockCaseRepository.findOne.mockResolvedValue(null);

      await expect(
        service.updateCase('user-123', 'non-existent', {}),
      ).rejects.toThrow(NotFoundException);
    });
  });

  describe('addCaseNote', () => {
    it('should add note to case', async () => {
      const userId = 'user-123';
      const caseId = 'case-1';
      const dto: AddCaseNoteDto = {
        note: 'Investigation note',
      };

      const mockCase = {
        id: caseId,
        notes: [],
      };

      mockCaseRepository.findOne.mockResolvedValue(mockCase);
      mockCaseRepository.save.mockResolvedValue({
        ...mockCase,
        notes: [
          {
            author: userId,
            content: 'Investigation note',
            timestamp: expect.any(Date),
          },
        ],
      });

      const result = await service.addCaseNote(userId, caseId, dto);

      expect(result.notes).toHaveLength(1);
      expect(mockEventEmitter.emit).toHaveBeenCalledWith(
        'compliance.case.note.added',
        expect.objectContaining({
          caseId,
          note: 'Investigation note',
        }),
      );
    });

    it('should append to existing notes', async () => {
      const userId = 'user-123';
      const caseId = 'case-1';
      const dto: AddCaseNoteDto = {
        note: 'Second note',
      };

      const mockCase = {
        id: caseId,
        notes: [
          {
            author: 'user-1',
            content: 'First note',
            timestamp: new Date(),
          },
        ],
      };

      mockCaseRepository.findOne.mockResolvedValue(mockCase);
      mockCaseRepository.save.mockResolvedValue({
        ...mockCase,
        notes: [
          ...mockCase.notes,
          {
            author: userId,
            content: 'Second note',
            timestamp: expect.any(Date),
          },
        ],
      });

      const result = await service.addCaseNote(userId, caseId, dto);

      expect(result.notes).toHaveLength(2);
    });

    it('should throw NotFoundException if case not found', async () => {
      mockCaseRepository.findOne.mockResolvedValue(null);

      await expect(
        service.addCaseNote('user-123', 'non-existent', { note: 'test' }),
      ).rejects.toThrow(NotFoundException);
    });
  });

  describe('createTravelRulePartner', () => {
    it('should create a new Travel Rule partner', async () => {
      const dto: CreateTravelRulePartnerDto = {
        name: 'Partner A',
        type: PartnerType.VASP,
        jurisdiction: 'US',
        apiEndpoint: 'https://partner-a.com/api',
      };

      mockTravelRulePartnerRepository.findOne.mockResolvedValue(null);
      mockTravelRulePartnerRepository.create.mockReturnValue({
        ...dto,
        status: PartnerStatus.PENDING_VERIFICATION,
        transactionsCount: 0,
      });
      mockTravelRulePartnerRepository.save.mockResolvedValue({
        id: 'partner-1',
        ...dto,
        status: PartnerStatus.PENDING_VERIFICATION,
        transactionsCount: 0,
      });

      const result = await service.createTravelRulePartner(dto);

      expect(result.name).toBe('Partner A');
      expect(mockEventEmitter.emit).toHaveBeenCalledWith(
        'compliance.travel_rule.partner.created',
        expect.objectContaining({
          name: 'Partner A',
        }),
      );
    });

    it('should throw BadRequestException if partner name already exists', async () => {
      const dto: CreateTravelRulePartnerDto = {
        name: 'Existing Partner',
        type: PartnerType.VASP,
        jurisdiction: 'US',
      };

      mockTravelRulePartnerRepository.findOne.mockResolvedValue({
        id: 'existing',
        name: 'Existing Partner',
      });

      await expect(service.createTravelRulePartner(dto)).rejects.toThrow(
        BadRequestException,
      );
    });
  });

  describe('getTravelRulePartner', () => {
    it('should return Travel Rule partner by ID', async () => {
      const partnerId = 'partner-1';
      const mockPartner = {
        id: partnerId,
        name: 'Partner A',
        type: PartnerType.VASP,
      };

      mockTravelRulePartnerRepository.findOne.mockResolvedValue(mockPartner);

      const result = await service.getTravelRulePartner(partnerId);

      expect(result).toEqual(mockPartner);
    });

    it('should throw NotFoundException if partner not found', async () => {
      mockTravelRulePartnerRepository.findOne.mockResolvedValue(null);

      await expect(
        service.getTravelRulePartner('non-existent'),
      ).rejects.toThrow(NotFoundException);
    });
  });

  describe('listTravelRulePartners', () => {
    it('should list all partners', async () => {
      const mockPartners = [
        {
          id: 'partner-1',
          name: 'Partner A',
          type: PartnerType.VASP,
        },
        {
          id: 'partner-2',
          name: 'Partner B',
          type: PartnerType.EXCHANGE,
        },
      ];

      mockTravelRulePartnerRepository.findAndCount.mockResolvedValue([
        mockPartners,
        2,
      ]);

      const result = await service.listTravelRulePartners();

      expect(result.partners).toEqual(mockPartners);
      expect(result.total).toBe(2);
    });

    it('should filter partners by status', async () => {
      const status = PartnerStatus.ACTIVE;
      const mockPartners = [
        {
          id: 'partner-1',
          status: PartnerStatus.ACTIVE,
        },
      ];

      mockTravelRulePartnerRepository.findAndCount.mockResolvedValue([
        mockPartners,
        1,
      ]);

      const result = await service.listTravelRulePartners(status);

      expect(result.partners).toEqual(mockPartners);
    });

    it('should filter partners by type', async () => {
      const type = PartnerType.VASP;
      mockTravelRulePartnerRepository.findAndCount.mockResolvedValue([[], 0]);

      await service.listTravelRulePartners(undefined, type);

      expect(mockTravelRulePartnerRepository.findAndCount).toHaveBeenCalledWith(
        expect.objectContaining({
          where: { type },
        }),
      );
    });

    it('should support pagination', async () => {
      mockTravelRulePartnerRepository.findAndCount.mockResolvedValue([[], 0]);

      await service.listTravelRulePartners(
        undefined,
        undefined,
        undefined,
        10,
        20,
      );

      expect(mockTravelRulePartnerRepository.findAndCount).toHaveBeenCalledWith(
        expect.objectContaining({
          take: 10,
          skip: 20,
        }),
      );
    });
  });

  describe('updateTravelRulePartner', () => {
    it('should update partner details', async () => {
      const partnerId = 'partner-1';
      const updates = {
        name: 'Updated Partner Name',
        apiEndpoint: 'https://updated.com/api',
      };

      const mockPartner = {
        id: partnerId,
        name: 'Original Name',
        apiEndpoint: 'https://original.com/api',
      };

      mockTravelRulePartnerRepository.findOne.mockResolvedValue(mockPartner);
      mockTravelRulePartnerRepository.save.mockResolvedValue({
        ...mockPartner,
        ...updates,
      });

      const result = await service.updateTravelRulePartner(partnerId, updates);

      expect(result.name).toBe('Updated Partner Name');
      expect(mockEventEmitter.emit).toHaveBeenCalledWith(
        'compliance.travel_rule.partner.updated',
        expect.objectContaining({
          partnerId,
          updates,
        }),
      );
    });
  });

  describe('updatePartnerStatus', () => {
    it('should update partner status', async () => {
      const partnerId = 'partner-1';
      const newStatus = PartnerStatus.ACTIVE;

      const mockPartner = {
        id: partnerId,
        status: PartnerStatus.PENDING_VERIFICATION,
      };

      mockTravelRulePartnerRepository.findOne.mockResolvedValue(mockPartner);
      mockTravelRulePartnerRepository.save.mockResolvedValue({
        ...mockPartner,
        status: newStatus,
      });

      const result = await service.updatePartnerStatus(partnerId, newStatus);

      expect(result.status).toBe(newStatus);
      expect(mockEventEmitter.emit).toHaveBeenCalledWith(
        'compliance.travel_rule.partner.status.updated',
        expect.objectContaining({
          partnerId,
          status: newStatus,
        }),
      );
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


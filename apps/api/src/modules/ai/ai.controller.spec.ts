import { Test, TestingModule } from '@nestjs/testing';
import { AIController } from './ai.controller';
import { AIService } from './ai.service';
import { AnalyzeTransactionDto } from './dto/analyze-transaction.dto';
import { AuditContractDto } from './dto/audit-contract.dto';
import { ChatDto } from './dto/chat.dto';
import { OptimizePortfolioDto } from './dto/optimize-portfolio.dto';

describe('AIController', () => {
  let controller: AIController;
  let service: jest.Mocked<AIService>;

  beforeEach(async () => {
    const mockAIService = {
      analyzeTransaction: jest.fn(),
      auditContract: jest.fn(),
      predictGasPrice: jest.fn(),
      detectAnomalies: jest.fn(),
      optimizePortfolio: jest.fn(),
      chat: jest.fn(),
    };

    const module: TestingModule = await Test.createTestingModule({
      controllers: [AIController],
      providers: [
        {
          provide: AIService,
          useValue: mockAIService,
        },
      ],
    }).compile();

    controller = module.get<AIController>(AIController);
    service = module.get(AIService);
  });

  it('should be defined', () => {
    expect(controller).toBeDefined();
  });

  describe('analyzeTransaction', () => {
    it('should analyze transaction successfully', async () => {
      const dto: AnalyzeTransactionDto = { txHash: '0x123...' };
      const mockResult = {
        summary: 'Test transaction',
        riskLevel: 'low' as const,
        confidence: 80,
        insights: [],
        recommendations: [],
        patterns: [],
        anomalies: [],
      };

      service.analyzeTransaction.mockResolvedValue(mockResult);

      const result = await controller.analyzeTransaction(dto);

      expect(result).toEqual(mockResult);
      expect(service.analyzeTransaction).toHaveBeenCalledWith(dto.txHash);
    });
  });

  describe('auditContract', () => {
    it('should audit contract successfully', async () => {
      const dto: AuditContractDto = { contractAddress: '0xabc...' };
      const mockResult = {
        securityScore: 85,
        vulnerabilities: [],
        recommendations: [],
        bestPractices: [],
        riskLevel: 'low' as const,
      };

      service.auditContract.mockResolvedValue(mockResult);

      const result = await controller.auditContract(dto);

      expect(result).toEqual(mockResult);
      expect(service.auditContract).toHaveBeenCalledWith(dto.contractAddress);
    });
  });

  describe('predictGasPrice', () => {
    it('should predict gas price successfully', async () => {
      const mockResult = {
        predictedPrice: '0x3b9aca00',
        confidence: 65,
        trend: 'increasing' as const,
        recommendation: 'Wait',
        historicalData: [],
      };

      service.predictGasPrice.mockResolvedValue(mockResult);

      const result = await controller.predictGasPrice();

      expect(result).toEqual(mockResult);
      expect(service.predictGasPrice).toHaveBeenCalled();
    });
  });

  describe('detectAnomalies', () => {
    it('should detect anomalies successfully', async () => {
      const address = '0x742d35Cc6634C0532925a3b844Bc9e7595f0bEb';
      const days = 7;
      const mockResult = {
        anomalies: [],
        riskScore: 10,
        recommendations: [],
      };

      service.detectAnomalies.mockResolvedValue(mockResult);

      const result = await controller.detectAnomalies(address, days);

      expect(result).toEqual(mockResult);
      expect(service.detectAnomalies).toHaveBeenCalledWith(address, days);
    });

    it('should use default days value', async () => {
      const address = '0x742d35Cc6634C0532925a3b844Bc9e7595f0bEb';
      const mockResult = {
        anomalies: [],
        riskScore: 10,
        recommendations: [],
      };

      service.detectAnomalies.mockResolvedValue(mockResult);

      await controller.detectAnomalies(address);

      expect(service.detectAnomalies).toHaveBeenCalledWith(address, 7);
    });
  });

  describe('optimizePortfolio', () => {
    it('should optimize portfolio successfully', async () => {
      const dto: OptimizePortfolioDto = { address: '0x742d35Cc6634C0532925a3b844Bc9e7595f0bEb' };
      const mockResult = {
        currentPortfolio: { address: dto.address, tokens: [], totalValue: 0 },
        recommendations: [],
        optimizedAllocation: {},
        expectedReturn: 0.08,
      };

      service.optimizePortfolio.mockResolvedValue(mockResult);

      const result = await controller.optimizePortfolio(dto);

      expect(result).toEqual(mockResult);
      expect(service.optimizePortfolio).toHaveBeenCalledWith(dto.address);
    });
  });

  describe('chat', () => {
    it('should answer chat question successfully', async () => {
      const dto: ChatDto = { question: 'What is gas?' };
      const mockResult = {
        answer: 'Gas is the fee paid for transactions',
        confidence: 80,
      };

      service.chat.mockResolvedValue(mockResult);

      const result = await controller.chat(dto);

      expect(result).toEqual(mockResult);
      expect(service.chat).toHaveBeenCalledWith(dto.question, dto.context);
    });

    it('should handle chat with context', async () => {
      const dto: ChatDto = {
        question: 'What is this transaction?',
        context: { txHash: '0x123...' },
      };
      const mockResult = {
        answer: 'This is a transaction',
        confidence: 85,
      };

      service.chat.mockResolvedValue(mockResult);

      const result = await controller.chat(dto);

      expect(result).toEqual(mockResult);
      expect(service.chat).toHaveBeenCalledWith(dto.question, dto.context);
    });
  });
});


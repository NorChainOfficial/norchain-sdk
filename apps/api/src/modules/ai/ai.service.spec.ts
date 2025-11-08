import { Test, TestingModule } from '@nestjs/testing';
import { AIService } from './ai.service';
import { TransactionAnalysisService } from './services/transaction-analysis.service';
import { ContractAuditService } from './services/contract-audit.service';
import { GasPredictionService } from './services/gas-prediction.service';
import { AnomalyDetectionService } from './services/anomaly-detection.service';
import { PortfolioOptimizationService } from './services/portfolio-optimization.service';
import { ChatbotService } from './services/chatbot.service';
import { ConfigService } from '@nestjs/config';

describe('AIService', () => {
  let service: AIService;
  let transactionAnalysis: jest.Mocked<TransactionAnalysisService>;
  let contractAudit: jest.Mocked<ContractAuditService>;
  let gasPrediction: jest.Mocked<GasPredictionService>;
  let anomalyDetection: jest.Mocked<AnomalyDetectionService>;
  let portfolioOptimization: jest.Mocked<PortfolioOptimizationService>;
  let chatbot: jest.Mocked<ChatbotService>;

  beforeEach(async () => {
    const mockTransactionAnalysis = {
      analyze: jest.fn(),
    };
    const mockContractAudit = {
      audit: jest.fn(),
    };
    const mockGasPrediction = {
      predict: jest.fn(),
    };
    const mockAnomalyDetection = {
      detect: jest.fn(),
    };
    const mockPortfolioOptimization = {
      optimize: jest.fn(),
    };
    const mockChatbot = {
      answer: jest.fn(),
    };
    const mockConfigService = {
      get: jest.fn(),
    };

    const module: TestingModule = await Test.createTestingModule({
      providers: [
        AIService,
        {
          provide: TransactionAnalysisService,
          useValue: mockTransactionAnalysis,
        },
        {
          provide: ContractAuditService,
          useValue: mockContractAudit,
        },
        {
          provide: GasPredictionService,
          useValue: mockGasPrediction,
        },
        {
          provide: AnomalyDetectionService,
          useValue: mockAnomalyDetection,
        },
        {
          provide: PortfolioOptimizationService,
          useValue: mockPortfolioOptimization,
        },
        {
          provide: ChatbotService,
          useValue: mockChatbot,
        },
        {
          provide: ConfigService,
          useValue: mockConfigService,
        },
      ],
    }).compile();

    service = module.get<AIService>(AIService);
    transactionAnalysis = module.get(TransactionAnalysisService);
    contractAudit = module.get(ContractAuditService);
    gasPrediction = module.get(GasPredictionService);
    anomalyDetection = module.get(AnomalyDetectionService);
    portfolioOptimization = module.get(PortfolioOptimizationService);
    chatbot = module.get(ChatbotService);
  });

  it('should be defined', () => {
    expect(service).toBeDefined();
  });

  describe('analyzeTransaction', () => {
    it('should call transaction analysis service', async () => {
      const txHash = '0x123...';
      const mockResult = {
        summary: 'Test',
        riskLevel: 'low' as const,
        confidence: 80,
        insights: [],
        recommendations: [],
        patterns: [],
        anomalies: [],
      };

      transactionAnalysis.analyze.mockResolvedValue(mockResult);

      const result = await service.analyzeTransaction(txHash);

      expect(result).toEqual(mockResult);
      expect(transactionAnalysis.analyze).toHaveBeenCalledWith(txHash);
    });
  });

  describe('auditContract', () => {
    it('should call contract audit service', async () => {
      const contractAddress = '0xabc...';
      const mockResult = {
        securityScore: 85,
        vulnerabilities: [],
        recommendations: [],
        bestPractices: [],
        riskLevel: 'low' as const,
      };

      contractAudit.audit.mockResolvedValue(mockResult);

      const result = await service.auditContract(contractAddress);

      expect(result).toEqual(mockResult);
      expect(contractAudit.audit).toHaveBeenCalledWith(contractAddress);
    });
  });

  describe('predictGasPrice', () => {
    it('should call gas prediction service', async () => {
      const mockResult = {
        predictedPrice: '0x3b9aca00',
        confidence: 65,
        trend: 'increasing' as const,
        recommendation: 'Wait',
        historicalData: [],
      };

      gasPrediction.predict.mockResolvedValue(mockResult);

      const result = await service.predictGasPrice();

      expect(result).toEqual(mockResult);
      expect(gasPrediction.predict).toHaveBeenCalled();
    });
  });

  describe('detectAnomalies', () => {
    it('should call anomaly detection service with default days', async () => {
      const address = '0x742d35Cc6634C0532925a3b844Bc9e7595f0bEb';
      const mockResult = {
        anomalies: [],
        riskScore: 10,
        recommendations: [],
      };

      anomalyDetection.detect.mockResolvedValue(mockResult);

      const result = await service.detectAnomalies(address);

      expect(result).toEqual(mockResult);
      expect(anomalyDetection.detect).toHaveBeenCalledWith(address, 7);
    });

    it('should call anomaly detection service with custom days', async () => {
      const address = '0x742d35Cc6634C0532925a3b844Bc9e7595f0bEb';
      const days = 14;
      const mockResult = {
        anomalies: [],
        riskScore: 10,
        recommendations: [],
      };

      anomalyDetection.detect.mockResolvedValue(mockResult);

      const result = await service.detectAnomalies(address, days);

      expect(result).toEqual(mockResult);
      expect(anomalyDetection.detect).toHaveBeenCalledWith(address, days);
    });
  });

  describe('optimizePortfolio', () => {
    it('should call portfolio optimization service', async () => {
      const address = '0x742d35Cc6634C0532925a3b844Bc9e7595f0bEb';
      const mockResult = {
        currentPortfolio: { address, tokens: [], totalValue: 0 },
        recommendations: [],
        optimizedAllocation: {},
        expectedReturn: 0.08,
      };

      portfolioOptimization.optimize.mockResolvedValue(mockResult);

      const result = await service.optimizePortfolio(address);

      expect(result).toEqual(mockResult);
      expect(portfolioOptimization.optimize).toHaveBeenCalledWith(address);
    });
  });

  describe('chat', () => {
    it('should call chatbot service', async () => {
      const question = 'What is gas?';
      const mockResult = {
        answer: 'Gas is the fee',
        confidence: 80,
      };

      chatbot.answer.mockResolvedValue(mockResult);

      const result = await service.chat(question);

      expect(result).toEqual(mockResult);
      expect(chatbot.answer).toHaveBeenCalledWith(question, undefined);
    });

    it('should call chatbot service with context', async () => {
      const question = 'What is this transaction?';
      const context = { txHash: '0x123...' };
      const mockResult = {
        answer: 'This is a transaction',
        confidence: 85,
      };

      chatbot.answer.mockResolvedValue(mockResult);

      const result = await service.chat(question, context);

      expect(result).toEqual(mockResult);
      expect(chatbot.answer).toHaveBeenCalledWith(question, context);
    });
  });
});


/**
 * AI Service Unit Tests
 */

import { Test, TestingModule } from '@nestjs/testing';
import { AIService } from '../../src/modules/ai/ai.service';
import { TransactionAnalysisService } from '../../src/modules/ai/services/transaction-analysis.service';
import { ContractAuditService } from '../../src/modules/ai/services/contract-audit.service';
import { GasPredictionService } from '../../src/modules/ai/services/gas-prediction.service';
import { AnomalyDetectionService } from '../../src/modules/ai/services/anomaly-detection.service';
import { PortfolioOptimizationService } from '../../src/modules/ai/services/portfolio-optimization.service';
import { ChatbotService } from '../../src/modules/ai/services/chatbot.service';

describe('AIService', () => {
  let service: AIService;
  let transactionAnalysis: TransactionAnalysisService;
  let contractAudit: ContractAuditService;
  let gasPrediction: GasPredictionService;
  let anomalyDetection: AnomalyDetectionService;
  let portfolioOptimization: PortfolioOptimizationService;
  let chatbot: ChatbotService;

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      providers: [
        AIService,
        {
          provide: TransactionAnalysisService,
          useValue: {
            analyze: jest.fn(),
          },
        },
        {
          provide: ContractAuditService,
          useValue: {
            audit: jest.fn(),
          },
        },
        {
          provide: GasPredictionService,
          useValue: {
            predict: jest.fn(),
          },
        },
        {
          provide: AnomalyDetectionService,
          useValue: {
            detect: jest.fn(),
          },
        },
        {
          provide: PortfolioOptimizationService,
          useValue: {
            optimize: jest.fn(),
          },
        },
        {
          provide: ChatbotService,
          useValue: {
            answer: jest.fn(),
          },
        },
        {
          provide: 'ConfigService',
          useValue: {
            get: jest.fn(),
          },
        },
      ],
    }).compile();

    service = module.get<AIService>(AIService);
    transactionAnalysis = module.get<TransactionAnalysisService>(TransactionAnalysisService);
    contractAudit = module.get<ContractAuditService>(ContractAuditService);
    gasPrediction = module.get<GasPredictionService>(GasPredictionService);
    anomalyDetection = module.get<AnomalyDetectionService>(AnomalyDetectionService);
    portfolioOptimization = module.get<PortfolioOptimizationService>(PortfolioOptimizationService);
    chatbot = module.get<ChatbotService>(ChatbotService);
  });

  it('should be defined', () => {
    expect(service).toBeDefined();
  });

  it('should analyze transaction', async () => {
    const mockResult = {
      summary: 'Test transaction',
      riskLevel: 'low',
      confidence: 80,
      insights: [],
      recommendations: [],
      patterns: [],
      anomalies: [],
    };

    jest.spyOn(transactionAnalysis, 'analyze').mockResolvedValue(mockResult);

    const result = await service.analyzeTransaction('0x123...');
    expect(result).toEqual(mockResult);
    expect(transactionAnalysis.analyze).toHaveBeenCalledWith('0x123...');
  });

  it('should audit contract', async () => {
    const mockResult = {
      securityScore: 85,
      vulnerabilities: [],
      recommendations: [],
      bestPractices: [],
      riskLevel: 'low',
    };

    jest.spyOn(contractAudit, 'audit').mockResolvedValue(mockResult);

    const result = await service.auditContract('0xabc...');
    expect(result).toEqual(mockResult);
    expect(contractAudit.audit).toHaveBeenCalledWith('0xabc...');
  });

  it('should predict gas price', async () => {
    const mockResult = {
      predictedPrice: '0x3b9aca00',
      confidence: 65,
      trend: 'increasing',
      recommendation: 'Wait',
      historicalData: [],
    };

    jest.spyOn(gasPrediction, 'predict').mockResolvedValue(mockResult);

    const result = await service.predictGasPrice();
    expect(result).toEqual(mockResult);
  });

  it('should detect anomalies', async () => {
    const mockResult = {
      anomalies: [],
      riskScore: 10,
      recommendations: [],
    };

    jest.spyOn(anomalyDetection, 'detect').mockResolvedValue(mockResult);

    const result = await service.detectAnomalies('0x...', 7);
    expect(result).toEqual(mockResult);
    expect(anomalyDetection.detect).toHaveBeenCalledWith('0x...', 7);
  });

  it('should optimize portfolio', async () => {
    const mockResult = {
      currentPortfolio: { address: '0x...', tokens: [], totalValue: 0 },
      recommendations: [],
      optimizedAllocation: {},
      expectedReturn: 0.08,
    };

    jest.spyOn(portfolioOptimization, 'optimize').mockResolvedValue(mockResult);

    const result = await service.optimizePortfolio('0x...');
    expect(result).toEqual(mockResult);
  });

  it('should answer chat questions', async () => {
    const mockResult = {
      answer: 'Test answer',
      confidence: 80,
    };

    jest.spyOn(chatbot, 'answer').mockResolvedValue(mockResult);

    const result = await service.chat('What is gas?');
    expect(result).toEqual(mockResult);
    expect(chatbot.answer).toHaveBeenCalledWith('What is gas?', undefined);
  });
});


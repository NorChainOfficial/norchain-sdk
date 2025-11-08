import { Injectable, Logger } from '@nestjs/common';
import { ConfigService } from '@nestjs/config';
import { TransactionAnalysisService } from './services/transaction-analysis.service';
import { ContractAuditService } from './services/contract-audit.service';
import { GasPredictionService } from './services/gas-prediction.service';
import { AnomalyDetectionService } from './services/anomaly-detection.service';
import { PortfolioOptimizationService } from './services/portfolio-optimization.service';
import { ChatbotService } from './services/chatbot.service';

@Injectable()
export class AIService {
  private readonly logger = new Logger(AIService.name);

  constructor(
    private readonly transactionAnalysis: TransactionAnalysisService,
    private readonly contractAudit: ContractAuditService,
    private readonly gasPrediction: GasPredictionService,
    private readonly anomalyDetection: AnomalyDetectionService,
    private readonly portfolioOptimization: PortfolioOptimizationService,
    private readonly chatbot: ChatbotService,
    private readonly configService: ConfigService,
  ) {}

  async analyzeTransaction(txHash: string) {
    return this.transactionAnalysis.analyze(txHash);
  }

  async auditContract(contractAddress: string) {
    return this.contractAudit.audit(contractAddress);
  }

  async predictGasPrice() {
    return this.gasPrediction.predict();
  }

  async detectAnomalies(address: string, days: number = 7) {
    return this.anomalyDetection.detect(address, days);
  }

  async optimizePortfolio(address: string) {
    return this.portfolioOptimization.optimize(address);
  }

  async chat(question: string, context?: any) {
    return this.chatbot.answer(question, context);
  }
}


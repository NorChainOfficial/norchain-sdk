import { Module } from '@nestjs/common';
import { HttpModule } from '@nestjs/axios';
import { ConfigModule } from '@nestjs/config';
import { AIController } from './ai.controller';
import { AIService } from './ai.service';
import { TransactionAnalysisService } from './services/transaction-analysis.service';
import { ContractAuditService } from './services/contract-audit.service';
import { GasPredictionService } from './services/gas-prediction.service';
import { AnomalyDetectionService } from './services/anomaly-detection.service';
import { PortfolioOptimizationService } from './services/portfolio-optimization.service';
import { ChatbotService } from './services/chatbot.service';
import { ProxyModule } from '../proxy/proxy.module';
import { TransactionModule } from '../transaction/transaction.module';
import { TokenModule } from '../token/token.module';

@Module({
  imports: [
    HttpModule,
    ConfigModule,
    ProxyModule,
    TransactionModule,
    TokenModule,
  ],
  controllers: [AIController],
  providers: [
    AIService,
    TransactionAnalysisService,
    ContractAuditService,
    GasPredictionService,
    AnomalyDetectionService,
    PortfolioOptimizationService,
    ChatbotService,
  ],
  exports: [AIService],
})
export class AIModule {}

import { Controller, Get, Post, Body, Query, Param } from '@nestjs/common';
import {
  ApiTags,
  ApiOperation,
  ApiResponse,
  ApiBearerAuth,
} from '@nestjs/swagger';
import { AIService } from './ai.service';
import { Public } from '@/common/decorators/public.decorator';
import { AnalyzeTransactionDto } from './dto/analyze-transaction.dto';
import { AuditContractDto } from './dto/audit-contract.dto';
import { ChatDto } from './dto/chat.dto';
import { OptimizePortfolioDto } from './dto/optimize-portfolio.dto';

@ApiTags('AI')
@Controller('ai')
export class AIController {
  constructor(private readonly aiService: AIService) {}

  @Public()
  @Post('analyze-transaction')
  @ApiOperation({ summary: 'AI-powered transaction analysis' })
  @ApiResponse({
    status: 200,
    description: 'Transaction analyzed successfully',
  })
  async analyzeTransaction(@Body() dto: AnalyzeTransactionDto) {
    return this.aiService.analyzeTransaction(dto.txHash);
  }

  @Public()
  @Post('audit-contract')
  @ApiOperation({ summary: 'AI-powered smart contract security audit' })
  @ApiResponse({ status: 200, description: 'Contract audited successfully' })
  async auditContract(@Body() dto: AuditContractDto) {
    return this.aiService.auditContract(dto.contractAddress);
  }

  @Public()
  @Get('predict-gas')
  @ApiOperation({ summary: 'AI-powered gas price prediction' })
  @ApiResponse({ status: 200, description: 'Gas price predicted successfully' })
  async predictGasPrice() {
    return this.aiService.predictGasPrice();
  }

  @Public()
  @Get('detect-anomalies')
  @ApiOperation({ summary: 'AI-powered anomaly detection for address' })
  @ApiResponse({ status: 200, description: 'Anomalies detected successfully' })
  async detectAnomalies(
    @Query('address') address: string,
    @Query('days') days: number = 7,
  ) {
    return this.aiService.detectAnomalies(address, days);
  }

  @Public()
  @Post('optimize-portfolio')
  @ApiOperation({ summary: 'AI-powered portfolio optimization' })
  @ApiResponse({ status: 200, description: 'Portfolio optimized successfully' })
  async optimizePortfolio(@Body() dto: OptimizePortfolioDto) {
    return this.aiService.optimizePortfolio(dto.address);
  }

  @Public()
  @Post('chat')
  @ApiOperation({ summary: 'AI chatbot assistant for blockchain questions' })
  @ApiResponse({
    status: 200,
    description: 'Chat response generated successfully',
  })
  async chat(@Body() dto: ChatDto) {
    return this.aiService.chat(dto.question, dto.context);
  }
}

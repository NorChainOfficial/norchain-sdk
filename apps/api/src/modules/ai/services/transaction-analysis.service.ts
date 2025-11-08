import { Injectable, Logger } from '@nestjs/common';
import { HttpService } from '@nestjs/axios';
import { ConfigService } from '@nestjs/config';
import { firstValueFrom } from 'rxjs';
import { AxiosResponse } from 'axios';
import { ProxyService } from '../../proxy/proxy.service';

export interface TransactionAnalysis {
  summary: string;
  riskLevel: 'low' | 'medium' | 'high' | 'critical';
  confidence: number;
  insights: string[];
  recommendations: string[];
  patterns: string[];
  anomalies: string[];
  gasAnalysis?: {
    used: string;
    price: string;
    efficiency: 'efficient' | 'moderate' | 'inefficient';
  };
}

@Injectable()
export class TransactionAnalysisService {
  private readonly logger = new Logger(TransactionAnalysisService.name);
  private readonly aiApiKey: string;
  private readonly aiApiUrl: string;

  constructor(
    private readonly httpService: HttpService,
    private readonly configService: ConfigService,
    private readonly proxyService: ProxyService,
  ) {
    this.aiApiKey = this.configService.get('ANTHROPIC_API_KEY', '');
    this.aiApiUrl = this.configService.get(
      'ANTHROPIC_API_URL',
      'https://api.anthropic.com/v1/messages',
    );
  }

  async analyze(txHash: string): Promise<TransactionAnalysis> {
    try {
      // Get transaction data
      const txDataResult = await this.proxyService.eth_getTransactionByHash(txHash);
      const receiptResult = await this.proxyService.eth_getTransactionReceipt(txHash);
      
      const txData = txDataResult.status === '1' ? txDataResult.result : null;
      const receipt = receiptResult.status === '1' ? receiptResult.result : null;

      // Build context
      const context = {
        hash: txHash,
        from: txData.from,
        to: txData.to,
        value: txData.value,
        gas: txData.gas,
        gasPrice: txData.gasPrice,
        gasUsed: receipt?.gasUsed,
        status: receipt?.status,
        logs: receipt?.logs || [],
      };

      // AI analysis
      if (this.aiApiKey) {
        return await this.analyzeWithAI(context);
      }

      // Fallback analysis
      return this.analyzeFallback(context);
    } catch (error) {
      this.logger.error(`Error analyzing transaction ${txHash}:`, error);
      throw error;
    }
  }

  private async analyzeWithAI(context: any): Promise<TransactionAnalysis> {
    const prompt = `Analyze this blockchain transaction:
Hash: ${context.hash}
From: ${context.from}
To: ${context.to}
Value: ${context.value}
Gas Used: ${context.gasUsed}
Status: ${context.status}

Provide comprehensive analysis including:
1. Transaction summary in simple terms
2. Risk assessment (low/medium/high/critical)
3. Key insights
4. Recommendations
5. Pattern recognition
6. Anomalies or concerns

Return JSON with: summary, riskLevel, confidence (0-100), insights[], recommendations[], patterns[], anomalies[]`;

    try {
      const response: AxiosResponse<any> = await firstValueFrom(
        this.httpService.post(
          this.aiApiUrl,
          {
            model: 'claude-3-5-sonnet-20241022',
            max_tokens: 2000,
            messages: [{ role: 'user', content: prompt }],
          },
          {
            headers: {
              'x-api-key': this.aiApiKey,
              'anthropic-version': '2023-06-01',
              'Content-Type': 'application/json',
            },
          },
        ),
      );

      const content = response.data?.content?.[0]?.text || '';
      const jsonMatch = content.match(/\{[\s\S]*\}/);

      if (jsonMatch) {
        const aiResult = JSON.parse(jsonMatch[0]);
        return {
          ...aiResult,
          gasAnalysis: this.analyzeGas(context),
        };
      }
    } catch (error) {
      this.logger.warn('AI analysis failed, using fallback:', error);
    }

    return this.analyzeFallback(context);
  }

  private analyzeFallback(context: any): TransactionAnalysis {
    const value = BigInt(context.value || '0');
    const isHighValue = value > BigInt('1000000000000000000'); // > 1 ETH
    const riskLevel = isHighValue
      ? 'high'
      : context.status === '0x0'
        ? 'high'
        : 'low';

    return {
      summary: `Transaction from ${context.from?.slice(0, 10)}... to ${context.to?.slice(0, 10)}...`,
      riskLevel,
      confidence: 60,
      insights: [
        isHighValue
          ? 'High-value transaction detected'
          : 'Standard transaction',
        context.status === '0x0'
          ? 'Transaction failed'
          : 'Transaction succeeded',
      ],
      recommendations: [
        'Verify transaction details before confirming',
        'Check gas price for optimal timing',
      ],
      patterns: [],
      anomalies: context.status === '0x0' ? ['Transaction failed'] : [],
      gasAnalysis: this.analyzeGas(context),
    };
  }

  private analyzeGas(context: any): { used: string; price: string; efficiency: 'efficient' | 'moderate' | 'inefficient' } {
    const gasUsed = parseInt(context.gasUsed || '0', 16);
    const gasLimit = parseInt(context.gas || '0', 16);
    const ratio = gasLimit > 0 ? gasUsed / gasLimit : 0;
    const efficiency: 'efficient' | 'moderate' | 'inefficient' = 
      ratio < 0.5 ? 'efficient' : ratio < 0.8 ? 'moderate' : 'inefficient';

    return {
      used: context.gasUsed || '0x0',
      price: context.gasPrice || '0x0',
      efficiency,
    };
  }
}

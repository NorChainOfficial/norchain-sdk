import { Injectable, Logger } from '@nestjs/common';
import { HttpService } from '@nestjs/axios';
import { ConfigService } from '@nestjs/config';
import { firstValueFrom } from 'rxjs';
import { AxiosResponse } from 'axios';
import { ProxyService } from '../../proxy/proxy.service';

export interface ContractAudit {
  securityScore: number;
  vulnerabilities: Array<{
    severity: 'low' | 'medium' | 'high' | 'critical';
    type: string;
    description: string;
    recommendation: string;
  }>;
  recommendations: string[];
  bestPractices: string[];
  riskLevel: 'low' | 'medium' | 'high' | 'critical';
}

@Injectable()
export class ContractAuditService {
  private readonly logger = new Logger(ContractAuditService.name);
  private readonly aiApiKey: string;

  constructor(
    private readonly httpService: HttpService,
    private readonly configService: ConfigService,
    private readonly proxyService: ProxyService,
  ) {
    this.aiApiKey = this.configService.get('ANTHROPIC_API_KEY', '');
  }

  async audit(contractAddress: string): Promise<ContractAudit> {
    try {
      const codeResult = await this.proxyService.eth_getCode(
        contractAddress,
        'latest',
      );
      const code = codeResult.status === '1' ? codeResult.result : '0x';

      if (!code || code === '0x') {
        return {
          securityScore: 0,
          vulnerabilities: [],
          recommendations: ['Contract not found or is an EOA'],
          bestPractices: [],
          riskLevel: 'low',
        };
      }

      if (this.aiApiKey) {
        return await this.auditWithAI(contractAddress, code);
      }

      return this.auditFallback(code);
    } catch (error) {
      this.logger.error(`Error auditing contract ${contractAddress}:`, error);
      throw error;
    }
  }

  private async auditWithAI(
    contractAddress: string,
    code: string,
  ): Promise<ContractAudit> {
    const prompt = `Perform security audit of this smart contract:
Address: ${contractAddress}
Code: ${code.slice(0, 5000)}...

Check for:
- Reentrancy vulnerabilities
- Integer overflow/underflow
- Access control issues
- Gas optimization opportunities
- Best practices violations

Return JSON with: securityScore (0-100), vulnerabilities[], recommendations[], bestPractices[], riskLevel`;

    try {
      const response: AxiosResponse<any> = await firstValueFrom(
        this.httpService.post(
          'https://api.anthropic.com/v1/messages',
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
        return JSON.parse(jsonMatch[0]);
      }
    } catch (error) {
      this.logger.warn('AI audit failed, using fallback:', error);
    }

    return this.auditFallback(code);
  }

  private auditFallback(code: string): ContractAudit {
    const vulnerabilities: ContractAudit['vulnerabilities'] = [];

    // Basic pattern detection
    if (code.includes('0xf4')) {
      // CALL opcode
      vulnerabilities.push({
        severity: 'medium',
        type: 'External Call',
        description: 'Contract makes external calls - check for reentrancy',
        recommendation: 'Use checks-effects-interactions pattern',
      });
    }

    return {
      securityScore: vulnerabilities.length === 0 ? 80 : 60,
      vulnerabilities,
      recommendations: [
        'Perform comprehensive security audit',
        'Use automated testing tools',
        'Follow Solidity best practices',
      ],
      bestPractices: [
        'Use latest Solidity compiler',
        'Implement access controls',
        'Add event logging',
      ],
      riskLevel: vulnerabilities.length === 0 ? 'low' : 'medium',
    };
  }
}

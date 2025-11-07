/**
 * AI Transaction Decoder Service
 *
 * Uses Anthropic Claude API to decode blockchain transactions
 * into human-readable descriptions with security analysis and
 * gas optimization suggestions.
 */

import Anthropic from '@anthropic-ai/sdk';
import {
  TransactionAnalysisRequest,
  TransactionAnalysisResult,
  SecurityAnalysis,
  GasOptimization,
  DecodedFunction,
  AIAnalysisError,
  SecurityFlag,
  OptimizationSuggestion,
  SimilarTransaction,
} from './types';

const ANTHROPIC_API_KEY = process.env.ANTHROPIC_API_KEY;
const CLAUDE_MODEL = 'claude-3-5-sonnet-20241022';
const MAX_TOKENS = 2048;
const ANALYSIS_TIMEOUT_MS = 10000;

/**
 * TransactionDecoder - AI-powered blockchain transaction analysis
 */
export class TransactionDecoder {
  private readonly client: Anthropic;
  private readonly cache: Map<string, TransactionAnalysisResult>;
  private readonly cacheExpiryMs: number;

  constructor(apiKey: string = ANTHROPIC_API_KEY || '', cacheTtlMs: number = 3600000) {
    if (!apiKey) {
      throw new Error('Anthropic API key is required');
    }

    this.client = new Anthropic({
      apiKey,
    });
    this.cache = new Map();
    this.cacheExpiryMs = cacheTtlMs;
  }

  /**
   * Analyze a blockchain transaction using Claude AI
   */
  async analyzeTransaction(
    request: TransactionAnalysisRequest
  ): Promise<TransactionAnalysisResult | AIAnalysisError> {
    const startTime = Date.now();

    try {
      // Check cache first
      const cachedResult = this.getCachedAnalysis(request.hash);
      if (cachedResult) {
        return {
          ...cachedResult,
          metadata: {
            ...cachedResult.metadata,
            cacheHit: true,
          },
        };
      }

      // Build analysis prompt
      const prompt = this.buildAnalysisPrompt(request);

      // Call Claude API with timeout
      const response = await Promise.race([
        this.callClaudeAPI(prompt),
        this.timeoutPromise(ANALYSIS_TIMEOUT_MS),
      ]);

      // Parse AI response
      const result = this.parseAIResponse(response as string, request, startTime);

      // Cache successful result
      this.cacheAnalysis(request.hash, result);

      return result;
    } catch (error) {
      console.error('Transaction analysis error:', error);
      return this.handleError(error);
    }
  }

  /**
   * Build comprehensive analysis prompt for Claude
   */
  private buildAnalysisPrompt(request: TransactionAnalysisRequest): string {
    return `You are an expert blockchain transaction analyzer. Analyze this transaction and provide a comprehensive analysis in JSON format.

Transaction Details:
- Hash: ${request.hash}
- Type: ${request.type}
- From: ${request.sender}
- To: ${request.receiver || 'N/A'}
- Amount: ${request.amount || '0'} XAHEEN
- Gas Used: ${request.gasUsed} / ${request.gasWanted}
- Status: ${request.status}
- Timestamp: ${request.timestamp}
${request.inputData ? `- Input Data: ${request.inputData}` : ''}

Provide analysis in this exact JSON structure:
{
  "humanReadableDescription": "Clear, concise description of what this transaction does",
  "confidence": 95,
  "decodedFunction": {
    "name": "functionName",
    "signature": "functionName(type param1, type param2)",
    "parameters": [
      {"name": "param1", "type": "address", "value": "0x...", "decodedValue": "Wallet address"}
    ],
    "description": "What this function does"
  },
  "securityAnalysis": {
    "isSafe": true,
    "riskLevel": "low",
    "score": 95,
    "flags": [
      {
        "type": "info",
        "category": "security",
        "title": "Standard Transfer",
        "description": "This is a standard token transfer operation"
      }
    ],
    "recommendations": ["Always verify recipient address"]
  },
  "gasOptimization": {
    "canOptimize": true,
    "potentialSavings": 30,
    "currentGasUsed": ${request.gasUsed},
    "estimatedOptimizedGas": ${Math.floor(request.gasUsed * 0.7)},
    "suggestions": [
      {
        "title": "Optimize storage writes",
        "description": "Use cached values to reduce SSTORE operations",
        "impact": "high",
        "difficulty": "medium",
        "estimatedSavings": 20
      }
    ]
  },
  "similarTransactions": []
}

Focus on:
1. Clear, non-technical language for humanReadableDescription
2. Accurate security analysis with specific risks
3. Practical gas optimization suggestions
4. Confidence score based on data quality

Return ONLY valid JSON, no additional text.`;
  }

  /**
   * Call Claude API
   */
  private async callClaudeAPI(prompt: string): Promise<string> {
    const message = await this.client.messages.create({
      model: CLAUDE_MODEL,
      max_tokens: MAX_TOKENS,
      messages: [
        {
          role: 'user',
          content: prompt,
        },
      ],
    });

    const content = message.content[0];
    if (content.type === 'text') {
      return content.text;
    }

    throw new Error('Unexpected response format from Claude API');
  }

  /**
   * Parse AI response into structured result
   */
  private parseAIResponse(
    response: string,
    request: TransactionAnalysisRequest,
    startTime: number
  ): TransactionAnalysisResult {
    try {
      // Extract JSON from response (Claude might include markdown code blocks)
      const jsonMatch = response.match(/\{[\s\S]*\}/);
      if (!jsonMatch) {
        throw new Error('No JSON found in AI response');
      }

      const parsed = JSON.parse(jsonMatch[0]);

      // Validate and construct result
      const result: TransactionAnalysisResult = {
        hash: request.hash,
        humanReadableDescription:
          parsed.humanReadableDescription ||
          this.generateFallbackDescription(request),
        confidence: this.validateConfidence(parsed.confidence),
        decodedFunction: parsed.decodedFunction || undefined,
        securityAnalysis: this.validateSecurityAnalysis(parsed.securityAnalysis),
        gasOptimization: this.validateGasOptimization(
          parsed.gasOptimization,
          request.gasUsed,
          request.gasWanted
        ),
        similarTransactions: parsed.similarTransactions || [],
        metadata: {
          analyzedAt: new Date().toISOString(),
          analysisTimeMs: Date.now() - startTime,
          aiModel: CLAUDE_MODEL,
          cacheHit: false,
        },
      };

      return result;
    } catch (error) {
      console.error('Failed to parse AI response:', error);
      // Return fallback result
      return this.generateFallbackResult(request, startTime);
    }
  }

  /**
   * Validate confidence score (0-100)
   */
  private validateConfidence(confidence: number | undefined): number {
    if (typeof confidence !== 'number' || confidence < 0 || confidence > 100) {
      return 50; // Default moderate confidence
    }
    return Math.round(confidence);
  }

  /**
   * Validate security analysis
   */
  private validateSecurityAnalysis(
    analysis: Partial<SecurityAnalysis> | undefined
  ): SecurityAnalysis {
    return {
      isSafe: analysis?.isSafe ?? true,
      riskLevel: analysis?.riskLevel ?? 'low',
      score: this.validateConfidence(analysis?.score),
      flags: Array.isArray(analysis?.flags) ? analysis.flags : [],
      recommendations: Array.isArray(analysis?.recommendations)
        ? analysis.recommendations
        : ['Always verify transaction details before signing'],
    };
  }

  /**
   * Validate gas optimization
   */
  private validateGasOptimization(
    optimization: Partial<GasOptimization> | undefined,
    gasUsed: number,
    gasWanted: number
  ): GasOptimization {
    const utilizationPercent = (gasUsed / gasWanted) * 100;
    const canOptimize = utilizationPercent > 70;
    const potentialSavings = canOptimize ? Math.min(30, 100 - utilizationPercent) : 0;

    return {
      canOptimize: optimization?.canOptimize ?? canOptimize,
      potentialSavings: optimization?.potentialSavings ?? potentialSavings,
      currentGasUsed: gasUsed,
      estimatedOptimizedGas:
        optimization?.estimatedOptimizedGas ??
        Math.floor(gasUsed * (1 - potentialSavings / 100)),
      suggestions: Array.isArray(optimization?.suggestions) ? optimization.suggestions : [],
    };
  }

  /**
   * Generate fallback description
   */
  private generateFallbackDescription(request: TransactionAnalysisRequest): string {
    const parts: string[] = [];

    if (request.type.includes('transfer') || request.type.includes('send')) {
      parts.push('Transferred');
      if (request.amount) {
        parts.push(request.amount, 'XAHEEN');
      }
      if (request.receiver) {
        parts.push('to', this.truncateAddress(request.receiver));
      }
    } else {
      parts.push(`Executed ${request.type} transaction`);
    }

    parts.push(`on ${new Date(request.timestamp).toLocaleDateString()}`);

    return parts.join(' ');
  }

  /**
   * Generate fallback result when AI parsing fails
   */
  private generateFallbackResult(
    request: TransactionAnalysisRequest,
    startTime: number
  ): TransactionAnalysisResult {
    return {
      hash: request.hash,
      humanReadableDescription: this.generateFallbackDescription(request),
      confidence: 50,
      securityAnalysis: {
        isSafe: request.status === 'success',
        riskLevel: 'low',
        score: 75,
        flags: [],
        recommendations: ['Verify transaction details independently'],
      },
      gasOptimization: this.validateGasOptimization(undefined, request.gasUsed, request.gasWanted),
      similarTransactions: [],
      metadata: {
        analyzedAt: new Date().toISOString(),
        analysisTimeMs: Date.now() - startTime,
        aiModel: 'fallback',
        cacheHit: false,
      },
    };
  }

  /**
   * Get cached analysis
   */
  private getCachedAnalysis(hash: string): TransactionAnalysisResult | null {
    const cached = this.cache.get(hash);
    if (!cached) return null;

    const age = Date.now() - new Date(cached.metadata.analyzedAt).getTime();
    if (age > this.cacheExpiryMs) {
      this.cache.delete(hash);
      return null;
    }

    return cached;
  }

  /**
   * Cache analysis result
   */
  private cacheAnalysis(hash: string, result: TransactionAnalysisResult): void {
    this.cache.set(hash, result);

    // Simple cache cleanup
    if (this.cache.size > 1000) {
      const firstKey = this.cache.keys().next().value;
      if (firstKey) {
        this.cache.delete(firstKey);
      }
    }
  }

  /**
   * Create timeout promise
   */
  private timeoutPromise(ms: number): Promise<never> {
    return new Promise((_, reject) => {
      setTimeout(() => reject(new Error('Analysis timeout')), ms);
    });
  }

  /**
   * Handle errors
   */
  private handleError(error: unknown): AIAnalysisError {
    if (error instanceof Anthropic.APIError) {
      if (error.status === 429) {
        return {
          error: 'Rate limit exceeded',
          code: 'RATE_LIMIT',
          retryAfter: 60,
          message: 'Too many requests. Please try again in a minute.',
        };
      }

      return {
        error: 'API error',
        code: 'API_ERROR',
        message: error.message || 'Failed to analyze transaction',
      };
    }

    return {
      error: 'Unknown error',
      code: 'API_ERROR',
      message: error instanceof Error ? error.message : 'An unexpected error occurred',
    };
  }

  /**
   * Truncate address for display
   */
  private truncateAddress(address: string): string {
    if (address.length <= 12) return address;
    return `${address.slice(0, 6)}...${address.slice(-4)}`;
  }

  /**
   * Clear cache
   */
  clearCache(): void {
    this.cache.clear();
  }

  /**
   * Get cache size
   */
  getCacheSize(): number {
    return this.cache.size;
  }
}

/**
 * Singleton instance
 */
let decoderInstance: TransactionDecoder | null = null;

/**
 * Get or create decoder instance
 */
export function getTransactionDecoder(): TransactionDecoder {
  if (!decoderInstance) {
    decoderInstance = new TransactionDecoder();
  }
  return decoderInstance;
}

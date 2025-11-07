/**
 * AI Transaction Decoder Types
 *
 * TypeScript interfaces for AI-powered transaction analysis
 * Provides strict typing for decoded transactions, security analysis,
 * and optimization recommendations.
 */

export interface TransactionAnalysisRequest {
  readonly hash: string;
  readonly inputData?: string;
  readonly type: string;
  readonly sender: string;
  readonly receiver?: string | null;
  readonly amount?: string | null;
  readonly gasUsed: number;
  readonly gasWanted: number;
  readonly status: string;
  readonly timestamp: string;
}

export interface SecurityAnalysis {
  readonly isSafe: boolean;
  readonly riskLevel: 'low' | 'medium' | 'high' | 'critical';
  readonly flags: ReadonlyArray<SecurityFlag>;
  readonly score: number; // 0-100
  readonly recommendations: ReadonlyArray<string>;
}

export interface SecurityFlag {
  readonly type: 'info' | 'warning' | 'danger';
  readonly category: 'security' | 'privacy' | 'compliance' | 'performance';
  readonly title: string;
  readonly description: string;
}

export interface GasOptimization {
  readonly canOptimize: boolean;
  readonly potentialSavings: number; // Percentage
  readonly currentGasUsed: number;
  readonly estimatedOptimizedGas: number;
  readonly suggestions: ReadonlyArray<OptimizationSuggestion>;
}

export interface OptimizationSuggestion {
  readonly title: string;
  readonly description: string;
  readonly impact: 'low' | 'medium' | 'high';
  readonly difficulty: 'easy' | 'medium' | 'hard';
  readonly estimatedSavings: number; // Percentage
}

export interface DecodedFunction {
  readonly name: string;
  readonly signature: string;
  readonly parameters: ReadonlyArray<DecodedParameter>;
  readonly description: string;
}

export interface DecodedParameter {
  readonly name: string;
  readonly type: string;
  readonly value: string;
  readonly decodedValue?: string; // Human-readable value
}

export interface SimilarTransaction {
  readonly hash: string;
  readonly similarity: number; // 0-100
  readonly timestamp: string;
  readonly description: string;
}

export interface TransactionAnalysisResult {
  readonly hash: string;
  readonly humanReadableDescription: string;
  readonly confidence: number; // 0-100
  readonly decodedFunction?: DecodedFunction;
  readonly securityAnalysis: SecurityAnalysis;
  readonly gasOptimization: GasOptimization;
  readonly similarTransactions: ReadonlyArray<SimilarTransaction>;
  readonly metadata: AnalysisMetadata;
}

export interface AnalysisMetadata {
  readonly analyzedAt: string;
  readonly analysisTimeMs: number;
  readonly aiModel: string;
  readonly cacheHit: boolean;
}

export interface AIAnalysisError {
  readonly error: string;
  readonly code: 'RATE_LIMIT' | 'API_ERROR' | 'INVALID_INPUT' | 'CACHE_ERROR';
  readonly retryAfter?: number; // seconds
  readonly message: string;
}

export interface CachedAnalysis {
  readonly result: TransactionAnalysisResult;
  readonly cachedAt: string;
  readonly expiresAt: string;
}

export interface RateLimitInfo {
  readonly limit: number;
  readonly remaining: number;
  readonly resetAt: number; // Unix timestamp
  readonly retryAfter: number; // seconds
}

/**
 * Type guard for AI analysis errors
 */
export function isAIAnalysisError(value: unknown): value is AIAnalysisError {
  return (
    typeof value === 'object' &&
    value !== null &&
    'error' in value &&
    'code' in value &&
    'message' in value
  );
}

/**
 * Type guard for successful analysis results
 */
export function isTransactionAnalysisResult(
  value: unknown
): value is TransactionAnalysisResult {
  return (
    typeof value === 'object' &&
    value !== null &&
    'hash' in value &&
    'humanReadableDescription' in value &&
    'confidence' in value &&
    'securityAnalysis' in value &&
    'gasOptimization' in value
  );
}

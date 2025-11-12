/**
 * AI Hooks for NorExplorer
 * 
 * Custom React hooks for all AI features, providing clean, reusable
 * interfaces for AI-powered functionality throughout Explorer.
 */

import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { apiClient } from '@/lib/api-client';

// ============================================================================
// Transaction Analysis Hook
// ============================================================================

export interface TransactionAnalysis {
  analysis: string;
  riskScore: number;
  insights: string[];
  recommendations: string[];
}

export function useAnalyzeTransaction(txHash: string | null, enabled: boolean = true) {
  return useQuery<TransactionAnalysis>({
    queryKey: ['ai', 'analyze-transaction', txHash],
    queryFn: () => apiClient.analyzeTransaction(txHash!),
    enabled: enabled && !!txHash,
    staleTime: 5 * 60 * 1000, // Cache for 5 minutes
    retry: 1,
  });
}

// ============================================================================
// Contract Audit Hook
// ============================================================================

export interface ContractAudit {
  audit: string;
  vulnerabilities: Array<{
    severity: 'critical' | 'high' | 'medium' | 'low';
    description: string;
    recommendation: string;
  }>;
  score: number;
}

export function useAuditContract(contractAddress: string | null, enabled: boolean = true) {
  return useQuery<ContractAudit>({
    queryKey: ['ai', 'audit-contract', contractAddress],
    queryFn: () => apiClient.auditContract(contractAddress!),
    enabled: enabled && !!contractAddress,
    staleTime: 10 * 60 * 1000, // Cache for 10 minutes (audits don't change often)
    retry: 1,
  });
}

// ============================================================================
// Gas Prediction Hook
// ============================================================================

export interface GasPrediction {
  predictedGasPrice: string;
  confidence: number;
  trend: 'increasing' | 'decreasing' | 'stable';
  recommendation: string;
}

export function usePredictGas(enabled: boolean = true) {
  return useQuery<GasPrediction>({
    queryKey: ['ai', 'predict-gas'],
    queryFn: () => apiClient.predictGas(),
    enabled,
    staleTime: 30 * 1000, // Cache for 30 seconds (gas changes frequently)
    refetchInterval: 60 * 1000, // Refresh every minute
    retry: 1,
  });
}

// ============================================================================
// Anomaly Detection Hook
// ============================================================================

export interface AnomalyDetection {
  anomalies: Array<{
    type: string;
    description: string;
    severity: 'high' | 'medium' | 'low';
    timestamp: string;
  }>;
  riskScore: number;
  summary: string;
}

export function useDetectAnomalies(
  address: string | null,
  days: number = 7,
  enabled: boolean = true
) {
  return useQuery<AnomalyDetection>({
    queryKey: ['ai', 'detect-anomalies', address, days],
    queryFn: () => apiClient.detectAnomalies(address!, days),
    enabled: enabled && !!address,
    staleTime: 2 * 60 * 1000, // Cache for 2 minutes
    retry: 1,
  });
}

// ============================================================================
// Portfolio Optimization Hook
// ============================================================================

export interface PortfolioOptimization {
  recommendations: Array<{
    action: string;
    reason: string;
    impact: 'high' | 'medium' | 'low';
  }>;
  currentValue: string;
  optimizedValue: string;
  improvement: string;
}

export function useOptimizePortfolio(address: string | null, enabled: boolean = true) {
  return useQuery<PortfolioOptimization>({
    queryKey: ['ai', 'optimize-portfolio', address],
    queryFn: () => apiClient.optimizePortfolio(address!),
    enabled: enabled && !!address,
    staleTime: 10 * 60 * 1000, // Cache for 10 minutes
    retry: 1,
  });
}

// ============================================================================
// AI Chat Hook (Mutation for sending messages)
// ============================================================================

export interface ChatMessage {
  role: 'user' | 'assistant';
  content: string;
  timestamp: Date;
}

export interface ChatContext {
  pageType?: 'transaction' | 'address' | 'token' | 'contract' | 'block';
  entityId?: string; // tx hash, address, token address, etc.
  abi?: any;
  additionalContext?: Record<string, any>;
}

export function useNorAIChat() {
  const queryClient = useQueryClient();

  const mutation = useMutation({
    mutationFn: async ({ question, context }: { question: string; context?: ChatContext }) => {
      return apiClient.aiChat(question, context);
    },
    onSuccess: () => {
      // Invalidate related queries if needed
      queryClient.invalidateQueries({ queryKey: ['ai'] });
    },
  });

  return {
    chat: mutation.mutate,
    chatAsync: mutation.mutateAsync,
    isLoading: mutation.isPending,
    error: mutation.error,
    reset: mutation.reset,
  };
}

// ============================================================================
// Combined Hooks for Context-Aware AI
// ============================================================================

/**
 * Hook for transaction page - combines analysis and anomaly detection
 */
export function useTransactionAI(txHash: string | null, fromAddress?: string | null) {
  const analysis = useAnalyzeTransaction(txHash);
  const fromAnomalies = useDetectAnomalies(fromAddress, 7, !!fromAddress);
  const gasPrediction = usePredictGas();

  return {
    analysis,
    fromAnomalies,
    gasPrediction,
    isLoading: analysis.isLoading || fromAnomalies.isLoading,
  };
}

/**
 * Hook for address page - combines anomaly detection and portfolio optimization
 */
export function useAddressAI(address: string | null) {
  const anomalies = useDetectAnomalies(address, 30);
  const portfolio = useOptimizePortfolio(address);

  return {
    anomalies,
    portfolio,
    isLoading: anomalies.isLoading || portfolio.isLoading,
  };
}

/**
 * Hook for contract page - combines audit and chat context
 */
export function useContractAI(contractAddress: string | null, abi?: any) {
  const audit = useAuditContract(contractAddress);
  const chat = useNorAIChat();

  const explainFunction = async (functionName: string, functionAbi: any) => {
    const question = `Explain what this function does: ${functionName}. ABI: ${JSON.stringify(functionAbi)}`;
    return chat.chatAsync({
      question,
      context: {
        pageType: 'contract',
        entityId: contractAddress!,
        abi: functionAbi,
      },
    });
  };

  return {
    audit,
    chat,
    explainFunction,
    isLoading: audit.isLoading,
  };
}


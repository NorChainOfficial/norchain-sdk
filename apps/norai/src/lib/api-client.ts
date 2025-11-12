const API_URL = process.env.NEXT_PUBLIC_API_URL || 'http://localhost:4000/api/v1';

export interface AnalyzeTransactionResponse {
  analysis: string;
  riskScore: number;
  insights: string[];
  recommendations: string[];
}

export interface AuditContractResponse {
  audit: string;
  vulnerabilities: Array<{
    severity: 'critical' | 'high' | 'medium' | 'low';
    description: string;
    recommendation: string;
  }>;
  score: number;
}

export interface PredictGasResponse {
  predictedGasPrice: string;
  confidence: number;
  trend: 'increasing' | 'decreasing' | 'stable';
  recommendation: string;
}

export interface DetectAnomaliesResponse {
  anomalies: Array<{
    type: string;
    description: string;
    severity: 'high' | 'medium' | 'low';
    timestamp: string;
  }>;
  riskScore: number;
  summary: string;
}

export interface OptimizePortfolioResponse {
  recommendations: Array<{
    action: string;
    reason: string;
    impact: 'high' | 'medium' | 'low';
  }>;
  currentValue: string;
  optimizedValue: string;
  improvement: string;
}

export interface ChatResponse {
  answer: string;
  sources?: string[];
  confidence?: number;
}

class AIClient {
  private async request<T>(
    endpoint: string,
    options: RequestInit = {}
  ): Promise<T> {
    const response = await fetch(`${API_URL}${endpoint}`, {
      ...options,
      headers: {
        'Content-Type': 'application/json',
        ...options.headers,
      },
    });

    if (!response.ok) {
      const error = await response.json().catch(() => ({ message: 'Request failed' }));
      throw new Error(error.message || `HTTP error! status: ${response.status}`);
    }

    return response.json();
  }

  async analyzeTransaction(txHash: string): Promise<AnalyzeTransactionResponse> {
    return this.request<AnalyzeTransactionResponse>('/ai/analyze-transaction', {
      method: 'POST',
      body: JSON.stringify({ txHash }),
    });
  }

  async auditContract(contractAddress: string): Promise<AuditContractResponse> {
    return this.request<AuditContractResponse>('/ai/audit-contract', {
      method: 'POST',
      body: JSON.stringify({ contractAddress }),
    });
  }

  async predictGas(): Promise<PredictGasResponse> {
    return this.request<PredictGasResponse>('/ai/predict-gas', {
      method: 'GET',
    });
  }

  async detectAnomalies(address: string, days: number = 7): Promise<DetectAnomaliesResponse> {
    return this.request<DetectAnomaliesResponse>(
      `/ai/detect-anomalies?address=${encodeURIComponent(address)}&days=${days}`,
      {
        method: 'GET',
      }
    );
  }

  async optimizePortfolio(address: string): Promise<OptimizePortfolioResponse> {
    return this.request<OptimizePortfolioResponse>('/ai/optimize-portfolio', {
      method: 'POST',
      body: JSON.stringify({ address }),
    });
  }

  async chat(question: string, context?: any): Promise<ChatResponse> {
    return this.request<ChatResponse>('/ai/chat', {
      method: 'POST',
      body: JSON.stringify({ question, context }),
    });
  }
}

export const aiClient = new AIClient();


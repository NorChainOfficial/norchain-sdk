import { Injectable, Logger } from '@nestjs/common';
import { HttpService } from '@nestjs/axios';
import { ConfigService } from '@nestjs/config';
import { firstValueFrom } from 'rxjs';

export interface ChatResponse {
  answer: string;
  confidence: number;
  sources?: string[];
  followUpQuestions?: string[];
}

@Injectable()
export class ChatbotService {
  private readonly logger = new Logger(ChatbotService.name);
  private readonly aiApiKey: string;

  constructor(
    private readonly httpService: HttpService,
    private readonly configService: ConfigService,
  ) {
    this.aiApiKey = this.configService.get('ANTHROPIC_API_KEY', '');
  }

  async answer(question: string, context?: any): Promise<ChatResponse> {
    try {
      if (this.aiApiKey) {
        return await this.answerWithAI(question, context);
      }

      return this.answerFallback(question);
    } catch (error) {
      this.logger.error('Error answering question:', error);
      throw error;
    }
  }

  private async answerWithAI(
    question: string,
    context?: any,
  ): Promise<ChatResponse> {
    const systemPrompt = `You are a helpful blockchain assistant for NorChain. 
Answer questions about blockchain, transactions, smart contracts, and DeFi.
Be concise and accurate.`;

    const userPrompt = context
      ? `Context: ${JSON.stringify(context)}\n\nQuestion: ${question}`
      : question;

    try {
      const response = await firstValueFrom(
        this.httpService.post(
          'https://api.anthropic.com/v1/messages',
          {
            model: 'claude-3-5-sonnet-20241022',
            max_tokens: 1000,
            messages: [
              { role: 'user', content: systemPrompt },
              { role: 'user', content: userPrompt },
            ],
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

      const content = response.data.content?.[0]?.text || '';

      return {
        answer: content,
        confidence: 85,
        sources: ['NorChain Documentation'],
        followUpQuestions: this.generateFollowUps(question),
      };
    } catch (error) {
      this.logger.warn('AI chat failed, using fallback:', error);
      return this.answerFallback(question);
    }
  }

  private answerFallback(question: string): ChatResponse {
    const lowerQuestion = question.toLowerCase();

    if (lowerQuestion.includes('gas')) {
      return {
        answer:
          'Gas is the fee paid for transactions on the blockchain. You can check current gas prices using the /ai/predict-gas endpoint.',
        confidence: 70,
      };
    }

    if (lowerQuestion.includes('transaction')) {
      return {
        answer:
          'Transactions are operations that change the blockchain state. You can analyze transactions using the /ai/analyze-transaction endpoint.',
        confidence: 70,
      };
    }

    return {
      answer:
        'I can help with blockchain-related questions. Try asking about transactions, gas prices, smart contracts, or portfolio optimization.',
      confidence: 50,
    };
  }

  private generateFollowUps(question: string): string[] {
    return [
      'How do I check my transaction status?',
      'What is the current gas price?',
      'How do I optimize my portfolio?',
    ];
  }
}

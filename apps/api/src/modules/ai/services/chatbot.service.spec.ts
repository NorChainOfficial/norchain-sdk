import { Test, TestingModule } from '@nestjs/testing';
import { ChatbotService } from './chatbot.service';
import { HttpService } from '@nestjs/axios';
import { ConfigService } from '@nestjs/config';
import { of } from 'rxjs';

describe('ChatbotService', () => {
  let service: ChatbotService;
  let httpService: jest.Mocked<HttpService>;
  let configService: jest.Mocked<ConfigService>;

  beforeEach(async () => {
    const mockHttpService = {
      post: jest.fn(),
    };
    const mockConfigService = {
      get: jest.fn(),
    };

    const module: TestingModule = await Test.createTestingModule({
      providers: [
        ChatbotService,
        {
          provide: HttpService,
          useValue: mockHttpService,
        },
        {
          provide: ConfigService,
          useValue: mockConfigService,
        },
      ],
    }).compile();

    service = module.get<ChatbotService>(ChatbotService);
    httpService = module.get(HttpService);
    configService = module.get(ConfigService);
  });

  it('should be defined', () => {
    expect(service).toBeDefined();
  });

  describe('answer', () => {
    it('should answer question with fallback', async () => {
      const question = 'What is gas?';
      configService.get.mockReturnValue(''); // No AI key

      const result = await service.answer(question);

      expect(result).toHaveProperty('answer');
      expect(result).toHaveProperty('confidence');
      expect(result.answer).toContain('Gas');
    });

    it('should answer with AI when API key is present', async () => {
      const question = 'What is gas?';
      // Mock configService.get to return API key (called in constructor)
      configService.get.mockReturnValue('test-api-key');
      
      // Create a new service instance to pick up the mocked API key
      const serviceWithKey = new (await import('./chatbot.service')).ChatbotService(
        httpService as any,
        configService as any,
      );
      
      // Mock the Observable properly for firstValueFrom
      httpService.post.mockReturnValue(
        of({
          data: {
            content: [
              {
                text: 'Gas is the fee paid for transactions on the blockchain.',
              },
            ],
          },
          status: 200,
          statusText: 'OK',
          headers: {},
          config: {},
        } as any),
      );

      const result = await serviceWithKey.answer(question);

      expect(result.answer).toBeDefined();
      expect(result.answer).toBe('Gas is the fee paid for transactions on the blockchain.');
      expect(result.confidence).toBe(85); // AI response returns 85 confidence
      expect(httpService.post).toHaveBeenCalled();
    });

    it('should handle context', async () => {
      const question = 'What is this transaction?';
      const context = { txHash: '0x123...' };
      configService.get.mockReturnValue('test-api-key');
      httpService.post.mockReturnValue(
        of({
          data: {
            content: [{ text: 'This is a transaction' }],
          },
        } as any),
      );

      const result = await service.answer(question, context);

      expect(result.answer).toBeDefined();
    });

    it('should handle errors', async () => {
      const question = 'What is gas?';
      configService.get.mockReturnValue('test-api-key');
      httpService.post.mockReturnValue(
        of({
          data: {},
        } as any),
      );

      const result = await service.answer(question);

      expect(result).toHaveProperty('answer');
    });
  });
});


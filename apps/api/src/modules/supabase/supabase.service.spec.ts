import { Test, TestingModule } from '@nestjs/testing';
import { SupabaseService } from './supabase.service';
import { ConfigService } from '@nestjs/config';
import { NorChainWebSocketGateway } from '../websocket/websocket.gateway';

describe('SupabaseService', () => {
  let service: SupabaseService;
  let configService: jest.Mocked<ConfigService>;
  let websocketGateway: jest.Mocked<NorChainWebSocketGateway>;

  beforeEach(async () => {
    const mockConfigService = {
      get: jest.fn(),
    };

    const mockWebSocketGateway = {
      server: {
        emit: jest.fn(),
      },
    };

    const module: TestingModule = await Test.createTestingModule({
      providers: [
        SupabaseService,
        {
          provide: ConfigService,
          useValue: mockConfigService,
        },
        {
          provide: NorChainWebSocketGateway,
          useValue: mockWebSocketGateway,
        },
      ],
    }).compile();

    service = module.get<SupabaseService>(SupabaseService);
    configService = module.get(ConfigService);
    websocketGateway = module.get(NorChainWebSocketGateway);
  });

  afterEach(() => {
    jest.clearAllMocks();
  });

  it('should be defined', () => {
    expect(service).toBeDefined();
  });

  describe('onModuleInit', () => {
    it('should initialize Supabase subscriptions if configured', async () => {
      configService.get.mockImplementation((key: string) => {
        if (key === 'SUPABASE_URL') return 'https://test.supabase.co';
        if (key === 'SUPABASE_ANON_KEY') return 'test-key';
        return null;
      });

      // Mock supabase client methods
      (service as any).supabase = {
        channel: jest.fn().mockReturnValue({
          on: jest.fn().mockReturnThis(),
          subscribe: jest.fn(),
        }),
      };

      await service.onModuleInit();

      expect(service).toBeDefined();
    });

    it('should skip initialization if Supabase not configured', async () => {
      configService.get.mockImplementation((key: string) => {
        return null;
      });

      await service.onModuleInit();

      // Should not throw error
      expect(service).toBeDefined();
    });
  });
});


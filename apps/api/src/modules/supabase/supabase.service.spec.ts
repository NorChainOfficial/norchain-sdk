import { Test, TestingModule } from '@nestjs/testing';
import { SupabaseService } from './supabase.service';
import { ConfigService } from '@nestjs/config';
import { NorChainWebSocketGateway } from '../websocket/websocket.gateway';

describe('SupabaseService', () => {
  let service: SupabaseService;
  let configService: jest.Mocked<ConfigService>;
  let websocketGateway: jest.Mocked<NorChainWebSocketGateway>;
  let mockSupabaseClient: any;

  beforeEach(async () => {
    mockSupabaseClient = {
      channel: jest.fn(),
      removeChannel: jest.fn(),
    };

    const mockConfigService = {
      get: jest.fn(),
    };

    const mockWebSocketGateway = {
      server: {
        emit: jest.fn(),
      },
      broadcastBlock: jest.fn(),
      broadcastTransaction: jest.fn(),
      broadcastTokenTransfer: jest.fn(),
      broadcastTokenUpdate: jest.fn(),
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

  describe('constructor', () => {
    it('should initialize Supabase client when configured', () => {
      configService.get.mockImplementation((key: string) => {
        if (key === 'SUPABASE_URL') return 'https://test.supabase.co';
        if (key === 'SUPABASE_ANON_KEY') return 'test-anon-key';
        if (key === 'SUPABASE_SERVICE_ROLE_KEY') return 'test-service-key';
        return null;
      });

      const newService = new SupabaseService(
        configService,
        websocketGateway,
      );

      expect(newService).toBeDefined();
      expect(configService.get).toHaveBeenCalledWith('SUPABASE_URL');
      expect(configService.get).toHaveBeenCalledWith('SUPABASE_ANON_KEY');
    });

    it('should initialize admin client when service role key provided', () => {
      configService.get.mockImplementation((key: string) => {
        if (key === 'SUPABASE_URL') return 'https://test.supabase.co';
        if (key === 'SUPABASE_ANON_KEY') return 'test-anon-key';
        if (key === 'SUPABASE_SERVICE_ROLE_KEY') return 'test-service-key';
        return null;
      });

      const newService = new SupabaseService(
        configService,
        websocketGateway,
      );

      expect(newService).toBeDefined();
    });

    it('should handle missing Supabase configuration gracefully', () => {
      configService.get.mockReturnValue(null);

      const newService = new SupabaseService(
        configService,
        websocketGateway,
      );

      expect(newService).toBeDefined();
    });
  });

  describe('onModuleInit', () => {
    it('should initialize subscriptions if Supabase configured', async () => {
      configService.get.mockImplementation((key: string) => {
        if (key === 'SUPABASE_URL') return 'https://test.supabase.co';
        if (key === 'SUPABASE_ANON_KEY') return 'test-key';
        return null;
      });

      const mockChannel = {
        on: jest.fn().mockReturnThis(),
        subscribe: jest.fn(),
      };

      mockSupabaseClient.channel.mockReturnValue(mockChannel);
      (service as any).supabase = mockSupabaseClient;

      await service.onModuleInit();

      expect(mockSupabaseClient.channel).toHaveBeenCalled();
    });

    it('should skip initialization if Supabase not configured', async () => {
      configService.get.mockReturnValue(null);

      await service.onModuleInit();

      expect(service).toBeDefined();
    });

    it('should handle initialization errors gracefully', async () => {
      configService.get.mockImplementation((key: string) => {
        if (key === 'SUPABASE_URL') return 'https://test.supabase.co';
        if (key === 'SUPABASE_ANON_KEY') return 'test-key';
        return null;
      });

      const mockChannel = {
        on: jest.fn().mockReturnThis(),
        subscribe: jest.fn().mockRejectedValue(new Error('Connection failed')),
      };

      mockSupabaseClient.channel.mockReturnValue(mockChannel);
      (service as any).supabase = mockSupabaseClient;

      // Mock the subscribe methods to handle errors
      jest.spyOn(service, 'subscribeToBlocks').mockResolvedValue(undefined);
      jest.spyOn(service, 'subscribeToTransactions').mockResolvedValue(undefined);
      jest.spyOn(service, 'subscribeToTokenTransfers').mockResolvedValue(undefined);

      await expect(service.onModuleInit()).resolves.not.toThrow();
    });
  });

  describe('getClient', () => {
    it('should return regular client by default', () => {
      const mockClient = {} as any;
      (service as any).supabase = mockClient;

      const result = service.getClient();

      expect(result).toBe(mockClient);
    });

    it('should return admin client when requested', () => {
      const mockClient = {} as any;
      const mockAdminClient = {} as any;
      (service as any).supabase = mockClient;
      (service as any).adminSupabase = mockAdminClient;

      const result = service.getClient(true);

      expect(result).toBe(mockAdminClient);
    });

    it('should return regular client if admin not available', () => {
      const mockClient = {} as any;
      (service as any).supabase = mockClient;
      (service as any).adminSupabase = null;

      const result = service.getClient(true);

      expect(result).toBe(mockClient);
    });
  });

  describe('subscribeToBlocks', () => {
    it('should subscribe to blocks channel', async () => {
      const mockChannel = {
        on: jest.fn().mockReturnThis(),
        subscribe: jest.fn(),
      };

      mockSupabaseClient.channel.mockReturnValue(mockChannel);
      (service as any).supabase = mockSupabaseClient;

      await service.subscribeToBlocks();

      expect(mockSupabaseClient.channel).toHaveBeenCalledWith('blocks');
      expect(mockChannel.on).toHaveBeenCalled();
    });

    it('should skip if Supabase not configured', async () => {
      (service as any).supabase = null;

      await service.subscribeToBlocks();

      expect(mockSupabaseClient.channel).not.toHaveBeenCalled();
    });
  });

  describe('subscribeToTransactions', () => {
    it('should subscribe to transactions channel', async () => {
      const mockChannel = {
        on: jest.fn().mockReturnThis(),
        subscribe: jest.fn(),
      };

      mockSupabaseClient.channel.mockReturnValue(mockChannel);
      (service as any).supabase = mockSupabaseClient;

      await service.subscribeToTransactions();

      expect(mockSupabaseClient.channel).toHaveBeenCalledWith('transactions');
    });

    it('should broadcast to from and to addresses', async () => {
      const mockPayload = {
        new: {
          fromAddress: '0x123',
          toAddress: '0x456',
          hash: '0xabc',
        },
      };

      const mockChannel = {
        on: jest.fn((event, config, callback) => {
          if (event === 'postgres_changes') {
            callback(mockPayload);
          }
          return mockChannel;
        }),
        subscribe: jest.fn(),
      };

      mockSupabaseClient.channel.mockReturnValue(mockChannel);
      (service as any).supabase = mockSupabaseClient;

      await service.subscribeToTransactions();

      expect(websocketGateway.broadcastTransaction).toHaveBeenCalledTimes(2);
    });
  });

  describe('subscribeToTokenTransfers', () => {
    it('should subscribe to token transfers channel', async () => {
      const mockChannel = {
        on: jest.fn().mockReturnThis(),
        subscribe: jest.fn(),
      };

      mockSupabaseClient.channel.mockReturnValue(mockChannel);
      (service as any).supabase = mockSupabaseClient;

      await service.subscribeToTokenTransfers();

      expect(mockSupabaseClient.channel).toHaveBeenCalledWith(
        'token-transfers',
      );
    });
  });

  describe('subscribeToTokenHolders', () => {
    it('should subscribe to token holders channel', async () => {
      const mockChannel = {
        on: jest.fn().mockReturnThis(),
        subscribe: jest.fn(),
      };

      mockSupabaseClient.channel.mockReturnValue(mockChannel);
      (service as any).supabase = mockSupabaseClient;

      await service.subscribeToTokenHolders('0x123');

      expect(mockSupabaseClient.channel).toHaveBeenCalledWith(
        'token-holders:0x123',
      );
    });

    it('should not subscribe twice to same token', async () => {
      const mockChannel = {
        on: jest.fn().mockReturnThis(),
        subscribe: jest.fn(),
      };

      mockSupabaseClient.channel.mockReturnValue(mockChannel);
      (service as any).supabase = mockSupabaseClient;
      (service as any).channels = new Map([
        ['token-holders:0x123', mockChannel],
      ]);

      await service.subscribeToTokenHolders('0x123');

      expect(mockSupabaseClient.channel).not.toHaveBeenCalled();
    });
  });

  describe('subscribeToChannel', () => {
    it('should subscribe to custom channel', async () => {
      const callback = jest.fn();
      const mockChannel = {
        on: jest.fn().mockReturnThis(),
        subscribe: jest.fn(),
      };

      mockSupabaseClient.channel.mockReturnValue(mockChannel);
      (service as any).supabase = mockSupabaseClient;

      await service.subscribeToChannel('custom-channel', callback);

      expect(mockSupabaseClient.channel).toHaveBeenCalledWith(
        'custom-channel',
      );
      expect(mockChannel.subscribe).toHaveBeenCalled();
    });

    it('should handle specific event filter', async () => {
      const callback = jest.fn();
      const mockChannel = {
        on: jest.fn().mockReturnThis(),
        subscribe: jest.fn(),
      };

      mockSupabaseClient.channel.mockReturnValue(mockChannel);
      (service as any).supabase = mockSupabaseClient;

      await service.subscribeToChannel('custom-channel', callback, {
        event: 'specific-event',
      });

      expect(mockChannel.on).toHaveBeenCalled();
    });

    it('should not subscribe twice to same channel', async () => {
      const callback = jest.fn();
      const mockChannel = {
        on: jest.fn().mockReturnThis(),
        subscribe: jest.fn(),
      };

      mockSupabaseClient.channel.mockReturnValue(mockChannel);
      (service as any).supabase = mockSupabaseClient;
      (service as any).customChannels = new Map([
        ['custom-channel', mockChannel],
      ]);

      await service.subscribeToChannel('custom-channel', callback);

      expect(mockSupabaseClient.channel).not.toHaveBeenCalled();
    });
  });

  describe('broadcast', () => {
    it('should broadcast event to channel', async () => {
      const mockChannel = {
        send: jest.fn().mockResolvedValue('ok'),
        subscribe: jest.fn(),
      };

      mockSupabaseClient.channel.mockReturnValue(mockChannel);
      (service as any).supabase = mockSupabaseClient;

      await service.broadcast('channel', 'event', { data: 'value' });

      expect(mockChannel.send).toHaveBeenCalledWith({
        type: 'broadcast',
        event: 'event',
        payload: { data: 'value' },
      });
    });

    it('should create channel if not exists', async () => {
      const mockChannel = {
        send: jest.fn().mockResolvedValue('ok'),
        subscribe: jest.fn(),
      };

      mockSupabaseClient.channel.mockReturnValue(mockChannel);
      (service as any).supabase = mockSupabaseClient;
      (service as any).customChannels = new Map();

      await service.broadcast('new-channel', 'event', { data: 'value' });

      expect(mockSupabaseClient.channel).toHaveBeenCalledWith('new-channel');
      expect(mockChannel.subscribe).toHaveBeenCalled();
    });
  });

  describe('updatePresence', () => {
    it('should update presence on channel', async () => {
      const mockChannel = {
        track: jest.fn(),
        subscribe: jest.fn(),
      };

      mockSupabaseClient.channel.mockReturnValue(mockChannel);
      (service as any).supabase = mockSupabaseClient;

      await service.updatePresence('channel', 'user-123', { status: 'online' });

      expect(mockChannel.track).toHaveBeenCalledWith({
        key: 'user-123',
        status: 'online',
      });
    });
  });

  describe('unsubscribe', () => {
    it('should unsubscribe from channel', async () => {
      const mockChannel = {} as any;
      (service as any).supabase = mockSupabaseClient;
      (service as any).channels = new Map([['blocks', mockChannel]]);

      await service.unsubscribe('blocks');

      expect(mockSupabaseClient.removeChannel).toHaveBeenCalledWith(
        mockChannel,
      );
    });

    it('should handle non-existent channel gracefully', async () => {
      (service as any).supabase = mockSupabaseClient;
      (service as any).channels = new Map();

      await service.unsubscribe('nonexistent');

      expect(mockSupabaseClient.removeChannel).not.toHaveBeenCalled();
    });
  });

  describe('unsubscribeFromChannel', () => {
    it('should unsubscribe from custom channel', async () => {
      const mockChannel = {} as any;
      (service as any).supabase = mockSupabaseClient;
      (service as any).customChannels = new Map([
        ['custom-channel', mockChannel],
      ]);

      await service.unsubscribeFromChannel('custom-channel');

      expect(mockSupabaseClient.removeChannel).toHaveBeenCalledWith(
        mockChannel,
      );
    });
  });

  describe('onModuleDestroy', () => {
    it('should clean up all channels', async () => {
      const mockChannel1 = {} as any;
      const mockChannel2 = {} as any;
      (service as any).supabase = mockSupabaseClient;
      (service as any).channels = new Map([
        ['blocks', mockChannel1],
        ['transactions', mockChannel2],
      ]);
      (service as any).customChannels = new Map([
        ['custom', mockChannel1],
      ]);

      await service.onModuleDestroy();

      expect(mockSupabaseClient.removeChannel).toHaveBeenCalledTimes(3);
    });

    it('should handle errors during cleanup gracefully', async () => {
      const mockChannel = {} as any;
      (service as any).supabase = mockSupabaseClient;
      (service as any).channels = new Map([['blocks', mockChannel]]);
      mockSupabaseClient.removeChannel.mockRejectedValue(
        new Error('Cleanup failed'),
      );

      await expect(service.onModuleDestroy()).resolves.not.toThrow();
    });

    it('should skip cleanup if Supabase not configured', async () => {
      (service as any).supabase = null;

      await service.onModuleDestroy();

      expect(mockSupabaseClient.removeChannel).not.toHaveBeenCalled();
    });
  });
});


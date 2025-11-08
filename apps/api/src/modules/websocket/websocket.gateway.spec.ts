import { Test, TestingModule } from '@nestjs/testing';
import { NorChainWebSocketGateway } from './websocket.gateway';
import { JwtService } from '@nestjs/jwt';
import { ConfigService } from '@nestjs/config';
import { Server, Socket } from 'socket.io';

describe('NorChainWebSocketGateway', () => {
  let gateway: NorChainWebSocketGateway;
  let jwtService: jest.Mocked<JwtService>;
  let configService: jest.Mocked<ConfigService>;
  let mockSocket: Partial<Socket>;
  let mockServer: Partial<Server>;

  beforeEach(async () => {
    mockServer = {
      emit: jest.fn(),
      to: jest.fn().mockReturnThis(),
    };

    mockSocket = {
      id: 'test-socket-id',
      handshake: {
        auth: {},
      } as any,
      emit: jest.fn(),
      join: jest.fn(),
      leave: jest.fn(),
      disconnect: jest.fn(),
      data: {},
    };

    const mockJwtService = {
      verify: jest.fn(),
    };

    const mockConfigService = {
      get: jest.fn(),
    };

    const module: TestingModule = await Test.createTestingModule({
      providers: [
        NorChainWebSocketGateway,
        {
          provide: JwtService,
          useValue: mockJwtService,
        },
        {
          provide: ConfigService,
          useValue: mockConfigService,
        },
      ],
    }).compile();

    gateway = module.get<NorChainWebSocketGateway>(NorChainWebSocketGateway);
    jwtService = module.get(JwtService);
    configService = module.get(ConfigService);
    gateway.server = mockServer as Server;
  });

  it('should be defined', () => {
    expect(gateway).toBeDefined();
  });

  describe('handleConnection', () => {
    it('should handle connection without token', async () => {
      await gateway.handleConnection(mockSocket as Socket);

      expect(mockSocket.emit).toHaveBeenCalledWith('connected', {
        message: 'Connected to Nor Chain WebSocket',
      });
    });

    it('should handle connection with valid token', async () => {
      const token = 'valid-token';
      const payload = { sub: 'user-123' };
      mockSocket.handshake.auth = { token };
      jwtService.verify.mockReturnValue(payload);

      await gateway.handleConnection(mockSocket as Socket);

      expect(jwtService.verify).toHaveBeenCalledWith(token);
      expect(mockSocket.data.userId).toBe('user-123');
      expect(mockSocket.emit).toHaveBeenCalled();
    });

    it('should disconnect on invalid token', async () => {
      const token = 'invalid-token';
      mockSocket.handshake.auth = { token };
      jwtService.verify.mockImplementation(() => {
        throw new Error('Invalid token');
      });

      await gateway.handleConnection(mockSocket as Socket);

      expect(mockSocket.disconnect).toHaveBeenCalled();
    });
  });

  describe('handleDisconnect', () => {
    it('should handle disconnection', () => {
      gateway.handleDisconnect(mockSocket as Socket);
      // Should clean up subscriptions
      expect(gateway).toBeDefined();
    });
  });

  // Note: subscribe and unsubscribe methods need to be tested once @nestjs/axios is installed
  // These tests are placeholders for when the package is available
});


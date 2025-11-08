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
      sockets: {
        sockets: new Map([
          ['socket-1', {} as Socket],
          ['socket-2', {} as Socket],
        ]) as any,
        size: 2,
      } as any,
      to: jest.fn().mockReturnThis(),
      emit: jest.fn(),
    } as any;

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

  afterEach(() => {
    jest.clearAllMocks();
    // Clear subscriptions map
    (gateway as any).subscriptions.clear();
  });

  it('should be defined', () => {
    expect(gateway).toBeDefined();
  });

  describe('handleConnection', () => {
    it('should handle connection without token', async () => {
      mockSocket.handshake.auth = {};

      await gateway.handleConnection(mockSocket as Socket);

      expect(mockSocket.emit).toHaveBeenCalledWith('connected', {
        message: 'Connected to Nor Chain WebSocket',
      });
      expect(mockSocket.disconnect).not.toHaveBeenCalled();
    });

    it('should handle connection with valid token', async () => {
      const token = 'valid-token';
      const payload = { sub: 'user-123' };
      mockSocket.handshake.auth = { token };
      jwtService.verify.mockReturnValue(payload as any);

      await gateway.handleConnection(mockSocket as Socket);

      expect(jwtService.verify).toHaveBeenCalledWith(token);
      expect(mockSocket.data.userId).toBe('user-123');
      expect(mockSocket.emit).toHaveBeenCalledWith('connected', {
        message: 'Connected to Nor Chain WebSocket',
      });
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

    it('should handle connection errors gracefully', async () => {
      mockSocket.emit = jest.fn(() => {
        throw new Error('Emit error');
      });

      await gateway.handleConnection(mockSocket as Socket);

      expect(mockSocket.disconnect).toHaveBeenCalled();
    });
  });

  describe('handleDisconnect', () => {
    it('should clean up subscriptions on disconnect', () => {
      // Set up subscriptions
      const subscriptions = (gateway as any).subscriptions;
      subscriptions.set('blocks', new Set(['test-socket-id', 'other-socket']));
      subscriptions.set('transactions:0x123', new Set(['test-socket-id']));

      gateway.handleDisconnect(mockSocket as Socket);

      // Should remove socket from subscriptions
      expect(subscriptions.get('blocks')?.has('test-socket-id')).toBe(false);
      expect(subscriptions.get('blocks')?.has('other-socket')).toBe(true);
      // Should delete empty room
      expect(subscriptions.has('transactions:0x123')).toBe(false);
    });

    it('should handle disconnect with no subscriptions', () => {
      gateway.handleDisconnect(mockSocket as Socket);
      // Should not throw error
      expect(gateway).toBeDefined();
    });
  });

  describe('handleSubscribe', () => {
    it('should subscribe to blocks', () => {
      const data = { type: 'blocks' };

      gateway.handleSubscribe(mockSocket as Socket, data);

      expect(mockSocket.join).toHaveBeenCalledWith('blocks');
      expect(mockSocket.emit).toHaveBeenCalledWith('subscribed', {
        type: 'blocks',
        room: 'blocks',
      });
      expect((gateway as any).subscriptions.get('blocks')?.has('test-socket-id')).toBe(true);
    });

    it('should subscribe to transactions with address', () => {
      const address = '0x742d35Cc6634C0532925a3b844Bc9e7595f0bEb0';
      const data = { type: 'transactions', address };

      gateway.handleSubscribe(mockSocket as Socket, data);

      const room = `transactions:${address.toLowerCase()}`;
      expect(mockSocket.join).toHaveBeenCalledWith(room);
      expect(mockSocket.emit).toHaveBeenCalledWith('subscribed', {
        type: 'transactions',
        room,
      });
    });

    it('should return error if address missing for transaction subscription', () => {
      const data = { type: 'transactions' };

      gateway.handleSubscribe(mockSocket as Socket, data);

      expect(mockSocket.emit).toHaveBeenCalledWith('error', {
        message: 'Address required for transaction subscription',
      });
      expect(mockSocket.join).not.toHaveBeenCalled();
    });

    it('should subscribe to token-transfers with address', () => {
      const address = '0x742d35Cc6634C0532925a3b844Bc9e7595f0bEb0';
      const data = { type: 'token-transfers', address };

      gateway.handleSubscribe(mockSocket as Socket, data);

      const room = `token-transfers:${address.toLowerCase()}`;
      expect(mockSocket.join).toHaveBeenCalledWith(room);
      expect(mockSocket.emit).toHaveBeenCalledWith('subscribed', {
        type: 'token-transfers',
        room,
      });
    });

    it('should return error if address missing for token-transfer subscription', () => {
      const data = { type: 'token-transfers' };

      gateway.handleSubscribe(mockSocket as Socket, data);

      expect(mockSocket.emit).toHaveBeenCalledWith('error', {
        message: 'Address required for token transfer subscription',
      });
      expect(mockSocket.join).not.toHaveBeenCalled();
    });

    it('should subscribe to token updates with tokenAddress', () => {
      const tokenAddress = '0x1234567890123456789012345678901234567890';
      const data = { type: 'token', tokenAddress };

      gateway.handleSubscribe(mockSocket as Socket, data);

      const room = `token:${tokenAddress.toLowerCase()}`;
      expect(mockSocket.join).toHaveBeenCalledWith(room);
      expect(mockSocket.emit).toHaveBeenCalledWith('subscribed', {
        type: 'token',
        room,
      });
    });

    it('should return error if tokenAddress missing for token subscription', () => {
      const data = { type: 'token' };

      gateway.handleSubscribe(mockSocket as Socket, data);

      expect(mockSocket.emit).toHaveBeenCalledWith('error', {
        message: 'Token address required',
      });
      expect(mockSocket.join).not.toHaveBeenCalled();
    });

    it('should return error for unknown subscription type', () => {
      const data = { type: 'unknown-type' };

      gateway.handleSubscribe(mockSocket as Socket, data);

      expect(mockSocket.emit).toHaveBeenCalledWith('error', {
        message: 'Unknown subscription type: unknown-type',
      });
      expect(mockSocket.join).not.toHaveBeenCalled();
    });

    it('should handle multiple subscriptions to same room', () => {
      const data = { type: 'blocks' };
      const socket2 = { ...mockSocket, id: 'socket-2' } as Socket;

      gateway.handleSubscribe(mockSocket as Socket, data);
      gateway.handleSubscribe(socket2, data);

      expect((gateway as any).subscriptions.get('blocks')?.size).toBe(2);
    });

    it('should normalize address to lowercase', () => {
      const address = '0x742D35CC6634C0532925A3B844BC9E7595F0BEB0';
      const data = { type: 'transactions', address };

      gateway.handleSubscribe(mockSocket as Socket, data);

      const room = `transactions:${address.toLowerCase()}`;
      expect(mockSocket.join).toHaveBeenCalledWith(room);
    });
  });

  describe('handleUnsubscribe', () => {
    it('should unsubscribe from blocks', () => {
      // First subscribe
      gateway.handleSubscribe(mockSocket as Socket, { type: 'blocks' });
      jest.clearAllMocks();

      const data = { type: 'blocks' };
      gateway.handleUnsubscribe(mockSocket as Socket, data);

      expect(mockSocket.leave).toHaveBeenCalledWith('blocks');
      expect(mockSocket.emit).toHaveBeenCalledWith('unsubscribed', {
        type: 'blocks',
        room: 'blocks',
      });
    });

    it('should unsubscribe from transactions with address', () => {
      const address = '0x742d35Cc6634C0532925a3b844Bc9e7595f0bEb0';
      // First subscribe
      gateway.handleSubscribe(mockSocket as Socket, {
        type: 'transactions',
        address,
      });
      jest.clearAllMocks();

      const data = { type: 'transactions', address };
      gateway.handleUnsubscribe(mockSocket as Socket, data);

      const room = `transactions:${address.toLowerCase()}`;
      expect(mockSocket.leave).toHaveBeenCalledWith(room);
      expect(mockSocket.emit).toHaveBeenCalledWith('unsubscribed', {
        type: 'transactions',
        room,
      });
    });

    it('should remove subscription from map when unsubscribing', () => {
      // Clear subscriptions first
      (gateway as any).subscriptions.clear();
      
      gateway.handleSubscribe(mockSocket as Socket, { type: 'blocks' });
      expect((gateway as any).subscriptions.get('blocks')?.has('test-socket-id')).toBe(true);

      gateway.handleUnsubscribe(mockSocket as Socket, { type: 'blocks' });

      // After unsubscribe, if it was the last subscriber, the room is deleted
      // Otherwise, the socket should be removed from the set
      const blocksSubscriptions = (gateway as any).subscriptions.get('blocks');
      // Since there's only one subscriber, the room should be deleted (undefined)
      // OR if it exists, the socket should not be in the set
      expect(blocksSubscriptions === undefined || !blocksSubscriptions.has('test-socket-id')).toBe(true);
    });

    it('should delete room when last subscriber leaves', () => {
      gateway.handleSubscribe(mockSocket as Socket, { type: 'blocks' });
      expect((gateway as any).subscriptions.has('blocks')).toBe(true);

      gateway.handleUnsubscribe(mockSocket as Socket, { type: 'blocks' });

      expect((gateway as any).subscriptions.has('blocks')).toBe(false);
    });

    it('should handle unsubscribe from non-existent subscription', () => {
      const data = { type: 'blocks' };

      gateway.handleUnsubscribe(mockSocket as Socket, data);

      expect(mockSocket.leave).toHaveBeenCalled();
      expect(mockSocket.emit).toHaveBeenCalledWith('unsubscribed', {
        type: 'blocks',
        room: 'blocks',
      });
    });
  });

  describe('broadcastBlock', () => {
    it('should broadcast block to blocks room', () => {
      const blockData = {
        number: 12345,
        hash: '0xabc123',
        timestamp: Date.now(),
      };

      gateway.broadcastBlock(blockData);

      expect(mockServer.to).toHaveBeenCalledWith('blocks');
      expect(mockServer.emit).toHaveBeenCalledWith('block', blockData);
    });

    it('should log broadcast with room size', () => {
      gateway.handleSubscribe(mockSocket as Socket, { type: 'blocks' });
      const blockData = { number: 12345 };

      gateway.broadcastBlock(blockData);

      expect(mockServer.emit).toHaveBeenCalled();
    });
  });

  describe('broadcastTransaction', () => {
    it('should broadcast transaction to address room', () => {
      const address = '0x742d35Cc6634C0532925a3b844Bc9e7595f0bEb0';
      const transactionData = {
        hash: '0xtx123',
        from: address,
        to: '0xrecipient',
        value: '1000000000000000000',
      };

      gateway.broadcastTransaction(address, transactionData);

      const room = `transactions:${address.toLowerCase()}`;
      expect(mockServer.to).toHaveBeenCalledWith(room);
      expect(mockServer.emit).toHaveBeenCalledWith('transaction', transactionData);
    });

    it('should normalize address to lowercase', () => {
      const address = '0x742D35CC6634C0532925A3B844BC9E7595F0BEB0';
      const transactionData = { hash: '0xtx123' };

      gateway.broadcastTransaction(address, transactionData);

      const room = `transactions:${address.toLowerCase()}`;
      expect(mockServer.to).toHaveBeenCalledWith(room);
    });
  });

  describe('broadcastTokenTransfer', () => {
    it('should broadcast token transfer to address room', () => {
      const address = '0x742d35Cc6634C0532925a3b844Bc9e7595f0bEb0';
      const transferData = {
        token: '0xtoken123',
        from: address,
        to: '0xrecipient',
        value: '1000',
      };

      gateway.broadcastTokenTransfer(address, transferData);

      const room = `token-transfers:${address.toLowerCase()}`;
      expect(mockServer.to).toHaveBeenCalledWith(room);
      expect(mockServer.emit).toHaveBeenCalledWith('token-transfer', transferData);
    });
  });

  describe('broadcastTokenUpdate', () => {
    it('should broadcast token update to token room', () => {
      const tokenAddress = '0x1234567890123456789012345678901234567890';
      const tokenData = {
        address: tokenAddress,
        totalSupply: '1000000',
        holders: 100,
      };

      gateway.broadcastTokenUpdate(tokenAddress, tokenData);

      const room = `token:${tokenAddress.toLowerCase()}`;
      expect(mockServer.to).toHaveBeenCalledWith(room);
      expect(mockServer.emit).toHaveBeenCalledWith('token-update', tokenData);
    });
  });

  describe('getStats', () => {
    it('should return connection statistics', () => {
      gateway.handleSubscribe(mockSocket as Socket, { type: 'blocks' });
      const socket2 = { ...mockSocket, id: 'socket-2' } as Socket;
      gateway.handleSubscribe(socket2, {
        type: 'transactions',
        address: '0x123',
      });

      const stats = gateway.getStats();

      expect(stats.totalConnections).toBe(2);
      expect(stats.subscriptions).toHaveProperty('blocks');
      expect(stats.subscriptions).toHaveProperty('transactions:0x123');
      expect(stats.subscriptions['blocks']).toBe(1);
      expect(stats.subscriptions['transactions:0x123']).toBe(1);
    });

    it('should return empty subscriptions when none exist', () => {
      const stats = gateway.getStats();

      expect(stats.totalConnections).toBe(2); // From mockServer setup
      expect(stats.subscriptions).toEqual({});
    });
  });

  describe('getRoomSize', () => {
    it('should return correct room size', () => {
      gateway.handleSubscribe(mockSocket as Socket, { type: 'blocks' });
      const socket2 = { ...mockSocket, id: 'socket-2' } as Socket;
      gateway.handleSubscribe(socket2, { type: 'blocks' });

      const roomSize = (gateway as any).getRoomSize('blocks');
      expect(roomSize).toBe(2);
    });

    it('should return 0 for non-existent room', () => {
      const roomSize = (gateway as any).getRoomSize('non-existent');
      expect(roomSize).toBe(0);
    });
  });

  describe('Additional Edge Cases for 100% Coverage', () => {
    it('should handle connection with empty auth object', async () => {
      mockSocket.handshake.auth = {};

      await gateway.handleConnection(mockSocket as Socket);

      expect(mockSocket.emit).toHaveBeenCalled();
      expect(mockSocket.disconnect).not.toHaveBeenCalled();
    });

    it('should handle subscribe with empty data', () => {
      const data = {};

      gateway.handleSubscribe(mockSocket as Socket, data as any);

      expect(mockSocket.emit).toHaveBeenCalledWith('error', {
        message: expect.stringContaining('Unknown subscription type'),
      });
    });

    it('should handle unsubscribe with empty data', () => {
      const data = {};

      gateway.handleUnsubscribe(mockSocket as Socket, data as any);

      expect(mockSocket.leave).toHaveBeenCalled();
      expect(mockSocket.emit).toHaveBeenCalled();
    });

    it('should handle broadcastBlock with null block data', () => {
      gateway.broadcastBlock(null as any);

      // When blockData is null, the method returns early and doesn't emit
      expect(mockServer.to).not.toHaveBeenCalled();
      expect(mockServer.emit).not.toHaveBeenCalled();
    });

    it('should handle broadcastTransaction with null transaction data', () => {
      const address = '0x742d35Cc6634C0532925a3b844Bc9e7595f0bEb0';

      gateway.broadcastTransaction(address, null as any);

      expect(mockServer.to).toHaveBeenCalled();
      expect(mockServer.emit).toHaveBeenCalled();
    });

    it('should handle broadcastTokenTransfer with null transfer data', () => {
      const address = '0x742d35Cc6634C0532925a3b844Bc9e7595f0bEb0';

      gateway.broadcastTokenTransfer(address, null as any);

      expect(mockServer.to).toHaveBeenCalled();
      expect(mockServer.emit).toHaveBeenCalled();
    });

    it('should handle broadcastTokenUpdate with null token data', () => {
      const tokenAddress = '0x1234567890123456789012345678901234567890';

      gateway.broadcastTokenUpdate(tokenAddress, null as any);

      expect(mockServer.to).toHaveBeenCalled();
      expect(mockServer.emit).toHaveBeenCalled();
    });

    it('should handle getStats with no subscriptions', () => {
      const stats = gateway.getStats();

      expect(stats.totalConnections).toBe(2);
      expect(stats.subscriptions).toEqual({});
    });

    it('should handle multiple subscriptions cleanup on disconnect', () => {
      const socket1 = { ...mockSocket, id: 'socket-1' } as Socket;
      const socket2 = { ...mockSocket, id: 'socket-2' } as Socket;

      gateway.handleSubscribe(socket1, { type: 'blocks' });
      gateway.handleSubscribe(socket1, {
        type: 'transactions',
        address: '0x123',
      });
      gateway.handleSubscribe(socket2, { type: 'blocks' });

      expect((gateway as any).subscriptions.get('blocks')?.size).toBe(2);
      expect((gateway as any).subscriptions.get('transactions:0x123')?.size).toBe(1);

      gateway.handleDisconnect(socket1);

      expect((gateway as any).subscriptions.get('blocks')?.size).toBe(1);
      expect((gateway as any).subscriptions.has('transactions:0x123')).toBe(false);
    });

    it('should handle subscribe to same room multiple times', () => {
      const data = { type: 'blocks' };

      gateway.handleSubscribe(mockSocket as Socket, data);
      gateway.handleSubscribe(mockSocket as Socket, data);

      expect((gateway as any).subscriptions.get('blocks')?.size).toBe(1);
      expect(mockSocket.join).toHaveBeenCalledTimes(2);
    });

    it('should handle unsubscribe from non-subscribed room', () => {
      const data = { type: 'blocks' };

      gateway.handleUnsubscribe(mockSocket as Socket, data);

      expect(mockSocket.leave).toHaveBeenCalled();
      expect((gateway as any).subscriptions.has('blocks')).toBe(false);
    });
  });
});

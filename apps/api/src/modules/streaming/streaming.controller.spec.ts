import { Test, TestingModule } from '@nestjs/testing';
import { StreamingController } from './streaming.controller';
import { EventEmitter2 } from '@nestjs/event-emitter';
import { Response } from 'express';
import { JwtAuthGuard } from '@/common/guards/jwt-auth.guard';

describe('StreamingController', () => {
  let controller: StreamingController;
  let eventEmitter: EventEmitter2;

  const mockEventEmitter = {
    on: jest.fn(),
    emit: jest.fn(),
  };

  const mockResponse = {
    setHeader: jest.fn(),
    write: jest.fn().mockReturnValue(true),
    end: jest.fn(),
    on: jest.fn(),
  } as unknown as Response;

  const mockRequest = {
    user: { id: 'user-123' },
    on: jest.fn((event, callback) => {
      // Store callbacks for later invocation
      if (event === 'close') {
        // Don't call immediately, allow test to control when
      }
    }),
  };

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      controllers: [StreamingController],
      providers: [
        {
          provide: EventEmitter2,
          useValue: mockEventEmitter,
        },
      ],
    })
      .overrideGuard(JwtAuthGuard)
      .useValue({ canActivate: () => true })
      .compile();

    controller = module.get<StreamingController>(StreamingController);
    eventEmitter = module.get<EventEmitter2>(EventEmitter2);
  });

  afterEach(() => {
    jest.clearAllMocks();
  });

  describe('streamEvents', () => {
    it('should set SSE headers', async () => {
      await controller.streamEvents(mockRequest as any, mockResponse, 'policy');

      expect(mockResponse.setHeader).toHaveBeenCalledWith(
        'Content-Type',
        'text/event-stream',
      );
      expect(mockResponse.setHeader).toHaveBeenCalledWith(
        'Cache-Control',
        'no-cache',
      );
      expect(mockResponse.setHeader).toHaveBeenCalledWith(
        'Connection',
        'keep-alive',
      );
      expect(mockResponse.setHeader).toHaveBeenCalledWith(
        'X-Accel-Buffering',
        'no',
      );
    });

    it('should send initial connection message', async () => {
      await controller.streamEvents(mockRequest as any, mockResponse, 'policy');

      expect(mockResponse.write).toHaveBeenCalled();
      const writeCall = (mockResponse.write as jest.Mock).mock.calls[0][0];
      expect(writeCall).toContain('connected');
      expect(writeCall).toContain('clientId');
      expect(writeCall).toContain('eventTypes');
    });

    it('should handle client disconnect', async () => {
      await controller.streamEvents(mockRequest as any, mockResponse, 'policy');

      expect(mockRequest.on).toHaveBeenCalledWith('close', expect.any(Function));
    });

    it('should filter event types', async () => {
      await controller.streamEvents(
        mockRequest as any,
        mockResponse,
        'policy,transaction',
      );

      expect(mockResponse.write).toHaveBeenCalled();
    });

    it('should use default event types when not provided', async () => {
      await controller.streamEvents(mockRequest as any, mockResponse);

      expect(mockResponse.write).toHaveBeenCalled();
      const writeCall = (mockResponse.write as jest.Mock).mock.calls[0][0];
      expect(writeCall).toContain('policy');
    });

    it('should set up heartbeat interval', async () => {
      const setIntervalSpy = jest.spyOn(global, 'setInterval').mockReturnValue(123 as any);

      await controller.streamEvents(mockRequest as any, mockResponse, 'policy');

      expect(setIntervalSpy).toHaveBeenCalledWith(expect.any(Function), 30000);
      setIntervalSpy.mockRestore();
    });

    it('should cleanup heartbeat on disconnect', async () => {
      const setIntervalSpy = jest.spyOn(global, 'setInterval').mockReturnValue(123 as any);
      const clearIntervalSpy = jest.spyOn(global, 'clearInterval').mockImplementation(() => {});

      await controller.streamEvents(mockRequest as any, mockResponse, 'policy');

      // Simulate disconnect - call all close callbacks
      const closeCallbacks = (mockRequest.on as jest.Mock).mock.calls
        .filter((call) => call[0] === 'close')
        .map((call) => call[1]);
      
      closeCallbacks.forEach((callback) => callback());

      // clearInterval should be called (at least once for the cleanup handler)
      expect(clearIntervalSpy).toHaveBeenCalled();
      setIntervalSpy.mockRestore();
      clearIntervalSpy.mockRestore();
    });
  });

  describe('broadcastToClients', () => {
    it('should broadcast events to all connected clients', () => {
      const mockClient1 = {
        write: jest.fn(),
      } as any;
      const mockClient2 = {
        write: jest.fn(),
      } as any;

      // Access private method via type assertion
      const controllerPrivate = controller as any;
      controllerPrivate.clients.set('client1', mockClient1);
      controllerPrivate.clients.set('client2', mockClient2);

      controllerPrivate.broadcastToClients('policy.check', { data: 'test' });

      expect(mockClient1.write).toHaveBeenCalled();
      expect(mockClient2.write).toHaveBeenCalled();
    });

    it('should handle write errors and remove failed clients', () => {
      const mockClient1 = {
        write: jest.fn().mockImplementation(() => {
          throw new Error('Write failed');
        }),
      } as any;
      const mockClient2 = {
        write: jest.fn(),
      } as any;

      const controllerPrivate = controller as any;
      controllerPrivate.clients.set('client1', mockClient1);
      controllerPrivate.clients.set('client2', mockClient2);

      controllerPrivate.broadcastToClients('policy.check', { data: 'test' });

      expect(controllerPrivate.clients.has('client1')).toBe(false);
      expect(controllerPrivate.clients.has('client2')).toBe(true);
    });
  });
});


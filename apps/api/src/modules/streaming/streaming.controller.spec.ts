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
      if (event === 'close') {
        setTimeout(() => callback(), 100);
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
    });

    it('should send initial connection message', async () => {
      await controller.streamEvents(mockRequest as any, mockResponse, 'policy');

      expect(mockResponse.write).toHaveBeenCalled();
      const writeCall = (mockResponse.write as jest.Mock).mock.calls[0][0];
      expect(writeCall).toContain('connected');
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
  });
});


import { Test, TestingModule } from '@nestjs/testing';
import { HealthController } from './health.controller';
import { HealthCheckService, TypeOrmHealthIndicator, MemoryHealthIndicator, DiskHealthIndicator } from '@nestjs/terminus';

describe('HealthController', () => {
  let controller: HealthController;
  let healthCheckService: jest.Mocked<HealthCheckService>;
  let db: jest.Mocked<TypeOrmHealthIndicator>;
  let memory: jest.Mocked<MemoryHealthIndicator>;
  let disk: jest.Mocked<DiskHealthIndicator>;

  beforeEach(async () => {
    const mockHealthCheckService = {
      check: jest.fn((checks) => Promise.resolve({ status: 'ok', info: {}, error: {} })),
    };

    const mockDb = {
      pingCheck: jest.fn(() => Promise.resolve({ database: { status: 'up' } })),
    };

    const mockMemory = {
      checkHeap: jest.fn(() => Promise.resolve({ 'memory_heap': { status: 'up' } })),
      checkRSS: jest.fn(() => Promise.resolve({ 'memory_rss': { status: 'up' } })),
    };

    const mockDisk = {
      checkStorage: jest.fn(() => Promise.resolve({ storage: { status: 'up' } })),
    };

    const module: TestingModule = await Test.createTestingModule({
      controllers: [HealthController],
      providers: [
        {
          provide: HealthCheckService,
          useValue: mockHealthCheckService,
        },
        {
          provide: TypeOrmHealthIndicator,
          useValue: mockDb,
        },
        {
          provide: MemoryHealthIndicator,
          useValue: mockMemory,
        },
        {
          provide: DiskHealthIndicator,
          useValue: mockDisk,
        },
      ],
    }).compile();

    controller = module.get<HealthController>(HealthController);
    healthCheckService = module.get(HealthCheckService);
    db = module.get(TypeOrmHealthIndicator);
    memory = module.get(MemoryHealthIndicator);
    disk = module.get(DiskHealthIndicator);
  });

  it('should be defined', () => {
    expect(controller).toBeDefined();
  });

  describe('check', () => {
    it('should return health status', async () => {
      const result = await controller.check();
      expect(result).toBeDefined();
      expect(result.status).toBe('ok');
      expect(healthCheckService.check).toHaveBeenCalled();
    });
  });

  describe('liveness', () => {
    it('should return liveness status', () => {
      const result = controller.liveness();
      expect(result).toEqual({ status: 'ok' });
    });
  });

  describe('readiness', () => {
    it('should return readiness status', async () => {
      const result = await controller.readiness();
      expect(result).toBeDefined();
      expect(healthCheckService.check).toHaveBeenCalled();
    });

    it('should handle database ping check', async () => {
      await controller.readiness();
      expect(healthCheckService.check).toHaveBeenCalled();
      // The pingCheck is called inside the check function passed to healthCheckService.check
      const checkCalls = healthCheckService.check.mock.calls[0][0];
      expect(checkCalls).toHaveLength(1);
      // Execute the check function to verify it calls pingCheck
      await checkCalls[0]();
      expect(db.pingCheck).toHaveBeenCalledWith('database');
    });
  });

  describe('check', () => {
    it('should check all health indicators', async () => {
      await controller.check();

      expect(healthCheckService.check).toHaveBeenCalled();
      const checkCalls = healthCheckService.check.mock.calls[0][0];
      expect(checkCalls).toHaveLength(4);
    });

    it('should handle health check errors gracefully', async () => {
      healthCheckService.check.mockRejectedValue(new Error('Health check failed'));

      await expect(controller.check()).rejects.toThrow('Health check failed');
    });
  });
});


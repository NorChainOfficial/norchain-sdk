import { Test, TestingModule } from '@nestjs/testing';
import { OrdersService } from './orders.service';
import { getRepositoryToken } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { LimitOrder } from './entities/limit-order.entity';
import { StopLossOrder } from './entities/stop-loss-order.entity';
import { DCASchedule } from './entities/dca-schedule.entity';

describe('OrdersService', () => {
  let service: OrdersService;
  let limitOrderRepository: jest.Mocked<Repository<LimitOrder>>;
  let stopLossOrderRepository: jest.Mocked<Repository<StopLossOrder>>;
  let dcaScheduleRepository: jest.Mocked<Repository<DCASchedule>>;

  beforeEach(async () => {
    const mockLimitOrderRepository = {
      create: jest.fn(),
      save: jest.fn(),
      find: jest.fn(),
      update: jest.fn(),
    };

    const mockStopLossOrderRepository = {
      create: jest.fn(),
      save: jest.fn(),
      find: jest.fn(),
    };

    const mockDCAScheduleRepository = {
      create: jest.fn(),
      save: jest.fn(),
      find: jest.fn(),
    };

    const module: TestingModule = await Test.createTestingModule({
      providers: [
        OrdersService,
        {
          provide: getRepositoryToken(LimitOrder),
          useValue: mockLimitOrderRepository,
        },
        {
          provide: getRepositoryToken(StopLossOrder),
          useValue: mockStopLossOrderRepository,
        },
        {
          provide: getRepositoryToken(DCASchedule),
          useValue: mockDCAScheduleRepository,
        },
      ],
    }).compile();

    service = module.get<OrdersService>(OrdersService);
    limitOrderRepository = module.get(getRepositoryToken(LimitOrder));
    stopLossOrderRepository = module.get(getRepositoryToken(StopLossOrder));
    dcaScheduleRepository = module.get(getRepositoryToken(DCASchedule));
  });

  afterEach(() => {
    jest.clearAllMocks();
  });

  it('should be defined', () => {
    expect(service).toBeDefined();
  });

  describe('createLimitOrder', () => {
    it('should create a limit order', async () => {
      const orderData = {
        userAddress: '0xdAC17F958D2ee523a2206206994597C13D831ec7',
        pair: 'NOR/USDT',
        side: 'buy',
        price: '0.0001',
        amount: '1000000000000000000',
      };

      const createdOrder = {
        id: '1',
        ...orderData,
        status: 'pending',
        createdAt: new Date(),
      };

      limitOrderRepository.create.mockReturnValue(createdOrder as any);
      limitOrderRepository.save.mockResolvedValue(createdOrder as any);

      const result = await service.createLimitOrder(orderData);

      expect(result).toEqual(createdOrder);
      expect(limitOrderRepository.create).toHaveBeenCalledWith(orderData);
      expect(limitOrderRepository.save).toHaveBeenCalled();
    });
  });

  describe('getLimitOrders', () => {
    it('should return limit orders for user', async () => {
      const userAddress = '0xdAC17F958D2ee523a2206206994597C13D831ec7';
      const orders = [
        {
          id: '1',
          userAddress,
          pair: 'NOR/USDT',
          side: 'buy',
          price: '0.0001',
          amount: '1000000000000000000',
          status: 'pending',
        },
      ];

      limitOrderRepository.find.mockResolvedValue(orders as any);

      const result = await service.getLimitOrders(userAddress);

      expect(result).toEqual(orders);
      expect(limitOrderRepository.find).toHaveBeenCalledWith({
        where: { userAddress },
        order: { createdAt: 'DESC' },
      });
    });
  });

  describe('cancelLimitOrder', () => {
    it('should cancel a limit order', async () => {
      const orderId = '1';
      limitOrderRepository.update.mockResolvedValue({ affected: 1 } as any);

      const result = await service.cancelLimitOrder(orderId);

      expect(result).toEqual({ success: true });
      expect(limitOrderRepository.update).toHaveBeenCalledWith(orderId, {
        status: 'cancelled',
      });
    });
  });

  describe('createStopLossOrder', () => {
    it('should create a stop-loss order', async () => {
      const orderData = {
        userAddress: '0xdAC17F958D2ee523a2206206994597C13D831ec7',
        pair: 'NOR/USDT',
        stopPrice: '0.00008',
        amount: '1000000000000000000',
      };

      const createdOrder = {
        id: '1',
        ...orderData,
        status: 'pending',
        createdAt: new Date(),
      };

      stopLossOrderRepository.create.mockReturnValue(createdOrder as any);
      stopLossOrderRepository.save.mockResolvedValue(createdOrder as any);

      const result = await service.createStopLossOrder(orderData);

      expect(result).toEqual(createdOrder);
      expect(stopLossOrderRepository.create).toHaveBeenCalledWith(orderData);
      expect(stopLossOrderRepository.save).toHaveBeenCalled();
    });
  });

  describe('getStopLossOrders', () => {
    it('should return stop-loss orders for user', async () => {
      const userAddress = '0xdAC17F958D2ee523a2206206994597C13D831ec7';
      const orders = [
        {
          id: '1',
          userAddress,
          pair: 'NOR/USDT',
          stopPrice: '0.00008',
          amount: '1000000000000000000',
          status: 'pending',
        },
      ];

      stopLossOrderRepository.find.mockResolvedValue(orders as any);

      const result = await service.getStopLossOrders(userAddress);

      expect(result).toEqual(orders);
      expect(stopLossOrderRepository.find).toHaveBeenCalledWith({
        where: { userAddress },
        order: { createdAt: 'DESC' },
      });
    });
  });

  describe('createDCASchedule', () => {
    it('should create a DCA schedule', async () => {
      const scheduleData = {
        userAddress: '0xdAC17F958D2ee523a2206206994597C13D831ec7',
        pair: 'NOR/USDT',
        amountPerExecution: '1000000000000000000',
        intervalHours: 24,
        totalExecutions: 10,
      };

      const createdSchedule = {
        id: '1',
        ...scheduleData,
        status: 'active',
        createdAt: new Date(),
      };

      dcaScheduleRepository.create.mockReturnValue(createdSchedule as any);
      dcaScheduleRepository.save.mockResolvedValue(createdSchedule as any);

      const result = await service.createDCASchedule(scheduleData);

      expect(result).toEqual(createdSchedule);
      expect(dcaScheduleRepository.create).toHaveBeenCalledWith(scheduleData);
      expect(dcaScheduleRepository.save).toHaveBeenCalled();
    });
  });

  describe('getDCASchedules', () => {
    it('should return DCA schedules for user', async () => {
      const userAddress = '0xdAC17F958D2ee523a2206206994597C13D831ec7';
      const schedules = [
        {
          id: '1',
          userAddress,
          pair: 'NOR/USDT',
          amountPerExecution: '1000000000000000000',
          intervalHours: 24,
          totalExecutions: 10,
          status: 'active',
        },
      ];

      dcaScheduleRepository.find.mockResolvedValue(schedules as any);

      const result = await service.getDCASchedules(userAddress);

      expect(result).toEqual(schedules);
      expect(dcaScheduleRepository.find).toHaveBeenCalledWith({
        where: { userAddress },
        order: { createdAt: 'DESC' },
      });
    });
  });
});


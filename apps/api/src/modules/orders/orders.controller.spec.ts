import { Test, TestingModule } from '@nestjs/testing';
import { OrdersController } from './orders.controller';
import { OrdersService } from './orders.service';
import { CreateLimitOrderDto, OrderSide } from './dto/create-limit-order.dto';

describe('OrdersController', () => {
  let controller: OrdersController;
  let service: jest.Mocked<OrdersService>;

  beforeEach(async () => {
    const mockOrdersService = {
      createLimitOrder: jest.fn(),
      getLimitOrders: jest.fn(),
      cancelLimitOrder: jest.fn(),
      createStopLossOrder: jest.fn(),
      getStopLossOrders: jest.fn(),
      createDCASchedule: jest.fn(),
      getDCASchedules: jest.fn(),
    };

    const module: TestingModule = await Test.createTestingModule({
      controllers: [OrdersController],
      providers: [
        {
          provide: OrdersService,
          useValue: mockOrdersService,
        },
      ],
    }).compile();

    controller = module.get<OrdersController>(OrdersController);
    service = module.get(OrdersService);
  });

  it('should be defined', () => {
    expect(controller).toBeDefined();
  });

  describe('createLimitOrder', () => {
    it('should create limit order', async () => {
      const dto: CreateLimitOrderDto = {
        userAddress: '0x123',
        pair: 'NOR/USDT',
        side: OrderSide.BUY,
        price: '0.0001',
        amount: '1000000000000000000',
      };
      const mockOrder = {
        id: '1',
        userAddress: dto.userAddress,
        pair: dto.pair,
        side: dto.side,
        price: dto.price,
        amount: dto.amount,
        status: 'pending',
        createdAt: new Date(),
      };
      service.createLimitOrder.mockResolvedValue(mockOrder as any);

      const result = await controller.createLimitOrder(dto);

      expect(result).toEqual(mockOrder);
      expect(service.createLimitOrder).toHaveBeenCalledWith(dto);
    });
  });

  describe('getLimitOrders', () => {
    it('should return limit orders', async () => {
      const userAddress = '0x123';
      const mockOrders = [];
      service.getLimitOrders.mockResolvedValue(mockOrders as any);

      const result = await controller.getLimitOrders(userAddress);

      expect(result).toEqual(mockOrders);
      expect(service.getLimitOrders).toHaveBeenCalledWith(userAddress);
    });
  });

  describe('cancelLimitOrder', () => {
    it('should cancel limit order', async () => {
      const id = '1';
      const mockResponse = { success: true };
      service.cancelLimitOrder.mockResolvedValue(mockResponse as any);

      const result = await controller.cancelLimitOrder(id);

      expect(result).toEqual(mockResponse);
      expect(service.cancelLimitOrder).toHaveBeenCalledWith(id);
    });
  });

  describe('createStopLossOrder', () => {
    it('should create stop-loss order', async () => {
      const dto = {
        userAddress: '0x123',
        pair: 'NOR/USDT',
        stopPrice: '0.00008',
        amount: '1000000000000000000',
      };
      const mockOrder = {
        id: '1',
        userAddress: dto.userAddress,
        pair: dto.pair,
        stopPrice: dto.stopPrice,
        amount: dto.amount,
        status: 'pending',
        createdAt: new Date(),
      };
      service.createStopLossOrder.mockResolvedValue(mockOrder as any);

      const result = await controller.createStopLossOrder(dto);

      expect(result).toEqual(mockOrder);
      expect(service.createStopLossOrder).toHaveBeenCalledWith(dto);
    });
  });

  describe('getStopLossOrders', () => {
    it('should return stop-loss orders', async () => {
      const userAddress = '0x123';
      const mockOrders = [];
      service.getStopLossOrders.mockResolvedValue(mockOrders as any);

      const result = await controller.getStopLossOrders(userAddress);

      expect(result).toEqual(mockOrders);
      expect(service.getStopLossOrders).toHaveBeenCalledWith(userAddress);
    });
  });

  describe('createDCASchedule', () => {
    it('should create DCA schedule', async () => {
      const dto = {
        userAddress: '0x123',
        pair: 'NOR/USDT',
        amountPerExecution: '1000000000000000000',
        intervalHours: 24,
        totalExecutions: 10,
      };
      const mockSchedule = {
        id: '1',
        userAddress: dto.userAddress,
        pair: dto.pair,
        amountPerExecution: dto.amountPerExecution,
        intervalHours: dto.intervalHours,
        totalExecutions: dto.totalExecutions,
        status: 'active',
        createdAt: new Date(),
      };
      service.createDCASchedule.mockResolvedValue(mockSchedule as any);

      const result = await controller.createDCASchedule(dto);

      expect(result).toEqual(mockSchedule);
      expect(service.createDCASchedule).toHaveBeenCalledWith(dto);
    });
  });

  describe('getDCASchedules', () => {
    it('should return DCA schedules', async () => {
      const userAddress = '0x123';
      const mockSchedules = [];
      service.getDCASchedules.mockResolvedValue(mockSchedules as any);

      const result = await controller.getDCASchedules(userAddress);

      expect(result).toEqual(mockSchedules);
      expect(service.getDCASchedules).toHaveBeenCalledWith(userAddress);
    });
  });
});


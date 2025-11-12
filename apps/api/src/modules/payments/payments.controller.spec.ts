import { Test, TestingModule } from '@nestjs/testing';
import { PaymentsController } from './payments.controller';
import { PaymentsService } from './payments.service';
import { JwtAuthGuard } from '@/common/guards/jwt-auth.guard';
import { CreateCouponDto } from './dto/create-coupon.dto';
import { ApplyCouponDto } from './dto/apply-coupon.dto';
import { CouponStatus, CouponType } from './entities/coupon.entity';

describe('PaymentsController', () => {
  let controller: PaymentsController;
  let service: jest.Mocked<PaymentsService>;

  const mockPaymentsService = {
    createCoupon: jest.fn(),
    getCoupons: jest.fn(),
    getCouponByCode: jest.fn(),
    applyCoupon: jest.fn(),
    updateCouponStatus: jest.fn(),
  };

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      controllers: [PaymentsController],
      providers: [
        {
          provide: PaymentsService,
          useValue: mockPaymentsService,
        },
      ],
    })
      .overrideGuard(JwtAuthGuard)
      .useValue({ canActivate: () => true })
      .compile();

    controller = module.get<PaymentsController>(PaymentsController);
    service = module.get(PaymentsService);
  });

  afterEach(() => {
    jest.clearAllMocks();
  });

  describe('createCoupon', () => {
    it('should create coupon', async () => {
      const dto: CreateCouponDto = {
        orgId: 'org-123',
        code: 'SUMMER2024',
        type: CouponType.PERCENTAGE,
        discountValue: '10.00',
      };

      const mockCoupon = {
        id: 'coupon-123',
        ...dto,
        status: CouponStatus.ACTIVE,
      };

      service.createCoupon.mockResolvedValue(mockCoupon as any);

      const result = await controller.createCoupon(
        { user: { id: 'user-123' } } as any,
        dto,
      );

      expect(result).toEqual(mockCoupon);
      expect(service.createCoupon).toHaveBeenCalledWith(dto, 'user-123');
    });
  });

  describe('getCoupons', () => {
    it('should return coupons', async () => {
      const mockCoupons = [
        {
          id: 'coupon-1',
          code: 'COUPON1',
          status: CouponStatus.ACTIVE,
        },
      ];

      service.getCoupons.mockResolvedValue(mockCoupons as any);

      const result = await controller.getCoupons(
        { user: { id: 'user-123', orgId: 'org-123' } } as any,
        'org-123',
        CouponStatus.ACTIVE,
      );

      expect(result).toEqual(mockCoupons);
      expect(service.getCoupons).toHaveBeenCalledWith(
        'org-123',
        CouponStatus.ACTIVE,
      );
    });

    it('should use user orgId when not provided', async () => {
      const mockCoupons = [];
      service.getCoupons.mockResolvedValue(mockCoupons as any);

      await controller.getCoupons(
        { user: { id: 'user-123', orgId: 'org-123' } } as any,
      );

      expect(service.getCoupons).toHaveBeenCalledWith('org-123', undefined);
    });
  });

  describe('getCouponByCode', () => {
    it('should return coupon by code', async () => {
      const mockCoupon = {
        id: 'coupon-123',
        code: 'SUMMER2024',
      };

      service.getCouponByCode.mockResolvedValue(mockCoupon as any);

      const result = await controller.getCouponByCode(
        { user: { id: 'user-123', orgId: 'org-123' } } as any,
        'SUMMER2024',
        'org-123',
      );

      expect(result).toEqual(mockCoupon);
      expect(service.getCouponByCode).toHaveBeenCalledWith(
        'SUMMER2024',
        'org-123',
      );
    });
  });

  describe('applyCoupon', () => {
    it('should apply coupon', async () => {
      const dto: ApplyCouponDto = {
        code: 'SUMMER2024',
        amount: '1.0',
      };

      const mockResult = {
        coupon: { id: 'coupon-123', code: 'SUMMER2024' },
        discountAmount: '0.1',
        finalAmount: '0.9',
        valid: true,
      };

      service.applyCoupon.mockResolvedValue(mockResult as any);

      const result = await controller.applyCoupon(
        { user: { id: 'user-123', orgId: 'org-123' } } as any,
        dto,
        'org-123',
      );

      expect(result).toEqual(mockResult);
      expect(service.applyCoupon).toHaveBeenCalledWith(dto, 'org-123');
    });
  });

  describe('updateCouponStatus', () => {
    it('should update coupon status', async () => {
      const mockCoupon = {
        id: 'coupon-123',
        status: CouponStatus.INACTIVE,
      };

      service.updateCouponStatus.mockResolvedValue(mockCoupon as any);

      const result = await controller.updateCouponStatus(
        { user: { id: 'user-123', orgId: 'org-123' } } as any,
        'coupon-123',
        CouponStatus.INACTIVE,
        'org-123',
      );

      expect(result).toEqual(mockCoupon);
      expect(service.updateCouponStatus).toHaveBeenCalledWith(
        'coupon-123',
        CouponStatus.INACTIVE,
        'org-123',
      );
    });
  });
});

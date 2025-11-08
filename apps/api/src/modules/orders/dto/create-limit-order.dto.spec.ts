import { validate } from 'class-validator';
import { CreateLimitOrderDto, OrderSide } from './create-limit-order.dto';

describe('CreateLimitOrderDto', () => {
  it('should be defined', () => {
    expect(CreateLimitOrderDto).toBeDefined();
  });

  describe('validation', () => {
    it('should pass validation with valid data', async () => {
      const dto = new CreateLimitOrderDto();
      dto.userAddress = '0x742d35Cc6634C0532925a3b844Bc9e7595f0bEb';
      dto.pair = 'NOR/USDT';
      dto.side = OrderSide.BUY;
      dto.price = '0.0001';
      dto.amount = '1000000000000000000';

      const errors = await validate(dto);
      expect(errors.length).toBe(0);
    });

    it('should pass validation with optional expiresAt', async () => {
      const dto = new CreateLimitOrderDto();
      dto.userAddress = '0x742d35Cc6634C0532925a3b844Bc9e7595f0bEb';
      dto.pair = 'NOR/USDT';
      dto.side = OrderSide.SELL;
      dto.price = '0.0001';
      dto.amount = '1000000000000000000';
      dto.expiresAt = '1735689600';

      const errors = await validate(dto);
      expect(errors.length).toBe(0);
    });

    it('should fail validation without userAddress', async () => {
      const dto = new CreateLimitOrderDto();
      dto.pair = 'NOR/USDT';
      dto.side = OrderSide.BUY;
      dto.price = '0.0001';
      dto.amount = '1000000000000000000';

      const errors = await validate(dto);
      expect(errors.length).toBeGreaterThan(0);
      expect(errors[0].property).toBe('userAddress');
    });

    it('should fail validation without pair', async () => {
      const dto = new CreateLimitOrderDto();
      dto.userAddress = '0x742d35Cc6634C0532925a3b844Bc9e7595f0bEb';
      dto.side = OrderSide.BUY;
      dto.price = '0.0001';
      dto.amount = '1000000000000000000';

      const errors = await validate(dto);
      expect(errors.length).toBeGreaterThan(0);
      expect(errors[0].property).toBe('pair');
    });

    it('should fail validation without side', async () => {
      const dto = new CreateLimitOrderDto();
      dto.userAddress = '0x742d35Cc6634C0532925a3b844Bc9e7595f0bEb';
      dto.pair = 'NOR/USDT';
      dto.price = '0.0001';
      dto.amount = '1000000000000000000';

      const errors = await validate(dto);
      expect(errors.length).toBeGreaterThan(0);
      expect(errors[0].property).toBe('side');
    });

    it('should fail validation with invalid side enum', async () => {
      const dto = new CreateLimitOrderDto();
      dto.userAddress = '0x742d35Cc6634C0532925a3b844Bc9e7595f0bEb';
      dto.pair = 'NOR/USDT';
      dto.side = 'invalid' as any;
      dto.price = '0.0001';
      dto.amount = '1000000000000000000';

      const errors = await validate(dto);
      expect(errors.length).toBeGreaterThan(0);
      expect(errors[0].property).toBe('side');
    });
  });
});


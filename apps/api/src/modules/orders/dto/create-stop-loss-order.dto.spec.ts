import { validate } from 'class-validator';
import { CreateStopLossOrderDto } from './create-stop-loss-order.dto';

describe('CreateStopLossOrderDto', () => {
  it('should be defined', () => {
    expect(CreateStopLossOrderDto).toBeDefined();
  });

  describe('validation', () => {
    it('should pass validation with valid data', async () => {
      const dto = new CreateStopLossOrderDto();
      dto.userAddress = '0x742d35Cc6634C0532925a3b844Bc9e7595f0bEb';
      dto.pair = 'NOR/USDT';
      dto.stopPrice = '0.00008';
      dto.amount = '1000000000000000000';

      const errors = await validate(dto);
      expect(errors.length).toBe(0);
    });

    it('should pass validation with optional expiresAt', async () => {
      const dto = new CreateStopLossOrderDto();
      dto.userAddress = '0x742d35Cc6634C0532925a3b844Bc9e7595f0bEb';
      dto.pair = 'NOR/USDT';
      dto.stopPrice = '0.00008';
      dto.amount = '1000000000000000000';
      dto.expiresAt = '1735689600';

      const errors = await validate(dto);
      expect(errors.length).toBe(0);
    });

    it('should fail validation without userAddress', async () => {
      const dto = new CreateStopLossOrderDto();
      dto.pair = 'NOR/USDT';
      dto.stopPrice = '0.00008';
      dto.amount = '1000000000000000000';

      const errors = await validate(dto);
      expect(errors.length).toBeGreaterThan(0);
      expect(errors[0].property).toBe('userAddress');
    });

    it('should fail validation without pair', async () => {
      const dto = new CreateStopLossOrderDto();
      dto.userAddress = '0x742d35Cc6634C0532925a3b844Bc9e7595f0bEb';
      dto.stopPrice = '0.00008';
      dto.amount = '1000000000000000000';

      const errors = await validate(dto);
      expect(errors.length).toBeGreaterThan(0);
      expect(errors[0].property).toBe('pair');
    });

    it('should fail validation without stopPrice', async () => {
      const dto = new CreateStopLossOrderDto();
      dto.userAddress = '0x742d35Cc6634C0532925a3b844Bc9e7595f0bEb';
      dto.pair = 'NOR/USDT';
      dto.amount = '1000000000000000000';

      const errors = await validate(dto);
      expect(errors.length).toBeGreaterThan(0);
      expect(errors[0].property).toBe('stopPrice');
    });
  });
});


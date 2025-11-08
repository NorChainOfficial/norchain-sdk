import { validate } from 'class-validator';
import { GetQuoteDto } from './get-quote.dto';

describe('GetQuoteDto', () => {
  it('should be defined', () => {
    expect(GetQuoteDto).toBeDefined();
  });

  describe('validation', () => {
    it('should pass validation with valid data', async () => {
      const dto = new GetQuoteDto();
      dto.tokenIn = 'NOR';
      dto.tokenOut = 'USDT';
      dto.amountIn = '1000000000000000000';

      const errors = await validate(dto);
      expect(errors.length).toBe(0);
    });

    it('should pass validation with optional chainId', async () => {
      const dto = new GetQuoteDto();
      dto.tokenIn = 'NOR';
      dto.tokenOut = 'USDT';
      dto.amountIn = '1000000000000000000';
      dto.chainId = '65001';

      const errors = await validate(dto);
      expect(errors.length).toBe(0);
    });

    it('should fail validation without tokenIn', async () => {
      const dto = new GetQuoteDto();
      dto.tokenOut = 'USDT';
      dto.amountIn = '1000000000000000000';

      const errors = await validate(dto);
      expect(errors.length).toBeGreaterThan(0);
      expect(errors[0].property).toBe('tokenIn');
    });

    it('should fail validation without tokenOut', async () => {
      const dto = new GetQuoteDto();
      dto.tokenIn = 'NOR';
      dto.amountIn = '1000000000000000000';

      const errors = await validate(dto);
      expect(errors.length).toBeGreaterThan(0);
      expect(errors[0].property).toBe('tokenOut');
    });

    it('should fail validation without amountIn', async () => {
      const dto = new GetQuoteDto();
      dto.tokenIn = 'NOR';
      dto.tokenOut = 'USDT';

      const errors = await validate(dto);
      expect(errors.length).toBeGreaterThan(0);
      expect(errors[0].property).toBe('amountIn');
    });
  });
});


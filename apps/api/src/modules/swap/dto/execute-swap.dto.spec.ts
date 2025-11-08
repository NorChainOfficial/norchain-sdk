import { validate } from 'class-validator';
import { ExecuteSwapDto } from './execute-swap.dto';

describe('ExecuteSwapDto', () => {
  it('should be defined', () => {
    expect(ExecuteSwapDto).toBeDefined();
  });

  describe('validation', () => {
    it('should pass validation with valid data', async () => {
      const dto = new ExecuteSwapDto();
      dto.quoteId = 'quote-123';
      dto.signedTx = '0x1234567890abcdef';
      dto.userAddress = '0x742d35Cc6634C0532925a3b844Bc9e7595f0bEb';

      const errors = await validate(dto);
      expect(errors.length).toBe(0);
    });

    it('should pass validation with optional chainId', async () => {
      const dto = new ExecuteSwapDto();
      dto.quoteId = 'quote-123';
      dto.signedTx = '0x1234567890abcdef';
      dto.userAddress = '0x742d35Cc6634C0532925a3b844Bc9e7595f0bEb';
      dto.chainId = '65001';

      const errors = await validate(dto);
      expect(errors.length).toBe(0);
    });

    it('should fail validation without quoteId', async () => {
      const dto = new ExecuteSwapDto();
      dto.signedTx = '0x1234567890abcdef';
      dto.userAddress = '0x742d35Cc6634C0532925a3b844Bc9e7595f0bEb';

      const errors = await validate(dto);
      expect(errors.length).toBeGreaterThan(0);
      expect(errors[0].property).toBe('quoteId');
    });

    it('should fail validation without signedTx', async () => {
      const dto = new ExecuteSwapDto();
      dto.quoteId = 'quote-123';
      dto.userAddress = '0x742d35Cc6634C0532925a3b844Bc9e7595f0bEb';

      const errors = await validate(dto);
      expect(errors.length).toBeGreaterThan(0);
      expect(errors[0].property).toBe('signedTx');
    });

    it('should fail validation without userAddress', async () => {
      const dto = new ExecuteSwapDto();
      dto.quoteId = 'quote-123';
      dto.signedTx = '0x1234567890abcdef';

      const errors = await validate(dto);
      expect(errors.length).toBeGreaterThan(0);
      expect(errors[0].property).toBe('userAddress');
    });
  });
});


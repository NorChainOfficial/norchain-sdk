import { validate } from 'class-validator';
import { plainToInstance } from 'class-transformer';
import { GetBalanceMultiDto } from './get-balance-multi.dto';

describe('GetBalanceMultiDto', () => {
  it('should be defined', () => {
    expect(GetBalanceMultiDto).toBeDefined();
  });

  describe('validation', () => {
    it('should pass validation with valid addresses array', async () => {
      const dto = plainToInstance(GetBalanceMultiDto, {
        address: [
          '0xdAC17F958D2ee523a2206206994597C13D831ec7', // USDT (valid checksum)
          '0xA0b86991c6218b36c1d19D4a2e9Eb0cE3606eB48', // USDC (valid checksum)
        ],
      });

      const errors = await validate(dto);
      expect(errors.length).toBe(0);
    });

    it('should fail validation without address array', async () => {
      const dto = plainToInstance(GetBalanceMultiDto, {});

      const errors = await validate(dto);
      expect(errors.length).toBeGreaterThan(0);
      expect(errors[0].property).toBe('address');
    });

    it('should fail validation with empty array', async () => {
      const dto = plainToInstance(GetBalanceMultiDto, {
        address: [],
      });

      const errors = await validate(dto);
      expect(errors.length).toBeGreaterThan(0);
      expect(errors[0].property).toBe('address');
    });

    it('should fail validation with more than 20 addresses', async () => {
      const dto = plainToInstance(GetBalanceMultiDto, {
        address: Array(21).fill('0xdAC17F958D2ee523a2206206994597C13D831ec7'),
      });

      const errors = await validate(dto);
      expect(errors.length).toBeGreaterThan(0);
      expect(errors[0].property).toBe('address');
    });

    it('should fail validation with invalid address in array', async () => {
      const dto = plainToInstance(GetBalanceMultiDto, {
        address: ['0xdAC17F958D2ee523a2206206994597C13D831ec7', 'invalid-address'],
      });

      const errors = await validate(dto);
      expect(errors.length).toBeGreaterThan(0);
    });
  });
});


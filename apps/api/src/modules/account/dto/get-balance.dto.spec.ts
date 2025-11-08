import { validate } from 'class-validator';
import { plainToInstance } from 'class-transformer';
import { GetBalanceDto } from './get-balance.dto';

describe('GetBalanceDto', () => {
  it('should be defined', () => {
    expect(GetBalanceDto).toBeDefined();
  });

  describe('validation', () => {
    it('should pass validation with valid Ethereum address', async () => {
      // Use a valid checksummed Ethereum address (known valid address)
      const dto = plainToInstance(GetBalanceDto, {
        address: '0xdAC17F958D2ee523a2206206994597C13D831ec7', // USDT contract address (valid checksum)
      });

      const errors = await validate(dto);
      expect(errors.length).toBe(0);
    });

    it('should fail validation without address', async () => {
      const dto = plainToInstance(GetBalanceDto, {});

      const errors = await validate(dto);
      expect(errors.length).toBeGreaterThan(0);
      expect(errors[0].property).toBe('address');
    });

    it('should fail validation with invalid Ethereum address', async () => {
      const dto = plainToInstance(GetBalanceDto, {
        address: 'invalid-address',
      });

      const errors = await validate(dto);
      expect(errors.length).toBeGreaterThan(0);
      expect(errors[0].property).toBe('address');
    });

    it('should fail validation with empty address', async () => {
      const dto = plainToInstance(GetBalanceDto, {
        address: '',
      });

      const errors = await validate(dto);
      expect(errors.length).toBeGreaterThan(0);
      expect(errors[0].property).toBe('address');
    });
  });
});


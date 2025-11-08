import { validate } from 'class-validator';
import { plainToInstance } from 'class-transformer';
import { GetInternalTransactionsDto } from './get-internal-transactions.dto';

describe('GetInternalTransactionsDto', () => {
  it('should be defined', () => {
    expect(GetInternalTransactionsDto).toBeDefined();
  });

  describe('validation', () => {
    it('should pass validation with valid data', async () => {
      const dto = plainToInstance(GetInternalTransactionsDto, {
        address: '0xdAC17F958D2ee523a2206206994597C13D831ec7',
        page: 1,
        limit: 10,
      });

      const errors = await validate(dto);
      expect(errors.length).toBe(0);
    });

    it('should pass validation with optional block range', async () => {
      const dto = plainToInstance(GetInternalTransactionsDto, {
        address: '0xdAC17F958D2ee523a2206206994597C13D831ec7',
        startblock: 0,
        endblock: 99999999,
      });

      const errors = await validate(dto);
      expect(errors.length).toBe(0);
    });

    it('should fail validation without address', async () => {
      const dto = plainToInstance(GetInternalTransactionsDto, {
        page: 1,
        limit: 10,
      });

      const errors = await validate(dto);
      expect(errors.length).toBeGreaterThan(0);
      expect(errors[0].property).toBe('address');
    });

    it('should fail validation with invalid address', async () => {
      const dto = plainToInstance(GetInternalTransactionsDto, {
        address: 'invalid-address',
        page: 1,
        limit: 10,
      });

      const errors = await validate(dto);
      expect(errors.length).toBeGreaterThan(0);
      expect(errors[0].property).toBe('address');
    });
  });
});


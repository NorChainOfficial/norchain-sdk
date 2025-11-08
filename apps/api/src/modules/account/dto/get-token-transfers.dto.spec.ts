import { validate } from 'class-validator';
import { plainToInstance } from 'class-transformer';
import { GetTokenTransfersDto } from './get-token-transfers.dto';

describe('GetTokenTransfersDto', () => {
  it('should be defined', () => {
    expect(GetTokenTransfersDto).toBeDefined();
  });

  describe('validation', () => {
    it('should pass validation with valid data', async () => {
      const dto = plainToInstance(GetTokenTransfersDto, {
        address: '0xdAC17F958D2ee523a2206206994597C13D831ec7',
        page: 1,
        limit: 10,
      });

      const errors = await validate(dto);
      expect(errors.length).toBe(0);
    });

    it('should pass validation with optional contract address', async () => {
      const dto = plainToInstance(GetTokenTransfersDto, {
        address: '0xdAC17F958D2ee523a2206206994597C13D831ec7',
        contractaddress: '0xA0b86991c6218b36c1d19D4a2e9Eb0cE3606eB48',
        page: 1,
        limit: 10,
      });

      const errors = await validate(dto);
      expect(errors.length).toBe(0);
    });

    it('should fail validation without address', async () => {
      const dto = plainToInstance(GetTokenTransfersDto, {
        page: 1,
        limit: 10,
      });

      const errors = await validate(dto);
      expect(errors.length).toBeGreaterThan(0);
      expect(errors[0].property).toBe('address');
    });

    it('should fail validation with invalid address', async () => {
      const dto = plainToInstance(GetTokenTransfersDto, {
        address: 'invalid-address',
        page: 1,
        limit: 10,
      });

      const errors = await validate(dto);
      expect(errors.length).toBeGreaterThan(0);
      expect(errors[0].property).toBe('address');
    });

    it('should fail validation with invalid contract address', async () => {
      const dto = plainToInstance(GetTokenTransfersDto, {
        address: '0xdAC17F958D2ee523a2206206994597C13D831ec7',
        contractaddress: 'invalid-address',
        page: 1,
        limit: 10,
      });

      const errors = await validate(dto);
      expect(errors.length).toBeGreaterThan(0);
    });
  });
});


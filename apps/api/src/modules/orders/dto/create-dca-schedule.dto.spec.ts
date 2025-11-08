import { validate } from 'class-validator';
import { CreateDCAScheduleDto } from './create-dca-schedule.dto';

describe('CreateDCAScheduleDto', () => {
  it('should be defined', () => {
    expect(CreateDCAScheduleDto).toBeDefined();
  });

  describe('validation', () => {
    it('should pass validation with valid data', async () => {
      const dto = new CreateDCAScheduleDto();
      dto.userAddress = '0x742d35Cc6634C0532925a3b844Bc9e7595f0bEb';
      dto.pair = 'NOR/USDT';
      dto.amountPerExecution = '1000000000000000000';
      dto.intervalHours = 24;
      dto.totalExecutions = 10;

      const errors = await validate(dto);
      expect(errors.length).toBe(0);
    });

    it('should pass validation with optional startsAt', async () => {
      const dto = new CreateDCAScheduleDto();
      dto.userAddress = '0x742d35Cc6634C0532925a3b844Bc9e7595f0bEb';
      dto.pair = 'NOR/USDT';
      dto.amountPerExecution = '1000000000000000000';
      dto.intervalHours = 24;
      dto.totalExecutions = 10;
      dto.startsAt = '1735689600';

      const errors = await validate(dto);
      expect(errors.length).toBe(0);
    });

    it('should fail validation without userAddress', async () => {
      const dto = new CreateDCAScheduleDto();
      dto.pair = 'NOR/USDT';
      dto.amountPerExecution = '1000000000000000000';
      dto.intervalHours = 24;
      dto.totalExecutions = 10;

      const errors = await validate(dto);
      expect(errors.length).toBeGreaterThan(0);
      expect(errors[0].property).toBe('userAddress');
    });

    it('should fail validation with intervalHours less than 1', async () => {
      const dto = new CreateDCAScheduleDto();
      dto.userAddress = '0x742d35Cc6634C0532925a3b844Bc9e7595f0bEb';
      dto.pair = 'NOR/USDT';
      dto.amountPerExecution = '1000000000000000000';
      dto.intervalHours = 0;
      dto.totalExecutions = 10;

      const errors = await validate(dto);
      expect(errors.length).toBeGreaterThan(0);
      expect(errors[0].property).toBe('intervalHours');
    });

    it('should fail validation with totalExecutions less than 1', async () => {
      const dto = new CreateDCAScheduleDto();
      dto.userAddress = '0x742d35Cc6634C0532925a3b844Bc9e7595f0bEb';
      dto.pair = 'NOR/USDT';
      dto.amountPerExecution = '1000000000000000000';
      dto.intervalHours = 24;
      dto.totalExecutions = 0;

      const errors = await validate(dto);
      expect(errors.length).toBeGreaterThan(0);
      expect(errors[0].property).toBe('totalExecutions');
    });
  });
});


import { Test, TestingModule } from '@nestjs/testing';
import { ValidatorService } from './validator.service';

describe('ValidatorService', () => {
  let service: ValidatorService;

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      providers: [ValidatorService],
    }).compile();

    service = module.get<ValidatorService>(ValidatorService);
  });

  it('should be defined', () => {
    expect(service).toBeDefined();
  });

  describe('getValidators', () => {
    it('should return validator set', async () => {
      const result = await service.getValidators();

      expect(result).toHaveProperty('validators');
      expect(result).toHaveProperty('count');
      expect(Array.isArray(result.validators)).toBe(true);
    });
  });
});


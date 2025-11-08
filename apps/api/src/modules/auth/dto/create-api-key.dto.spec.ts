import { validate } from 'class-validator';
import { CreateApiKeyDto } from './create-api-key.dto';

describe('CreateApiKeyDto', () => {
  it('should be defined', () => {
    expect(CreateApiKeyDto).toBeDefined();
  });

  describe('validation', () => {
    it('should pass validation with valid data', async () => {
      const dto = new CreateApiKeyDto();
      dto.name = 'Test API Key';

      const errors = await validate(dto);
      expect(errors.length).toBe(0);
    });

    it('should pass validation with all optional fields', async () => {
      const dto = new CreateApiKeyDto();
      dto.name = 'Test API Key';
      dto.description = 'Test description';
      dto.scopes = ['read', 'write'];
      dto.expiresAt = '2024-12-31T23:59:59Z';

      const errors = await validate(dto);
      expect(errors.length).toBe(0);
    });

    it('should fail validation without name', async () => {
      const dto = new CreateApiKeyDto();

      const errors = await validate(dto);
      expect(errors.length).toBeGreaterThan(0);
      expect(errors[0].property).toBe('name');
    });

    it('should pass validation with empty description (optional)', async () => {
      const dto = new CreateApiKeyDto();
      dto.name = 'Test API Key';
      dto.description = '';

      const errors = await validate(dto);
      expect(errors.length).toBe(0);
    });

    it('should pass validation with empty scopes array (optional)', async () => {
      const dto = new CreateApiKeyDto();
      dto.name = 'Test API Key';
      dto.scopes = [];

      const errors = await validate(dto);
      expect(errors.length).toBe(0);
    });
  });
});


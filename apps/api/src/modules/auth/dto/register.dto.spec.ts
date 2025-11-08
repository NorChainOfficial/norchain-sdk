import { validate } from 'class-validator';
import { RegisterDto } from './register.dto';

describe('RegisterDto', () => {
  it('should be defined', () => {
    expect(RegisterDto).toBeDefined();
  });

  describe('validation', () => {
    it('should pass validation with valid data', async () => {
      const dto = new RegisterDto();
      dto.email = 'test@example.com';
      dto.password = 'password123';
      dto.name = 'Test User';

      const errors = await validate(dto);
      expect(errors.length).toBe(0);
    });

    it('should fail validation without email', async () => {
      const dto = new RegisterDto();
      dto.password = 'password123';
      dto.name = 'Test User';

      const errors = await validate(dto);
      expect(errors.length).toBeGreaterThan(0);
      expect(errors[0].property).toBe('email');
    });

    it('should fail validation with invalid email', async () => {
      const dto = new RegisterDto();
      dto.email = 'invalid-email';
      dto.password = 'password123';
      dto.name = 'Test User';

      const errors = await validate(dto);
      expect(errors.length).toBeGreaterThan(0);
      expect(errors[0].property).toBe('email');
    });

    it('should fail validation without password', async () => {
      const dto = new RegisterDto();
      dto.email = 'test@example.com';
      dto.name = 'Test User';

      const errors = await validate(dto);
      expect(errors.length).toBeGreaterThan(0);
      expect(errors[0].property).toBe('password');
    });

    it('should fail validation with short password', async () => {
      const dto = new RegisterDto();
      dto.email = 'test@example.com';
      dto.password = '12345'; // Less than 6 characters
      dto.name = 'Test User';

      const errors = await validate(dto);
      expect(errors.length).toBeGreaterThan(0);
      expect(errors[0].property).toBe('password');
    });

    it('should pass validation without name (optional)', async () => {
      const dto = new RegisterDto();
      dto.email = 'test@example.com';
      dto.password = 'password123';

      const errors = await validate(dto);
      expect(errors.length).toBe(0);
    });

    it('should pass validation with empty name (optional)', async () => {
      const dto = new RegisterDto();
      dto.email = 'test@example.com';
      dto.password = 'password123';
      dto.name = '';

      const errors = await validate(dto);
      expect(errors.length).toBe(0);
    });
  });
});


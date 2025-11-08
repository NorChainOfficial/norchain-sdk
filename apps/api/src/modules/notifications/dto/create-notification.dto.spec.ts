import { validate } from 'class-validator';
import { CreateNotificationDto } from './create-notification.dto';

describe('CreateNotificationDto', () => {
  it('should be defined', () => {
    expect(CreateNotificationDto).toBeDefined();
  });

  describe('validation', () => {
    it('should pass validation with valid data', async () => {
      const dto = new CreateNotificationDto();
      dto.userId = 'user-123';
      dto.type = 'transaction';
      dto.title = 'Test Notification';
      dto.message = 'This is a test notification';

      const errors = await validate(dto);
      expect(errors.length).toBe(0);
    });

    it('should pass validation with optional data', async () => {
      const dto = new CreateNotificationDto();
      dto.userId = 'user-123';
      dto.type = 'transaction';
      dto.title = 'Test Notification';
      dto.message = 'This is a test notification';
      dto.data = { transactionId: 'tx-123' };

      const errors = await validate(dto);
      expect(errors.length).toBe(0);
    });

    it('should fail validation without userId', async () => {
      const dto = new CreateNotificationDto();
      dto.type = 'transaction';
      dto.title = 'Test Notification';
      dto.message = 'This is a test notification';

      const errors = await validate(dto);
      expect(errors.length).toBeGreaterThan(0);
      expect(errors[0].property).toBe('userId');
    });

    it('should fail validation without type', async () => {
      const dto = new CreateNotificationDto();
      dto.userId = 'user-123';
      dto.title = 'Test Notification';
      dto.message = 'This is a test notification';

      const errors = await validate(dto);
      expect(errors.length).toBeGreaterThan(0);
      expect(errors[0].property).toBe('type');
    });

    it('should fail validation without title', async () => {
      const dto = new CreateNotificationDto();
      dto.userId = 'user-123';
      dto.type = 'transaction';
      dto.message = 'This is a test notification';

      const errors = await validate(dto);
      expect(errors.length).toBeGreaterThan(0);
      expect(errors[0].property).toBe('title');
    });

    it('should fail validation without message', async () => {
      const dto = new CreateNotificationDto();
      dto.userId = 'user-123';
      dto.type = 'transaction';
      dto.title = 'Test Notification';

      const errors = await validate(dto);
      expect(errors.length).toBeGreaterThan(0);
      expect(errors[0].property).toBe('message');
    });
  });
});


import { validate } from 'class-validator';
import { GetBlockDto } from './get-block.dto';

describe('GetBlockDto', () => {
  it('should be defined', () => {
    expect(GetBlockDto).toBeDefined();
  });

  describe('validation', () => {
    it('should pass validation with blockno', async () => {
      const dto = new GetBlockDto();
      dto.blockno = 12345;

      const errors = await validate(dto);
      expect(errors.length).toBe(0);
    });

    it('should pass validation with tag', async () => {
      const dto = new GetBlockDto();
      dto.tag = 'latest';

      const errors = await validate(dto);
      expect(errors.length).toBe(0);
    });

    it('should pass validation with pending tag', async () => {
      const dto = new GetBlockDto();
      dto.tag = 'pending';

      const errors = await validate(dto);
      expect(errors.length).toBe(0);
    });

    it('should fail validation with negative blockno', async () => {
      const dto = new GetBlockDto();
      dto.blockno = -1;

      const errors = await validate(dto);
      expect(errors.length).toBeGreaterThan(0);
      expect(errors[0].property).toBe('blockno');
    });

    it('should pass validation without blockno or tag (both optional)', async () => {
      const dto = new GetBlockDto();

      const errors = await validate(dto);
      // Both are optional, so validation should pass
      expect(errors.length).toBe(0);
    });
  });
});


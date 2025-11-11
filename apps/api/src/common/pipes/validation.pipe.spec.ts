import { ArgumentMetadata, BadRequestException } from '@nestjs/common';
import { ValidationPipe } from './validation.pipe';
import { IsString, IsEmail, MinLength } from 'class-validator';

class TestDto {
  @IsString()
  @MinLength(3)
  name: string;

  @IsEmail()
  email: string;
}

describe('ValidationPipe', () => {
  let pipe: ValidationPipe;

  beforeEach(() => {
    pipe = new ValidationPipe();
  });

  it('should be defined', () => {
    expect(pipe).toBeDefined();
  });

  describe('transform', () => {
    it('should pass through value for non-class types', async () => {
      const metadata: ArgumentMetadata = {
        type: 'query',
        metatype: String,
      };

      const result = await pipe.transform('test', metadata);

      expect(result).toBe('test');
    });

    it('should validate and return valid DTO', async () => {
      const metadata: ArgumentMetadata = {
        type: 'body',
        metatype: TestDto,
      };

      const validData = {
        name: 'John Doe',
        email: 'john@example.com',
      };

      const result = await pipe.transform(validData, metadata);

      expect(result).toEqual(validData);
    });

    it('should throw BadRequestException for invalid DTO', async () => {
      const metadata: ArgumentMetadata = {
        type: 'body',
        metatype: TestDto,
      };

      const invalidData = {
        name: 'Jo', // Too short
        email: 'invalid-email', // Invalid email
      };

      await expect(pipe.transform(invalidData, metadata)).rejects.toThrow(
        BadRequestException,
      );
    });

    it('should throw BadRequestException with validation messages', async () => {
      const metadata: ArgumentMetadata = {
        type: 'body',
        metatype: TestDto,
      };

      const invalidData = {
        name: 'Jo',
        email: 'invalid',
      };

      try {
        await pipe.transform(invalidData, metadata);
      } catch (error) {
        expect(error).toBeInstanceOf(BadRequestException);
        expect(error.message).toContain('name');
        expect(error.message).toContain('email');
      }
    });

    it('should skip validation for primitive types', async () => {
      const stringMetadata: ArgumentMetadata = {
        type: 'query',
        metatype: String,
      };
      expect(await pipe.transform('test', stringMetadata)).toBe('test');

      const numberMetadata: ArgumentMetadata = {
        type: 'query',
        metatype: Number,
      };
      expect(await pipe.transform(123, numberMetadata)).toBe(123);

      const booleanMetadata: ArgumentMetadata = {
        type: 'query',
        metatype: Boolean,
      };
      expect(await pipe.transform(true, booleanMetadata)).toBe(true);
    });

    it('should handle undefined metatype', async () => {
      const metadata: ArgumentMetadata = {
        type: 'query',
        metatype: undefined,
      };

      const result = await pipe.transform('test', metadata);

      expect(result).toBe('test');
    });
  });
});


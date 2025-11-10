import { ApiProperty } from '@nestjs/swagger';
import { IsOptional, IsInt, Min, Max, IsString } from 'class-validator';
import { Type } from 'class-transformer';

export class PaginationDto {
  @ApiProperty({
    example: 50,
    description: 'Number of items per page',
    minimum: 1,
    maximum: 100,
    required: false,
    default: 50,
  })
  @IsOptional()
  @Type(() => Number)
  @IsInt()
  @Min(1)
  @Max(100)
  limit?: number = 50;

  @ApiProperty({
    example: 0,
    description: 'Number of items to skip',
    minimum: 0,
    required: false,
    default: 0,
  })
  @IsOptional()
  @Type(() => Number)
  @IsInt()
  @Min(0)
  offset?: number = 0;

  @ApiProperty({
    example: 'eyJpZCI6IjEyMzQ1In0=',
    description: 'Cursor for pagination (base64 encoded)',
    required: false,
  })
  @IsOptional()
  @IsString()
  cursor?: string;
}

export class PaginatedResponseDto<T> {
  @ApiProperty({ description: 'Array of items' })
  data: T[];

  @ApiProperty({ example: 100, description: 'Total number of items' })
  total: number;

  @ApiProperty({ example: 50, description: 'Number of items per page' })
  limit: number;

  @ApiProperty({ example: 0, description: 'Number of items skipped' })
  offset: number;

  @ApiProperty({
    example: 'eyJpZCI6IjEyMzQ1In0=',
    description: 'Next cursor for pagination',
    required: false,
  })
  nextCursor?: string;

  @ApiProperty({ example: true, description: 'Whether there are more items' })
  hasMore: boolean;
}

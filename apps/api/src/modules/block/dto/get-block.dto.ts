import { IsOptional, IsInt, Min, IsString, IsIn } from 'class-validator';
import { Type } from 'class-transformer';
import { ApiProperty } from '@nestjs/swagger';

export class GetBlockDto {
  @ApiProperty({
    example: 12345,
    description: 'Block number or "latest" or "pending"',
    required: false,
  })
  @IsOptional()
  @IsString()
  tag?: string;

  @ApiProperty({ example: 12345, required: false })
  @IsOptional()
  @Type(() => Number)
  @IsInt()
  @Min(0)
  blockno?: number;
}

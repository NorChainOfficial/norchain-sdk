import { IsString, IsNotEmpty, IsOptional } from 'class-validator';
import { ApiProperty, ApiPropertyOptional } from '@nestjs/swagger';

export class AddCaseNoteDto {
  @ApiProperty({
    description: 'Note content',
  })
  @IsString()
  @IsNotEmpty()
  note: string;

  @ApiPropertyOptional({
    description: 'Note type (e.g., "comment", "investigation", "resolution")',
    default: 'comment',
  })
  @IsOptional()
  @IsString()
  type?: string;
}

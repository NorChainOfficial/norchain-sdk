import { ApiProperty } from '@nestjs/swagger';
import { IsString, IsOptional, MaxLength } from 'class-validator';

export class UploadMediaDto {
  @ApiProperty({
    example: 'image/png',
    description: 'Media MIME type',
  })
  @IsString()
  contentType: string;

  @ApiProperty({
    example: 'profile-picture',
    description: 'Media kind',
    required: false,
  })
  @IsOptional()
  @IsString()
  @MaxLength(100)
  kind?: string;
}


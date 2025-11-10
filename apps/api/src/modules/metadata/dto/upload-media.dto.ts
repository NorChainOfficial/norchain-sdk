import { ApiProperty } from '@nestjs/swagger';
import { IsEnum, IsOptional } from 'class-validator';

export enum MediaKind {
  LOGO = 'logo',
  BANNER = 'banner',
}

export class UploadMediaDto {
  @ApiProperty({ enum: MediaKind })
  @IsEnum(MediaKind)
  kind: MediaKind;
}

import { ApiProperty } from '@nestjs/swagger';
import { IsUUID, IsString, MaxLength } from 'class-validator';

export class AddReactionDto {
  @ApiProperty({
    example: 'm_01J...',
    description: 'Message ID',
  })
  @IsUUID()
  messageId: string;

  @ApiProperty({
    example: '👍',
    description: 'Emoji reaction',
  })
  @IsString()
  @MaxLength(50)
  emoji: string;
}

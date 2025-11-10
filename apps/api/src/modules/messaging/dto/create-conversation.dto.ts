import { ApiProperty } from '@nestjs/swagger';
import {
  IsString,
  IsEnum,
  IsArray,
  IsOptional,
  MaxLength,
  ArrayMinSize,
} from 'class-validator';
import { ConversationKind } from '../entities/conversation.entity';

export class CreateConversationDto {
  @ApiProperty({
    example: ConversationKind.P2P,
    enum: ConversationKind,
    description: 'Conversation type',
  })
  @IsEnum(ConversationKind)
  kind: ConversationKind;

  @ApiProperty({
    example: ['did:pkh:eip155:65001:0x...'],
    description: 'Array of member DIDs',
  })
  @IsArray()
  @ArrayMinSize(1)
  @IsString({ each: true })
  members: string[];

  @ApiProperty({
    example: 'Project Discussion',
    description: 'Conversation name (for groups/channels)',
    required: false,
  })
  @IsOptional()
  @IsString()
  @MaxLength(255)
  name?: string;

  @ApiProperty({
    example: 'Discussion about the project',
    description: 'Conversation description',
    required: false,
  })
  @IsOptional()
  @IsString()
  description?: string;

  @ApiProperty({
    example: { projectId: 'proj_123' },
    description: 'Additional metadata',
    required: false,
  })
  @IsOptional()
  metadata?: Record<string, any>;
}


import { ApiProperty } from '@nestjs/swagger';
import { IsString, IsUUID, IsOptional, MaxLength } from 'class-validator';

export class SendMessageDto {
  @ApiProperty({
    example: 'c_01J...',
    description: 'Conversation ID',
  })
  @IsUUID()
  conversationId: string;

  @ApiProperty({
    example: 'base64:encrypted_message_data',
    description: 'Encrypted message (client-side encrypted)',
  })
  @IsString()
  cipherText: string;

  @ApiProperty({
    example: 'https://storage.example.com/media/encrypted_file',
    description: 'Reference to encrypted media file',
    required: false,
  })
  @IsOptional()
  @IsString()
  @MaxLength(500)
  mediaRef?: string;

  @ApiProperty({
    example: 'uuid-nonce',
    description: 'Client-provided nonce for idempotency',
    required: false,
  })
  @IsOptional()
  @IsUUID()
  clientNonce?: string;

  @ApiProperty({
    example: { replyTo: 'm_01J...' },
    description: 'Additional metadata',
    required: false,
  })
  @IsOptional()
  metadata?: Record<string, any>;
}


import { IsString, IsNotEmpty, IsOptional, IsObject } from 'class-validator';
import { ApiProperty } from '@nestjs/swagger';

export class ChatDto {
  @ApiProperty({ description: 'Question to ask the AI chatbot' })
  @IsString()
  @IsNotEmpty()
  question: string;

  @ApiProperty({ description: 'Optional context for the question', required: false })
  @IsOptional()
  @IsObject()
  context?: any;
}


import { ApiProperty } from '@nestjs/swagger';
import { IsString, IsUrl, IsArray, IsEnum } from 'class-validator';
import { WebhookEventType } from '../entities/webhook-subscription.entity';

export class CreateWebhookDto {
  @ApiProperty({
    example: 'https://example.com/webhook',
    description: 'Webhook URL',
  })
  @IsUrl()
  url: string;

  @ApiProperty({
    example: ['transaction.mined', 'swap.executed'],
    description: 'Events to subscribe to',
    enum: WebhookEventType,
    isArray: true,
  })
  @IsArray()
  @IsEnum(WebhookEventType, { each: true })
  events: WebhookEventType[];
}


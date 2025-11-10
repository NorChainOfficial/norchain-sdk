import {
  Controller,
  Get,
  Post,
  Body,
  Param,
  Query,
  UseGuards,
  Request,
  ParseIntPipe,
  DefaultValuePipe,
} from '@nestjs/common';
import {
  ApiTags,
  ApiOperation,
  ApiResponse,
  ApiBearerAuth,
  ApiParam,
  ApiQuery,
} from '@nestjs/swagger';
import { WebhooksService } from './webhooks.service';
import { JwtAuthGuard } from '@/common/guards/jwt-auth.guard';
import { CreateWebhookDto } from './dto/create-webhook.dto';
import { ErrorResponseDto } from '@/common/dto/error-response.dto';

@ApiTags('Webhooks')
@Controller('webhooks')
@UseGuards(JwtAuthGuard)
@ApiBearerAuth('JWT-auth')
export class WebhooksController {
  constructor(private readonly webhooksService: WebhooksService) {}

  @Post()
  @ApiOperation({ summary: 'Create a webhook subscription' })
  @ApiResponse({
    status: 201,
    description: 'Webhook created successfully',
  })
  @ApiResponse({
    status: 400,
    description: 'Bad Request',
    type: ErrorResponseDto,
  })
  async createWebhook(@Request() req: any, @Body() dto: CreateWebhookDto) {
    return this.webhooksService.createWebhook(req.user.id, dto);
  }

  @Get()
  @ApiOperation({ summary: 'Get all webhook subscriptions' })
  @ApiResponse({
    status: 200,
    description: 'Webhooks retrieved successfully',
  })
  async getWebhooks(@Request() req: any) {
    return this.webhooksService.getWebhooks(req.user.id);
  }

  @Get(':id/deliveries')
  @ApiOperation({ summary: 'Get webhook delivery history' })
  @ApiParam({ name: 'id', description: 'Webhook ID' })
  @ApiQuery({ name: 'limit', required: false, type: Number })
  @ApiQuery({ name: 'offset', required: false, type: Number })
  @ApiResponse({
    status: 200,
    description: 'Deliveries retrieved successfully',
  })
  async getDeliveries(
    @Request() req: any,
    @Param('id') webhookId: string,
    @Query('limit', new DefaultValuePipe(50), ParseIntPipe) limit: number,
    @Query('offset', new DefaultValuePipe(0), ParseIntPipe) offset: number,
  ) {
    return this.webhooksService.getDeliveries(
      req.user.id,
      webhookId,
      limit,
      offset,
    );
  }
}

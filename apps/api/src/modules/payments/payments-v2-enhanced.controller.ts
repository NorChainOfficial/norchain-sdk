import {
  Controller,
  Post,
  Get,
  Body,
  Param,
  UseGuards,
  Request,
  ParseUUIDPipe,
} from '@nestjs/common';
import {
  ApiTags,
  ApiOperation,
  ApiResponse,
  ApiBearerAuth,
  ApiHeader,
} from '@nestjs/swagger';
import { PaymentsV2EnhancedService } from './payments-v2-enhanced.service';
import { CreateProductDto } from './dto/create-product.dto';
import { CreatePriceDto } from './dto/create-price.dto';
import { CreateCustomerDto } from './dto/create-customer.dto';
import { CreateSubscriptionDto } from './dto/create-subscription.dto';
import { CreateDisputeDto } from './dto/create-dispute.dto';
import { CreateCheckoutSessionV2Dto } from './dto/create-checkout-session-v2.dto';
import { JwtAuthGuard } from '@/common/guards/jwt-auth.guard';
import { Idempotent } from '@/common/decorators/idempotency.decorator';

@ApiTags('Payments')
@Controller('v2')
@UseGuards(JwtAuthGuard)
@ApiBearerAuth('JWT-auth')
export class PaymentsV2EnhancedController {
  constructor(private readonly paymentsV2EnhancedService: PaymentsV2EnhancedService) {}

  @Post('products')
  @Idempotent()
  @ApiOperation({ summary: 'Create a product' })
  @ApiHeader({
    name: 'Idempotency-Key',
    description: 'Idempotency key for safe retries',
    required: true,
  })
  @ApiResponse({ status: 201, description: 'Product created successfully' })
  async createProduct(@Request() req: any, @Body() dto: CreateProductDto) {
    return this.paymentsV2EnhancedService.createProduct(dto, req.user.id);
  }

  @Post('prices')
  @Idempotent()
  @ApiOperation({ summary: 'Create a price for a product' })
  @ApiHeader({
    name: 'Idempotency-Key',
    description: 'Idempotency key for safe retries',
    required: true,
  })
  @ApiResponse({ status: 201, description: 'Price created successfully' })
  async createPrice(@Request() req: any, @Body() dto: CreatePriceDto) {
    return this.paymentsV2EnhancedService.createPrice(dto, req.user.id);
  }

  @Get('catalog')
  @ApiOperation({ summary: 'Get product catalog with prices' })
  @ApiResponse({ status: 200, description: 'Catalog retrieved successfully' })
  async getCatalog(@Request() req: any, @Param('orgId') orgId?: string) {
    const targetOrgId = orgId || req.user.orgId || req.user.id;
    return this.paymentsV2EnhancedService.getCatalog(targetOrgId);
  }

  @Post('customers')
  @Idempotent()
  @ApiOperation({ summary: 'Create a customer' })
  @ApiHeader({
    name: 'Idempotency-Key',
    description: 'Idempotency key for safe retries',
    required: true,
  })
  @ApiResponse({ status: 201, description: 'Customer created successfully' })
  async createCustomer(@Request() req: any, @Body() dto: CreateCustomerDto) {
    return this.paymentsV2EnhancedService.createCustomer(dto, req.user.id);
  }

  @Post('payments/checkout-sessions')
  @Idempotent()
  @ApiOperation({
    summary: 'Create a checkout session with line items',
    description: 'Creates a hosted checkout session for products/prices',
  })
  @ApiHeader({
    name: 'Idempotency-Key',
    description: 'Idempotency key for safe retries',
    required: true,
  })
  @ApiResponse({ status: 201, description: 'Checkout session created successfully' })
  async createCheckoutSessionV2(@Request() req: any, @Body() dto: CreateCheckoutSessionV2Dto) {
    return this.paymentsV2EnhancedService.createCheckoutSessionV2(dto, req.user.id);
  }

  @Post('subscriptions')
  @Idempotent()
  @ApiOperation({ summary: 'Create a subscription' })
  @ApiHeader({
    name: 'Idempotency-Key',
    description: 'Idempotency key for safe retries',
    required: true,
  })
  @ApiResponse({ status: 201, description: 'Subscription created successfully' })
  async createSubscription(@Request() req: any, @Body() dto: CreateSubscriptionDto) {
    return this.paymentsV2EnhancedService.createSubscription(dto, req.user.id);
  }

  @Post('subscriptions/:id/cancel')
  @Idempotent()
  @ApiOperation({ summary: 'Cancel a subscription' })
  @ApiHeader({
    name: 'Idempotency-Key',
    description: 'Idempotency key for safe retries',
    required: true,
  })
  @ApiResponse({ status: 200, description: 'Subscription canceled successfully' })
  async cancelSubscription(@Request() req: any, @Param('id', ParseUUIDPipe) id: string) {
    return this.paymentsV2EnhancedService.cancelSubscription(id, req.user.id);
  }

  @Post('disputes')
  @Idempotent()
  @ApiOperation({ summary: 'Create a dispute for a payment' })
  @ApiHeader({
    name: 'Idempotency-Key',
    description: 'Idempotency key for safe retries',
    required: true,
  })
  @ApiResponse({ status: 201, description: 'Dispute created successfully' })
  async createDispute(@Request() req: any, @Body() dto: CreateDisputeDto) {
    return this.paymentsV2EnhancedService.createDispute(dto, req.user.id);
  }

  @Post('webhooks')
  @Idempotent()
  @ApiOperation({ summary: 'Register a webhook endpoint' })
  @ApiHeader({
    name: 'Idempotency-Key',
    description: 'Idempotency key for safe retries',
    required: true,
  })
  @ApiResponse({ status: 201, description: 'Webhook endpoint registered successfully' })
  async registerWebhook(
    @Request() req: any,
    @Body() dto: { orgId: string; url: string; events: string[] },
  ) {
    return this.paymentsV2EnhancedService.registerWebhook(
      dto.orgId,
      dto.url,
      dto.events,
      req.user.id,
    );
  }
}


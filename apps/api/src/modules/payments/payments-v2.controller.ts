import {
  Controller,
  Post,
  Get,
  Body,
  Param,
  UseGuards,
  Request,
  Headers,
  ParseUUIDPipe,
} from '@nestjs/common';
import {
  ApiTags,
  ApiOperation,
  ApiResponse,
  ApiBearerAuth,
  ApiHeader,
} from '@nestjs/swagger';
import { PaymentsV2Service } from './payments-v2.service';
import { CreateCheckoutSessionDto } from './dto/create-checkout-session.dto';
import { CreateRefundDto } from './dto/create-refund.dto';
import { OnboardMerchantDto } from './dto/onboard-merchant.dto';
import { JwtAuthGuard } from '@/common/guards/jwt-auth.guard';
import { Idempotent } from '@/common/decorators/idempotency.decorator';

@ApiTags('Payments')
@Controller('v2/payments')
@UseGuards(JwtAuthGuard)
@ApiBearerAuth('JWT-auth')
export class PaymentsV2Controller {
  constructor(private readonly paymentsV2Service: PaymentsV2Service) {}

  @Post('merchants')
  @Idempotent()
  @ApiOperation({ summary: 'Onboard a merchant' })
  @ApiHeader({
    name: 'Idempotency-Key',
    description: 'Idempotency key for safe retries',
    required: true,
  })
  @ApiResponse({ status: 201, description: 'Merchant onboarded successfully' })
  @ApiResponse({ status: 400, description: 'Merchant already onboarded' })
  async onboardMerchant(@Request() req: any, @Body() dto: OnboardMerchantDto) {
    return this.paymentsV2Service.onboardMerchant(req.user.orgId || req.user.id, req.user.id, dto);
  }

  @Post('checkout-sessions')
  @Idempotent()
  @ApiOperation({
    summary: 'Create a checkout session',
    description: 'Creates a hosted checkout session for crypto payments',
  })
  @ApiHeader({
    name: 'Idempotency-Key',
    description: 'Idempotency key for safe retries',
    required: true,
  })
  @ApiResponse({ status: 201, description: 'Checkout session created successfully' })
  @ApiResponse({ status: 404, description: 'Merchant not found' })
  async createCheckoutSession(@Request() req: any, @Body() dto: CreateCheckoutSessionDto) {
    return this.paymentsV2Service.createCheckoutSession(dto, req.user.id);
  }

  @Get('checkout-sessions/:sessionId')
  @ApiOperation({ summary: 'Get checkout session status' })
  @ApiResponse({ status: 200, description: 'Checkout session retrieved successfully' })
  @ApiResponse({ status: 404, description: 'Checkout session not found' })
  async getCheckoutSession(@Param('sessionId') sessionId: string) {
    return this.paymentsV2Service.getCheckoutSession(sessionId);
  }

  @Post('refunds')
  @Idempotent()
  @ApiOperation({
    summary: 'Create a refund',
    description: 'Creates a refund for a payment (sends on-chain transaction)',
  })
  @ApiHeader({
    name: 'Idempotency-Key',
    description: 'Idempotency key for safe retries',
    required: true,
  })
  @ApiResponse({ status: 201, description: 'Refund created successfully' })
  @ApiResponse({ status: 400, description: 'Invalid refund amount' })
  @ApiResponse({ status: 403, description: 'Refund blocked by policy' })
  @ApiResponse({ status: 404, description: 'Payment not found' })
  async createRefund(@Request() req: any, @Body() dto: CreateRefundDto) {
    return this.paymentsV2Service.createRefund(dto, req.user.id);
  }
}


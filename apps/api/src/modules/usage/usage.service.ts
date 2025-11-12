import {
  Injectable,
  Logger,
  BadRequestException,
  NotFoundException,
} from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository, Between, LessThanOrEqual, MoreThanOrEqual } from 'typeorm';
import { ApiUsage, UsageType } from './entities/api-usage.entity';
import {
  UsageBilling,
  BillingPeriod,
  BillingStatus,
} from './entities/usage-billing.entity';
import { GetUsageAnalyticsDto } from './dto/get-usage-analytics.dto';
import { EventEmitter2 } from '@nestjs/event-emitter';

/**
 * Pricing tiers (cost per 1000 API calls in NOR)
 */
const PRICING_TIERS = {
  free: {
    baseCost: '0',
    apiCallCost: '0.0001', // 0.0001 NOR per 1000 calls
    rpcCallCost: '0.00005',
    streamingCost: '0.001', // per minute
    webhookCost: '0.0002',
    monthlyLimit: 10000, // free tier limit
  },
  pro: {
    baseCost: '10', // 10 NOR/month
    apiCallCost: '0.00005', // 50% discount
    rpcCallCost: '0.000025',
    streamingCost: '0.0005',
    webhookCost: '0.0001',
    monthlyLimit: 1000000,
  },
  enterprise: {
    baseCost: '100', // 100 NOR/month
    apiCallCost: '0.00001', // 90% discount
    rpcCallCost: '0.000005',
    streamingCost: '0.0001',
    webhookCost: '0.00005',
    monthlyLimit: -1, // unlimited
  },
};

@Injectable()
export class UsageService {
  private readonly logger = new Logger(UsageService.name);

  constructor(
    @InjectRepository(ApiUsage)
    private readonly usageRepository: Repository<ApiUsage>,
    @InjectRepository(UsageBilling)
    private readonly billingRepository: Repository<UsageBilling>,
    private readonly eventEmitter: EventEmitter2,
  ) {}

  /**
   * Record API usage
   */
  async recordUsage(
    userId: string,
    endpoint: string,
    method: string,
    type: UsageType = UsageType.API_CALL,
    options?: {
      apiKeyId?: string;
      statusCode?: number;
      responseTime?: number;
      count?: number;
      tier?: string;
      metadata?: Record<string, any>;
    },
  ): Promise<ApiUsage> {
    const tier = options?.tier || 'free';
    const count = options?.count || 1;
    const cost = this.calculateCost(type, count, tier);

    const usage = this.usageRepository.create({
      userId,
      apiKeyId: options?.apiKeyId,
      endpoint,
      method,
      type,
      count,
      statusCode: options?.statusCode,
      responseTime: options?.responseTime,
      cost,
      tier,
      metadata: options?.metadata,
      timestamp: new Date(),
    });

    const saved = await this.usageRepository.save(usage);

    // Emit usage event for real-time analytics
    this.eventEmitter.emit('usage.recorded', {
      userId,
      endpoint,
      type,
      cost,
      timestamp: saved.timestamp,
    });

    return saved;
  }

  /**
   * Calculate cost based on usage type and tier
   */
  private calculateCost(
    type: UsageType,
    count: number,
    tier: string = 'free',
  ): string {
    const pricing =
      PRICING_TIERS[tier as keyof typeof PRICING_TIERS] || PRICING_TIERS.free;

    let unitCost = '0';
    switch (type) {
      case UsageType.API_CALL:
        unitCost = pricing.apiCallCost;
        break;
      case UsageType.RPC_CALL:
        unitCost = pricing.rpcCallCost;
        break;
      case UsageType.STREAMING_CONNECTION:
        unitCost = pricing.streamingCost;
        break;
      case UsageType.WEBHOOK_DELIVERY:
        unitCost = pricing.webhookCost;
        break;
    }

    // Cost = (unit cost / 1000) * count
    const cost = (parseFloat(unitCost) / 1000) * count;
    return cost.toFixed(6);
  }

  /**
   * Get usage analytics for a user
   */
  async getUsageAnalytics(
    userId: string,
    dto: GetUsageAnalyticsDto,
  ): Promise<{
    totalCalls: number;
    totalRpcCalls: number;
    totalStreamingMinutes: number;
    totalWebhookDeliveries: number;
    totalCost: string;
    byEndpoint: Array<{ endpoint: string; calls: number; cost: string }>;
    byDay?: Array<{ date: string; calls: number; cost: string }>;
    byApiKey?: Array<{ apiKeyId: string; calls: number; cost: string }>;
  }> {
    const startDate = dto.startDate
      ? new Date(dto.startDate)
      : new Date(Date.now() - 30 * 24 * 60 * 60 * 1000); // Default: last 30 days
    const endDate = dto.endDate ? new Date(dto.endDate) : new Date();

    const where: any = {
      userId,
      timestamp: Between(startDate, endDate),
    };

    if (dto.apiKeyId) {
      where.apiKeyId = dto.apiKeyId;
    }

    if (dto.endpoint) {
      where.endpoint = dto.endpoint;
    }

    const usage = await this.usageRepository.find({ where });

    // Aggregate totals
    const totals = usage.reduce(
      (acc, u) => {
        acc.totalCalls += u.type === UsageType.API_CALL ? u.count : 0;
        acc.totalRpcCalls += u.type === UsageType.RPC_CALL ? u.count : 0;
        acc.totalStreamingMinutes +=
          u.type === UsageType.STREAMING_CONNECTION ? u.count : 0;
        acc.totalWebhookDeliveries +=
          u.type === UsageType.WEBHOOK_DELIVERY ? u.count : 0;
        acc.totalCost += parseFloat(u.cost);
        return acc;
      },
      {
        totalCalls: 0,
        totalRpcCalls: 0,
        totalStreamingMinutes: 0,
        totalWebhookDeliveries: 0,
        totalCost: 0,
      },
    );

    // Group by endpoint
    const byEndpointMap = new Map<string, { calls: number; cost: number }>();
    usage.forEach((u) => {
      if (u.type === UsageType.API_CALL) {
        const existing = byEndpointMap.get(u.endpoint) || { calls: 0, cost: 0 };
        byEndpointMap.set(u.endpoint, {
          calls: existing.calls + u.count,
          cost: existing.cost + parseFloat(u.cost),
        });
      }
    });

    const byEndpoint = Array.from(byEndpointMap.entries())
      .map(([endpoint, data]) => ({
        endpoint,
        calls: data.calls,
        cost: data.cost.toFixed(6),
      }))
      .sort((a, b) => b.calls - a.calls);

    // Group by day if requested
    let byDay: Array<{ date: string; calls: number; cost: string }> | undefined;
    if (dto.groupBy === BillingPeriod.DAILY) {
      const byDayMap = new Map<string, { calls: number; cost: number }>();
      usage.forEach((u) => {
        const date = u.timestamp.toISOString().split('T')[0];
        const existing = byDayMap.get(date) || { calls: 0, cost: 0 };
        byDayMap.set(date, {
          calls: existing.calls + u.count,
          cost: existing.cost + parseFloat(u.cost),
        });
      });

      byDay = Array.from(byDayMap.entries())
        .map(([date, data]) => ({
          date,
          calls: data.calls,
          cost: data.cost.toFixed(6),
        }))
        .sort((a, b) => a.date.localeCompare(b.date));
    }

    // Group by API key if requested
    let byApiKey:
      | Array<{ apiKeyId: string; calls: number; cost: string }>
      | undefined;
    if (dto.apiKeyId) {
      const byApiKeyMap = new Map<string, { calls: number; cost: number }>();
      usage.forEach((u) => {
        if (u.apiKeyId) {
          const existing = byApiKeyMap.get(u.apiKeyId) || { calls: 0, cost: 0 };
          byApiKeyMap.set(u.apiKeyId, {
            calls: existing.calls + u.count,
            cost: existing.cost + parseFloat(u.cost),
          });
        }
      });

      byApiKey = Array.from(byApiKeyMap.entries())
        .map(([apiKeyId, data]) => ({
          apiKeyId,
          calls: data.calls,
          cost: data.cost.toFixed(6),
        }))
        .sort((a, b) => b.calls - a.calls);
    }

    return {
      totalCalls: totals.totalCalls,
      totalRpcCalls: totals.totalRpcCalls,
      totalStreamingMinutes: totals.totalStreamingMinutes,
      totalWebhookDeliveries: totals.totalWebhookDeliveries,
      totalCost: totals.totalCost.toFixed(6),
      byEndpoint,
      byDay,
      byApiKey,
    };
  }

  /**
   * Generate billing for a period
   */
  async generateBilling(
    userId: string,
    period: BillingPeriod = BillingPeriod.MONTHLY,
    periodStart?: Date,
  ): Promise<UsageBilling> {
    // Determine period dates
    const now = new Date();
    let start: Date;
    let end: Date;

    if (periodStart) {
      start = periodStart;
    } else {
      // Default to start of current period
      start = new Date(now.getFullYear(), now.getMonth(), 1);
    }

    switch (period) {
      case BillingPeriod.HOURLY:
        end = new Date(start.getTime() + 60 * 60 * 1000);
        break;
      case BillingPeriod.DAILY:
        end = new Date(start.getTime() + 24 * 60 * 60 * 1000);
        break;
      case BillingPeriod.MONTHLY:
        end = new Date(start.getFullYear(), start.getMonth() + 1, 1);
        break;
    }

    // Check if billing already exists
    const existing = await this.billingRepository.findOne({
      where: {
        userId,
        period,
        periodStart: start,
      },
    });

    if (existing && existing.status !== BillingStatus.PENDING) {
      throw new BadRequestException(
        'Billing already processed for this period',
      );
    }

    // Get usage for period
    const usage = await this.usageRepository.find({
      where: {
        userId,
        timestamp: Between(start, end),
      },
    });

    // Calculate totals
    const totals = usage.reduce(
      (acc, u) => {
        acc.totalCalls += u.type === UsageType.API_CALL ? u.count : 0;
        acc.totalRpcCalls += u.type === UsageType.RPC_CALL ? u.count : 0;
        acc.totalStreamingMinutes +=
          u.type === UsageType.STREAMING_CONNECTION ? u.count : 0;
        acc.totalWebhookDeliveries +=
          u.type === UsageType.WEBHOOK_DELIVERY ? u.count : 0;
        acc.totalCost += parseFloat(u.cost);
        return acc;
      },
      {
        totalCalls: 0,
        totalRpcCalls: 0,
        totalStreamingMinutes: 0,
        totalWebhookDeliveries: 0,
        totalCost: 0,
      },
    );

    // Determine tier (simplified - in production, get from user subscription)
    const tier = 'free'; // TODO: Get from user subscription
    const pricing =
      PRICING_TIERS[tier as keyof typeof PRICING_TIERS] || PRICING_TIERS.free;
    const baseCost = parseFloat(pricing.baseCost);
    const usageCost = totals.totalCost;

    const billing = this.billingRepository.create({
      userId,
      period,
      periodStart: start,
      periodEnd: end,
      totalCalls: totals.totalCalls,
      totalRpcCalls: totals.totalRpcCalls,
      totalStreamingMinutes: totals.totalStreamingMinutes,
      totalWebhookDeliveries: totals.totalWebhookDeliveries,
      totalCost: (baseCost + usageCost).toFixed(6),
      baseCost: baseCost.toFixed(6),
      usageCost: usageCost.toFixed(6),
      status: BillingStatus.PENDING,
      breakdown: {
        tier,
        apiCalls: totals.totalCalls,
        rpcCalls: totals.totalRpcCalls,
        streamingMinutes: totals.totalStreamingMinutes,
        webhookDeliveries: totals.totalWebhookDeliveries,
      },
    });

    const saved = await this.billingRepository.save(billing);

    // Emit billing event
    this.eventEmitter.emit('billing.generated', {
      billingId: saved.id,
      userId,
      totalCost: saved.totalCost,
    });

    return saved;
  }

  /**
   * Get billing history
   */
  async getBillingHistory(
    userId: string,
    limit: number = 50,
    offset: number = 0,
  ): Promise<{ billings: UsageBilling[]; total: number }> {
    const [billings, total] = await this.billingRepository.findAndCount({
      where: { userId },
      order: { periodStart: 'DESC' },
      take: limit,
      skip: offset,
    });

    return { billings, total };
  }

  /**
   * Get current period usage summary
   */
  async getCurrentUsage(userId: string): Promise<{
    periodStart: Date;
    periodEnd: Date;
    calls: number;
    cost: string;
    limit: number;
    remaining: number;
  }> {
    const now = new Date();
    const periodStart = new Date(now.getFullYear(), now.getMonth(), 1);
    const periodEnd = new Date(now.getFullYear(), now.getMonth() + 1, 1);

    const usage = await this.usageRepository.find({
      where: {
        userId,
        timestamp: Between(periodStart, periodEnd),
      },
    });

    const calls = usage.reduce(
      (sum, u) => sum + (u.type === UsageType.API_CALL ? u.count : 0),
      0,
    );
    const cost = usage.reduce((sum, u) => sum + parseFloat(u.cost), 0);

    // Get tier limit (simplified)
    const tier = 'free';
    const pricing =
      PRICING_TIERS[tier as keyof typeof PRICING_TIERS] || PRICING_TIERS.free;
    const limit = pricing.monthlyLimit;

    return {
      periodStart,
      periodEnd,
      calls,
      cost: cost.toFixed(6),
      limit,
      remaining: limit === -1 ? -1 : Math.max(0, limit - calls),
    };
  }
}

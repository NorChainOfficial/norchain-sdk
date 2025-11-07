import { Module } from '@nestjs/common';
import { ConfigModule, ConfigService } from '@nestjs/config';
import { ThrottlerModule, ThrottlerGuard } from '@nestjs/throttler';
import { APP_GUARD } from '@nestjs/core';
import { TypeOrmModule } from '@nestjs/typeorm';
import { CacheModule } from '@nestjs/cache-manager';
import { ScheduleModule } from '@nestjs/schedule';
import { TerminusModule } from '@nestjs/terminus';
import * as redisStore from 'cache-manager-redis-store';
// Config validation schema (optional)
const configValidationSchema = undefined;
import { databaseConfig } from './config/database.config';
import { AccountModule } from './modules/account/account.module';
import { TransactionModule } from './modules/transaction/transaction.module';
import { BlockModule } from './modules/block/block.module';
import { TokenModule } from './modules/token/token.module';
import { ContractModule } from './modules/contract/contract.module';
import { StatsModule } from './modules/stats/stats.module';
import { AuthModule } from './modules/auth/auth.module';
import { HealthModule } from './modules/health/health.module';
import { IndexerModule } from './modules/indexer/indexer.module';
import { LedgerModule } from './modules/ledger/ledger.module';
import { WebSocketModule } from './modules/websocket/websocket.module';
import { SupabaseModule } from './modules/supabase/supabase.module';
import { NotificationsModule } from './modules/notifications/notifications.module';
import { GasModule } from './modules/gas/gas.module';
import { LogsModule } from './modules/logs/logs.module';
import { ProxyModule } from './modules/proxy/proxy.module';
import { BatchModule } from './modules/batch/batch.module';
import { AnalyticsModule } from './modules/analytics/analytics.module';
import { SwapModule } from './modules/swap/swap.module';
import { OrdersModule } from './modules/orders/orders.module';

@Module({
  imports: [
    // Configuration
    ConfigModule.forRoot({
      isGlobal: true,
      envFilePath: ['.env.local', '.env'],
    }),

    // Database
    TypeOrmModule.forRootAsync({
      imports: [ConfigModule],
      useFactory: (configService: ConfigService) =>
        databaseConfig(configService),
      inject: [ConfigService],
    }),

    // Cache (Redis)
    CacheModule.registerAsync({
      isGlobal: true,
      imports: [ConfigModule],
      useFactory: (configService: ConfigService) => ({
        store: redisStore as any,
        host: configService.get('REDIS_HOST', 'localhost'),
        port: configService.get('REDIS_PORT', 6379),
        password: configService.get('REDIS_PASSWORD'),
        db: configService.get('REDIS_DB', 0),
        ttl: configService.get('CACHE_TTL', 300), // 5 minutes default
      }),
      inject: [ConfigService],
    }),

    // Rate Limiting
    ThrottlerModule.forRootAsync({
      imports: [ConfigService],
      useFactory: (configService: ConfigService) => ({
        ttl: Number(configService.get('THROTTLE_TTL', 60)),
        limit: Number(configService.get('THROTTLE_LIMIT', 100)),
      }),
      inject: [ConfigService],
    }),

    // Scheduled Tasks
    ScheduleModule.forRoot(),

    // Health Checks
    TerminusModule,

    // Feature Modules
    AuthModule,
    AccountModule,
    TransactionModule,
    BlockModule,
    TokenModule,
    ContractModule,
    StatsModule,
    HealthModule,
    IndexerModule,
    LedgerModule,
    WebSocketModule,
    SupabaseModule,
    NotificationsModule,
    GasModule,
    LogsModule,
    ProxyModule,
    BatchModule,
    AnalyticsModule,
    SwapModule,
    OrdersModule,
  ],
  providers: [
    {
      provide: APP_GUARD,
      useClass: ThrottlerGuard,
    },
  ],
})
export class AppModule {}


import { Global, Module } from '@nestjs/common';
import { CacheModule } from '@nestjs/cache-manager';
import { ConfigModule, ConfigService } from '@nestjs/config';
import * as redisStore from 'cache-manager-redis-store';
import { RpcService } from './services/rpc.service';
import { CacheService } from './services/cache.service';

/**
 * Common Module
 *
 * Provides global services that are used across multiple modules:
 * - RpcService: Blockchain RPC interaction
 * - CacheService: Redis caching
 */
@Global()
@Module({
  imports: [
    CacheModule.registerAsync({
      isGlobal: true,
      imports: [ConfigModule],
      useFactory: (configService: ConfigService) => {
        const nodeEnv = configService.get('NODE_ENV', 'development');
        const isTest = nodeEnv === 'test';
        const redisHost = configService.get('REDIS_HOST', 'localhost');
        const redisPort = configService.get('REDIS_PORT', 6379);

        // Use in-memory cache for tests or if Redis is not available
        if (isTest || !redisHost || redisHost === 'localhost') {
          return {
            ttl: configService.get('CACHE_TTL', 300),
            max: 100,
          } as any;
        }

        // Use Redis for production/development
        return {
          store: redisStore as any,
          host: redisHost,
          port: redisPort,
          password: configService.get('REDIS_PASSWORD'),
          db: configService.get('REDIS_DB', 0),
          ttl: configService.get('CACHE_TTL', 300),
        } as any;
      },
      inject: [ConfigService],
    }),
  ],
  providers: [RpcService, CacheService],
  exports: [RpcService, CacheService],
})
export class CommonModule {}

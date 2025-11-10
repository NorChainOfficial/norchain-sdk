import { NestFactory, Reflector } from '@nestjs/core';
import { ValidationPipe, VersioningType } from '@nestjs/common';
import { SwaggerModule, DocumentBuilder } from '@nestjs/swagger';
import { ConfigService } from '@nestjs/config';
import helmet from 'helmet';
import compression from 'compression';
import { AppModule } from './app.module';
import { HttpExceptionFilter } from './common/filters/http-exception.filter';
import { TransformInterceptor } from './common/interceptors/transform.interceptor';
import { LoggingInterceptor } from './common/interceptors/logging.interceptor';
import { PaginationInterceptor } from './common/interceptors/pagination.interceptor';
import { RateLimitInterceptor } from './common/interceptors/rate-limit.interceptor';
import { IdempotencyInterceptor } from './common/interceptors/idempotency.interceptor';
import { CacheService } from './common/services/cache.service';
import { WinstonLogger } from './common/logger/winston.logger';

async function bootstrap() {
  const app = await NestFactory.create(AppModule, {
    logger: new WinstonLogger(),
  });

  const configService = app.get(ConfigService);

  // Security
  app.use(helmet());
  app.enableCors({
    origin: configService.get('CORS_ORIGIN', '*'),
    credentials: true,
  });

  // Compression
  app.use(compression());

  // Global prefix
  app.setGlobalPrefix('api');

  // API Versioning (optional - supports both /api/... and /api/v1/...)
  app.enableVersioning({
    type: VersioningType.URI,
    defaultVersion: '1',
  });

  // Global validation pipe
  app.useGlobalPipes(
    new ValidationPipe({
      whitelist: true,
      forbidNonWhitelisted: true,
      transform: true,
      transformOptions: {
        enableImplicitConversion: true,
      },
    }),
  );

  // Global exception filter for consistent error responses
  app.useGlobalFilters(new HttpExceptionFilter());

  // Global interceptors
  app.useGlobalInterceptors(
    new TransformInterceptor(),
    new LoggingInterceptor(),
    new PaginationInterceptor(),
    new RateLimitInterceptor(),
    new IdempotencyInterceptor(
      app.get(Reflector),
      app.get(CacheService),
    ),
  );

  // Swagger documentation
  const swaggerConfig = new DocumentBuilder()
    .setTitle('NorChain Unified API')
    .setDescription(
      'Production-ready REST API for NorChain ecosystem - Explorer, Wallet, Exchange, and all services',
    )
    .setVersion('2.0.0')
    .addBearerAuth(
      {
        type: 'http',
        scheme: 'bearer',
        bearerFormat: 'JWT',
        name: 'JWT',
        description: 'Enter JWT token',
        in: 'header',
      },
      'JWT-auth',
    )
    .addApiKey(
      {
        type: 'apiKey',
        name: 'X-API-Key',
        in: 'header',
        description: 'API Key for authentication',
      },
      'api-key',
    )
    .addTag('Account', 'Account and address operations')
    .addTag('Transaction', 'Transaction operations')
    .addTag('Block', 'Block operations')
    .addTag('Token', 'Token operations')
    .addTag('Contract', 'Contract operations')
    .addTag('Stats', 'Network statistics')
    .addTag('Auth', 'Authentication endpoints')
    .addTag('Health', 'Health check endpoints')
    .addTag('Wallet', 'Wallet management endpoints')
    .addTag('Bridge', 'Cross-chain bridge operations')
    .addTag('Compliance', 'Compliance and regulatory endpoints')
    .addTag('Governance', 'On-chain governance endpoints')
    .addTag(
      'Payments',
      'Payment invoices, POS sessions, and merchant settlements',
    )
    .addTag(
      'Admin',
      'System administration endpoints (validators, params, audit)',
    )
    .addTag('RPC Extensions', 'NorChain-specific RPC extensions (nor_*)')
    .addTag('Finality', 'Finality status endpoints')
    .addTag('Validators', 'Validator set endpoints')
    .addTag('Insights', 'Analytics and insights endpoints')
    .addTag('Webhooks', 'Webhook subscription and delivery management')
    .addTag('Policy', 'Policy gateway and compliance checks')
    .addTag('Streaming', 'Server-Sent Events (SSE) for real-time event streaming')
    .addTag('Metadata', 'Self-service token/contract metadata management')
    .build();

  const document = SwaggerModule.createDocument(app, swaggerConfig);
  SwaggerModule.setup('api-docs', app, document, {
    swaggerOptions: {
      persistAuthorization: true,
    },
  });

  const port = configService.get('PORT', 3000);
  await app.listen(port);

  console.log(`🚀 Application is running on: http://localhost:${port}`);
  console.log(`📚 Swagger documentation: http://localhost:${port}/api-docs`);
}

bootstrap();

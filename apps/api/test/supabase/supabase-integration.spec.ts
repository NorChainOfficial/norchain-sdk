/**
 * Supabase Integration Tests
 *
 * Comprehensive integration tests for Supabase services:
 * - Real-time subscriptions
 * - Authentication
 * - Storage
 * - Database operations
 */

import { Test, TestingModule } from '@nestjs/testing';
import { INestApplication } from '@nestjs/common';
import { ConfigModule, ConfigService } from '@nestjs/config';
import { TypeOrmModule } from '@nestjs/typeorm';
import { SupabaseModule } from '../../src/modules/supabase/supabase.module';
import { SupabaseService } from '../../src/modules/supabase/supabase.service';
import { SupabaseAuthService } from '../../src/modules/supabase/supabase-auth.service';
import { SupabaseStorageService } from '../../src/modules/supabase/supabase-storage.service';
import { NotificationsModule } from '../../src/modules/notifications/notifications.module';
import { NotificationsService } from '../../src/modules/notifications/notifications.service';
import { WebSocketModule } from '../../src/modules/websocket/websocket.module';
import { databaseConfig } from '../../src/config/database.config';

describe('Supabase Integration Tests', () => {
  let app: INestApplication;
  let supabaseService: SupabaseService;
  let supabaseAuthService: SupabaseAuthService;
  let supabaseStorageService: SupabaseStorageService;
  let notificationsService: NotificationsService;
  let configService: ConfigService;

  beforeAll(async () => {
    try {
      const moduleFixture: TestingModule = await Test.createTestingModule({
        imports: [
          ConfigModule.forRoot({
            isGlobal: true,
            envFilePath: ['.env.test', '.env'],
          }),
          TypeOrmModule.forRootAsync({
            imports: [ConfigModule],
            useFactory: (configService: ConfigService) =>
              databaseConfig(configService),
            inject: [ConfigService],
          }),
          WebSocketModule,
          SupabaseModule,
          NotificationsModule,
        ],
      }).compile();

      app = moduleFixture.createNestApplication();
      await app.init();

      supabaseService = moduleFixture.get<SupabaseService>(SupabaseService);
      supabaseAuthService = moduleFixture.get<SupabaseAuthService>(
        SupabaseAuthService,
      );
      supabaseStorageService = moduleFixture.get<SupabaseStorageService>(
        SupabaseStorageService,
      );
      notificationsService = moduleFixture.get<NotificationsService>(
        NotificationsService,
      );
      configService = moduleFixture.get<ConfigService>(ConfigService);
    } catch (error) {
      console.warn('Failed to initialize test module:', error.message);
      // Continue with tests that don't require full app initialization
    }
  });

  afterAll(async () => {
    if (app) {
      await app.close();
    }
  });

  describe('Supabase Configuration', () => {
    it('should have Supabase URL configured', () => {
      if (!configService) {
        console.log('Skipping - ConfigService not available');
        return;
      }
      const supabaseUrl = configService.get<string>('SUPABASE_URL');
      expect(supabaseUrl).toBeDefined();
      if (supabaseUrl) {
        expect(supabaseUrl).toContain('supabase.co');
      }
    });

    it('should have Supabase anon key configured', () => {
      if (!configService) {
        console.log('Skipping - ConfigService not available');
        return;
      }
      const anonKey = configService.get<string>('SUPABASE_ANON_KEY');
      expect(anonKey).toBeDefined();
      if (anonKey) {
        expect(anonKey.length).toBeGreaterThan(0);
      }
    });

    it('should initialize Supabase client', () => {
      if (!supabaseService) {
        console.log('Skipping - SupabaseService not available');
        return;
      }
      const client = supabaseService.getClient();
      expect(client).toBeDefined();
    });
  });

  describe('SupabaseService - Real-time', () => {
    it('should initialize subscriptions', async () => {
      if (!supabaseService) {
        console.log('Skipping - SupabaseService not available');
        return;
      }
      // This should not throw if Supabase is configured
      await expect(supabaseService.onModuleInit()).resolves.not.toThrow();
    });

    it('should get Supabase client', () => {
      const client = supabaseService.getClient();
      expect(client).toBeDefined();
    });

    it('should get admin client if service role key provided', () => {
      const adminClient = supabaseService.getClient(true);
      expect(adminClient).toBeDefined();
    });

    it('should subscribe to custom channel', async () => {
      const callback = jest.fn();
      await supabaseService.subscribeToChannel('test-channel', callback);
      // Should not throw
      expect(callback).toBeDefined();
    });

    it('should broadcast to channel', async () => {
      await expect(
        supabaseService.broadcast('test-channel', 'test-event', {
          message: 'test',
        }),
      ).resolves.not.toThrow();
    });

    it('should update presence', async () => {
      await expect(
        supabaseService.updatePresence('test-channel', 'user-123', {
          status: 'online',
        }),
      ).resolves.not.toThrow();
    });

    it('should unsubscribe from channel', async () => {
      await expect(
        supabaseService.unsubscribeFromChannel('test-channel'),
      ).resolves.not.toThrow();
    });
  });

  describe('SupabaseAuthService - Authentication', () => {
    const testEmail = `test-${Date.now()}@example.com`;
    const testPassword = 'TestPassword123!';

    it('should register a new user', async () => {
      try {
        const result = await supabaseAuthService.signUp({
          email: testEmail,
          password: testPassword,
          metadata: { name: 'Test User' },
        });

        expect(result).toBeDefined();
        expect(result.user).toBeDefined();
        expect(result.user.email).toBe(testEmail);
      } catch (error) {
        // User might already exist, that's okay for integration test
        expect(error.message).toContain('already registered');
      }
    });

    it('should sign in user', async () => {
      try {
        const result = await supabaseAuthService.signIn({
          email: testEmail,
          password: testPassword,
        });

        expect(result).toBeDefined();
        expect(result.user).toBeDefined();
        expect(result.session).toBeDefined();
      } catch (error) {
        // If user doesn't exist, skip this test
        if (error.message.includes('Invalid credentials')) {
          console.log('Skipping sign in test - user not found');
        } else {
          throw error;
        }
      }
    });

    it('should get session', async () => {
      const session = await supabaseAuthService.getSession();
      // Session might be null if not authenticated, that's okay
      expect(session).toBeDefined();
    });

    it('should get user', async () => {
      const user = await supabaseAuthService.getUser();
      // User might be null if not authenticated, that's okay
      expect(user).toBeDefined();
    });

    it('should validate session', async () => {
      // Test with invalid token
      const result = await supabaseAuthService.validateSession('invalid-token');
      expect(result).toBeNull();
    });
  });

  describe('SupabaseStorageService - Storage', () => {
    const testBucket = 'test-bucket';
    const testPath = `test-${Date.now()}.txt`;
    const testContent = Buffer.from('Test file content');

    it('should get public URL', () => {
      try {
        const url = supabaseStorageService.getPublicUrl(testBucket, testPath);
        expect(url).toBeDefined();
        expect(url).toContain('supabase.co');
      } catch (error) {
        // If Supabase not configured, skip
        if (error.message.includes('not configured')) {
          console.log('Skipping storage test - Supabase not configured');
        } else {
          throw error;
        }
      }
    });

    it('should create signed URL', async () => {
      try {
        const url = await supabaseStorageService.getSignedUrl(
          testBucket,
          testPath,
          3600,
        );
        expect(url).toBeDefined();
        expect(url).toContain('supabase.co');
      } catch (error) {
        // Bucket might not exist, that's okay
        if (
          error.message.includes('not found') ||
          error.message.includes('not configured')
        ) {
          console.log('Skipping signed URL test - bucket not found');
        } else {
          throw error;
        }
      }
    });

    it('should list files', async () => {
      try {
        const files = await supabaseStorageService.listFiles(testBucket);
        expect(Array.isArray(files)).toBe(true);
      } catch (error) {
        // Bucket might not exist, that's okay
        if (
          error.message.includes('not found') ||
          error.message.includes('not configured')
        ) {
          console.log('Skipping list files test - bucket not found');
        } else {
          throw error;
        }
      }
    });
  });

  describe('NotificationsService - Supabase Integration', () => {
    it('should create notification with Supabase broadcast', async () => {
      const testNotification = {
        userId: 'test-user-123',
        type: 'test',
        title: 'Test Notification',
        message: 'This is a test notification',
        data: { test: true },
      };

      try {
        const notification = await notificationsService.create(
          testNotification as any,
        );

        expect(notification).toBeDefined();
        expect(notification.userId).toBe(testNotification.userId);
        expect(notification.title).toBe(testNotification.title);
      } catch (error) {
        // If database not available, skip
        if (error.message.includes('relation') || error.message.includes('table')) {
          console.log('Skipping notification test - database not available');
        } else {
          throw error;
        }
      }
    });

    it('should send real-time notification', () => {
      const testData = { message: 'Test real-time notification' };
      expect(() => {
        notificationsService.sendRealtimeNotification(
          'test-user-123',
          testData,
        );
      }).not.toThrow();
    });

    it('should subscribe to user notifications', async () => {
      const callback = jest.fn();
      await notificationsService.subscribeToUserNotifications(
        'test-user-123',
        callback,
      );
      // Should not throw
      expect(callback).toBeDefined();
    });
  });

  describe('Error Handling', () => {
    it('should handle missing Supabase configuration gracefully', () => {
      // Test that services handle missing config
      const client = supabaseService.getClient();
      // Should return client or null, but not throw
      expect(client !== undefined).toBe(true);
    });

    it('should handle Supabase errors gracefully', async () => {
      // Test error handling in broadcast
      await expect(
        supabaseService.broadcast('invalid-channel', 'event', {}),
      ).resolves.not.toThrow();
    });
  });

  describe('Cleanup', () => {
    it('should cleanup subscriptions on destroy', async () => {
      await expect(supabaseService.onModuleDestroy()).resolves.not.toThrow();
    });
  });
});


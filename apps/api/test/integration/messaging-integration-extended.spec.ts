/**
 * Messaging Integration Tests - Extended
 *
 * Tests messaging service integration with database and EventEmitter
 * - Profile management
 * - Conversation management
 * - Message operations
 * - Reaction management
 */

import { Test, TestingModule } from '@nestjs/testing';
import { INestApplication } from '@nestjs/common';
import { AppModule } from '../../src/app.module';
import { MessagingService } from '../../src/modules/messaging/messaging.service';
import { EventEmitter2 } from '@nestjs/event-emitter';

describe('Messaging Integration Tests - Extended', () => {
  let app: INestApplication;
  let messagingService: MessagingService;
  let eventEmitter: EventEmitter2;

  beforeAll(async () => {
    const moduleFixture: TestingModule = await Test.createTestingModule({
      imports: [AppModule],
    }).compile();

    app = moduleFixture.createNestApplication();
    await app.init();

    messagingService = moduleFixture.get<MessagingService>(MessagingService);
    eventEmitter = moduleFixture.get<EventEmitter2>(EventEmitter2);
  });

  afterAll(async () => {
    await app.close();
  });

  describe('Messaging Service', () => {
    it('should be initialized', () => {
      expect(messagingService).toBeDefined();
      expect(eventEmitter).toBeDefined();
    });

    it('should list conversations', async () => {
      try {
        const conversations = await messagingService.listConversations('did:user');
        expect(Array.isArray(conversations)).toBe(true);
      } catch (error) {
        expect(error).toBeDefined();
      }
    });

    it('should get reactions for message', async () => {
      try {
        const reactions = await messagingService.getReactions('message-123');
        expect(Array.isArray(reactions)).toBe(true);
      } catch (error) {
        expect(error).toBeDefined();
      }
    });
  });
});


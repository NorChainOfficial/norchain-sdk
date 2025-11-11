import { Test, TestingModule } from '@nestjs/testing';
import { getRepositoryToken } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { MessagingService } from './messaging.service';
import { MessagingProfile } from './entities/profile.entity';
import { Conversation } from './entities/conversation.entity';
import { Message } from './entities/message.entity';
import { MessageReaction } from './entities/reaction.entity';
import { EventEmitter2 } from '@nestjs/event-emitter';
import { NotFoundException, BadRequestException, ForbiddenException } from '@nestjs/common';

describe('MessagingService', () => {
  let service: MessagingService;
  let profileRepository: Repository<MessagingProfile>;
  let conversationRepository: Repository<Conversation>;
  let messageRepository: Repository<Message>;
  let reactionRepository: Repository<MessageReaction>;

  const mockProfileRepository = {
    findOne: jest.fn(),
    create: jest.fn(),
    save: jest.fn(),
  };

  const mockConversationRepository = {
    findOne: jest.fn(),
    find: jest.fn(),
    create: jest.fn(),
    save: jest.fn(),
  };

  const mockMessageRepository = {
    findOne: jest.fn(),
    find: jest.fn(),
    createQueryBuilder: jest.fn(),
    create: jest.fn(),
    save: jest.fn(),
  };

  const mockReactionRepository = {
    findOne: jest.fn(),
    find: jest.fn(),
    create: jest.fn(),
    save: jest.fn(),
    remove: jest.fn(),
  };

  const mockDeviceKeyRepository = {
    findOne: jest.fn(),
    find: jest.fn(),
    create: jest.fn(),
    save: jest.fn(),
  };

  const mockEventEmitter = {
    emit: jest.fn(),
  };

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      providers: [
        MessagingService,
        {
          provide: getRepositoryToken(MessagingProfile),
          useValue: mockProfileRepository,
        },
        {
          provide: getRepositoryToken(Conversation),
          useValue: mockConversationRepository,
        },
        {
          provide: getRepositoryToken(Message),
          useValue: mockMessageRepository,
        },
        {
          provide: getRepositoryToken(MessageReaction),
          useValue: mockReactionRepository,
        },
        {
          provide: getRepositoryToken(require('./entities/device-key.entity').DeviceKey),
          useValue: mockDeviceKeyRepository,
        },
        {
          provide: EventEmitter2,
          useValue: mockEventEmitter,
        },
      ],
    }).compile();

    service = module.get<MessagingService>(MessagingService);
  });

  afterEach(() => {
    jest.clearAllMocks();
  });

  describe('createProfile', () => {
    it('should create a new profile', async () => {
      const dto = {
        address: '0x742d35Cc6634C0532925a3b844Bc9e7595f0bEb0',
        displayName: 'John Doe',
      };

      mockProfileRepository.findOne.mockResolvedValue(null);
      mockProfileRepository.create.mockReturnValue({
        did: 'did:pkh:eip155:65001:0x742d35cc6634c0532925a3b844bc9e7595f0beb0',
        ...dto,
      });
      mockProfileRepository.save.mockResolvedValue({
        id: 'profile_123',
        did: 'did:pkh:eip155:65001:0x742d35cc6634c0532925a3b844bc9e7595f0beb0',
        ...dto,
      });

      const result = await service.createProfile(dto, 'user_123');

      expect(result).toBeDefined();
      expect(result.did).toContain('did:pkh');
    });

    it('should update existing profile', async () => {
      const dto = {
        address: '0x742d35Cc6634C0532925a3b844Bc9e7595f0bEb0',
        displayName: 'Updated Name',
      };

      const existingProfile = {
        id: 'profile_123',
        did: 'did:pkh:eip155:65001:0x742d35cc6634c0532925a3b844bc9e7595f0beb0',
        address: '0x742d35cc6634c0532925a3b844bc9e7595f0beb0',
        displayName: 'Old Name',
      };

      mockProfileRepository.findOne.mockResolvedValue(existingProfile);
      mockProfileRepository.save.mockResolvedValue({
        ...existingProfile,
        displayName: 'Updated Name',
      });

      const result = await service.createProfile(dto, 'user_123');

      expect(result.displayName).toBe('Updated Name');
    });
  });

  describe('createConversation', () => {
    it('should create a P2P conversation', async () => {
      const dto = {
        kind: 'p2p' as any,
        members: [
          'did:pkh:eip155:65001:0x111',
          'did:pkh:eip155:65001:0x222',
        ],
      };

      const senderDid = 'did:pkh:eip155:65001:0x111';

      mockConversationRepository.find.mockResolvedValue([]);
      mockConversationRepository.create.mockReturnValue({
        ...dto,
        createdBy: senderDid,
      });
      mockConversationRepository.save.mockResolvedValue({
        id: 'conv_123',
        ...dto,
        createdBy: senderDid,
      });

      const result = await service.createConversation(dto, senderDid);

      expect(result).toBeDefined();
      expect(result.kind).toBe('p2p');
      expect(mockEventEmitter.emit).toHaveBeenCalledWith(
        'messaging.conversation.created',
        expect.any(Object),
      );
    });

    it('should throw BadRequestException if P2P has wrong member count', async () => {
      const dto = {
        kind: 'p2p' as any,
        members: ['did:pkh:eip155:65001:0x111'], // Only 1 member
      };

      const senderDid = 'did:pkh:eip155:65001:0x111';

      await expect(
        service.createConversation(dto, senderDid),
      ).rejects.toThrow(BadRequestException);
    });
  });

  describe('sendMessage', () => {
    it('should send a message successfully', async () => {
      const dto = {
        conversationId: 'conv_123',
        cipherText: 'base64:encrypted_data',
      };

      const senderDid = 'did:pkh:eip155:65001:0x111';

      const mockConversation = {
        id: 'conv_123',
        members: [senderDid, 'did:pkh:eip155:65001:0x222'],
      };

      mockConversationRepository.findOne.mockResolvedValue(mockConversation);
      mockMessageRepository.findOne.mockResolvedValue(null);
      mockMessageRepository.create.mockReturnValue({
        ...dto,
        senderDid,
        sentAt: new Date(),
      });
      mockMessageRepository.save.mockResolvedValue({
        id: 'msg_123',
        ...dto,
        senderDid,
      });

      const result = await service.sendMessage(dto, senderDid);

      expect(result).toBeDefined();
      expect(mockEventEmitter.emit).toHaveBeenCalledWith(
        'messaging.message.sent',
        expect.any(Object),
      );
    });

    it('should throw ForbiddenException if user not in conversation', async () => {
      const dto = {
        conversationId: 'conv_123',
        cipherText: 'base64:encrypted_data',
      };

      const senderDid = 'did:pkh:eip155:65001:0x111';

      const mockConversation = {
        id: 'conv_123',
        members: ['did:pkh:eip155:65001:0x222', 'did:pkh:eip155:65001:0x333'], // Sender not included
      };

      mockConversationRepository.findOne.mockResolvedValue(mockConversation);

      await expect(service.sendMessage(dto, senderDid)).rejects.toThrow(
        ForbiddenException,
      );
    });
  });

  describe('addReaction', () => {
    it('should add a reaction to a message', async () => {
      const messageId = 'msg_123';
      const userDid = 'did:pkh:eip155:65001:0x111';
      const emoji = '👍';

      mockMessageRepository.findOne.mockResolvedValue({ id: messageId });
      mockReactionRepository.findOne.mockResolvedValue(null);
      mockReactionRepository.create.mockReturnValue({
        messageId,
        userDid,
        emoji,
      });
      mockReactionRepository.save.mockResolvedValue({
        id: 'reaction_123',
        messageId,
        userDid,
        emoji,
      });

      const result = await service.addReaction(messageId, userDid, emoji);

      expect(result).toBeDefined();
      expect(result.emoji).toBe('👍');
      expect(mockEventEmitter.emit).toHaveBeenCalledWith(
        'messaging.reaction.added',
        expect.any(Object),
      );
    });

    it('should return existing reaction if already exists (idempotent)', async () => {
      const messageId = 'msg_123';
      const userDid = 'did:pkh:eip155:65001:0x111';
      const emoji = '👍';

      const existingReaction = {
        id: 'reaction_123',
        messageId,
        userDid,
        emoji,
      };

      mockMessageRepository.findOne.mockResolvedValue({ id: messageId });
      mockReactionRepository.findOne.mockResolvedValue(existingReaction);

      const result = await service.addReaction(messageId, userDid, emoji);

      expect(result).toBe(existingReaction);
      expect(mockReactionRepository.save).not.toHaveBeenCalled();
    });
  });
});


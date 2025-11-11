import { Test, TestingModule } from '@nestjs/testing';
import { getRepositoryToken } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { MessagingService } from './messaging.service';
import { MessagingProfile } from './entities/profile.entity';
import { Conversation } from './entities/conversation.entity';
import { Message } from './entities/message.entity';
import { MessageReaction } from './entities/reaction.entity';
import { DeviceKey } from './entities/device-key.entity';
import { EventEmitter2 } from '@nestjs/event-emitter';
import { NotFoundException, BadRequestException, ForbiddenException } from '@nestjs/common';

describe('MessagingService', () => {
  let service: MessagingService;
  let profileRepository: Repository<MessagingProfile>;
  let conversationRepository: Repository<Conversation>;
  let messageRepository: Repository<Message>;
  let reactionRepository: Repository<MessageReaction>;
  let deviceKeyRepository: Repository<DeviceKey>;

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

  const mockQueryBuilder = {
    where: jest.fn().mockReturnThis(),
    andWhere: jest.fn().mockReturnThis(),
    orderBy: jest.fn().mockReturnThis(),
    take: jest.fn().mockReturnThis(),
    getMany: jest.fn(),
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
          provide: getRepositoryToken(DeviceKey),
          useValue: mockDeviceKeyRepository,
        },
        {
          provide: EventEmitter2,
          useValue: mockEventEmitter,
        },
      ],
    }).compile();

    service = module.get<MessagingService>(MessagingService);
    profileRepository = module.get<Repository<MessagingProfile>>(getRepositoryToken(MessagingProfile));
    conversationRepository = module.get<Repository<Conversation>>(getRepositoryToken(Conversation));
    messageRepository = module.get<Repository<Message>>(getRepositoryToken(Message));
    reactionRepository = module.get<Repository<MessageReaction>>(getRepositoryToken(MessageReaction));
    deviceKeyRepository = module.get<Repository<DeviceKey>>(getRepositoryToken(DeviceKey));
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
      expect(mockProfileRepository.create).toHaveBeenCalled();
      expect(mockProfileRepository.save).toHaveBeenCalled();
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
      expect(mockProfileRepository.save).toHaveBeenCalled();
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

    it('should create a group conversation', async () => {
      const dto = {
        kind: 'group' as any,
        members: [
          'did:pkh:eip155:65001:0x111',
          'did:pkh:eip155:65001:0x222',
          'did:pkh:eip155:65001:0x333',
        ],
        name: 'Test Group',
      };

      const senderDid = 'did:pkh:eip155:65001:0x111';

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
      expect(result.kind).toBe('group');
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

    it('should throw BadRequestException if P2P has more than 2 members', async () => {
      const dto = {
        kind: 'p2p' as any,
        members: [
          'did:pkh:eip155:65001:0x111',
          'did:pkh:eip155:65001:0x222',
          'did:pkh:eip155:65001:0x333',
        ],
      };

      const senderDid = 'did:pkh:eip155:65001:0x111';

      await expect(
        service.createConversation(dto, senderDid),
      ).rejects.toThrow(BadRequestException);
    });
  });

  describe('getConversation', () => {
    it('should return conversation if user is a member', async () => {
      const conversationId = 'conv_123';
      const userDid = 'did:pkh:eip155:65001:0x111';

      const mockConversation = {
        id: conversationId,
        members: [userDid, 'did:pkh:eip155:65001:0x222'],
      };

      mockConversationRepository.findOne.mockResolvedValue(mockConversation);

      const result = await service.getConversation(conversationId, userDid);

      expect(result).toEqual(mockConversation);
    });

    it('should throw NotFoundException if conversation not found', async () => {
      const conversationId = 'conv_123';
      const userDid = 'did:pkh:eip155:65001:0x111';

      mockConversationRepository.findOne.mockResolvedValue(null);

      await expect(
        service.getConversation(conversationId, userDid),
      ).rejects.toThrow(NotFoundException);
    });

    it('should throw ForbiddenException if user is not a member', async () => {
      const conversationId = 'conv_123';
      const userDid = 'did:pkh:eip155:65001:0x111';

      const mockConversation = {
        id: conversationId,
        members: ['did:pkh:eip155:65001:0x222', 'did:pkh:eip155:65001:0x333'],
      };

      mockConversationRepository.findOne.mockResolvedValue(mockConversation);

      await expect(
        service.getConversation(conversationId, userDid),
      ).rejects.toThrow(ForbiddenException);
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

    it('should return existing message if idempotency key matches', async () => {
      const dto = {
        conversationId: 'conv_123',
        cipherText: 'base64:encrypted_data',
        clientNonce: 'nonce-123',
      };

      const senderDid = 'did:pkh:eip155:65001:0x111';

      const mockConversation = {
        id: 'conv_123',
        members: [senderDid, 'did:pkh:eip155:65001:0x222'],
      };

      const existingMessage = {
        id: 'msg_123',
        conversationId: 'conv_123',
        senderDid,
        clientNonce: 'nonce-123',
      };

      mockConversationRepository.findOne.mockResolvedValue(mockConversation);
      mockMessageRepository.findOne.mockResolvedValue(existingMessage);

      const result = await service.sendMessage(dto, senderDid);

      expect(result).toBe(existingMessage);
      expect(mockMessageRepository.save).not.toHaveBeenCalled();
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

    it('should throw NotFoundException if conversation not found', async () => {
      const dto = {
        conversationId: 'invalid_conv',
        cipherText: 'base64:encrypted_data',
      };

      const senderDid = 'did:pkh:eip155:65001:0x111';

      mockConversationRepository.findOne.mockResolvedValue(null);

      await expect(service.sendMessage(dto, senderDid)).rejects.toThrow(
        NotFoundException,
      );
    });
  });

  describe('getMessages', () => {
    it('should return messages for a conversation', async () => {
      const conversationId = 'conv_123';
      const userDid = 'did:pkh:eip155:65001:0x111';
      const limit = 50;

      const mockConversation = {
        id: conversationId,
        members: [userDid, 'did:pkh:eip155:65001:0x222'],
      };

      const mockMessages = [
        {
          id: 'msg_1',
          conversationId,
          senderDid: userDid,
          cipherText: 'encrypted_1',
          sentAt: new Date(),
        },
        {
          id: 'msg_2',
          conversationId,
          senderDid: 'did:pkh:eip155:65001:0x222',
          cipherText: 'encrypted_2',
          sentAt: new Date(),
        },
      ];

      mockConversationRepository.findOne.mockResolvedValue(mockConversation);
      mockMessageRepository.createQueryBuilder.mockReturnValue(mockQueryBuilder);
      mockQueryBuilder.getMany.mockResolvedValue(mockMessages);

      const result = await service.getMessages(conversationId, userDid, undefined, limit);

      expect(result).toHaveProperty('messages');
      expect(result).toHaveProperty('nextCursor');
      expect(result.messages).toHaveLength(2);
    });

    it('should use cursor for pagination', async () => {
      const conversationId = 'conv_123';
      const userDid = 'did:pkh:eip155:65001:0x111';
      const cursor = 'msg_2';
      const limit = 50;

      const mockConversation = {
        id: conversationId,
        members: [userDid, 'did:pkh:eip155:65001:0x222'],
      };

      const mockMessages = [
        {
          id: 'msg_3',
          conversationId,
          senderDid: userDid,
          cipherText: 'encrypted_3',
          sentAt: new Date(),
        },
      ];

      mockConversationRepository.findOne.mockResolvedValue(mockConversation);
      mockMessageRepository.createQueryBuilder.mockReturnValue(mockQueryBuilder);
      mockQueryBuilder.getMany.mockResolvedValue(mockMessages);

      const result = await service.getMessages(conversationId, userDid, cursor, limit);

      expect(mockQueryBuilder.andWhere).toHaveBeenCalledWith('message.id < :cursor', { cursor });
      expect(result.messages).toHaveLength(1);
    });

    it('should throw ForbiddenException if user not in conversation', async () => {
      const conversationId = 'conv_123';
      const userDid = 'did:pkh:eip155:65001:0x111';

      const mockConversation = {
        id: conversationId,
        members: ['did:pkh:eip155:65001:0x222', 'did:pkh:eip155:65001:0x333'],
      };

      mockConversationRepository.findOne.mockResolvedValue(mockConversation);

      await expect(
        service.getMessages(conversationId, userDid),
      ).rejects.toThrow(ForbiddenException);
    });
  });

  describe('markDelivered', () => {
    it('should mark message as delivered', async () => {
      const messageId = 'msg_123';
      const recipientDid = 'did:pkh:eip155:65001:0x222';

      const mockMessage = {
        id: messageId,
        deliveredTo: [],
      };

      mockMessageRepository.findOne.mockResolvedValue(mockMessage);
      mockMessageRepository.save.mockResolvedValue({
        ...mockMessage,
        deliveredTo: [recipientDid],
      });

      await service.markDelivered(messageId, recipientDid);

      expect(mockMessageRepository.save).toHaveBeenCalled();
      expect(mockEventEmitter.emit).toHaveBeenCalledWith(
        'messaging.message.delivered',
        expect.objectContaining({ messageId, recipientDid }),
      );
    });

    it('should not duplicate delivery status', async () => {
      const messageId = 'msg_123';
      const recipientDid = 'did:pkh:eip155:65001:0x222';

      const mockMessage = {
        id: messageId,
        deliveredTo: [recipientDid],
      };

      mockMessageRepository.findOne.mockResolvedValue(mockMessage);

      await service.markDelivered(messageId, recipientDid);

      expect(mockMessageRepository.save).not.toHaveBeenCalled();
    });

    it('should throw NotFoundException if message not found', async () => {
      mockMessageRepository.findOne.mockResolvedValue(null);

      await expect(
        service.markDelivered('invalid-id', 'did:pkh:eip155:65001:0x222'),
      ).rejects.toThrow(NotFoundException);
    });
  });

  describe('markRead', () => {
    it('should mark message as read', async () => {
      const messageId = 'msg_123';
      const readerDid = 'did:pkh:eip155:65001:0x222';

      const mockMessage = {
        id: messageId,
        readBy: [],
      };

      mockMessageRepository.findOne.mockResolvedValue(mockMessage);
      mockMessageRepository.save.mockResolvedValue({
        ...mockMessage,
        readBy: [readerDid],
      });

      await service.markRead(messageId, readerDid);

      expect(mockMessageRepository.save).toHaveBeenCalled();
      expect(mockEventEmitter.emit).toHaveBeenCalledWith(
        'messaging.message.read',
        expect.objectContaining({ messageId, readerDid }),
      );
    });

    it('should not duplicate read status', async () => {
      const messageId = 'msg_123';
      const readerDid = 'did:pkh:eip155:65001:0x222';

      const mockMessage = {
        id: messageId,
        readBy: [readerDid],
      };

      mockMessageRepository.findOne.mockResolvedValue(mockMessage);

      await service.markRead(messageId, readerDid);

      expect(mockMessageRepository.save).not.toHaveBeenCalled();
    });

    it('should throw NotFoundException if message not found', async () => {
      mockMessageRepository.findOne.mockResolvedValue(null);

      await expect(
        service.markRead('invalid-id', 'did:pkh:eip155:65001:0x222'),
      ).rejects.toThrow(NotFoundException);
    });
  });

  describe('registerDeviceKeys', () => {
    it('should register new device keys', async () => {
      const did = 'did:pkh:eip155:65001:0x111';
      const deviceId = 'device-123';
      const prekeyBundle = 'bundle-123';
      const signedPrekey = 'signed-123';

      mockDeviceKeyRepository.findOne.mockResolvedValue(null);
      mockDeviceKeyRepository.create.mockReturnValue({
        did,
        deviceId,
        prekeyBundle,
        signedPrekey,
      });
      mockDeviceKeyRepository.save.mockResolvedValue({
        id: 'key-123',
        did,
        deviceId,
        prekeyBundle,
        signedPrekey,
        lastUsedAt: new Date(),
      });

      const result = await service.registerDeviceKeys(did, deviceId, prekeyBundle, signedPrekey);

      expect(result).toBeDefined();
      expect(result.prekeyBundle).toBe(prekeyBundle);
      expect(mockDeviceKeyRepository.create).toHaveBeenCalled();
      expect(mockDeviceKeyRepository.save).toHaveBeenCalled();
    });

    it('should update existing device keys', async () => {
      const did = 'did:pkh:eip155:65001:0x111';
      const deviceId = 'device-123';
      const prekeyBundle = 'new-bundle-123';
      const signedPrekey = 'new-signed-123';

      const existingDeviceKey = {
        id: 'key-123',
        did,
        deviceId,
        prekeyBundle: 'old-bundle',
        signedPrekey: 'old-signed',
        lastUsedAt: new Date(),
      };

      mockDeviceKeyRepository.findOne.mockResolvedValue(existingDeviceKey);
      mockDeviceKeyRepository.save.mockResolvedValue({
        ...existingDeviceKey,
        prekeyBundle,
        signedPrekey,
        lastUsedAt: new Date(),
      });

      const result = await service.registerDeviceKeys(did, deviceId, prekeyBundle, signedPrekey);

      expect(result.prekeyBundle).toBe(prekeyBundle);
      expect(mockDeviceKeyRepository.save).toHaveBeenCalled();
    });
  });

  describe('getDeviceKeys', () => {
    it('should return device keys for a DID', async () => {
      const did = 'did:pkh:eip155:65001:0x111';

      const mockDeviceKeys = [
        {
          id: 'key-1',
          did,
          deviceId: 'device-1',
          prekeyBundle: 'bundle-1',
          lastUsedAt: new Date(),
        },
        {
          id: 'key-2',
          did,
          deviceId: 'device-2',
          prekeyBundle: 'bundle-2',
          lastUsedAt: new Date(),
        },
      ];

      mockDeviceKeyRepository.find.mockResolvedValue(mockDeviceKeys);

      const result = await service.getDeviceKeys(did);

      expect(result).toEqual(mockDeviceKeys);
      expect(mockDeviceKeyRepository.find).toHaveBeenCalledWith({
        where: { did },
        order: { lastUsedAt: 'DESC' },
      });
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

    it('should throw NotFoundException if message not found', async () => {
      mockMessageRepository.findOne.mockResolvedValue(null);

      await expect(
        service.addReaction('invalid-id', 'did:pkh:eip155:65001:0x111', '👍'),
      ).rejects.toThrow(NotFoundException);
    });
  });

  describe('removeReaction', () => {
    it('should remove a reaction', async () => {
      const messageId = 'msg_123';
      const userDid = 'did:pkh:eip155:65001:0x111';
      const emoji = '👍';

      const mockReaction = {
        id: 'reaction_123',
        messageId,
        userDid,
        emoji,
      };

      mockReactionRepository.findOne.mockResolvedValue(mockReaction);
      mockReactionRepository.remove.mockResolvedValue(mockReaction);

      await service.removeReaction(messageId, userDid, emoji);

      expect(mockReactionRepository.remove).toHaveBeenCalledWith(mockReaction);
      expect(mockEventEmitter.emit).toHaveBeenCalledWith(
        'messaging.reaction.removed',
        expect.any(Object),
      );
    });

    it('should not throw if reaction does not exist', async () => {
      const messageId = 'msg_123';
      const userDid = 'did:pkh:eip155:65001:0x111';
      const emoji = '👍';

      mockReactionRepository.findOne.mockResolvedValue(null);

      await service.removeReaction(messageId, userDid, emoji);

      expect(mockReactionRepository.remove).not.toHaveBeenCalled();
    });
  });

  describe('getReactions', () => {
    it('should return all reactions for a message', async () => {
      const messageId = 'msg_123';

      const mockReactions = [
        {
          id: 'reaction_1',
          messageId,
          userDid: 'did:pkh:eip155:65001:0x111',
          emoji: '👍',
          createdAt: new Date(),
        },
        {
          id: 'reaction_2',
          messageId,
          userDid: 'did:pkh:eip155:65001:0x222',
          emoji: '❤️',
          createdAt: new Date(),
        },
      ];

      mockReactionRepository.find.mockResolvedValue(mockReactions);

      const result = await service.getReactions(messageId);

      expect(result).toEqual(mockReactions);
      expect(mockReactionRepository.find).toHaveBeenCalledWith({
        where: { messageId },
        order: { createdAt: 'ASC' },
      });
    });
  });

  describe('generateMediaUploadUrl', () => {
    it('should generate a signed upload URL', async () => {
      const userDid = 'did:pkh:eip155:65001:0x111';
      const contentType = 'image/jpeg';
      const kind = 'photo';

      const result = await service.generateMediaUploadUrl(userDid, contentType, kind);

      expect(result).toHaveProperty('uploadUrl');
      expect(result).toHaveProperty('mediaRef');
      expect(result.uploadUrl).toContain('norchain.org');
    });

    it('should generate URL without kind', async () => {
      const userDid = 'did:pkh:eip155:65001:0x111';
      const contentType = 'image/png';

      const result = await service.generateMediaUploadUrl(userDid, contentType);

      expect(result).toHaveProperty('uploadUrl');
      expect(result).toHaveProperty('mediaRef');
    });
  });

  describe('getProfileByAddress', () => {
    it('should return profile by address', async () => {
      const address = '0x742d35Cc6634C0532925a3b844Bc9e7595f0bEb0';
      const mockProfile = {
        did: 'did:pkh:eip155:65001:0x742d35cc6634c0532925a3b844bc9e7595f0beb0',
        address: address.toLowerCase(),
        displayName: 'Test User',
      };

      mockProfileRepository.findOne.mockResolvedValue(mockProfile);

      const result = await service.getProfileByAddress(address);

      expect(result).toEqual(mockProfile);
      expect(mockProfileRepository.findOne).toHaveBeenCalledWith({
        where: { did: 'did:pkh:eip155:65001:0x742d35cc6634c0532925a3b844bc9e7595f0beb0' },
      });
    });

    it('should return null if profile not found', async () => {
      const address = '0x742d35Cc6634C0532925a3b844Bc9e7595f0bEb0';

      mockProfileRepository.findOne.mockResolvedValue(null);

      const result = await service.getProfileByAddress(address);

      expect(result).toBeNull();
    });
  });

  describe('listConversations', () => {
    it('should return conversations for user', async () => {
      const userDid = 'did:pkh:eip155:65001:0x111';
      const mockConversations = [
        {
          id: 'conv_1',
          members: [userDid, 'did:pkh:eip155:65001:0x222'],
        },
        {
          id: 'conv_2',
          members: [userDid, 'did:pkh:eip155:65001:0x333'],
        },
      ];

      mockConversationRepository.find.mockResolvedValue(mockConversations);

      const result = await service.listConversations(userDid);

      expect(result).toEqual(mockConversations);
      expect(result).toHaveLength(2);
    });

    it('should filter out conversations where user is not a member', async () => {
      const userDid = 'did:pkh:eip155:65001:0x111';
      const mockConversations = [
        {
          id: 'conv_1',
          members: [userDid, 'did:pkh:eip155:65001:0x222'],
        },
        {
          id: 'conv_2',
          members: ['did:pkh:eip155:65001:0x333', 'did:pkh:eip155:65001:0x444'],
        },
      ];

      mockConversationRepository.find.mockResolvedValue(mockConversations);

      const result = await service.listConversations(userDid);

      expect(result).toHaveLength(1);
      expect(result[0].id).toBe('conv_1');
    });

    it('should return empty array when no conversations', async () => {
      const userDid = 'did:pkh:eip155:65001:0x111';

      mockConversationRepository.find.mockResolvedValue([]);

      const result = await service.listConversations(userDid);

      expect(result).toEqual([]);
    });
  });

  describe('getMessages', () => {
    it('should use default limit when not provided', async () => {
      const conversationId = 'conv_123';
      const userDid = 'did:pkh:eip155:65001:0x111';

      const mockConversation = {
        id: conversationId,
        members: [userDid, 'did:pkh:eip155:65001:0x222'],
      };

      mockConversationRepository.findOne.mockResolvedValue(mockConversation);
      mockMessageRepository.createQueryBuilder.mockReturnValue(mockQueryBuilder);
      mockQueryBuilder.getMany.mockResolvedValue([]);

      const result = await service.getMessages(conversationId, userDid);

      expect(result).toHaveProperty('messages');
      expect(result).toHaveProperty('nextCursor');
      expect(mockQueryBuilder.take).toHaveBeenCalledWith(51); // limit + 1
    });

    it('should use custom limit when provided', async () => {
      const conversationId = 'conv_123';
      const userDid = 'did:pkh:eip155:65001:0x111';
      const limit = 100;

      const mockConversation = {
        id: conversationId,
        members: [userDid, 'did:pkh:eip155:65001:0x222'],
      };

      mockConversationRepository.findOne.mockResolvedValue(mockConversation);
      mockMessageRepository.createQueryBuilder.mockReturnValue(mockQueryBuilder);
      mockQueryBuilder.getMany.mockResolvedValue([]);

      const result = await service.getMessages(conversationId, userDid, undefined, limit);

      expect(result).toHaveProperty('messages');
      expect(mockQueryBuilder.take).toHaveBeenCalledWith(limit + 1); // limit + 1
    });
  });

  describe('createProfile', () => {
    it('should update existing profile metadata', async () => {
      const userId = 'user-123';
      const dto = {
        address: '0x742d35Cc6634C0532925a3b844Bc9e7595f0bEb0',
        displayName: 'Updated Name',
        metadata: { newKey: 'newValue' },
      };

      const existingProfile = {
        did: 'did:pkh:eip155:65001:0x742d35cc6634c0532925a3b844bc9e7595f0beb0',
        address: dto.address.toLowerCase(),
        displayName: 'Old Name',
        metadata: { oldKey: 'oldValue' },
      };

      mockProfileRepository.findOne.mockResolvedValue(existingProfile);
      mockProfileRepository.save.mockResolvedValue({
        ...existingProfile,
        displayName: dto.displayName,
        metadata: { ...existingProfile.metadata, ...dto.metadata },
      });

      const result = await service.createProfile(dto, userId);

      expect(result.displayName).toBe(dto.displayName);
      expect(result.metadata).toEqual({
        oldKey: 'oldValue',
        newKey: 'newValue',
      });
    });
  });
});

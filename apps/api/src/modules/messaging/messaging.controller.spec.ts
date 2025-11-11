import { Test, TestingModule } from '@nestjs/testing';
import { MessagingController } from './messaging.controller';
import { MessagingService } from './messaging.service';
import { JwtAuthGuard } from '@/common/guards/jwt-auth.guard';

describe('MessagingController', () => {
  let controller: MessagingController;
  let service: MessagingService;

  const mockService = {
    createProfile: jest.fn(),
    getProfile: jest.fn(),
    createConversation: jest.fn(),
    listConversations: jest.fn(),
    getConversation: jest.fn(),
    sendMessage: jest.fn(),
    getMessages: jest.fn(),
    markDelivered: jest.fn(),
    markRead: jest.fn(),
    addReaction: jest.fn(),
    removeReaction: jest.fn(),
    getReactions: jest.fn(),
    generateMediaUploadUrl: jest.fn(),
  };

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      controllers: [MessagingController],
      providers: [
        {
          provide: MessagingService,
          useValue: mockService,
        },
      ],
    })
      .overrideGuard(JwtAuthGuard)
      .useValue({ canActivate: () => true })
      .compile();

    controller = module.get<MessagingController>(MessagingController);
    service = module.get<MessagingService>(MessagingService);
  });

  afterEach(() => {
    jest.clearAllMocks();
  });

  describe('createProfile', () => {
    it('should create a profile', async () => {
      const dto = {
        address: '0x742d35Cc6634C0532925a3b844Bc9e7595f0bEb0',
        displayName: 'John Doe',
      };

      const mockProfile = {
        id: 'profile_123',
        did: 'did:pkh:eip155:65001:0x742d35cc6634c0532925a3b844bc9e7595f0beb0',
        ...dto,
      };

      mockService.createProfile.mockResolvedValue(mockProfile);

      const req = { user: { id: 'user_123' } };
      const result = await controller.createProfile(req as any, dto);

      expect(result).toEqual(mockProfile);
      expect(mockService.createProfile).toHaveBeenCalled();
    });
  });

  describe('addReaction', () => {
    it('should add a reaction', async () => {
      const messageId = 'msg_123';
      const dto = { messageId: 'msg_123', emoji: '👍' };

      const mockReaction = {
        id: 'reaction_123',
        messageId,
        userDid: 'did:pkh:eip155:65001:0x111',
        emoji: '👍',
      };

      mockService.addReaction.mockResolvedValue(mockReaction);

      const req = { user: { address: '0x111', id: 'user_123' } };
      const result = await controller.addReaction(req as any, messageId, dto);

      expect(result).toEqual(mockReaction);
      expect(mockService.addReaction).toHaveBeenCalled();
    });
  });
});


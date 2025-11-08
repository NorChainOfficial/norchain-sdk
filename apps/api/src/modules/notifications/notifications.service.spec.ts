import { Test, TestingModule } from '@nestjs/testing';
import { NotificationsService } from './notifications.service';
import { getRepositoryToken } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { Notification } from './entities/notification.entity';
import { NorChainWebSocketGateway } from '../websocket/websocket.gateway';
import { CreateNotificationDto } from './dto/create-notification.dto';

describe('NotificationsService', () => {
  let service: NotificationsService;
  let notificationRepository: jest.Mocked<Repository<Notification>>;
  let websocketGateway: jest.Mocked<NorChainWebSocketGateway>;

  beforeEach(async () => {
    const mockNotificationRepository = {
      create: jest.fn(),
      save: jest.fn(),
      findOne: jest.fn(),
      update: jest.fn(),
      delete: jest.fn(),
      createQueryBuilder: jest.fn(),
    };

    const mockWebSocketGateway = {
      server: {
        to: jest.fn().mockReturnThis(),
        emit: jest.fn(),
      },
    };

    const module: TestingModule = await Test.createTestingModule({
      providers: [
        NotificationsService,
        {
          provide: getRepositoryToken(Notification),
          useValue: mockNotificationRepository,
        },
        {
          provide: NorChainWebSocketGateway,
          useValue: mockWebSocketGateway,
        },
      ],
    }).compile();

    service = module.get<NotificationsService>(NotificationsService);
    notificationRepository = module.get(getRepositoryToken(Notification));
    websocketGateway = module.get(NorChainWebSocketGateway);
  });

  afterEach(() => {
    jest.clearAllMocks();
  });

  it('should be defined', () => {
    expect(service).toBeDefined();
  });

  describe('create', () => {
    it('should create and send notification', async () => {
      const dto: CreateNotificationDto = {
        userId: 'user-1',
        type: 'transaction',
        title: 'New Transaction',
        message: 'You received 1 ETH',
        data: { txHash: '0x123' },
      };

      const notification = {
        id: '1',
        ...dto,
        read: false,
        createdAt: new Date(),
      };

      notificationRepository.create.mockReturnValue(notification as any);
      notificationRepository.save.mockResolvedValue(notification as any);

      const result = await service.create(dto);

      expect(result).toEqual(notification);
      expect(notificationRepository.create).toHaveBeenCalledWith(dto);
      expect(notificationRepository.save).toHaveBeenCalled();
      expect(websocketGateway.server.to).toHaveBeenCalledWith(`user:${dto.userId}`);
    });
  });

  describe('getUserNotifications', () => {
    it('should return user notifications', async () => {
      const userId = 'user-1';
      const notifications = [
        {
          id: '1',
          userId,
          type: 'transaction',
          title: 'New Transaction',
          read: false,
        },
      ];

      const mockQueryBuilder = {
        where: jest.fn().mockReturnThis(),
        andWhere: jest.fn().mockReturnThis(),
        orderBy: jest.fn().mockReturnThis(),
        limit: jest.fn().mockReturnThis(),
        getMany: jest.fn().mockResolvedValue(notifications),
      };

      notificationRepository.createQueryBuilder.mockReturnValue(
        mockQueryBuilder as any,
      );

      const result = await service.getUserNotifications(userId, {});

      expect(result).toEqual(notifications);
      expect(notificationRepository.createQueryBuilder).toHaveBeenCalled();
    });

    it('should filter unread notifications', async () => {
      const userId = 'user-1';
      const mockQueryBuilder = {
        where: jest.fn().mockReturnThis(),
        andWhere: jest.fn().mockReturnThis(),
        orderBy: jest.fn().mockReturnThis(),
        limit: jest.fn().mockReturnThis(),
        getMany: jest.fn().mockResolvedValue([]),
      };

      notificationRepository.createQueryBuilder.mockReturnValue(
        mockQueryBuilder as any,
      );

      await service.getUserNotifications(userId, { unreadOnly: true });

      expect(mockQueryBuilder.andWhere).toHaveBeenCalledWith(
        'notification.read = false',
      );
    });
  });

  describe('markAsRead', () => {
    it('should mark notification as read', async () => {
      const notificationId = '1';
      const userId = 'user-1';
      const notification = {
        id: notificationId,
        userId,
        read: false,
      };

      notificationRepository.findOne.mockResolvedValue(notification as any);
      notificationRepository.save.mockResolvedValue({
        ...notification,
        read: true,
      } as any);

      const result = await service.markAsRead(notificationId, userId);

      expect(result.read).toBe(true);
      expect(notificationRepository.findOne).toHaveBeenCalledWith({
        where: { id: notificationId, userId },
      });
    });

    it('should throw error if notification not found', async () => {
      const notificationId = '1';
      const userId = 'user-1';

      notificationRepository.findOne.mockResolvedValue(null);

      await expect(
        service.markAsRead(notificationId, userId),
      ).rejects.toThrow('Notification not found');
    });
  });

  describe('markAllAsRead', () => {
    it('should mark all notifications as read', async () => {
      const userId = 'user-1';

      notificationRepository.update.mockResolvedValue({ affected: 5 } as any);

      await service.markAllAsRead(userId);

      expect(notificationRepository.update).toHaveBeenCalledWith(
        { userId, read: false },
        expect.objectContaining({
          read: true,
          readAt: expect.any(Date),
        }),
      );
    });
  });

  describe('getUnreadCount', () => {
    it('should return unread notification count', async () => {
      const userId = 'user-1';

      notificationRepository.count.mockResolvedValue(5);

      const result = await service.getUnreadCount(userId);

      expect(result).toBe(5);
      expect(notificationRepository.count).toHaveBeenCalledWith({
        where: { userId, read: false },
      });
    });
  });

  describe('delete', () => {
    it('should delete notification', async () => {
      const notificationId = '1';
      const userId = 'user-1';
      const notification = {
        id: notificationId,
        userId,
      };

      notificationRepository.findOne.mockResolvedValue(notification as any);
      notificationRepository.delete.mockResolvedValue({ affected: 1 } as any);

      await service.delete(notificationId, userId);

      expect(notificationRepository.delete).toHaveBeenCalledWith({
        id: notificationId,
        userId,
      });
    });

    it('should throw error if notification not found', async () => {
      const notificationId = '1';
      const userId = 'user-1';

      notificationRepository.findOne.mockResolvedValue(null);

      await expect(service.delete(notificationId, userId)).rejects.toThrow(
        'Notification not found',
      );
    });
  });
});


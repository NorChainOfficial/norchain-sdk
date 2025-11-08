import { Test, TestingModule } from '@nestjs/testing';
import { NotificationsController } from './notifications.controller';
import { NotificationsService } from './notifications.service';
import { ResponseDto } from '@/common/interfaces/api-response.interface';

describe('NotificationsController', () => {
  let controller: NotificationsController;
  let service: jest.Mocked<NotificationsService>;

  beforeEach(async () => {
    const mockNotificationsService = {
      getUserNotifications: jest.fn(),
      getUnreadCount: jest.fn(),
      markAsRead: jest.fn(),
      markAllAsRead: jest.fn(),
      delete: jest.fn(),
    };

    const module: TestingModule = await Test.createTestingModule({
      controllers: [NotificationsController],
      providers: [
        {
          provide: NotificationsService,
          useValue: mockNotificationsService,
        },
      ],
    }).compile();

    controller = module.get<NotificationsController>(NotificationsController);
    service = module.get(NotificationsService);
  });

  it('should be defined', () => {
    expect(controller).toBeDefined();
  });

  describe('getNotifications', () => {
    it('should return notifications', async () => {
      const req = { user: { id: '1' } };
      const mockNotifications = [];
      service.getUserNotifications.mockResolvedValue(mockNotifications as any);

      const result = await controller.getNotifications(req);

      expect(result).toEqual(mockNotifications);
      expect(service.getUserNotifications).toHaveBeenCalledWith(req.user.id, {
        unreadOnly: false,
        limit: undefined,
      });
    });
  });

  describe('getUnreadCount', () => {
    it('should return unread count', async () => {
      const req = { user: { id: '1' } };
      service.getUnreadCount.mockResolvedValue(5);

      const result = await controller.getUnreadCount(req);

      expect(result).toEqual({ count: 5 });
      expect(service.getUnreadCount).toHaveBeenCalledWith(req.user.id);
    });
  });

  describe('markAsRead', () => {
    it('should mark notification as read', async () => {
      const req = { user: { id: '1' } };
      const id = '1';
      const mockNotification = {
        id,
        userId: req.user.id,
        read: true,
      };
      service.markAsRead.mockResolvedValue(mockNotification as any);

      const result = await controller.markAsRead(req, id);

      expect(result).toEqual(mockNotification);
      expect(service.markAsRead).toHaveBeenCalledWith(id, req.user.id);
    });
  });

  describe('markAllAsRead', () => {
    it('should mark all notifications as read', async () => {
      const req = { user: { id: '1' } };
      service.markAllAsRead.mockResolvedValue(undefined);

      const result = await controller.markAllAsRead(req);

      expect(result).toEqual({ message: 'All notifications marked as read' });
      expect(service.markAllAsRead).toHaveBeenCalledWith(req.user.id);
    });
  });

  describe('delete', () => {
    it('should delete notification', async () => {
      const req = { user: { id: '1' } };
      const id = '1';
      service.delete.mockResolvedValue(undefined);

      const result = await controller.delete(req, id);

      expect(result).toEqual({ message: 'Notification deleted' });
      expect(service.delete).toHaveBeenCalledWith(id, req.user.id);
    });
  });
});


import { Injectable, Logger, Optional } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { NorChainWebSocketGateway } from '../websocket/websocket.gateway';
import { SupabaseService } from '../supabase/supabase.service';
import { Notification } from './entities/notification.entity';
import { CreateNotificationDto } from './dto/create-notification.dto';

/**
 * Notifications Service
 *
 * Manages user notifications with real-time delivery via:
 * - WebSocket (Socket.io) - For client connections
 * - Supabase Realtime - For database change subscriptions and custom events
 *
 * Supports push notifications, email notifications, and in-app notifications.
 *
 * @class NotificationsService
 * @example
 * ```typescript
 * // Create and send notification
 * await notificationsService.create({
 *   userId: 'user-id',
 *   type: 'transaction',
 *   title: 'New Transaction',
 *   message: 'You received 1 ETH',
 *   data: { txHash: '0x...' }
 * });
 * ```
 */
@Injectable()
export class NotificationsService {
  private readonly logger = new Logger(NotificationsService.name);

  constructor(
    @InjectRepository(Notification)
    private notificationRepository: Repository<Notification>,
    private websocketGateway: NorChainWebSocketGateway,
    @Optional() private supabaseService?: SupabaseService,
  ) {}

  /**
   * Creates a new notification.
   *
   * @param {CreateNotificationDto} dto - Notification data
   * @returns {Promise<Notification>} Created notification
   */
  async create(dto: CreateNotificationDto): Promise<Notification> {
    const notification = this.notificationRepository.create(dto);
    const saved = await this.notificationRepository.save(notification);

    // Send via WebSocket if user is connected
    this.websocketGateway.server
      .to(`user:${dto.userId}`)
      .emit('notification', saved);

    // Also broadcast via Supabase Realtime for cross-platform support
    if (this.supabaseService) {
      try {
        await this.supabaseService.broadcast(
          `notifications:${dto.userId}`,
          'new-notification',
          saved,
        );
        this.logger.debug(`Notification broadcasted via Supabase for user ${dto.userId}`);
      } catch (error) {
        this.logger.warn(`Failed to broadcast via Supabase: ${error.message}`);
      }
    }

    this.logger.log(`Notification created: ${saved.id} for user ${dto.userId}`);
    return saved;
  }

  /**
   * Gets notifications for a user.
   *
   * @param {string} userId - User ID
   * @param {object} options - Query options
   * @returns {Promise<Notification[]>} Array of notifications
   */
  async getUserNotifications(
    userId: string,
    options: { limit?: number; unreadOnly?: boolean } = {},
  ): Promise<Notification[]> {
    const query = this.notificationRepository
      .createQueryBuilder('notification')
      .where('notification.userId = :userId', { userId })
      .orderBy('notification.createdAt', 'DESC');

    if (options.unreadOnly) {
      query.andWhere('notification.read = false');
    }

    if (options.limit) {
      query.limit(options.limit);
    }

    return query.getMany();
  }

  /**
   * Marks a notification as read.
   *
   * @param {string} notificationId - Notification ID
   * @param {string} userId - User ID (for authorization)
   * @returns {Promise<Notification>} Updated notification
   */
  async markAsRead(
    notificationId: string,
    userId: string,
  ): Promise<Notification> {
    const notification = await this.notificationRepository.findOne({
      where: { id: notificationId, userId },
    });

    if (!notification) {
      throw new Error('Notification not found');
    }

    notification.read = true;
    notification.readAt = new Date();
    return this.notificationRepository.save(notification);
  }

  /**
   * Marks all notifications as read for a user.
   *
   * @param {string} userId - User ID
   * @returns {Promise<void>}
   */
  async markAllAsRead(userId: string): Promise<void> {
    await this.notificationRepository.update(
      { userId, read: false },
      { read: true, readAt: new Date() },
    );
  }

  /**
   * Deletes a notification.
   *
   * @param {string} notificationId - Notification ID
   * @param {string} userId - User ID (for authorization)
   * @returns {Promise<void>}
   */
  async delete(notificationId: string, userId: string): Promise<void> {
    const notification = await this.notificationRepository.findOne({
      where: { id: notificationId, userId },
    });

    if (!notification) {
      throw new Error('Notification not found');
    }

    await this.notificationRepository.delete({ id: notificationId, userId });
  }

  /**
   * Gets unread notification count for a user.
   *
   * @param {string} userId - User ID
   * @returns {Promise<number>} Unread count
   */
  async getUnreadCount(userId: string): Promise<number> {
    return this.notificationRepository.count({
      where: { userId, read: false },
    });
  }

  /**
   * Sends a real-time notification to a user.
   *
   * Uses both WebSocket and Supabase Realtime for maximum compatibility.
   *
   * @param {string} userId - User ID
   * @param {any} data - Notification data
   */
  sendRealtimeNotification(userId: string, data: any) {
    // Send via WebSocket
    this.websocketGateway.server
      .to(`user:${userId}`)
      .emit('notification', data);

    // Also broadcast via Supabase Realtime
    if (this.supabaseService) {
      this.supabaseService
        .broadcast(`notifications:${userId}`, 'notification', data)
        .catch((error) => {
          this.logger.warn(`Supabase broadcast failed: ${error.message}`);
        });
    }
  }

  /**
   * Subscribes to notifications for a user via Supabase Realtime.
   *
   * This allows clients to receive notifications directly from Supabase
   * without needing WebSocket connection.
   *
   * @param {string} userId - User ID
   * @param {Function} callback - Callback function for notifications
   */
  async subscribeToUserNotifications(
    userId: string,
    callback: (notification: Notification) => void,
  ): Promise<void> {
    if (!this.supabaseService) {
      this.logger.warn('Supabase not available for notification subscriptions');
      return;
    }

    // Subscribe to database changes
    await this.supabaseService.subscribeToChannel(
      `notifications:${userId}`,
      (payload) => {
        if (payload.type === 'presence') {
          return; // Ignore presence events
        }
        callback(payload.payload || payload);
      },
      {
        event: 'new-notification',
      },
    );

    this.logger.log(`Subscribed to notifications for user: ${userId}`);
  }
}

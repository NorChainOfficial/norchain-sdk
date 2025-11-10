import {
  Injectable,
  Logger,
  OnModuleInit,
  OnModuleDestroy,
} from '@nestjs/common';
import { ConfigService } from '@nestjs/config';
import {
  createClient,
  SupabaseClient,
  RealtimeChannel,
} from '@supabase/supabase-js';
import { NorChainWebSocketGateway } from '../websocket/websocket.gateway';

/**
 * Supabase Service
 *
 * Provides comprehensive Supabase integration for all real-time features:
 * - Database change subscriptions (blocks, transactions, tokens)
 * - Custom real-time channels and events
 * - Presence tracking
 * - Direct real-time broadcasting
 * - Storage real-time updates
 *
 * @class SupabaseService
 * @example
 * ```typescript
 * // Subscribe to database changes
 * supabaseService.subscribeToBlocks();
 *
 * // Subscribe to custom channel
 * supabaseService.subscribeToChannel('custom-events', (payload) => {
 *   console.log('Custom event:', payload);
 * });
 *
 * // Broadcast custom event
 * supabaseService.broadcast('custom-channel', 'event-name', { data: 'value' });
 * ```
 */
@Injectable()
export class SupabaseService implements OnModuleInit, OnModuleDestroy {
  private readonly logger = new Logger(SupabaseService.name);
  private supabase: SupabaseClient;
  private adminSupabase: SupabaseClient;
  private channels: Map<string, RealtimeChannel> = new Map();
  private customChannels: Map<string, RealtimeChannel> = new Map();

  constructor(
    private configService: ConfigService,
    private websocketGateway: NorChainWebSocketGateway,
  ) {
    const supabaseUrl = this.configService.get<string>('SUPABASE_URL');
    const supabaseAnonKey = this.configService.get<string>('SUPABASE_ANON_KEY');
    const supabaseServiceKey = this.configService.get<string>(
      'SUPABASE_SERVICE_ROLE_KEY',
    );

    if (supabaseUrl && supabaseAnonKey) {
      this.supabase = createClient(supabaseUrl, supabaseAnonKey, {
        realtime: {
          params: {
            eventsPerSecond: 10,
          },
        },
      });
      this.logger.log('Supabase client initialized for all real-time features');

      // Create admin client with service role key for admin operations
      if (supabaseServiceKey) {
        this.adminSupabase = createClient(supabaseUrl, supabaseServiceKey, {
          auth: {
            autoRefreshToken: false,
            persistSession: false,
          },
        });
        this.logger.log('Supabase admin client initialized');
      }
    } else {
      this.logger.warn(
        'Supabase not configured, all real-time features disabled',
      );
    }
  }

  /**
   * Initializes Supabase subscriptions on module init.
   */
  async onModuleInit() {
    if (!this.supabase) {
      this.logger.warn(
        'Supabase not configured, skipping real-time subscriptions',
      );
      return;
    }

    try {
      await this.subscribeToBlocks();
      await this.subscribeToTransactions();
      await this.subscribeToTokenTransfers();
      this.logger.log('Supabase real-time subscriptions initialized');
    } catch (error) {
      this.logger.error(
        `Failed to initialize Supabase subscriptions: ${error.message}`,
      );
    }
  }

  /**
   * Gets the Supabase client instance.
   *
   * @param {boolean} admin - Whether to return admin client (with service role key)
   * @returns {SupabaseClient} Supabase client
   */
  getClient(admin: boolean = false): SupabaseClient {
    if (admin && this.adminSupabase) {
      return this.adminSupabase;
    }
    return this.supabase;
  }

  /**
   * Subscribes to new blocks.
   *
   * Listens for new blocks in the database and broadcasts via WebSocket.
   */
  async subscribeToBlocks() {
    if (!this.supabase) return;

    const channel = this.supabase
      .channel('blocks')
      .on(
        'postgres_changes',
        {
          event: 'INSERT',
          schema: 'public',
          table: 'blocks',
        },
        (payload) => {
          this.logger.log(`New block: ${payload.new.number}`);
          this.websocketGateway.broadcastBlock(payload.new);
        },
      )
      .subscribe();

    this.channels.set('blocks', channel);
    this.logger.log('Subscribed to blocks');
  }

  /**
   * Subscribes to new transactions.
   *
   * Listens for new transactions and broadcasts to relevant addresses.
   */
  async subscribeToTransactions() {
    if (!this.supabase) return;

    const channel = this.supabase
      .channel('transactions')
      .on(
        'postgres_changes',
        {
          event: 'INSERT',
          schema: 'public',
          table: 'transactions',
        },
        (payload) => {
          const tx = payload.new as any;

          // Broadcast to from address
          if (tx.fromAddress) {
            this.websocketGateway.broadcastTransaction(tx.fromAddress, tx);
          }

          // Broadcast to to address
          if (tx.toAddress) {
            this.websocketGateway.broadcastTransaction(tx.toAddress, tx);
          }
        },
      )
      .subscribe();

    this.channels.set('transactions', channel);
    this.logger.log('Subscribed to transactions');
  }

  /**
   * Subscribes to token transfers.
   *
   * Listens for token transfers and broadcasts to relevant addresses.
   */
  async subscribeToTokenTransfers() {
    if (!this.supabase) return;

    const channel = this.supabase
      .channel('token-transfers')
      .on(
        'postgres_changes',
        {
          event: 'INSERT',
          schema: 'public',
          table: 'token_transfers',
        },
        (payload) => {
          const transfer = payload.new as any;

          // Broadcast to from address
          if (transfer.fromAddress) {
            this.websocketGateway.broadcastTokenTransfer(
              transfer.fromAddress,
              transfer,
            );
          }

          // Broadcast to to address
          if (transfer.toAddress) {
            this.websocketGateway.broadcastTokenTransfer(
              transfer.toAddress,
              transfer,
            );
          }
        },
      )
      .subscribe();

    this.channels.set('token-transfers', channel);
    this.logger.log('Subscribed to token transfers');
  }

  /**
   * Subscribes to token holder updates.
   *
   * @param {string} tokenAddress - Token address
   */
  async subscribeToTokenHolders(tokenAddress: string) {
    if (!this.supabase) return;

    const channelName = `token-holders:${tokenAddress}`;

    if (this.channels.has(channelName)) {
      return; // Already subscribed
    }

    const channel = this.supabase
      .channel(channelName)
      .on(
        'postgres_changes',
        {
          event: '*',
          schema: 'public',
          table: 'token_holders',
          filter: `token_address=eq.${tokenAddress}`,
        },
        (payload) => {
          this.websocketGateway.broadcastTokenUpdate(tokenAddress, payload.new);
        },
      )
      .subscribe();

    this.channels.set(channelName, channel);
    this.logger.log(`Subscribed to token holders: ${tokenAddress}`);
  }

  /**
   * Unsubscribes from a channel.
   *
   * @param {string} channelName - Channel name
   */
  async unsubscribe(channelName: string) {
    const channel = this.channels.get(channelName);
    if (channel) {
      await this.supabase.removeChannel(channel);
      this.channels.delete(channelName);
      this.logger.log(`Unsubscribed from ${channelName}`);
    }
  }

  /**
   * Subscribes to a custom real-time channel.
   *
   * Use this for custom events, presence tracking, or any real-time feature
   * that doesn't depend on database changes.
   *
   * @param {string} channelName - Channel name
   * @param {Function} callback - Callback function for events
   * @param {object} options - Subscription options
   * @example
   * ```typescript
   * supabaseService.subscribeToChannel('notifications', (payload) => {
   *   console.log('Notification:', payload);
   * });
   * ```
   */
  async subscribeToChannel(
    channelName: string,
    callback: (payload: any) => void,
    options?: {
      event?: string;
      filter?: string;
    },
  ): Promise<void> {
    if (!this.supabase) {
      this.logger.warn(`Cannot subscribe to ${channelName}: Supabase not configured`);
      return;
    }

    if (this.customChannels.has(channelName)) {
      this.logger.warn(`Already subscribed to channel: ${channelName}`);
      return;
    }

    const channel = this.supabase.channel(channelName);

    // Subscribe to custom events
    if (options?.event) {
      channel.on('broadcast', { event: options.event }, (payload) => {
        callback(payload);
      });
    } else {
      // Subscribe to all events on channel
      channel.on('broadcast', { event: '*' }, (payload) => {
        callback(payload);
      });
    }

    // Subscribe to presence updates
    channel.on('presence', { event: 'sync' }, () => {
      const state = channel.presenceState();
      callback({ type: 'presence', state });
    });

    channel.on('presence', { event: 'join' }, ({ key, newPresences }) => {
      callback({ type: 'presence-join', key, presences: newPresences });
    });

    channel.on('presence', { event: 'leave' }, ({ key, leftPresences }) => {
      callback({ type: 'presence-leave', key, presences: leftPresences });
    });

    await channel.subscribe();
    this.customChannels.set(channelName, channel);
    this.logger.log(`Subscribed to custom channel: ${channelName}`);
  }

  /**
   * Broadcasts a custom event to a Supabase channel.
   *
   * This allows broadcasting events directly through Supabase Realtime,
   * not just database changes.
   *
   * @param {string} channelName - Channel name
   * @param {string} event - Event name
   * @param {any} payload - Event payload
   * @example
   * ```typescript
   * supabaseService.broadcast('notifications', 'new-notification', {
   *   userId: '123',
   *   message: 'New transaction'
   * });
   * ```
   */
  async broadcast(
    channelName: string,
    event: string,
    payload: any,
  ): Promise<void> {
    if (!this.supabase) {
      this.logger.warn(`Cannot broadcast to ${channelName}: Supabase not configured`);
      return;
    }

    let channel = this.customChannels.get(channelName);

    // Create channel if it doesn't exist
    if (!channel) {
      channel = this.supabase.channel(channelName);
      await channel.subscribe();
      this.customChannels.set(channelName, channel);
    }

    const status = await channel.send({
      type: 'broadcast',
      event,
      payload,
    });

    if (status === 'ok') {
      this.logger.debug(`Broadcasted ${event} to ${channelName}`);
    } else {
      this.logger.error(`Failed to broadcast ${event} to ${channelName}: ${status}`);
    }
  }

  /**
   * Updates presence on a channel.
   *
   * Use this to track who's online, what they're viewing, etc.
   *
   * @param {string} channelName - Channel name
   * @param {string} key - Unique identifier (e.g., userId)
   * @param {any} presence - Presence data
   * @example
   * ```typescript
   * supabaseService.updatePresence('blocks', 'user-123', {
   *   viewing: 'block-12345',
   *   timestamp: Date.now()
   * });
   * ```
   */
  async updatePresence(
    channelName: string,
    key: string,
    presence: any,
  ): Promise<void> {
    if (!this.supabase) {
      this.logger.warn(`Cannot update presence: Supabase not configured`);
      return;
    }

    let channel = this.customChannels.get(channelName);

    if (!channel) {
      channel = this.supabase.channel(channelName);
      await channel.subscribe();
      this.customChannels.set(channelName, channel);
    }

    await channel.track({
      key,
      ...presence,
    });

    this.logger.debug(`Updated presence for ${key} on ${channelName}`);
  }

  /**
   * Unsubscribes from a custom channel.
   *
   * @param {string} channelName - Channel name
   */
  async unsubscribeFromChannel(channelName: string): Promise<void> {
    const channel = this.customChannels.get(channelName);
    if (channel) {
      await this.supabase.removeChannel(channel);
      this.customChannels.delete(channelName);
      this.logger.log(`Unsubscribed from custom channel: ${channelName}`);
    }
  }

  /**
   * Cleans up all subscriptions on module destroy.
   */
  async onModuleDestroy(): Promise<void> {
    if (!this.supabase) return;

    // Clean up database subscriptions
    for (const [name, channel] of this.channels.entries()) {
      try {
        await this.supabase.removeChannel(channel);
        this.logger.log(`Unsubscribed from ${name}`);
      } catch (error) {
        this.logger.error(`Error unsubscribing from ${name}: ${error.message}`);
      }
    }
    this.channels.clear();

    // Clean up custom channels
    for (const [name, channel] of this.customChannels.entries()) {
      try {
        await this.supabase.removeChannel(channel);
        this.logger.log(`Unsubscribed from custom channel: ${name}`);
      } catch (error) {
        this.logger.error(`Error unsubscribing from custom channel ${name}: ${error.message}`);
      }
    }
    this.customChannels.clear();
  }
}

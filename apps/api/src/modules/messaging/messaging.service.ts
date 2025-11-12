import {
  Injectable,
  NotFoundException,
  BadRequestException,
  Logger,
  ForbiddenException,
} from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { MessagingProfile } from './entities/profile.entity';
import { Conversation, ConversationKind } from './entities/conversation.entity';
import { Message } from './entities/message.entity';
import { DeviceKey } from './entities/device-key.entity';
import { MessageReaction } from './entities/reaction.entity';
import { GroupMember, GroupMemberRole } from './entities/group-member.entity';
import { CreateProfileDto } from './dto/create-profile.dto';
import { CreateConversationDto } from './dto/create-conversation.dto';
import { SendMessageDto } from './dto/send-message.dto';
import { ManageGroupMemberDto } from './dto/manage-group-member.dto';
import { UpdateGroupDto } from './dto/update-group.dto';
import { EventEmitter2 } from '@nestjs/event-emitter';
import { createHash, randomBytes } from 'crypto';

@Injectable()
export class MessagingService {
  private readonly logger = new Logger(MessagingService.name);

  constructor(
    @InjectRepository(MessagingProfile)
    private readonly profileRepository: Repository<MessagingProfile>,
    @InjectRepository(Conversation)
    private readonly conversationRepository: Repository<Conversation>,
    @InjectRepository(Message)
    private readonly messageRepository: Repository<Message>,
    @InjectRepository(DeviceKey)
    private readonly deviceKeyRepository: Repository<DeviceKey>,
    @InjectRepository(MessageReaction)
    private readonly reactionRepository: Repository<MessageReaction>,
    @InjectRepository(GroupMember)
    private readonly groupMemberRepository: Repository<GroupMember>,
    private readonly eventEmitter: EventEmitter2,
  ) {}

  /**
   * Generate DID from wallet address
   */
  private generateDID(address: string, chainId: number = 65001): string {
    return `did:pkh:eip155:${chainId}:${address.toLowerCase()}`;
  }

  /**
   * Create or update messaging profile
   */
  async createProfile(
    dto: CreateProfileDto,
    userId: string,
  ): Promise<MessagingProfile> {
    const did = this.generateDID(dto.address);

    // Check if profile exists
    let profile = await this.profileRepository.findOne({
      where: { did },
    });

    if (profile) {
      // Update existing profile
      profile.displayName = dto.displayName || profile.displayName;
      profile.avatarUrl = dto.avatarUrl || profile.avatarUrl;
      profile.metadata = { ...profile.metadata, ...dto.metadata };
      return this.profileRepository.save(profile);
    }

    // Create new profile
    profile = this.profileRepository.create({
      did,
      address: dto.address.toLowerCase(),
      displayName: dto.displayName,
      avatarUrl: dto.avatarUrl,
      metadata: dto.metadata,
    });

    const saved = await this.profileRepository.save(profile);
    this.logger.log(`Created messaging profile: ${saved.did}`);

    return saved;
  }

  /**
   * Get profile by DID
   */
  async getProfile(did: string): Promise<MessagingProfile> {
    const profile = await this.profileRepository.findOne({
      where: { did },
    });

    if (!profile) {
      throw new NotFoundException(`Profile ${did} not found`);
    }

    return profile;
  }

  /**
   * Get profile by address
   */
  async getProfileByAddress(address: string): Promise<MessagingProfile | null> {
    const did = this.generateDID(address);
    return this.profileRepository.findOne({
      where: { did },
    });
  }

  /**
   * Create a conversation
   */
  async createConversation(
    dto: CreateConversationDto,
    senderDid: string,
  ): Promise<Conversation> {
    // Validate that sender is in members list
    if (!dto.members.includes(senderDid)) {
      throw new BadRequestException('Sender must be included in members list');
    }

    // For P2P, ensure exactly 2 members
    if (dto.kind === ConversationKind.P2P && dto.members.length !== 2) {
      throw new BadRequestException(
        'P2P conversations must have exactly 2 members',
      );
    }

    // Check if P2P conversation already exists
    if (dto.kind === ConversationKind.P2P) {
      // For P2P, check if a conversation exists with these two members
      const sortedMembers = dto.members.sort();
      const allP2P = await this.conversationRepository.find({
        where: { kind: ConversationKind.P2P },
      });

      const existing = allP2P.find(
        (conv) =>
          conv.members.length === 2 &&
          conv.members.sort().join(',') === sortedMembers.join(','),
      );

      if (existing) {
        return existing;
      }
    }

    const conversation = this.conversationRepository.create({
      kind: dto.kind,
      createdBy: senderDid,
      members: dto.members,
      name: dto.name,
      description: dto.description,
      metadata: dto.metadata,
    });

    const saved = await this.conversationRepository.save(conversation);
    this.logger.log(`Created conversation: ${saved.id} (${saved.kind})`);

    // Emit event for real-time updates
    this.eventEmitter.emit('messaging.conversation.created', {
      conversationId: saved.id,
      kind: saved.kind,
      members: saved.members,
    });

    return saved;
  }

  /**
   * Get conversation by ID
   */
  async getConversation(
    conversationId: string,
    userDid: string,
  ): Promise<Conversation> {
    const conversation = await this.conversationRepository.findOne({
      where: { id: conversationId },
    });

    if (!conversation) {
      throw new NotFoundException(`Conversation ${conversationId} not found`);
    }

    // Verify user is a member
    if (!conversation.members.includes(userDid)) {
      throw new ForbiddenException('Not a member of this conversation');
    }

    return conversation;
  }

  /**
   * List conversations for a user
   */
  async listConversations(userDid: string): Promise<Conversation[]> {
    // Find all conversations where user is a member
    // Note: This is a simplified query - in production, use proper JSONB query
    const allConversations = await this.conversationRepository.find({
      order: { updatedAt: 'DESC' },
    });

    return allConversations.filter((conv) => conv.members.includes(userDid));
  }

  /**
   * Send a message
   */
  async sendMessage(dto: SendMessageDto, senderDid: string): Promise<Message> {
    // Get conversation
    const conversation = await this.getConversation(
      dto.conversationId,
      senderDid,
    );

    // Check idempotency (if clientNonce provided)
    if (dto.clientNonce) {
      const existing = await this.messageRepository.findOne({
        where: {
          conversationId: dto.conversationId,
          clientNonce: dto.clientNonce,
        },
      });

      if (existing) {
        this.logger.log(`Message already exists for nonce ${dto.clientNonce}`);
        return existing;
      }
    }

    // Create message
    const message = this.messageRepository.create({
      conversationId: dto.conversationId,
      senderDid,
      cipherText: dto.cipherText,
      mediaRef: dto.mediaRef,
      clientNonce: dto.clientNonce,
      sentAt: new Date(),
      deliveredTo: [senderDid], // Sender has delivered to themselves
      metadata: dto.metadata,
    });

    const saved = await this.messageRepository.save(message);

    // Update conversation updatedAt
    conversation.updatedAt = new Date();
    await this.conversationRepository.save(conversation);

    this.logger.log(
      `Message sent: ${saved.id} in conversation ${dto.conversationId}`,
    );

    // Emit event for real-time delivery
    this.eventEmitter.emit('messaging.message.sent', {
      messageId: saved.id,
      conversationId: dto.conversationId,
      senderDid,
      recipientDids: conversation.members.filter((did) => did !== senderDid),
    });

    return saved;
  }

  /**
   * Get messages for a conversation
   */
  async getMessages(
    conversationId: string,
    userDid: string,
    cursor?: string,
    limit: number = 50,
  ): Promise<{ messages: Message[]; nextCursor?: string }> {
    // Verify access
    await this.getConversation(conversationId, userDid);

    const query = this.messageRepository
      .createQueryBuilder('message')
      .where('message.conversationId = :conversationId', { conversationId })
      .orderBy('message.sentAt', 'DESC')
      .take(limit + 1); // Fetch one extra to check if there's more

    if (cursor) {
      query.andWhere('message.id < :cursor', { cursor });
    }

    const messages = await query.getMany();

    // Check if there's a next page
    let nextCursor: string | undefined;
    if (messages.length > limit) {
      nextCursor = messages[limit - 1].id;
      messages.pop(); // Remove the extra message
    }

    // Reverse to get chronological order
    messages.reverse();

    return { messages, nextCursor };
  }

  /**
   * Mark message as delivered
   */
  async markDelivered(messageId: string, recipientDid: string): Promise<void> {
    const message = await this.messageRepository.findOne({
      where: { id: messageId },
    });

    if (!message) {
      throw new NotFoundException(`Message ${messageId} not found`);
    }

    if (!message.deliveredTo?.includes(recipientDid)) {
      message.deliveredTo = [...(message.deliveredTo || []), recipientDid];
      await this.messageRepository.save(message);

      this.eventEmitter.emit('messaging.message.delivered', {
        messageId,
        recipientDid,
      });
    }
  }

  /**
   * Mark message as read
   */
  async markRead(messageId: string, readerDid: string): Promise<void> {
    const message = await this.messageRepository.findOne({
      where: { id: messageId },
    });

    if (!message) {
      throw new NotFoundException(`Message ${messageId} not found`);
    }

    if (!message.readBy?.includes(readerDid)) {
      message.readBy = [...(message.readBy || []), readerDid];
      await this.messageRepository.save(message);

      this.eventEmitter.emit('messaging.message.read', {
        messageId,
        readerDid,
      });
    }
  }

  /**
   * Register device keys (for E2EE)
   */
  async registerDeviceKeys(
    did: string,
    deviceId: string,
    prekeyBundle: string,
    signedPrekey?: string,
  ): Promise<DeviceKey> {
    // Check if device already registered
    let deviceKey = await this.deviceKeyRepository.findOne({
      where: { did, deviceId },
    });

    if (deviceKey) {
      // Update existing
      deviceKey.prekeyBundle = prekeyBundle;
      deviceKey.signedPrekey = signedPrekey || deviceKey.signedPrekey;
      deviceKey.lastUsedAt = new Date();
      return this.deviceKeyRepository.save(deviceKey);
    }

    // Create new
    deviceKey = this.deviceKeyRepository.create({
      did,
      deviceId,
      prekeyBundle,
      signedPrekey,
      lastUsedAt: new Date(),
    });

    return this.deviceKeyRepository.save(deviceKey);
  }

  /**
   * Get device keys for a DID
   */
  async getDeviceKeys(did: string): Promise<DeviceKey[]> {
    return this.deviceKeyRepository.find({
      where: { did },
      order: { lastUsedAt: 'DESC' },
    });
  }

  /**
   * Add reaction to a message
   */
  async addReaction(
    messageId: string,
    userDid: string,
    emoji: string,
  ): Promise<MessageReaction> {
    // Verify message exists
    const message = await this.messageRepository.findOne({
      where: { id: messageId },
    });

    if (!message) {
      throw new NotFoundException(`Message ${messageId} not found`);
    }

    // Check if reaction already exists
    const existing = await this.reactionRepository.findOne({
      where: { messageId, userDid, emoji },
    });

    if (existing) {
      return existing; // Idempotent
    }

    const reaction = this.reactionRepository.create({
      messageId,
      userDid,
      emoji,
    });

    const saved = await this.reactionRepository.save(reaction);

    // Emit event
    this.eventEmitter.emit('messaging.reaction.added', {
      messageId,
      userDid,
      emoji,
    });

    return saved;
  }

  /**
   * Remove reaction from a message
   */
  async removeReaction(
    messageId: string,
    userDid: string,
    emoji: string,
  ): Promise<void> {
    const reaction = await this.reactionRepository.findOne({
      where: { messageId, userDid, emoji },
    });

    if (reaction) {
      await this.reactionRepository.remove(reaction);
      this.eventEmitter.emit('messaging.reaction.removed', {
        messageId,
        userDid,
        emoji,
      });
    }
  }

  /**
   * Get reactions for a message
   */
  async getReactions(messageId: string): Promise<MessageReaction[]> {
    return this.reactionRepository.find({
      where: { messageId },
      order: { createdAt: 'ASC' },
    });
  }

  /**
   * Generate signed upload URL for media
   */
  async generateMediaUploadUrl(
    userDid: string,
    contentType: string,
    kind?: string,
  ): Promise<{ uploadUrl: string; mediaRef: string }> {
    // In production, use Supabase Storage to generate signed URL
    // For now, return a placeholder
    const mediaRef = `media_${Date.now()}_${randomBytes(8).toString('hex')}`;
    const uploadUrl = `https://storage.norchain.org/chat-media/${mediaRef}`;

    return {
      uploadUrl,
      mediaRef,
    };
  }

  /**
   * Check if user has permission to manage group/channel
   */
  private async checkGroupPermission(
    conversationId: string,
    userDid: string,
    requireAdmin: boolean = false,
  ): Promise<{ conversation: Conversation; member?: GroupMember }> {
    const conversation = await this.getConversation(conversationId, userDid);

    if (conversation.kind === ConversationKind.P2P) {
      throw new BadRequestException('P2P conversations do not support member management');
    }

    // Check if user is admin/moderator
    const member = await this.groupMemberRepository.findOne({
      where: { conversationId, memberDid: userDid },
    });

    if (requireAdmin) {
      if (!member || member.role !== GroupMemberRole.ADMIN) {
        throw new ForbiddenException('Only admins can perform this action');
      }
    } else {
      if (!member || (member.role !== GroupMemberRole.ADMIN && member.role !== GroupMemberRole.MODERATOR)) {
        throw new ForbiddenException('Only admins and moderators can perform this action');
      }
    }

    return { conversation, member };
  }

  /**
   * Add member to group/channel
   */
  async addGroupMember(
    conversationId: string,
    dto: ManageGroupMemberDto,
    userDid: string,
  ): Promise<GroupMember> {
    const { conversation } = await this.checkGroupPermission(conversationId, userDid);

    // Check if member already exists
    const existing = await this.groupMemberRepository.findOne({
      where: { conversationId, memberDid: dto.memberDid },
    });

    if (existing) {
      throw new BadRequestException('Member already in group/channel');
    }

    // Verify member DID is in conversation members list
    if (!conversation.members.includes(dto.memberDid)) {
      // Add to conversation members list
      conversation.members.push(dto.memberDid);
      await this.conversationRepository.save(conversation);
    }

    const groupMember = this.groupMemberRepository.create({
      conversationId,
      memberDid: dto.memberDid,
      role: dto.role || GroupMemberRole.MEMBER,
    });

    const saved = await this.groupMemberRepository.save(groupMember);

    this.eventEmitter.emit('messaging.group.member.added', {
      conversationId,
      memberDid: dto.memberDid,
      role: saved.role,
    });

    return saved;
  }

  /**
   * Remove member from group/channel
   */
  async removeGroupMember(
    conversationId: string,
    memberDid: string,
    userDid: string,
  ): Promise<void> {
    const { conversation } = await this.checkGroupPermission(conversationId, userDid);

    // Prevent removing yourself if you're the only admin
    if (memberDid === userDid) {
      const admins = await this.groupMemberRepository.find({
        where: { conversationId, role: GroupMemberRole.ADMIN },
      });

      if (admins.length === 1 && admins[0].memberDid === userDid) {
        throw new BadRequestException('Cannot remove the only admin');
      }
    }

    const member = await this.groupMemberRepository.findOne({
      where: { conversationId, memberDid },
    });

    if (!member) {
      throw new NotFoundException('Member not found in group/channel');
    }

    await this.groupMemberRepository.remove(member);

    // Remove from conversation members list
    conversation.members = conversation.members.filter((did) => did !== memberDid);
    await this.conversationRepository.save(conversation);

    this.eventEmitter.emit('messaging.group.member.removed', {
      conversationId,
      memberDid,
    });
  }

  /**
   * Update member role
   */
  async updateMemberRole(
    conversationId: string,
    memberDid: string,
    role: GroupMemberRole,
    userDid: string,
  ): Promise<GroupMember> {
    await this.checkGroupPermission(conversationId, userDid, true); // Require admin

    const member = await this.groupMemberRepository.findOne({
      where: { conversationId, memberDid },
    });

    if (!member) {
      throw new NotFoundException('Member not found in group/channel');
    }

    member.role = role;
    const saved = await this.groupMemberRepository.save(member);

    this.eventEmitter.emit('messaging.group.member.role.updated', {
      conversationId,
      memberDid,
      role,
    });

    return saved;
  }

  /**
   * List group/channel members
   */
  async listGroupMembers(conversationId: string, userDid: string): Promise<GroupMember[]> {
    // Verify user is a member
    await this.getConversation(conversationId, userDid);

    return this.groupMemberRepository.find({
      where: { conversationId },
      order: { createdAt: 'ASC' },
    });
  }

  /**
   * Update group/channel details
   */
  async updateGroup(
    conversationId: string,
    dto: UpdateGroupDto,
    userDid: string,
  ): Promise<Conversation> {
    await this.checkGroupPermission(conversationId, userDid, true); // Require admin

    const conversation = await this.conversationRepository.findOne({
      where: { id: conversationId },
    });

    if (!conversation) {
      throw new NotFoundException(`Conversation ${conversationId} not found`);
    }

    if (dto.name !== undefined) {
      conversation.name = dto.name;
    }
    if (dto.description !== undefined) {
      conversation.description = dto.description;
    }
    if (dto.metadata !== undefined) {
      conversation.metadata = { ...conversation.metadata, ...dto.metadata };
    }

    const saved = await this.conversationRepository.save(conversation);

    this.eventEmitter.emit('messaging.group.updated', {
      conversationId,
      updates: dto,
    });

    return saved;
  }

  /**
   * Leave group/channel
   */
  async leaveGroup(conversationId: string, userDid: string): Promise<void> {
    const conversation = await this.getConversation(conversationId, userDid);

    if (conversation.kind === ConversationKind.P2P) {
      throw new BadRequestException('Cannot leave P2P conversation');
    }

    const member = await this.groupMemberRepository.findOne({
      where: { conversationId, memberDid: userDid },
    });

    if (member) {
      // Check if user is the only admin
      if (member.role === GroupMemberRole.ADMIN) {
        const admins = await this.groupMemberRepository.find({
          where: { conversationId, role: GroupMemberRole.ADMIN },
        });

        if (admins.length === 1) {
          throw new BadRequestException('Cannot leave as the only admin. Transfer admin role first.');
        }
      }

      await this.groupMemberRepository.remove(member);
    }

    // Remove from conversation members list
    conversation.members = conversation.members.filter((did) => did !== userDid);
    await this.conversationRepository.save(conversation);

    this.eventEmitter.emit('messaging.group.member.left', {
      conversationId,
      memberDid: userDid,
    });
  }

  /**
   * Delete group/channel (admin only)
   */
  async deleteGroup(conversationId: string, userDid: string): Promise<void> {
    await this.checkGroupPermission(conversationId, userDid, true); // Require admin

    const conversation = await this.conversationRepository.findOne({
      where: { id: conversationId },
    });

    if (!conversation) {
      throw new NotFoundException(`Conversation ${conversationId} not found`);
    }

    if (conversation.kind === ConversationKind.P2P) {
      throw new BadRequestException('Cannot delete P2P conversation');
    }

    // Delete all group members
    await this.groupMemberRepository.delete({ conversationId });

    // Delete conversation (cascade will handle messages, reactions, etc.)
    await this.conversationRepository.remove(conversation);

    this.eventEmitter.emit('messaging.group.deleted', {
      conversationId,
    });
  }
}

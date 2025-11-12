import {
  Controller,
  Post,
  Get,
  Patch,
  Delete,
  Body,
  Param,
  Query,
  UseGuards,
  Request,
  ParseUUIDPipe,
  DefaultValuePipe,
  ParseIntPipe,
} from '@nestjs/common';
import {
  ApiTags,
  ApiOperation,
  ApiResponse,
  ApiBearerAuth,
  ApiQuery,
  ApiHeader,
  ApiParam,
} from '@nestjs/swagger';
import { MessagingService } from './messaging.service';
import { CreateProfileDto } from './dto/create-profile.dto';
import { CreateConversationDto } from './dto/create-conversation.dto';
import { SendMessageDto } from './dto/send-message.dto';
import { AddReactionDto } from './dto/add-reaction.dto';
import { UploadMediaDto } from './dto/upload-media.dto';
import { ManageGroupMemberDto } from './dto/manage-group-member.dto';
import { UpdateGroupDto } from './dto/update-group.dto';
import { JwtAuthGuard } from '@/common/guards/jwt-auth.guard';
import { Idempotent } from '@/common/decorators/idempotency.decorator';
import { GroupMemberRole } from './entities/group-member.entity';

@ApiTags('Messaging')
@Controller('messaging')
@UseGuards(JwtAuthGuard)
@ApiBearerAuth('JWT-auth')
export class MessagingController {
  constructor(private readonly messagingService: MessagingService) {}

  @Post('profiles')
  @Idempotent()
  @ApiOperation({ summary: 'Create or update messaging profile' })
  @ApiHeader({
    name: 'Idempotency-Key',
    description: 'Idempotency key for safe retries',
    required: true,
  })
  @ApiResponse({
    status: 201,
    description: 'Profile created/updated successfully',
  })
  async createProfile(@Request() req: any, @Body() dto: CreateProfileDto) {
    // In production, verify that req.user.address matches dto.address
    return this.messagingService.createProfile(dto, req.user.id);
  }

  @Get('profiles/:did')
  @ApiOperation({ summary: 'Get messaging profile by DID' })
  @ApiResponse({ status: 200, description: 'Profile retrieved successfully' })
  @ApiResponse({ status: 404, description: 'Profile not found' })
  async getProfile(@Param('did') did: string) {
    return this.messagingService.getProfile(did);
  }

  @Post('conversations')
  @Idempotent()
  @ApiOperation({ summary: 'Create a conversation (P2P, group, or channel)' })
  @ApiHeader({
    name: 'Idempotency-Key',
    description: 'Idempotency key for safe retries',
    required: true,
  })
  @ApiResponse({
    status: 201,
    description: 'Conversation created successfully',
  })
  async createConversation(
    @Request() req: any,
    @Body() dto: CreateConversationDto,
  ) {
    // Get sender DID from user's address
    const senderDid = `did:pkh:eip155:65001:${req.user.address?.toLowerCase() || req.user.id}`;
    return this.messagingService.createConversation(dto, senderDid);
  }

  @Get('conversations')
  @ApiOperation({ summary: 'List conversations for authenticated user' })
  @ApiResponse({
    status: 200,
    description: 'Conversations retrieved successfully',
  })
  async listConversations(@Request() req: any) {
    const userDid = `did:pkh:eip155:65001:${req.user.address?.toLowerCase() || req.user.id}`;
    return this.messagingService.listConversations(userDid);
  }

  @Get('conversations/:id')
  @ApiOperation({ summary: 'Get conversation by ID' })
  @ApiResponse({
    status: 200,
    description: 'Conversation retrieved successfully',
  })
  @ApiResponse({
    status: 403,
    description: 'Not a member of this conversation',
  })
  async getConversation(
    @Request() req: any,
    @Param('id', ParseUUIDPipe) id: string,
  ) {
    const userDid = `did:pkh:eip155:65001:${req.user.address?.toLowerCase() || req.user.id}`;
    return this.messagingService.getConversation(id, userDid);
  }

  @Post('messages')
  @Idempotent()
  @ApiOperation({
    summary: 'Send an encrypted message',
    description:
      'Sends an end-to-end encrypted message. Server never sees plaintext.',
  })
  @ApiHeader({
    name: 'Idempotency-Key',
    description: 'Idempotency key for safe retries',
    required: true,
  })
  @ApiResponse({ status: 201, description: 'Message sent successfully' })
  async sendMessage(@Request() req: any, @Body() dto: SendMessageDto) {
    const senderDid = `did:pkh:eip155:65001:${req.user.address?.toLowerCase() || req.user.id}`;
    return this.messagingService.sendMessage(dto, senderDid);
  }

  @Get('messages')
  @ApiOperation({ summary: 'Get messages for a conversation' })
  @ApiQuery({
    name: 'conversationId',
    required: true,
    type: String,
    description: 'Conversation ID',
  })
  @ApiQuery({
    name: 'cursor',
    required: false,
    type: String,
    description: 'Cursor for pagination',
  })
  @ApiQuery({
    name: 'limit',
    required: false,
    type: Number,
    description: 'Number of messages to retrieve',
  })
  @ApiResponse({ status: 200, description: 'Messages retrieved successfully' })
  async getMessages(
    @Request() req: any,
    @Query('conversationId', ParseUUIDPipe) conversationId: string,
    @Query('cursor') cursor?: string,
    @Query('limit', new DefaultValuePipe(50), ParseIntPipe) limit?: number,
  ) {
    const userDid = `did:pkh:eip155:65001:${req.user.address?.toLowerCase() || req.user.id}`;
    return this.messagingService.getMessages(
      conversationId,
      userDid,
      cursor,
      limit,
    );
  }

  @Post('messages/:id/delivered')
  @ApiOperation({ summary: 'Mark message as delivered' })
  @ApiResponse({ status: 200, description: 'Message marked as delivered' })
  async markDelivered(
    @Request() req: any,
    @Param('id', ParseUUIDPipe) id: string,
  ) {
    const recipientDid = `did:pkh:eip155:65001:${req.user.address?.toLowerCase() || req.user.id}`;
    await this.messagingService.markDelivered(id, recipientDid);
    return { success: true };
  }

  @Post('messages/:id/read')
  @ApiOperation({ summary: 'Mark message as read' })
  @ApiResponse({ status: 200, description: 'Message marked as read' })
  async markRead(@Request() req: any, @Param('id', ParseUUIDPipe) id: string) {
    const readerDid = `did:pkh:eip155:65001:${req.user.address?.toLowerCase() || req.user.id}`;
    await this.messagingService.markRead(id, readerDid);
    return { success: true };
  }

  @Post('messages/:id/reactions')
  @Idempotent()
  @ApiOperation({ summary: 'Add reaction to a message' })
  @ApiHeader({
    name: 'Idempotency-Key',
    description: 'Idempotency key for safe retries',
    required: true,
  })
  @ApiResponse({ status: 201, description: 'Reaction added successfully' })
  async addReaction(
    @Request() req: any,
    @Param('id', ParseUUIDPipe) id: string,
    @Body() dto: AddReactionDto,
  ) {
    const userDid = `did:pkh:eip155:65001:${req.user.address?.toLowerCase() || req.user.id}`;
    return this.messagingService.addReaction(id, userDid, dto.emoji);
  }

  @Delete('messages/:id/reactions')
  @ApiOperation({ summary: 'Remove reaction from a message' })
  @ApiResponse({ status: 200, description: 'Reaction removed successfully' })
  async removeReaction(
    @Request() req: any,
    @Param('id', ParseUUIDPipe) id: string,
    @Body() dto: AddReactionDto,
  ) {
    const userDid = `did:pkh:eip155:65001:${req.user.address?.toLowerCase() || req.user.id}`;
    await this.messagingService.removeReaction(id, userDid, dto.emoji);
    return { success: true };
  }

  @Get('messages/:id/reactions')
  @ApiOperation({ summary: 'Get reactions for a message' })
  @ApiResponse({ status: 200, description: 'Reactions retrieved successfully' })
  async getReactions(@Param('id', ParseUUIDPipe) id: string) {
    return this.messagingService.getReactions(id);
  }

  @Post('media/upload-url')
  @Idempotent()
  @ApiOperation({ summary: 'Generate signed upload URL for media' })
  @ApiHeader({
    name: 'Idempotency-Key',
    description: 'Idempotency key for safe retries',
    required: true,
  })
  @ApiResponse({
    status: 201,
    description: 'Upload URL generated successfully',
  })
  async generateMediaUploadUrl(
    @Request() req: any,
    @Body() dto: UploadMediaDto,
  ) {
    const userDid = `did:pkh:eip155:65001:${req.user.address?.toLowerCase() || req.user.id}`;
    return this.messagingService.generateMediaUploadUrl(
      userDid,
      dto.contentType,
      dto.kind,
    );
  }

  // ========== Group & Channel Management Endpoints ==========

  @Post('groups/:id/members')
  @Idempotent()
  @ApiOperation({ summary: 'Add member to group/channel' })
  @ApiHeader({
    name: 'Idempotency-Key',
    description: 'Idempotency key for safe retries',
    required: true,
  })
  @ApiParam({ name: 'id', description: 'Conversation ID' })
  @ApiResponse({
    status: 201,
    description: 'Member added successfully',
  })
  @ApiResponse({ status: 403, description: 'Insufficient permissions' })
  async addGroupMember(
    @Request() req: any,
    @Param('id', ParseUUIDPipe) conversationId: string,
    @Body() dto: ManageGroupMemberDto,
  ) {
    const userDid = `did:pkh:eip155:65001:${req.user.address?.toLowerCase() || req.user.id}`;
    return this.messagingService.addGroupMember(conversationId, dto, userDid);
  }

  @Delete('groups/:id/members/:memberDid')
  @ApiOperation({ summary: 'Remove member from group/channel' })
  @ApiParam({ name: 'id', description: 'Conversation ID' })
  @ApiParam({ name: 'memberDid', description: 'Member DID to remove' })
  @ApiResponse({
    status: 200,
    description: 'Member removed successfully',
  })
  async removeGroupMember(
    @Request() req: any,
    @Param('id', ParseUUIDPipe) conversationId: string,
    @Param('memberDid') memberDid: string,
  ) {
    const userDid = `did:pkh:eip155:65001:${req.user.address?.toLowerCase() || req.user.id}`;
    await this.messagingService.removeGroupMember(conversationId, memberDid, userDid);
    return { success: true };
  }

  @Patch('groups/:id/members/:memberDid/role')
  @ApiOperation({ summary: 'Update member role (admin only)' })
  @ApiParam({ name: 'id', description: 'Conversation ID' })
  @ApiParam({ name: 'memberDid', description: 'Member DID' })
  @ApiQuery({
    name: 'role',
    required: true,
    enum: GroupMemberRole,
    description: 'New role',
  })
  @ApiResponse({
    status: 200,
    description: 'Role updated successfully',
  })
  async updateMemberRole(
    @Request() req: any,
    @Param('id', ParseUUIDPipe) conversationId: string,
    @Param('memberDid') memberDid: string,
    @Query('role') role: GroupMemberRole,
  ) {
    const userDid = `did:pkh:eip155:65001:${req.user.address?.toLowerCase() || req.user.id}`;
    return this.messagingService.updateMemberRole(conversationId, memberDid, role, userDid);
  }

  @Get('groups/:id/members')
  @ApiOperation({ summary: 'List group/channel members' })
  @ApiParam({ name: 'id', description: 'Conversation ID' })
  @ApiResponse({
    status: 200,
    description: 'Members retrieved successfully',
  })
  async listGroupMembers(
    @Request() req: any,
    @Param('id', ParseUUIDPipe) conversationId: string,
  ) {
    const userDid = `did:pkh:eip155:65001:${req.user.address?.toLowerCase() || req.user.id}`;
    return this.messagingService.listGroupMembers(conversationId, userDid);
  }

  @Patch('groups/:id')
  @Idempotent()
  @ApiOperation({ summary: 'Update group/channel details (admin only)' })
  @ApiHeader({
    name: 'Idempotency-Key',
    description: 'Idempotency key for safe retries',
    required: true,
  })
  @ApiParam({ name: 'id', description: 'Conversation ID' })
  @ApiResponse({
    status: 200,
    description: 'Group updated successfully',
  })
  async updateGroup(
    @Request() req: any,
    @Param('id', ParseUUIDPipe) conversationId: string,
    @Body() dto: UpdateGroupDto,
  ) {
    const userDid = `did:pkh:eip155:65001:${req.user.address?.toLowerCase() || req.user.id}`;
    return this.messagingService.updateGroup(conversationId, dto, userDid);
  }

  @Post('groups/:id/leave')
  @ApiOperation({ summary: 'Leave group/channel' })
  @ApiParam({ name: 'id', description: 'Conversation ID' })
  @ApiResponse({
    status: 200,
    description: 'Left group successfully',
  })
  async leaveGroup(
    @Request() req: any,
    @Param('id', ParseUUIDPipe) conversationId: string,
  ) {
    const userDid = `did:pkh:eip155:65001:${req.user.address?.toLowerCase() || req.user.id}`;
    await this.messagingService.leaveGroup(conversationId, userDid);
    return { success: true };
  }

  @Delete('groups/:id')
  @ApiOperation({ summary: 'Delete group/channel (admin only)' })
  @ApiParam({ name: 'id', description: 'Conversation ID' })
  @ApiResponse({
    status: 200,
    description: 'Group deleted successfully',
  })
  async deleteGroup(
    @Request() req: any,
    @Param('id', ParseUUIDPipe) conversationId: string,
  ) {
    const userDid = `did:pkh:eip155:65001:${req.user.address?.toLowerCase() || req.user.id}`;
    await this.messagingService.deleteGroup(conversationId, userDid);
    return { success: true };
  }
}

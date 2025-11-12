import { Module } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';
import { MessagingController } from './messaging.controller';
import { MessagingService } from './messaging.service';
import { MessagingProfile } from './entities/profile.entity';
import { Conversation } from './entities/conversation.entity';
import { Message } from './entities/message.entity';
import { DeviceKey } from './entities/device-key.entity';
import { MessageReaction } from './entities/reaction.entity';
import { GroupMember } from './entities/group-member.entity';
import { EventEmitterModule } from '@nestjs/event-emitter';

@Module({
  imports: [
    TypeOrmModule.forFeature([
      MessagingProfile,
      Conversation,
      Message,
      DeviceKey,
      MessageReaction,
      GroupMember,
    ]),
    EventEmitterModule,
  ],
  controllers: [MessagingController],
  providers: [MessagingService],
  exports: [MessagingService],
})
export class MessagingModule {}

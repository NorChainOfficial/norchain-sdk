import { Module } from '@nestjs/common';
import { StreamingController } from './streaming.controller';
import { EventEmitterModule } from '@nestjs/event-emitter';

@Module({
  imports: [EventEmitterModule],
  controllers: [StreamingController],
})
export class StreamingModule {}


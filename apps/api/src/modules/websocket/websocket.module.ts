import { Module } from '@nestjs/common';
import { NorChainWebSocketGateway } from './websocket.gateway';
import { JwtModule } from '@nestjs/jwt';
import { ConfigModule } from '@nestjs/config';
import { EventEmitterModule } from '@nestjs/event-emitter';

@Module({
  imports: [JwtModule, ConfigModule, EventEmitterModule],
  providers: [NorChainWebSocketGateway],
  exports: [NorChainWebSocketGateway],
})
export class WebSocketModule {}

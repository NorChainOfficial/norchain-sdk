import { Module } from '@nestjs/common';
import { NorChainWebSocketGateway } from './websocket.gateway';
import { JwtModule } from '@nestjs/jwt';
import { ConfigModule } from '@nestjs/config';

@Module({
  imports: [JwtModule, ConfigModule],
  providers: [NorChainWebSocketGateway],
  exports: [NorChainWebSocketGateway],
})
export class WebSocketModule {}


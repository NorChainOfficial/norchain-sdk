import { Module } from '@nestjs/common';
import { ConfigModule } from '@nestjs/config';
import { SupabaseService } from './supabase.service';
import { SupabaseAuthService } from './supabase-auth.service';
import { SupabaseStorageService } from './supabase-storage.service';
import { WebSocketModule } from '../websocket/websocket.module';

@Module({
  imports: [ConfigModule, WebSocketModule],
  providers: [SupabaseService, SupabaseAuthService, SupabaseStorageService],
  exports: [SupabaseService, SupabaseAuthService, SupabaseStorageService],
})
export class SupabaseModule {}

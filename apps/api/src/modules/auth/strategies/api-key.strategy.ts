import { Injectable, UnauthorizedException } from '@nestjs/common';
import { PassportStrategy } from '@nestjs/passport';
import { Strategy } from 'passport-custom';
import { Request } from 'express';
import { AuthService } from '../auth.service';
import { ApiKey } from '../entities/api-key.entity';

@Injectable()
export class ApiKeyStrategy extends PassportStrategy(Strategy, 'api-key') {
  constructor(private authService: AuthService) {
    super();
  }

  async validate(req: Request): Promise<ApiKey> {
    const apiKey =
      req.headers['x-api-key'] || req.headers['X-API-Key'] || undefined;
    if (!apiKey || typeof apiKey !== 'string') {
      throw new UnauthorizedException('API key missing');
    }
    const key = await this.authService.validateApiKey(apiKey);
    if (!key) {
      throw new UnauthorizedException('Invalid API key');
    }
    return key;
  }
}

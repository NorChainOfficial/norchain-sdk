import {
  Injectable,
  CanActivate,
  ExecutionContext,
  ForbiddenException,
} from '@nestjs/common';
import { Reflector } from '@nestjs/core';
import { SCOPES_KEY } from '../decorators/api-scopes.decorator';

@Injectable()
export class ScopeGuard implements CanActivate {
  constructor(private reflector: Reflector) {}

  canActivate(context: ExecutionContext): boolean {
    const requiredScopes = this.reflector.getAllAndOverride<string[]>(
      SCOPES_KEY,
      [context.getHandler(), context.getClass()],
    );

    if (!requiredScopes || requiredScopes.length === 0) {
      return true; // No scopes required
    }

    const request = context.switchToHttp().getRequest();
    const user = request.user;
    const apiKey = request.apiKey;

    // Check JWT token scopes
    if (user && user.scopes) {
      const hasScope = requiredScopes.some((scope) =>
        user.scopes.includes(scope),
      );
      if (hasScope) {
        return true;
      }
    }

    // Check API key scopes
    if (apiKey && apiKey.scopes) {
      const hasScope = requiredScopes.some((scope) =>
        apiKey.scopes.includes(scope),
      );
      if (hasScope) {
        return true;
      }
    }

    throw new ForbiddenException(
      `Insufficient permissions. Required scopes: ${requiredScopes.join(', ')}`,
    );
  }
}

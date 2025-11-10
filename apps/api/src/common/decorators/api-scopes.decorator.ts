import { SetMetadata } from '@nestjs/common';

export const SCOPES_KEY = 'scopes';
export const ApiScopes = (...scopes: string[]) => SetMetadata(SCOPES_KEY, scopes);

// Standard scope definitions
export enum ApiScope {
  // Read scopes
  READ_ACCOUNT = 'read:account',
  READ_TRANSACTION = 'read:transaction',
  READ_BLOCK = 'read:block',
  READ_TOKEN = 'read:token',
  READ_CONTRACT = 'read:contract',
  READ_BRIDGE = 'read:bridge',
  READ_COMPLIANCE = 'read:compliance',
  READ_GOVERNANCE = 'read:governance',
  READ_WALLET = 'read:wallet',

  // Write scopes
  WRITE_TRANSACTION = 'write:transaction',
  WRITE_SWAP = 'write:swap',
  WRITE_ORDER = 'write:order',
  WRITE_BRIDGE = 'write:bridge',
  WRITE_WALLET = 'write:wallet',
  WRITE_GOVERNANCE = 'write:governance',
  WRITE_COMPLIANCE = 'write:compliance',

  // Admin scopes
  ADMIN_VALIDATOR = 'admin:validator',
  ADMIN_PARAMS = 'admin:params',
  ADMIN_COMPLIANCE = 'admin:compliance',
}


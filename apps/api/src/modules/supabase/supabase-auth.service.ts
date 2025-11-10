import { Injectable, Logger, UnauthorizedException } from '@nestjs/common';
import { ConfigService } from '@nestjs/config';
import { SupabaseClient, AuthError } from '@supabase/supabase-js';
import { SupabaseService } from './supabase.service';

/**
 * Supabase Auth Service
 *
 * Provides Supabase authentication integration:
 * - User registration and login
 * - Session management
 * - Password reset
 * - Email verification
 * - OAuth providers (Google, GitHub, etc.)
 * - User metadata management
 *
 * Can work alongside existing JWT auth or replace it.
 *
 * @class SupabaseAuthService
 * @example
 * ```typescript
 * // Register with Supabase Auth
 * const { user, session } = await supabaseAuthService.signUp({
 *   email: 'user@example.com',
 *   password: 'password123',
 *   metadata: { name: 'John Doe' }
 * });
 *
 * // Login with Supabase Auth
 * const { user, session } = await supabaseAuthService.signIn({
 *   email: 'user@example.com',
 *   password: 'password123'
 * });
 * ```
 */
@Injectable()
export class SupabaseAuthService {
  private readonly logger = new Logger(SupabaseAuthService.name);
  private supabase: SupabaseClient;

  constructor(
    private configService: ConfigService,
    private supabaseService: SupabaseService,
  ) {
    this.supabase = this.supabaseService.getClient();
  }

  /**
   * Registers a new user with Supabase Auth.
   *
   * @param {object} data - Registration data
   * @param {string} data.email - User email
   * @param {string} data.password - User password
   * @param {object} data.metadata - Additional user metadata
   * @returns {Promise<{ user: any; session: any }>} User and session
   * @throws {UnauthorizedException} If registration fails
   */
  async signUp(data: {
    email: string;
    password: string;
    metadata?: Record<string, any>;
  }): Promise<{ user: any; session: any }> {
    if (!this.supabase) {
      throw new UnauthorizedException('Supabase not configured');
    }

    try {
      const { data: authData, error } = await this.supabase.auth.signUp({
        email: data.email,
        password: data.password,
        options: {
          data: data.metadata || {},
        },
      });

      if (error) {
        this.logger.error(`Supabase signup error: ${error.message}`);
        throw new UnauthorizedException(error.message);
      }

      this.logger.log(`User registered via Supabase: ${authData.user?.email}`);
      return {
        user: authData.user,
        session: authData.session,
      };
    } catch (error) {
      if (error instanceof UnauthorizedException) {
        throw error;
      }
      this.logger.error(`Unexpected signup error: ${error.message}`);
      throw new UnauthorizedException('Registration failed');
    }
  }

  /**
   * Signs in a user with Supabase Auth.
   *
   * @param {object} credentials - Login credentials
   * @param {string} credentials.email - User email
   * @param {string} credentials.password - User password
   * @returns {Promise<{ user: any; session: any }>} User and session
   * @throws {UnauthorizedException} If login fails
   */
  async signIn(credentials: {
    email: string;
    password: string;
  }): Promise<{ user: any; session: any }> {
    if (!this.supabase) {
      throw new UnauthorizedException('Supabase not configured');
    }

    try {
      const { data: authData, error } =
        await this.supabase.auth.signInWithPassword({
          email: credentials.email,
          password: credentials.password,
        });

      if (error) {
        this.logger.error(`Supabase signin error: ${error.message}`);
        throw new UnauthorizedException('Invalid credentials');
      }

      this.logger.log(`User signed in via Supabase: ${authData.user?.email}`);
      return {
        user: authData.user,
        session: authData.session,
      };
    } catch (error) {
      if (error instanceof UnauthorizedException) {
        throw error;
      }
      this.logger.error(`Unexpected signin error: ${error.message}`);
      throw new UnauthorizedException('Login failed');
    }
  }

  /**
   * Signs out the current user.
   *
   * @returns {Promise<void>}
   */
  async signOut(): Promise<void> {
    if (!this.supabase) {
      return;
    }

    const { error } = await this.supabase.auth.signOut();
    if (error) {
      this.logger.error(`Supabase signout error: ${error.message}`);
    } else {
      this.logger.log('User signed out via Supabase');
    }
  }

  /**
   * Gets the current user session.
   *
   * @returns {Promise<any>} Current session or null
   */
  async getSession(): Promise<any> {
    if (!this.supabase) {
      return null;
    }

    const { data, error } = await this.supabase.auth.getSession();
    if (error) {
      this.logger.error(`Get session error: ${error.message}`);
      return null;
    }

    return data.session;
  }

  /**
   * Gets the current user.
   *
   * @returns {Promise<any>} Current user or null
   */
  async getUser(): Promise<any> {
    if (!this.supabase) {
      return null;
    }

    const { data, error } = await this.supabase.auth.getUser();
    if (error) {
      this.logger.error(`Get user error: ${error.message}`);
      return null;
    }

    return data.user;
  }

  /**
   * Refreshes the user session.
   *
   * @param {string} refreshToken - Refresh token
   * @returns {Promise<{ user: any; session: any }>} New user and session
   */
  async refreshSession(
    refreshToken: string,
  ): Promise<{ user: any; session: any }> {
    if (!this.supabase) {
      throw new UnauthorizedException('Supabase not configured');
    }

    const { data, error } = await this.supabase.auth.refreshSession({
      refresh_token: refreshToken,
    });

    if (error) {
      this.logger.error(`Refresh session error: ${error.message}`);
      throw new UnauthorizedException('Session refresh failed');
    }

    return {
      user: data.user,
      session: data.session,
    };
  }

  /**
   * Sends password reset email.
   *
   * @param {string} email - User email
   * @returns {Promise<void>}
   */
  async resetPassword(email: string): Promise<void> {
    if (!this.supabase) {
      throw new UnauthorizedException('Supabase not configured');
    }

    const { error } = await this.supabase.auth.resetPasswordForEmail(email, {
      redirectTo: this.configService.get<string>(
        'SUPABASE_PASSWORD_RESET_URL',
        'http://localhost:3000/reset-password',
      ),
    });

    if (error) {
      this.logger.error(`Password reset error: ${error.message}`);
      throw new UnauthorizedException('Password reset failed');
    }

    this.logger.log(`Password reset email sent to: ${email}`);
  }

  /**
   * Updates user password.
   *
   * @param {string} newPassword - New password
   * @returns {Promise<void>}
   */
  async updatePassword(newPassword: string): Promise<void> {
    if (!this.supabase) {
      throw new UnauthorizedException('Supabase not configured');
    }

    const { error } = await this.supabase.auth.updateUser({
      password: newPassword,
    });

    if (error) {
      this.logger.error(`Update password error: ${error.message}`);
      throw new UnauthorizedException('Password update failed');
    }

    this.logger.log('Password updated successfully');
  }

  /**
   * Updates user metadata.
   *
   * @param {object} metadata - User metadata
   * @returns {Promise<any>} Updated user
   */
  async updateUserMetadata(metadata: Record<string, any>): Promise<any> {
    if (!this.supabase) {
      throw new UnauthorizedException('Supabase not configured');
    }

    const { data, error } = await this.supabase.auth.updateUser({
      data: metadata,
    });

    if (error) {
      this.logger.error(`Update metadata error: ${error.message}`);
      throw new UnauthorizedException('Metadata update failed');
    }

    return data.user;
  }

  /**
   * Verifies OTP (One-Time Password) for email verification or password reset.
   *
   * @param {object} params - OTP parameters
   * @param {string} params.email - User email
   * @param {string} params.token - OTP token
   * @param {string} params.type - OTP type ('email' or 'recovery')
   * @returns {Promise<{ user: any; session: any }>} User and session
   */
  async verifyOtp(params: {
    email: string;
    token: string;
    type: 'email' | 'recovery';
  }): Promise<{ user: any; session: any }> {
    if (!this.supabase) {
      throw new UnauthorizedException('Supabase not configured');
    }

    const { data, error } = await this.supabase.auth.verifyOtp({
      email: params.email,
      token: params.token,
      type: params.type,
    });

    if (error) {
      this.logger.error(`OTP verification error: ${error.message}`);
      throw new UnauthorizedException('OTP verification failed');
    }

    return {
      user: data.user,
      session: data.session,
    };
  }

  /**
   * Signs in with OAuth provider.
   *
   * @param {string} provider - OAuth provider (google, github, etc.)
   * @param {string} redirectTo - Redirect URL after OAuth
   * @returns {Promise<{ url: string }>} OAuth URL
   */
  async signInWithOAuth(
    provider: string,
    redirectTo?: string,
  ): Promise<{ url: string }> {
    if (!this.supabase) {
      throw new UnauthorizedException('Supabase not configured');
    }

    const { data, error } = await this.supabase.auth.signInWithOAuth({
      provider: provider as any,
      options: {
        redirectTo:
          redirectTo ||
          this.configService.get<string>(
            'SUPABASE_OAUTH_REDIRECT_URL',
            'http://localhost:3000/auth/callback',
          ),
      },
    });

    if (error) {
      this.logger.error(`OAuth signin error: ${error.message}`);
      throw new UnauthorizedException('OAuth signin failed');
    }

    return { url: data.url };
  }

  /**
   * Validates a Supabase session token.
   *
   * @param {string} accessToken - Supabase access token
   * @returns {Promise<any>} User if valid, null otherwise
   */
  async validateSession(accessToken: string): Promise<any> {
    if (!this.supabase) {
      return null;
    }

    const { data, error } = await this.supabase.auth.getUser(accessToken);
    if (error) {
      this.logger.error(`Session validation error: ${error.message}`);
      return null;
    }

    return data.user;
  }
}

import { Test, TestingModule } from '@nestjs/testing';
import { ConfigService } from '@nestjs/config';
import { UnauthorizedException } from '@nestjs/common';
import { SupabaseAuthService } from './supabase-auth.service';
import { SupabaseService } from './supabase.service';

describe('SupabaseAuthService', () => {
  let service: SupabaseAuthService;
  let supabaseService: jest.Mocked<SupabaseService>;
  let configService: jest.Mocked<ConfigService>;
  let mockSupabaseClient: any;

  beforeEach(async () => {
    mockSupabaseClient = {
      auth: {
        signUp: jest.fn(),
        signInWithPassword: jest.fn(),
        signOut: jest.fn(),
        getSession: jest.fn(),
        getUser: jest.fn(),
        refreshSession: jest.fn(),
        resetPasswordForEmail: jest.fn(),
        updateUser: jest.fn(),
        verifyOtp: jest.fn(),
        signInWithOAuth: jest.fn(),
      },
    };

    const mockSupabaseService = {
      getClient: jest.fn().mockReturnValue(mockSupabaseClient),
    };

    const mockConfigService = {
      get: jest.fn(),
    };

    const module: TestingModule = await Test.createTestingModule({
      providers: [
        SupabaseAuthService,
        {
          provide: SupabaseService,
          useValue: mockSupabaseService,
        },
        {
          provide: ConfigService,
          useValue: mockConfigService,
        },
      ],
    }).compile();

    service = module.get<SupabaseAuthService>(SupabaseAuthService);
    supabaseService = module.get(SupabaseService);
    configService = module.get(ConfigService);
  });

  afterEach(() => {
    jest.clearAllMocks();
  });

  it('should be defined', () => {
    expect(service).toBeDefined();
  });

  describe('signUp', () => {
    it('should register a new user successfully', async () => {
      const mockUser = { id: '123', email: 'test@example.com' };
      const mockSession = { access_token: 'token' };

      mockSupabaseClient.auth.signUp.mockResolvedValue({
        data: { user: mockUser, session: mockSession },
        error: null,
      });

      const result = await service.signUp({
        email: 'test@example.com',
        password: 'password123',
        metadata: { name: 'Test User' },
      });

      expect(result).toEqual({ user: mockUser, session: mockSession });
      expect(mockSupabaseClient.auth.signUp).toHaveBeenCalledWith({
        email: 'test@example.com',
        password: 'password123',
        options: {
          data: { name: 'Test User' },
        },
      });
    });

    it('should throw UnauthorizedException on signup error', async () => {
      mockSupabaseClient.auth.signUp.mockResolvedValue({
        data: null,
        error: { message: 'User already exists' },
      });

      await expect(
        service.signUp({
          email: 'test@example.com',
          password: 'password123',
        }),
      ).rejects.toThrow(UnauthorizedException);
    });

    it('should throw UnauthorizedException if Supabase not configured', async () => {
      (service as any).supabase = null;

      await expect(
        service.signUp({
          email: 'test@example.com',
          password: 'password123',
        }),
      ).rejects.toThrow(UnauthorizedException);
    });
  });

  describe('signIn', () => {
    it('should sign in user successfully', async () => {
      const mockUser = { id: '123', email: 'test@example.com' };
      const mockSession = { access_token: 'token' };

      mockSupabaseClient.auth.signInWithPassword.mockResolvedValue({
        data: { user: mockUser, session: mockSession },
        error: null,
      });

      const result = await service.signIn({
        email: 'test@example.com',
        password: 'password123',
      });

      expect(result).toEqual({ user: mockUser, session: mockSession });
      expect(mockSupabaseClient.auth.signInWithPassword).toHaveBeenCalledWith({
        email: 'test@example.com',
        password: 'password123',
      });
    });

    it('should throw UnauthorizedException on invalid credentials', async () => {
      mockSupabaseClient.auth.signInWithPassword.mockResolvedValue({
        data: null,
        error: { message: 'Invalid credentials' },
      });

      await expect(
        service.signIn({
          email: 'test@example.com',
          password: 'wrongpassword',
        }),
      ).rejects.toThrow(UnauthorizedException);
    });
  });

  describe('signOut', () => {
    it('should sign out successfully', async () => {
      mockSupabaseClient.auth.signOut.mockResolvedValue({
        error: null,
      });

      await service.signOut();

      expect(mockSupabaseClient.auth.signOut).toHaveBeenCalled();
    });

    it('should handle signout gracefully if Supabase not configured', async () => {
      (service as any).supabase = null;

      await expect(service.signOut()).resolves.not.toThrow();
    });
  });

  describe('getSession', () => {
    it('should return session if available', async () => {
      const mockSession = { access_token: 'token' };

      mockSupabaseClient.auth.getSession.mockResolvedValue({
        data: { session: mockSession },
        error: null,
      });

      const result = await service.getSession();

      expect(result).toEqual(mockSession);
    });

    it('should return null if no session', async () => {
      mockSupabaseClient.auth.getSession.mockResolvedValue({
        data: { session: null },
        error: null,
      });

      const result = await service.getSession();

      expect(result).toBeNull();
    });

    it('should return null on error', async () => {
      mockSupabaseClient.auth.getSession.mockResolvedValue({
        data: null,
        error: { message: 'Error' },
      });

      const result = await service.getSession();

      expect(result).toBeNull();
    });
  });

  describe('getUser', () => {
    it('should return user if available', async () => {
      const mockUser = { id: '123', email: 'test@example.com' };

      mockSupabaseClient.auth.getUser.mockResolvedValue({
        data: { user: mockUser },
        error: null,
      });

      const result = await service.getUser();

      expect(result).toEqual(mockUser);
    });

    it('should return null on error', async () => {
      mockSupabaseClient.auth.getUser.mockResolvedValue({
        data: null,
        error: { message: 'Error' },
      });

      const result = await service.getUser();

      expect(result).toBeNull();
    });
  });

  describe('refreshSession', () => {
    it('should refresh session successfully', async () => {
      const mockUser = { id: '123', email: 'test@example.com' };
      const mockSession = { access_token: 'new-token' };

      mockSupabaseClient.auth.refreshSession.mockResolvedValue({
        data: { user: mockUser, session: mockSession },
        error: null,
      });

      const result = await service.refreshSession('refresh-token');

      expect(result).toEqual({ user: mockUser, session: mockSession });
      expect(mockSupabaseClient.auth.refreshSession).toHaveBeenCalledWith({
        refresh_token: 'refresh-token',
      });
    });

    it('should throw UnauthorizedException on refresh error', async () => {
      mockSupabaseClient.auth.refreshSession.mockResolvedValue({
        data: null,
        error: { message: 'Invalid refresh token' },
      });

      await expect(
        service.refreshSession('invalid-token'),
      ).rejects.toThrow(UnauthorizedException);
    });
  });

  describe('resetPassword', () => {
    it('should send password reset email', async () => {
      configService.get.mockReturnValue('http://localhost:3000/reset-password');

      mockSupabaseClient.auth.resetPasswordForEmail.mockResolvedValue({
        error: null,
      });

      await service.resetPassword('test@example.com');

      expect(mockSupabaseClient.auth.resetPasswordForEmail).toHaveBeenCalledWith(
        'test@example.com',
        {
          redirectTo: 'http://localhost:3000/reset-password',
        },
      );
    });

    it('should throw UnauthorizedException on error', async () => {
      configService.get.mockReturnValue('http://localhost:3000/reset-password');

      mockSupabaseClient.auth.resetPasswordForEmail.mockResolvedValue({
        error: { message: 'User not found' },
      });

      await expect(
        service.resetPassword('test@example.com'),
      ).rejects.toThrow(UnauthorizedException);
    });
  });

  describe('updatePassword', () => {
    it('should update password successfully', async () => {
      mockSupabaseClient.auth.updateUser.mockResolvedValue({
        error: null,
      });

      await service.updatePassword('newpassword123');

      expect(mockSupabaseClient.auth.updateUser).toHaveBeenCalledWith({
        password: 'newpassword123',
      });
    });

    it('should throw UnauthorizedException on error', async () => {
      mockSupabaseClient.auth.updateUser.mockResolvedValue({
        error: { message: 'Invalid password' },
      });

      await expect(
        service.updatePassword('weak'),
      ).rejects.toThrow(UnauthorizedException);
    });
  });

  describe('updateUserMetadata', () => {
    it('should update user metadata successfully', async () => {
      const mockUser = { id: '123', email: 'test@example.com' };

      mockSupabaseClient.auth.updateUser.mockResolvedValue({
        data: { user: mockUser },
        error: null,
      });

      const result = await service.updateUserMetadata({ name: 'New Name' });

      expect(result).toEqual(mockUser);
      expect(mockSupabaseClient.auth.updateUser).toHaveBeenCalledWith({
        data: { name: 'New Name' },
      });
    });

    it('should throw UnauthorizedException on error', async () => {
      mockSupabaseClient.auth.updateUser.mockResolvedValue({
        data: null,
        error: { message: 'Update failed' },
      });

      await expect(
        service.updateUserMetadata({ name: 'New Name' }),
      ).rejects.toThrow(UnauthorizedException);
    });
  });

  describe('verifyOtp', () => {
    it('should verify OTP successfully', async () => {
      const mockUser = { id: '123', email: 'test@example.com' };
      const mockSession = { access_token: 'token' };

      mockSupabaseClient.auth.verifyOtp.mockResolvedValue({
        data: { user: mockUser, session: mockSession },
        error: null,
      });

      const result = await service.verifyOtp({
        email: 'test@example.com',
        token: '123456',
        type: 'email',
      });

      expect(result).toEqual({ user: mockUser, session: mockSession });
      expect(mockSupabaseClient.auth.verifyOtp).toHaveBeenCalledWith({
        email: 'test@example.com',
        token: '123456',
        type: 'email',
      });
    });

    it('should throw UnauthorizedException on invalid OTP', async () => {
      mockSupabaseClient.auth.verifyOtp.mockResolvedValue({
        data: null,
        error: { message: 'Invalid OTP' },
      });

      await expect(
        service.verifyOtp({
          email: 'test@example.com',
          token: 'wrong',
          type: 'email',
        }),
      ).rejects.toThrow(UnauthorizedException);
    });
  });

  describe('signInWithOAuth', () => {
    it('should return OAuth URL', async () => {
      configService.get.mockReturnValue('http://localhost:3000/auth/callback');

      mockSupabaseClient.auth.signInWithOAuth.mockResolvedValue({
        data: { url: 'https://supabase.co/auth/oauth/google' },
        error: null,
      });

      const result = await service.signInWithOAuth('google');

      expect(result).toEqual({
        url: 'https://supabase.co/auth/oauth/google',
      });
      expect(mockSupabaseClient.auth.signInWithOAuth).toHaveBeenCalledWith({
        provider: 'google',
        options: {
          redirectTo: 'http://localhost:3000/auth/callback',
        },
      });
    });

    it('should use custom redirectTo if provided', async () => {
      mockSupabaseClient.auth.signInWithOAuth.mockResolvedValue({
        data: { url: 'https://supabase.co/auth/oauth/github' },
        error: null,
      });

      const result = await service.signInWithOAuth(
        'github',
        'http://custom.com/callback',
      );

      expect(result).toEqual({
        url: 'https://supabase.co/auth/oauth/github',
      });
      expect(mockSupabaseClient.auth.signInWithOAuth).toHaveBeenCalledWith({
        provider: 'github',
        options: {
          redirectTo: 'http://custom.com/callback',
        },
      });
    });

    it('should throw UnauthorizedException on error', async () => {
      configService.get.mockReturnValue('http://localhost:3000/auth/callback');

      mockSupabaseClient.auth.signInWithOAuth.mockResolvedValue({
        data: null,
        error: { message: 'OAuth failed' },
      });

      await expect(service.signInWithOAuth('google')).rejects.toThrow(
        UnauthorizedException,
      );
    });
  });

  describe('validateSession', () => {
    it('should validate session successfully', async () => {
      const mockUser = { id: '123', email: 'test@example.com' };

      mockSupabaseClient.auth.getUser.mockResolvedValue({
        data: { user: mockUser },
        error: null,
      });

      const result = await service.validateSession('access-token');

      expect(result).toEqual(mockUser);
      expect(mockSupabaseClient.auth.getUser).toHaveBeenCalledWith(
        'access-token',
      );
    });

    it('should return null on invalid token', async () => {
      mockSupabaseClient.auth.getUser.mockResolvedValue({
        data: null,
        error: { message: 'Invalid token' },
      });

      const result = await service.validateSession('invalid-token');

      expect(result).toBeNull();
    });
  });
});


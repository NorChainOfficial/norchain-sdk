// Mock bcrypt before any imports that use it
jest.mock('bcrypt', () => ({
  hash: jest.fn((password: string) => Promise.resolve(`hashed_${password}`)),
  compare: jest.fn((password: string, hash: string) => Promise.resolve(hash === `hashed_${password}`)),
  genSalt: jest.fn(() => Promise.resolve('salt')),
}));

import { Test, TestingModule } from '@nestjs/testing';
import { getRepositoryToken } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { JwtService } from '@nestjs/jwt';
import { ConfigService } from '@nestjs/config';
import { AuthService } from './auth.service';
import { User } from './entities/user.entity';
import { ApiKey } from './entities/api-key.entity';
import { RegisterDto } from './dto/register.dto';
import { LoginDto } from './dto/login.dto';
import { ConflictException, UnauthorizedException } from '@nestjs/common';

describe('AuthService Integration', () => {
  let service: AuthService;
  let userRepository: Repository<User>;
  let apiKeyRepository: Repository<ApiKey>;
  let jwtService: JwtService;
  let configService: ConfigService;

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      providers: [
        AuthService,
        {
          provide: getRepositoryToken(User),
          useClass: Repository,
        },
        {
          provide: getRepositoryToken(ApiKey),
          useClass: Repository,
        },
        {
          provide: JwtService,
          useValue: {
            sign: jest.fn((payload) => `token_${payload.sub}`),
          },
        },
        {
          provide: ConfigService,
          useValue: {
            get: jest.fn((key: string) => {
              if (key === 'JWT_SECRET') return 'test-secret';
              if (key === 'JWT_EXPIRES_IN') return '1h';
              return null;
            }),
          },
        },
      ],
    }).compile();

    service = module.get<AuthService>(AuthService);
    userRepository = module.get<Repository<User>>(getRepositoryToken(User));
    apiKeyRepository = module.get<Repository<ApiKey>>(getRepositoryToken(ApiKey));
    jwtService = module.get<JwtService>(JwtService);
    configService = module.get<ConfigService>(ConfigService);
  });

  afterEach(() => {
    jest.clearAllMocks();
  });

  describe('register', () => {
    it('should register a new user successfully', async () => {
      const registerDto: RegisterDto = {
        email: 'test@example.com',
        password: 'password123',
        name: 'Test User',
      };

      userRepository.findOne = jest.fn().mockResolvedValue(null);
      const createdUser = {
        ...registerDto,
        id: '1',
        password: 'hashed_password123',
        isActive: true,
        roles: ['user'],
        createdAt: new Date(),
        updatedAt: new Date(),
      };
      userRepository.create = jest.fn().mockReturnValue(createdUser);
      userRepository.save = jest.fn().mockResolvedValue({
        id: '1',
        email: registerDto.email,
        name: registerDto.name,
        password: 'hashed_password123',
        isActive: true,
        roles: ['user'],
        createdAt: new Date(),
        updatedAt: new Date(),
      });

      const result = await service.register(registerDto);

      expect(result).toBeDefined();
      expect(result.email).toBe(registerDto.email);
      expect(result.name).toBe(registerDto.name);
      expect(userRepository.findOne).toHaveBeenCalledWith({
        where: { email: registerDto.email },
      });
      expect(userRepository.save).toHaveBeenCalled();
    });

    it('should throw ConflictException if user already exists', async () => {
      const registerDto: RegisterDto = {
        email: 'existing@example.com',
        password: 'password123',
        name: 'Existing User',
      };

      userRepository.findOne = jest.fn().mockResolvedValue({
        id: '1',
        email: registerDto.email,
      });
      userRepository.save = jest.fn(); // Reset mock

      await expect(service.register(registerDto)).rejects.toThrow(ConflictException);
      expect(userRepository.save).not.toHaveBeenCalled();
    });
  });

  describe('login', () => {
    it('should login user successfully with valid credentials', async () => {
      const loginDto: LoginDto = {
        email: 'test@example.com',
        password: 'password123',
      };

      const hashedPassword = 'hashed_password123';
      const user = {
        id: '1',
        email: loginDto.email,
        password: hashedPassword,
        isActive: true,
        roles: ['user'],
      };

      userRepository.findOne = jest.fn().mockResolvedValue(user);
      const bcrypt = require('bcrypt');
      bcrypt.compare.mockResolvedValue(true);

      const result = await service.login(loginDto);

      expect(result).toBeDefined();
      expect(result.access_token).toBeDefined();
      expect(jwtService.sign).toHaveBeenCalledWith({
        sub: user.id,
        email: user.email,
        roles: user.roles,
      });
    });

    it('should throw UnauthorizedException with invalid credentials', async () => {
      const loginDto: LoginDto = {
        email: 'test@example.com',
        password: 'wrongpassword',
      };

      const hashedPassword = 'hashed_correctpassword';
      const user = {
        id: '1',
        email: loginDto.email,
        password: hashedPassword,
        isActive: true,
      };

      userRepository.findOne = jest.fn().mockResolvedValue(user);
      const bcrypt = require('bcrypt');
      bcrypt.compare.mockResolvedValue(false);

      await expect(service.login(loginDto)).rejects.toThrow(UnauthorizedException);
    });

    it('should throw UnauthorizedException if user not found', async () => {
      const loginDto: LoginDto = {
        email: 'nonexistent@example.com',
        password: 'password123',
      };

      userRepository.findOne = jest.fn().mockResolvedValue(null);

      await expect(service.login(loginDto)).rejects.toThrow(UnauthorizedException);
    });
  });

  describe('createApiKey', () => {
    it('should create API key successfully', async () => {
      const userId = '1';
      const createApiKeyDto = {
        name: 'Test API Key',
        description: 'Test description',
      };

      // Mock user exists check
      userRepository.findOne = jest.fn().mockResolvedValue({
        id: userId,
        email: 'test@example.com',
        isActive: true,
      });

      apiKeyRepository.create = jest.fn().mockReturnValue({
        id: '1',
        key: 'nk_test123',
        name: createApiKeyDto.name,
        userId,
        isActive: true,
        createdAt: new Date(),
      });
      apiKeyRepository.save = jest.fn().mockResolvedValue({
        id: '1',
        key: 'nk_test123',
        name: createApiKeyDto.name,
        userId,
        isActive: true,
        createdAt: new Date(),
      });

      const result = await service.createApiKey(userId, createApiKeyDto);

      expect(result).toBeDefined();
      expect(result.key).toBeDefined();
      expect(result.name).toBe(createApiKeyDto.name);
      expect(userRepository.findOne).toHaveBeenCalled();
      expect(apiKeyRepository.create).toHaveBeenCalled();
      expect(apiKeyRepository.save).toHaveBeenCalled();
    });
  });

  describe('getApiKeys', () => {
    it('should return user API keys', async () => {
      const userId = '1';
      const apiKeys = [
        {
          id: '1',
          key: 'nk_test123',
          name: 'Key 1',
          userId,
          isActive: true,
          createdAt: new Date(),
        },
        {
          id: '2',
          key: 'nk_test456',
          name: 'Key 2',
          userId,
          isActive: true,
          createdAt: new Date(),
        },
      ];

      apiKeyRepository.find = jest.fn().mockResolvedValue(apiKeys);

      const result = await service.getApiKeys(userId);

      expect(result).toEqual(apiKeys);
      expect(apiKeyRepository.find).toHaveBeenCalledWith({
        where: { userId },
        order: { createdAt: 'DESC' },
      });
    });
  });
});


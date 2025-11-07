import { Test, TestingModule } from '@nestjs/testing';
import { getRepositoryToken } from '@nestjs/typeorm';
import { JwtService } from '@nestjs/jwt';
import { UnauthorizedException, ConflictException } from '@nestjs/common';
import { AuthService } from './auth.service';
import { User } from './entities/user.entity';
import { ApiKey } from './entities/api-key.entity';
import { RegisterDto } from './dto/register.dto';
import { LoginDto } from './dto/login.dto';
import * as bcrypt from 'bcrypt';

describe('AuthService', () => {
  let service: AuthService;
  let userRepository: any;
  let apiKeyRepository: any;
  let jwtService: jest.Mocked<JwtService>;

  beforeEach(async () => {
    const mockUserRepository = {
      findOne: jest.fn(),
      create: jest.fn(),
      save: jest.fn(),
    };

    const mockApiKeyRepository = {
      findOne: jest.fn(),
      create: jest.fn(),
      save: jest.fn(),
      find: jest.fn(),
    };

    const mockJwtService = {
      sign: jest.fn(),
      verify: jest.fn(),
    };

    const module: TestingModule = await Test.createTestingModule({
      providers: [
        AuthService,
        {
          provide: getRepositoryToken(User),
          useValue: mockUserRepository,
        },
        {
          provide: getRepositoryToken(ApiKey),
          useValue: mockApiKeyRepository,
        },
        {
          provide: JwtService,
          useValue: mockJwtService,
        },
      ],
    }).compile();

    service = module.get<AuthService>(AuthService);
    userRepository = module.get(getRepositoryToken(User));
    apiKeyRepository = module.get(getRepositoryToken(ApiKey));
    jwtService = module.get(JwtService);
  });

  it('should be defined', () => {
    expect(service).toBeDefined();
  });

  describe('register', () => {
    it('should register a new user', async () => {
      const registerDto: RegisterDto = {
        email: 'test@example.com',
        password: 'password123',
        name: 'Test User',
      };

      userRepository.findOne.mockResolvedValue(null);
      userRepository.create.mockReturnValue({
        ...registerDto,
        password: 'hashed-password',
      });
      userRepository.save.mockResolvedValue({
        id: '1',
        email: registerDto.email,
        name: registerDto.name,
        password: 'hashed-password',
      });

      const result = await service.register(registerDto);

      expect(result.email).toBe(registerDto.email);
      expect(result.name).toBe(registerDto.name);
      expect(userRepository.findOne).toHaveBeenCalledWith({
        where: { email: registerDto.email },
      });
    });

    it('should throw ConflictException if user exists', async () => {
      const registerDto: RegisterDto = {
        email: 'test@example.com',
        password: 'password123',
        name: 'Test User',
      };

      userRepository.findOne.mockResolvedValue({ id: '1', email: registerDto.email });

      await expect(service.register(registerDto)).rejects.toThrow(
        ConflictException,
      );
    });
  });

  describe('login', () => {
    it('should return access token for valid credentials', async () => {
      const loginDto: LoginDto = {
        email: 'test@example.com',
        password: 'password123',
      };

      const hashedPassword = await bcrypt.hash(loginDto.password, 10);
      const user = {
        id: '1',
        email: loginDto.email,
        password: hashedPassword,
        isActive: true,
        roles: ['user'],
      };

      userRepository.findOne.mockResolvedValue(user);
      jwtService.sign.mockReturnValue('jwt-token');

      const result = await service.login(loginDto);

      expect(result.access_token).toBe('jwt-token');
      expect(jwtService.sign).toHaveBeenCalled();
    });

    it('should throw UnauthorizedException for invalid credentials', async () => {
      const loginDto: LoginDto = {
        email: 'test@example.com',
        password: 'wrong-password',
      };

      const hashedPassword = await bcrypt.hash('correct-password', 10);
      const user = {
        id: '1',
        email: loginDto.email,
        password: hashedPassword,
        isActive: true,
      };

      userRepository.findOne.mockResolvedValue(user);

      await expect(service.login(loginDto)).rejects.toThrow(
        UnauthorizedException,
      );
    });

    it('should throw UnauthorizedException if user not found', async () => {
      const loginDto: LoginDto = {
        email: 'test@example.com',
        password: 'password123',
      };

      userRepository.findOne.mockResolvedValue(null);

      await expect(service.login(loginDto)).rejects.toThrow(
        UnauthorizedException,
      );
    });
  });

  describe('validateApiKey', () => {
    it('should return API key if valid', async () => {
      const apiKey = 'nk_test123';
      const keyEntity = {
        id: '1',
        key: apiKey,
        isActive: true,
        expiresAt: null,
        lastUsedAt: null,
        user: { id: '1' },
      };

      apiKeyRepository.findOne.mockResolvedValue(keyEntity);
      apiKeyRepository.save.mockResolvedValue(keyEntity);

      const result = await service.validateApiKey(apiKey);

      expect(result).toEqual(keyEntity);
      expect(apiKeyRepository.findOne).toHaveBeenCalledWith({
        where: { key: apiKey, isActive: true },
        relations: ['user'],
      });
    });

    it('should return null if API key not found', async () => {
      apiKeyRepository.findOne.mockResolvedValue(null);

      const result = await service.validateApiKey('invalid-key');

      expect(result).toBeNull();
    });

    it('should return null if API key expired', async () => {
      const expiredKey = {
        id: '1',
        key: 'nk_test123',
        isActive: true,
        expiresAt: new Date(Date.now() - 1000),
      };

      apiKeyRepository.findOne.mockResolvedValue(expiredKey);

      const result = await service.validateApiKey('nk_test123');

      expect(result).toBeNull();
    });
  });
});


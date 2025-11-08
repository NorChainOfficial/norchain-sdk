import { Test, TestingModule } from '@nestjs/testing';
import { AuthController } from './auth.controller';
import { AuthService } from './auth.service';
import { RegisterDto } from './dto/register.dto';
import { LoginDto } from './dto/login.dto';
import { CreateApiKeyDto } from './dto/create-api-key.dto';

// Mock bcrypt to avoid native module issues in test environment
jest.mock('bcrypt', () => ({
  hash: jest.fn().mockResolvedValue('hashed_password'),
  compare: jest.fn().mockResolvedValue(true),
}));

describe('AuthController', () => {
  let controller: AuthController;
  let service: jest.Mocked<AuthService>;

  beforeEach(async () => {
    const mockAuthService = {
      register: jest.fn(),
      login: jest.fn(),
      createApiKey: jest.fn(),
      getApiKeys: jest.fn(),
      revokeApiKey: jest.fn(),
    };

    const module: TestingModule = await Test.createTestingModule({
      controllers: [AuthController],
      providers: [
        {
          provide: AuthService,
          useValue: mockAuthService,
        },
      ],
    }).compile();

    controller = module.get<AuthController>(AuthController);
    service = module.get(AuthService);
  });

  it('should be defined', () => {
    expect(controller).toBeDefined();
  });

  describe('register', () => {
    it('should register a new user', async () => {
      const dto: RegisterDto = {
        email: 'test@example.com',
        password: 'password123',
        name: 'Test User',
      };
      const mockUser = {
        id: '1',
        email: dto.email,
        name: dto.name,
        roles: ['user'],
        isActive: true,
        createdAt: new Date(),
        updatedAt: new Date(),
      };
      service.register.mockResolvedValue(mockUser as any);

      const result = await controller.register(dto);

      expect(result).toEqual(mockUser);
      expect(service.register).toHaveBeenCalledWith(dto);
    });
  });

  describe('login', () => {
    it('should login user', async () => {
      const dto: LoginDto = {
        email: 'test@example.com',
        password: 'password123',
      };
      const mockResponse = { access_token: 'token' };
      service.login.mockResolvedValue(mockResponse);

      const result = await controller.login(dto);

      expect(result).toEqual(mockResponse);
      expect(service.login).toHaveBeenCalledWith(dto);
    });
  });

  describe('createApiKey', () => {
    it('should create API key', async () => {
      const req = { user: { id: '1' } };
      const dto: CreateApiKeyDto = { name: 'Test API Key' };
      const mockApiKey = {
        id: '1',
        key: 'nk_test123',
        name: dto.name,
        userId: req.user.id,
        isActive: true,
        createdAt: new Date(),
      };
      service.createApiKey.mockResolvedValue(mockApiKey as any);

      const result = await controller.createApiKey(req, dto);

      expect(result).toEqual(mockApiKey);
      expect(service.createApiKey).toHaveBeenCalledWith(req.user.id, dto);
    });
  });

  describe('getApiKeys', () => {
    it('should return API keys', async () => {
      const req = { user: { id: '1' } };
      const mockApiKeys = [];
      service.getApiKeys.mockResolvedValue(mockApiKeys as any);

      const result = await controller.getApiKeys(req);

      expect(result).toEqual(mockApiKeys);
      expect(service.getApiKeys).toHaveBeenCalledWith(req.user.id);
    });
  });

  describe('revokeApiKey', () => {
    it('should revoke API key', async () => {
      const req = { user: { id: '1' } };
      const id = '1';
      service.revokeApiKey.mockResolvedValue(undefined);

      const result = await controller.revokeApiKey(req, id);

      expect(result).toEqual({ message: 'API key revoked' });
      expect(service.revokeApiKey).toHaveBeenCalledWith(req.user.id, id);
    });
  });
});


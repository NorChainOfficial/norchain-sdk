import { Test, TestingModule } from '@nestjs/testing';
import { getRepositoryToken } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { WalletService } from './wallet.service';
import { User } from '../auth/entities/user.entity';
import { Wallet } from './entities/wallet.entity';
import { RpcService } from '@/common/services/rpc.service';
import { PolicyService } from '../policy/policy.service';
import { NotFoundException, ForbiddenException } from '@nestjs/common';
import { ethers } from 'ethers';

describe('WalletService', () => {
  let service: WalletService;
  let userRepository: Repository<User>;
  let walletRepository: Repository<Wallet>;
  let rpcService: RpcService;

  const mockUser: Partial<User> = {
    id: '1',
    email: 'test@example.com',
  };

  const mockRpcService = {
    getBalance: jest.fn().mockResolvedValue(ethers.parseEther('1.0')),
    getProvider: jest.fn().mockReturnValue({
      sendTransaction: jest.fn(),
    }),
  };

  const mockUserRepository = {
    findOne: jest.fn(),
    update: jest.fn(),
  };

  const mockWalletRepository = {
    findOne: jest.fn(),
    find: jest.fn(),
    create: jest.fn(),
    save: jest.fn(),
    count: jest.fn(),
    update: jest.fn(),
    remove: jest.fn(),
  };

  const mockPolicyService = {
    checkPolicy: jest.fn().mockResolvedValue({ allowed: true }),
  };

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      providers: [
        WalletService,
        {
          provide: getRepositoryToken(User),
          useValue: mockUserRepository,
        },
        {
          provide: getRepositoryToken(Wallet),
          useValue: mockWalletRepository,
        },
        {
          provide: RpcService,
          useValue: mockRpcService,
        },
        {
          provide: PolicyService,
          useValue: mockPolicyService,
        },
      ],
    }).compile();

    service = module.get<WalletService>(WalletService);
    userRepository = module.get<Repository<User>>(getRepositoryToken(User));
    walletRepository = module.get<Repository<Wallet>>(getRepositoryToken(Wallet));
    rpcService = module.get<RpcService>(RpcService);
  });

  afterEach(() => {
    jest.clearAllMocks();
  });

  describe('createWallet', () => {
    it('should create a new wallet', async () => {
      mockUserRepository.findOne.mockResolvedValue(mockUser);
      mockWalletRepository.count.mockResolvedValue(0);
      mockWalletRepository.create.mockReturnValue({
        address: '0x742d35Cc6634C0532925a3b844Bc9e7595f0bEb0',
        encryptedPrivateKey: 'encrypted',
        name: 'Test Wallet',
        userId: '1',
      });
      mockWalletRepository.save.mockResolvedValue({
        id: 'wallet-123',
        address: '0x742d35Cc6634C0532925a3b844Bc9e7595f0bEb0',
        encryptedPrivateKey: 'encrypted',
        name: 'Test Wallet',
        userId: '1',
        createdAt: new Date(),
        updatedAt: new Date(),
      } as Wallet);

      const dto = { password: 'SecurePassword123!', name: 'Test Wallet' };
      const result = await service.createWallet('1', dto);

      expect(result).toHaveProperty('address');
      expect(result).toHaveProperty('name', 'Test Wallet');
      expect(result.address).toMatch(/^0x[a-fA-F0-9]{40}$/);
      expect(mockWalletRepository.save).toHaveBeenCalled();
    });

    it('should throw NotFoundException if user not found', async () => {
      mockUserRepository.findOne.mockResolvedValue(null);

      await expect(
        service.createWallet('999', { password: 'SecurePassword123!' }),
      ).rejects.toThrow(NotFoundException);
    });
  });

  describe('importWallet', () => {
    it('should import an existing wallet', async () => {
      const wallet = ethers.Wallet.createRandom();
      const privateKey = wallet.privateKey;
      mockUserRepository.findOne.mockResolvedValue(mockUser);
      mockWalletRepository.findOne.mockResolvedValue(null); // Wallet doesn't exist yet
      mockWalletRepository.count.mockResolvedValue(0);
      mockWalletRepository.create.mockReturnValue({
        address: wallet.address.toLowerCase(),
        encryptedPrivateKey: 'encrypted',
        name: 'Imported Wallet',
        userId: '1',
      });
      mockWalletRepository.save.mockResolvedValue({
        id: 'wallet-123',
        address: wallet.address.toLowerCase(),
        encryptedPrivateKey: 'encrypted',
        name: 'Imported Wallet',
        userId: '1',
        createdAt: new Date(),
        updatedAt: new Date(),
      } as Wallet);

      const dto = {
        privateKey,
        password: 'SecurePassword123!',
        name: 'Imported Wallet',
      };
      const result = await service.importWallet('1', dto);

      expect(result).toHaveProperty('address');
      expect(result).toHaveProperty('name', 'Imported Wallet');
      expect(mockWalletRepository.save).toHaveBeenCalled();
    });

    it('should throw error for invalid private key', async () => {
      const dto = {
        privateKey: 'invalid-key',
        password: 'SecurePassword123!',
      };

      await expect(service.importWallet('1', dto)).rejects.toThrow();
    });

    it('should throw error if wallet already exists', async () => {
      const wallet = ethers.Wallet.createRandom();
      mockUserRepository.findOne.mockResolvedValue(mockUser);
      mockWalletRepository.findOne.mockResolvedValue({
        id: 'wallet-123',
        address: wallet.address.toLowerCase(),
        userId: '1',
        name: 'Existing Wallet',
        encryptedPrivateKey: 'encrypted',
        createdAt: new Date(),
        updatedAt: new Date(),
      } as Wallet);

      const dto = {
        privateKey: wallet.privateKey,
        password: 'SecurePassword123!',
      };

      await expect(service.importWallet('1', dto)).rejects.toThrow(
        'Wallet already imported',
      );
    });
  });

  describe('getUserWallets', () => {
    it('should return all wallets for user', async () => {
      const wallets = [
        {
          address: '0x1234567890123456789012345678901234567890',
          name: 'Wallet 1',
          createdAt: new Date().toISOString(),
        },
      ];
      mockUserRepository.findOne.mockResolvedValue(mockUser);
      mockWalletRepository.find.mockResolvedValue(wallets.map(w => ({ ...w, userId: '1' })));

      const result = await service.getUserWallets('1');

      expect(result).toHaveLength(1);
      expect(result[0]).toHaveProperty('address');
      expect(result[0]).toHaveProperty('name');
    });

    it('should return empty array if no wallets', async () => {
      mockUserRepository.findOne.mockResolvedValue(mockUser);
      mockWalletRepository.find.mockResolvedValue([]);

      const result = await service.getUserWallets('1');

      expect(result).toEqual([]);
    });
  });

  describe('getWallet', () => {
    it('should return wallet details', async () => {
      const wallet = ethers.Wallet.createRandom();
      mockWalletRepository.findOne.mockResolvedValue({
        id: 'wallet-123',
        address: wallet.address.toLowerCase(),
        userId: '1',
        name: 'Test Wallet',
        encryptedPrivateKey: 'encrypted',
        createdAt: new Date(),
        updatedAt: new Date(),
      } as Wallet);
      mockRpcService.getBalance.mockResolvedValue(ethers.parseEther('1.0'));

      const result = await service.getWallet('1', wallet.address);

      expect(result).toHaveProperty('address', wallet.address.toLowerCase());
      expect(result).toHaveProperty('balance');
      expect(result).toHaveProperty('name', 'Test Wallet');
    });

    it('should throw NotFoundException if wallet not found', async () => {
      mockWalletRepository.findOne.mockResolvedValue(null);

      await expect(
        service.getWallet('1', '0x0000000000000000000000000000000000000000'),
      ).rejects.toThrow(NotFoundException);
    });
  });

  describe('getBalance', () => {
    it('should return wallet balance', async () => {
      const wallet = ethers.Wallet.createRandom();
      mockWalletRepository.findOne.mockResolvedValue({
        id: 'wallet-123',
        address: wallet.address.toLowerCase(),
        userId: '1',
        name: 'Test Wallet',
        encryptedPrivateKey: 'enc',
        createdAt: new Date(),
        updatedAt: new Date(),
      } as Wallet);
      mockRpcService.getBalance.mockResolvedValue(ethers.parseEther('1.5'));

      const result = await service.getBalance('1', wallet.address);

      expect(result).toHaveProperty('address', wallet.address);
      expect(result).toHaveProperty('balance');
      expect(result).toHaveProperty('balanceFormatted');
    });

    it('should throw ForbiddenException if wallet not owned', async () => {
      mockWalletRepository.findOne.mockResolvedValue(null);

      await expect(
        service.getBalance('1', '0x0000000000000000000000000000000000000000'),
      ).rejects.toThrow(ForbiddenException);
    });
  });

  describe('deleteWallet', () => {
    it('should delete a wallet', async () => {
      const wallet = ethers.Wallet.createRandom();
      mockWalletRepository.findOne.mockResolvedValue({
        id: 'wallet-123',
        address: wallet.address.toLowerCase(),
        userId: '1',
        name: 'Test Wallet',
        encryptedPrivateKey: 'encrypted',
        createdAt: new Date(),
        updatedAt: new Date(),
      } as Wallet);
      mockWalletRepository.remove.mockResolvedValue(undefined);

      const result = await service.deleteWallet('1', wallet.address);

      expect(result).toHaveProperty('message', 'Wallet deleted successfully');
      expect(mockWalletRepository.remove).toHaveBeenCalled();
    });

    it('should throw ForbiddenException if wallet not owned', async () => {
      mockWalletRepository.findOne.mockResolvedValue(null);

      await expect(
        service.deleteWallet('1', '0x0000000000000000000000000000000000000000'),
      ).rejects.toThrow(ForbiddenException);
    });
  });
});


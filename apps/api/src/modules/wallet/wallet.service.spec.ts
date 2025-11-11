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

  describe('getUserWallets', () => {
    it('should return all wallets for user', async () => {
      const userId = '1';
      const mockWallets = [
        {
          id: 'wallet-1',
          address: '0x742d35Cc6634C0532925a3b844Bc9e7595f0bEb0',
          name: 'Wallet 1',
          userId,
          createdAt: new Date(),
          importedAt: null,
        },
        {
          id: 'wallet-2',
          address: '0x742d35Cc6634C0532925a3b844Bc9e7595f0bEb1',
          name: 'Wallet 2',
          userId,
          createdAt: new Date(),
          importedAt: new Date(),
        },
      ];

      mockWalletRepository.find.mockResolvedValue(mockWallets);

      const result = await service.getUserWallets(userId);

      expect(result).toHaveLength(2);
      expect(result[0]).toHaveProperty('address');
      expect(result[0]).toHaveProperty('name');
      expect(mockWalletRepository.find).toHaveBeenCalledWith({
        where: { userId },
        order: { createdAt: 'ASC' },
      });
    });

    it('should return empty array when user has no wallets', async () => {
      mockWalletRepository.find.mockResolvedValue([]);

      const result = await service.getUserWallets('1');

      expect(result).toEqual([]);
    });
  });

  describe('getWallet', () => {
    it('should return wallet with balance', async () => {
      const userId = '1';
      const address = '0x742d35Cc6634C0532925a3b844Bc9e7595f0bEb0';
      const mockWallet = {
        id: 'wallet-123',
        address,
        name: 'Test Wallet',
        userId,
        createdAt: new Date(),
        importedAt: null,
      };

      mockWalletRepository.findOne.mockResolvedValue(mockWallet);
      mockRpcService.getBalance.mockResolvedValue(ethers.parseEther('10.0'));

      const result = await service.getWallet(userId, address);

      expect(result).toHaveProperty('address', address);
      expect(result).toHaveProperty('name', 'Test Wallet');
      expect(result).toHaveProperty('balance');
      expect(mockRpcService.getBalance).toHaveBeenCalledWith(address);
    });

    it('should throw NotFoundException if wallet not found', async () => {
      mockWalletRepository.findOne.mockResolvedValue(null);

      await expect(
        service.getWallet('1', '0x0000000000000000000000000000000000000000'),
      ).rejects.toThrow(NotFoundException);
    });
  });

  describe('getBalance', () => {
    it('should return balance for wallet', async () => {
      const userId = '1';
      const address = '0x742d35Cc6634C0532925a3b844Bc9e7595f0bEb0';
      const mockWallet = {
        id: 'wallet-123',
        address,
        userId,
      };

      jest.spyOn(service as any, 'verifyWalletOwnership').mockResolvedValue(mockWallet);
      mockRpcService.getBalance.mockResolvedValue(ethers.parseEther('5.0'));

      const result = await service.getBalance(userId, address);

      expect(result).toHaveProperty('address', address);
      expect(result).toHaveProperty('balance');
      expect(result).toHaveProperty('balanceFormatted', '5.0');
    });

    it('should throw ForbiddenException if wallet does not belong to user', async () => {
      jest.spyOn(service as any, 'verifyWalletOwnership').mockRejectedValue(
        new ForbiddenException('Wallet not found or access denied'),
      );

      await expect(
        service.getBalance('1', '0x0000000000000000000000000000000000000000'),
      ).rejects.toThrow(ForbiddenException);
    });
  });

  describe('getTokens', () => {
    it('should return tokens for wallet', async () => {
      const userId = '1';
      const address = '0x742d35Cc6634C0532925a3b844Bc9e7595f0bEb0';
      const mockWallet = {
        id: 'wallet-123',
        address,
        userId,
      };

      jest.spyOn(service as any, 'verifyWalletOwnership').mockResolvedValue(mockWallet);

      const result = await service.getTokens(userId, address);

      expect(result).toHaveProperty('address', address);
      expect(result).toHaveProperty('tokens', []);
    });
  });

  describe('getTransactions', () => {
    it('should return transactions for wallet', async () => {
      const userId = '1';
      const address = '0x742d35Cc6634C0532925a3b844Bc9e7595f0bEb0';
      const mockWallet = {
        id: 'wallet-123',
        address,
        userId,
      };

      jest.spyOn(service as any, 'verifyWalletOwnership').mockResolvedValue(mockWallet);

      const result = await service.getTransactions(userId, address);

      expect(result).toHaveProperty('address', address);
      expect(result).toHaveProperty('transactions', []);
    });
  });

  describe('sendTransaction', () => {
    it('should send transaction successfully', async () => {
      const userId = '1';
      const address = '0x742d35Cc6634C0532925a3b844Bc9e7595f0bEb0';
      const mockWallet = {
        id: 'wallet-123',
        address,
        encryptedPrivateKey: 'encrypted-key',
        userId,
      };

      const dto = {
        to: '0x742d35Cc6634C0532925a3b844Bc9e7595f0bEb1',
        amount: '1.0',
        password: 'password123',
        gasLimit: '21000',
      };

      jest.spyOn(service as any, 'verifyWalletOwnership').mockResolvedValue(mockWallet);
      jest.spyOn(service as any, 'decryptPrivateKey').mockResolvedValue('private-key');
      mockRpcService.getProvider.mockReturnValue({
        sendTransaction: jest.fn(),
      });

      const mockTx = {
        hash: '0x1234567890abcdef',
      };

      const mockProvider = {
        sendTransaction: jest.fn().mockResolvedValue(mockTx),
      };

      const mockWalletInstance = {
        connect: jest.fn().mockReturnValue({
          sendTransaction: jest.fn().mockResolvedValue(mockTx),
        }),
      };

      jest.spyOn(ethers, 'Wallet').mockImplementation(() => mockWalletInstance as any);
      mockRpcService.getProvider.mockReturnValue(mockProvider);

      const result = await service.sendTransaction(userId, address, dto);

      expect(result).toHaveProperty('hash');
      expect(result).toHaveProperty('from', address);
      expect(result).toHaveProperty('to', dto.to);
    });

    it('should throw ForbiddenException if policy check fails', async () => {
      const userId = '1';
      const address = '0x742d35Cc6634C0532925a3b844Bc9e7595f0bEb0';
      const mockWallet = {
        id: 'wallet-123',
        address,
        userId,
      };

      const dto = {
        to: '0x742d35Cc6634C0532925a3b844Bc9e7595f0bEb1',
        amount: '1.0',
        password: 'password123',
      };

      jest.spyOn(service as any, 'verifyWalletOwnership').mockResolvedValue(mockWallet);
      mockPolicyService.checkPolicy.mockRejectedValue(
        new ForbiddenException('Transaction blocked by policy'),
      );

      await expect(
        service.sendTransaction(userId, address, dto),
      ).rejects.toThrow(ForbiddenException);
    });
  });
});


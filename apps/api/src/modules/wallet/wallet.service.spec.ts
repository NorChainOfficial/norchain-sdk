import { Test, TestingModule } from '@nestjs/testing';
import { getRepositoryToken } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { WalletService } from './wallet.service';
import { User } from '../auth/entities/user.entity';
import { RpcService } from '@/common/services/rpc.service';
import { NotFoundException, ForbiddenException } from '@nestjs/common';
import { ethers } from 'ethers';

describe('WalletService', () => {
  let service: WalletService;
  let userRepository: Repository<User>;
  let rpcService: RpcService;

  const mockUser: Partial<User> = {
    id: 1,
    email: 'test@example.com',
    metadata: { wallets: [] },
  };

  const mockRpcService = {
    getBalance: jest.fn().mockResolvedValue(ethers.parseEther('1.0')),
    getProvider: jest.fn().mockReturnValue({
      sendTransaction: jest.fn(),
    }),
  };

  const mockRepository = {
    findOne: jest.fn(),
    update: jest.fn(),
  };

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      providers: [
        WalletService,
        {
          provide: getRepositoryToken(User),
          useValue: mockRepository,
        },
        {
          provide: RpcService,
          useValue: mockRpcService,
        },
      ],
    }).compile();

    service = module.get<WalletService>(WalletService);
    userRepository = module.get<Repository<User>>(getRepositoryToken(User));
    rpcService = module.get<RpcService>(RpcService);
  });

  afterEach(() => {
    jest.clearAllMocks();
  });

  describe('createWallet', () => {
    it('should create a new wallet', async () => {
      mockRepository.findOne.mockResolvedValue(mockUser);
      mockRepository.update.mockResolvedValue({ affected: 1 });

      const dto = { password: 'SecurePassword123!', name: 'Test Wallet' };
      const result = await service.createWallet(1, dto);

      expect(result).toHaveProperty('address');
      expect(result).toHaveProperty('name', 'Test Wallet');
      expect(result.address).toMatch(/^0x[a-fA-F0-9]{40}$/);
      expect(mockRepository.update).toHaveBeenCalled();
    });

    it('should throw NotFoundException if user not found', async () => {
      mockRepository.findOne.mockResolvedValue(null);

      await expect(
        service.createWallet(999, { password: 'SecurePassword123!' }),
      ).rejects.toThrow(NotFoundException);
    });
  });

  describe('importWallet', () => {
    it('should import an existing wallet', async () => {
      const privateKey = ethers.Wallet.createRandom().privateKey;
      mockRepository.findOne.mockResolvedValue(mockUser);
      mockRepository.update.mockResolvedValue({ affected: 1 });

      const dto = {
        privateKey,
        password: 'SecurePassword123!',
        name: 'Imported Wallet',
      };
      const result = await service.importWallet(1, dto);

      expect(result).toHaveProperty('address');
      expect(result).toHaveProperty('name', 'Imported Wallet');
      expect(mockRepository.update).toHaveBeenCalled();
    });

    it('should throw error for invalid private key', async () => {
      const dto = {
        privateKey: 'invalid-key',
        password: 'SecurePassword123!',
      };

      await expect(service.importWallet(1, dto)).rejects.toThrow();
    });

    it('should throw error if wallet already exists', async () => {
      const wallet = ethers.Wallet.createRandom();
      const existingWallets = [
        {
          address: wallet.address,
          encryptedPrivateKey: 'encrypted',
          name: 'Existing Wallet',
        },
      ];
      mockRepository.findOne.mockResolvedValue({
        ...mockUser,
        metadata: { wallets: existingWallets },
      });

      const dto = {
        privateKey: wallet.privateKey,
        password: 'SecurePassword123!',
      };

      await expect(service.importWallet(1, dto)).rejects.toThrow(
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
      mockRepository.findOne.mockResolvedValue({
        ...mockUser,
        metadata: { wallets },
      });

      const result = await service.getUserWallets(1);

      expect(result).toHaveLength(1);
      expect(result[0]).toHaveProperty('address');
      expect(result[0]).toHaveProperty('name');
    });

    it('should return empty array if no wallets', async () => {
      mockRepository.findOne.mockResolvedValue(mockUser);

      const result = await service.getUserWallets(1);

      expect(result).toEqual([]);
    });
  });

  describe('getWallet', () => {
    it('should return wallet details', async () => {
      const wallet = ethers.Wallet.createRandom();
      const wallets = [
        {
          address: wallet.address,
          encryptedPrivateKey: 'encrypted',
          name: 'Test Wallet',
          createdAt: new Date().toISOString(),
        },
      ];
      mockRepository.findOne.mockResolvedValue({
        ...mockUser,
        metadata: { wallets },
      });
      mockRpcService.getBalance.mockResolvedValue(ethers.parseEther('1.0'));

      const result = await service.getWallet(1, wallet.address);

      expect(result).toHaveProperty('address', wallet.address);
      expect(result).toHaveProperty('balance');
      expect(result).toHaveProperty('name', 'Test Wallet');
    });

    it('should throw NotFoundException if wallet not found', async () => {
      mockRepository.findOne.mockResolvedValue(mockUser);

      await expect(
        service.getWallet(1, '0x0000000000000000000000000000000000000000'),
      ).rejects.toThrow(NotFoundException);
    });
  });

  describe('getBalance', () => {
    it('should return wallet balance', async () => {
      const wallet = ethers.Wallet.createRandom();
      const wallets = [{ address: wallet.address, encryptedPrivateKey: 'enc' }];
      mockRepository.findOne.mockResolvedValue({
        ...mockUser,
        metadata: { wallets },
      });
      mockRpcService.getBalance.mockResolvedValue(ethers.parseEther('1.5'));

      const result = await service.getBalance(1, wallet.address);

      expect(result).toHaveProperty('address', wallet.address);
      expect(result).toHaveProperty('balance');
      expect(result).toHaveProperty('balanceFormatted');
    });

    it('should throw ForbiddenException if wallet not owned', async () => {
      mockRepository.findOne.mockResolvedValue(mockUser);

      await expect(
        service.getBalance(1, '0x0000000000000000000000000000000000000000'),
      ).rejects.toThrow(ForbiddenException);
    });
  });

  describe('deleteWallet', () => {
    it('should delete a wallet', async () => {
      const wallet = ethers.Wallet.createRandom();
      const wallets = [
        {
          address: wallet.address,
          encryptedPrivateKey: 'encrypted',
          name: 'Test Wallet',
        },
      ];
      mockRepository.findOne.mockResolvedValue({
        ...mockUser,
        metadata: { wallets },
      });
      mockRepository.update.mockResolvedValue({ affected: 1 });

      const result = await service.deleteWallet(1, wallet.address);

      expect(result).toHaveProperty('message', 'Wallet deleted successfully');
      expect(mockRepository.update).toHaveBeenCalled();
    });

    it('should throw ForbiddenException if wallet not owned', async () => {
      mockRepository.findOne.mockResolvedValue(mockUser);

      await expect(
        service.deleteWallet(1, '0x0000000000000000000000000000000000000000'),
      ).rejects.toThrow(ForbiddenException);
    });
  });
});


import { Test, TestingModule } from '@nestjs/testing';
import { WalletController } from './wallet.controller';
import { WalletService } from './wallet.service';
import { CreateWalletDto } from './dto/create-wallet.dto';
import { ImportWalletDto } from './dto/import-wallet.dto';
import { SendTransactionDto } from './dto/send-transaction.dto';
import { NotFoundException, ForbiddenException } from '@nestjs/common';

describe('WalletController', () => {
  let controller: WalletController;
  let walletService: jest.Mocked<WalletService>;

  const mockWalletService = {
    createWallet: jest.fn(),
    importWallet: jest.fn(),
    getUserWallets: jest.fn(),
    getWallet: jest.fn(),
    getBalance: jest.fn(),
    getTokens: jest.fn(),
    getTransactions: jest.fn(),
    sendTransaction: jest.fn(),
    deleteWallet: jest.fn(),
  };

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      controllers: [WalletController],
      providers: [
        {
          provide: WalletService,
          useValue: mockWalletService,
        },
      ],
    }).compile();

    controller = module.get<WalletController>(WalletController);
    walletService = module.get(WalletService);
  });

  afterEach(() => {
    jest.clearAllMocks();
  });

  it('should be defined', () => {
    expect(controller).toBeDefined();
  });

  describe('createWallet', () => {
    it('should create a new wallet', async () => {
      const userId = 'user-123';
      const dto: CreateWalletDto = {
        name: 'My Wallet',
        password: 'SecurePassword123!',
      };

      const mockResult = {
        wallet_id: 'wallet-123',
        address: '0x742d35Cc6634C0532925a3b844Bc9e7595f0bEb0',
        name: dto.name,
      };

      mockWalletService.createWallet.mockResolvedValue(mockResult);

      const result = await controller.createWallet({ user: { id: userId } }, dto);

      expect(result).toEqual(mockResult);
      expect(walletService.createWallet).toHaveBeenCalledWith(userId, dto);
    });

    it('should create wallet without name', async () => {
      const userId = 'user-123';
      const dto: CreateWalletDto = {
        password: 'SecurePassword123!',
      };

      const mockResult = {
        wallet_id: 'wallet-123',
        address: '0x742d35Cc6634C0532925a3b844Bc9e7595f0bEb0',
        name: 'Wallet 1',
      };

      mockWalletService.createWallet.mockResolvedValue(mockResult);

      const result = await controller.createWallet({ user: { id: userId } }, dto);

      expect(result).toEqual(mockResult);
    });
  });

  describe('importWallet', () => {
    it('should import an existing wallet', async () => {
      const userId = 'user-123';
      const dto: ImportWalletDto = {
        privateKey: '0x1234567890abcdef1234567890abcdef1234567890abcdef1234567890abcdef',
        name: 'Imported Wallet',
        password: 'SecurePassword123!',
      };

      const mockResult = {
        wallet_id: 'wallet-123',
        address: '0x742d35Cc6634C0532925a3b844Bc9e7595f0bEb0',
        name: dto.name,
      };

      mockWalletService.importWallet.mockResolvedValue(mockResult);

      const result = await controller.importWallet({ user: { id: userId } }, dto);

      expect(result).toEqual(mockResult);
      expect(walletService.importWallet).toHaveBeenCalledWith(userId, dto);
    });
  });

  describe('getWallets', () => {
    it('should return all wallets for user', async () => {
      const userId = 'user-123';
      const mockResult = [
        {
          address: '0x742d35Cc6634C0532925a3b844Bc9e7595f0bEb0',
          name: 'Wallet 1',
          createdAt: new Date(),
          importedAt: new Date(),
        },
        {
          address: '0x1234567890123456789012345678901234567890',
          name: 'Wallet 2',
          createdAt: new Date(),
          importedAt: new Date(),
        },
      ];

      mockWalletService.getUserWallets.mockResolvedValue(mockResult);

      const result = await controller.getWallets({ user: { id: userId } });

      expect(result).toEqual(mockResult);
      expect(walletService.getUserWallets).toHaveBeenCalledWith(userId);
    });

    it('should return empty array when no wallets exist', async () => {
      const userId = 'user-123';
      const mockResult: any[] = [];

      mockWalletService.getUserWallets.mockResolvedValue(mockResult);

      const result = await controller.getWallets({ user: { id: userId } });

      expect(result).toHaveLength(0);
    });
  });

  describe('getWallet', () => {
    it('should return wallet details', async () => {
      const userId = 'user-123';
      const address = '0x742d35Cc6634C0532925a3b844Bc9e7595f0bEb0';

      const mockResult = {
        wallet_id: 'wallet-123',
        address,
        name: 'My Wallet',
        createdAt: new Date(),
      };

      mockWalletService.getWallet.mockResolvedValue(mockResult);

      const result = await controller.getWallet({ user: { id: userId } }, address);

      expect(result).toEqual(mockResult);
      expect(walletService.getWallet).toHaveBeenCalledWith(userId, address);
    });

    it('should throw NotFoundException when wallet not found', async () => {
      const userId = 'user-123';
      const address = '0x742d35Cc6634C0532925a3b844Bc9e7595f0bEb0';

      mockWalletService.getWallet.mockRejectedValue(
        new NotFoundException('Wallet not found'),
      );

      await expect(
        controller.getWallet({ user: { id: userId } }, address),
      ).rejects.toThrow(NotFoundException);
    });
  });

  describe('getBalance', () => {
    it('should return wallet balance', async () => {
      const userId = 'user-123';
      const address = '0x742d35Cc6634C0532925a3b844Bc9e7595f0bEb0';

      const mockResult = {
        address,
        balance: '1000000000000000000',
        balanceFormatted: '1.0',
      };

      mockWalletService.getBalance.mockResolvedValue(mockResult);

      const result = await controller.getBalance({ user: { id: userId } }, address);

      expect(result).toEqual(mockResult);
      expect(walletService.getBalance).toHaveBeenCalledWith(userId, address);
    });
  });

  describe('getTokens', () => {
    it('should return tokens in wallet', async () => {
      const userId = 'user-123';
      const address = '0x742d35Cc6634C0532925a3b844Bc9e7595f0bEb0';

      const mockResult = {
        tokens: [
          {
            address: '0x123',
            symbol: 'USDT',
            balance: '1000000',
          },
        ],
      };

      mockWalletService.getTokens.mockResolvedValue(mockResult);

      const result = await controller.getTokens({ user: { id: userId } }, address);

      expect(result).toEqual(mockResult);
      expect(walletService.getTokens).toHaveBeenCalledWith(userId, address);
    });

    it('should return empty array when no tokens', async () => {
      const userId = 'user-123';
      const address = '0x742d35Cc6634C0532925a3b844Bc9e7595f0bEb0';

      const mockResult = { tokens: [] };

      mockWalletService.getTokens.mockResolvedValue(mockResult);

      const result = await controller.getTokens({ user: { id: userId } }, address);

      expect(result.tokens).toHaveLength(0);
    });
  });

  describe('getTransactions', () => {
    it('should return wallet transaction history', async () => {
      const userId = 'user-123';
      const address = '0x742d35Cc6634C0532925a3b844Bc9e7595f0bEb0';

      const mockResult = {
        transactions: [
          {
            hash: '0xabc',
            from: address,
            to: '0x123',
            value: '1000000000000000000',
          },
        ],
      };

      mockWalletService.getTransactions.mockResolvedValue(mockResult);

      const result = await controller.getTransactions({ user: { id: userId } }, address);

      expect(result).toEqual(mockResult);
      expect(walletService.getTransactions).toHaveBeenCalledWith(userId, address);
    });
  });

  describe('sendTransaction', () => {
    it('should send a transaction', async () => {
      const userId = 'user-123';
      const address = '0x742d35Cc6634C0532925a3b844Bc9e7595f0bEb0';
      const dto: SendTransactionDto = {
        to: '0x1234567890123456789012345678901234567890',
        amount: '0.1',
        password: 'SecurePassword123!',
        gasLimit: '21000',
      };

      const mockResult = {
        txHash: '0x123',
        status: 'pending',
      };

      mockWalletService.sendTransaction.mockResolvedValue(mockResult);

      const result = await controller.sendTransaction(
        { user: { id: userId } },
        address,
        dto,
      );

      expect(result).toEqual(mockResult);
      expect(walletService.sendTransaction).toHaveBeenCalledWith(userId, address, dto);
    });

    it('should handle transaction without gasLimit', async () => {
      const userId = 'user-123';
      const address = '0x742d35Cc6634C0532925a3b844Bc9e7595f0bEb0';
      const dto: SendTransactionDto = {
        to: '0x1234567890123456789012345678901234567890',
        amount: '0.1',
        password: 'SecurePassword123!',
      };

      const mockResult = {
        txHash: '0x123',
        status: 'pending',
      };

      mockWalletService.sendTransaction.mockResolvedValue(mockResult);

      await controller.sendTransaction({ user: { id: userId } }, address, dto);

      expect(walletService.sendTransaction).toHaveBeenCalledWith(userId, address, dto);
    });

    it('should throw ForbiddenException when policy check fails', async () => {
      const userId = 'user-123';
      const address = '0x742d35Cc6634C0532925a3b844Bc9e7595f0bEb0';
      const dto: SendTransactionDto = {
        to: '0xSANCTIONED_ADDRESS',
        amount: '1000',
        password: 'SecurePassword123!',
      };

      mockWalletService.sendTransaction.mockRejectedValue(
        new ForbiddenException('Transaction blocked by policy'),
      );

      await expect(
        controller.sendTransaction({ user: { id: userId } }, address, dto),
      ).rejects.toThrow(ForbiddenException);
    });
  });

  describe('deleteWallet', () => {
    it('should delete a wallet', async () => {
      const userId = 'user-123';
      const address = '0x742d35Cc6634C0532925a3b844Bc9e7595f0bEb0';

      const mockResult = {
        message: 'Wallet deleted successfully',
      };

      mockWalletService.deleteWallet.mockResolvedValue(mockResult);

      const result = await controller.deleteWallet({ user: { id: userId } }, address);

      expect(result).toEqual(mockResult);
      expect(walletService.deleteWallet).toHaveBeenCalledWith(userId, address);
    });

    it('should throw NotFoundException when wallet not found', async () => {
      const userId = 'user-123';
      const address = '0x742d35Cc6634C0532925a3b844Bc9e7595f0bEb0';

      mockWalletService.deleteWallet.mockRejectedValue(
        new NotFoundException('Wallet not found'),
      );

      await expect(
        controller.deleteWallet({ user: { id: userId } }, address),
      ).rejects.toThrow(NotFoundException);
    });
  });
});


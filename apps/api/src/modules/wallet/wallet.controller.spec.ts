import { Test, TestingModule } from '@nestjs/testing';
import { WalletController } from './wallet.controller';
import { WalletService } from './wallet.service';
import { CreateWalletDto } from './dto/create-wallet.dto';
import { ImportWalletDto } from './dto/import-wallet.dto';
import { SyncWalletDto } from './dto/sync-wallet.dto';
import { NotFoundException, BadRequestException } from '@nestjs/common';

describe('WalletController', () => {
  let controller: WalletController;
  let walletService: jest.Mocked<WalletService>;

  beforeEach(async () => {
    const mockWalletService = {
      createWallet: jest.fn(),
      importWallet: jest.fn(),
      getWalletById: jest.fn(),
      getWalletAccounts: jest.fn(),
      syncWallet: jest.fn(),
      updateWallet: jest.fn(),
      deleteWallet: jest.fn(),
    };

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
      const dto: CreateWalletDto = {
        name: 'Test Wallet',
      };

      const mockResult = {
        wallet: {
          id: 'wallet-1',
          name: dto.name,
          accounts: [],
        },
        mnemonic: 'abandon abandon abandon abandon abandon abandon abandon abandon abandon abandon abandon about',
      };

      walletService.createWallet.mockResolvedValue(mockResult);

      const result = await controller.createWallet(dto);

      expect(result.success).toBe(true);
      expect(result.result).toEqual(mockResult);
      expect(walletService.createWallet).toHaveBeenCalledWith(dto, undefined);
    });

    it('should create wallet with user ID if authenticated', async () => {
      const dto: CreateWalletDto = {
        name: 'Test Wallet',
      };

      const req = {
        user: { id: 'user-1' },
      };

      const mockResult = {
        wallet: {
          id: 'wallet-1',
          name: dto.name,
          accounts: [],
        },
        mnemonic: 'test mnemonic',
      };

      walletService.createWallet.mockResolvedValue(mockResult);

      const result = await controller.createWallet(dto, req);

      expect(result.success).toBe(true);
      expect(walletService.createWallet).toHaveBeenCalledWith(dto, 'user-1');
    });
  });

  describe('importWallet', () => {
    it('should import wallet from mnemonic', async () => {
      const dto: ImportWalletDto = {
        mnemonicOrPrivateKey: 'abandon abandon abandon abandon abandon abandon abandon abandon abandon abandon abandon about',
        name: 'Imported Wallet',
      };

      const mockResult = {
        wallet: {
          id: 'wallet-1',
          name: dto.name,
          isImported: true,
          accounts: [],
        },
        mnemonic: undefined,
      };

      walletService.importWallet.mockResolvedValue(mockResult);

      const result = await controller.importWallet(dto);

      expect(result.success).toBe(true);
      expect(result.result).toEqual(mockResult);
      expect(walletService.importWallet).toHaveBeenCalledWith(dto, undefined);
    });

    it('should handle import errors', async () => {
      const dto: ImportWalletDto = {
        mnemonicOrPrivateKey: 'invalid',
        name: 'Invalid Wallet',
      };

      walletService.importWallet.mockRejectedValue(
        new BadRequestException('Invalid mnemonic'),
      );

      await expect(controller.importWallet(dto)).rejects.toThrow(
        BadRequestException,
      );
    });
  });

  describe('getWallet', () => {
    it('should return wallet by ID', async () => {
      const walletId = 'wallet-1';
      const mockWallet = {
        id: walletId,
        name: 'Test Wallet',
        accounts: [],
      };

      walletService.getWalletById.mockResolvedValue(mockWallet);

      const result = await controller.getWallet(walletId);

      expect(result.success).toBe(true);
      expect(result.result).toEqual(mockWallet);
      expect(walletService.getWalletById).toHaveBeenCalledWith(walletId);
    });

    it('should handle wallet not found', async () => {
      const walletId = 'non-existent';

      walletService.getWalletById.mockRejectedValue(
        new NotFoundException('Wallet not found'),
      );

      await expect(controller.getWallet(walletId)).rejects.toThrow(
        NotFoundException,
      );
    });
  });

  describe('getWalletAccounts', () => {
    it('should return accounts for a wallet', async () => {
      const walletId = 'wallet-1';
      const mockAccounts = [
        {
          id: 'account-1',
          walletId,
          address: '0x742d35Cc6634C0532925a3b844Bc9e7595f0bEb0',
          index: 0,
        },
      ];

      walletService.getWalletAccounts.mockResolvedValue(mockAccounts);

      const result = await controller.getWalletAccounts(walletId, {});

      expect(result.success).toBe(true);
      expect(result.result).toEqual(mockAccounts);
      expect(walletService.getWalletAccounts).toHaveBeenCalledWith(
        walletId,
        false,
      );
    });

    it('should include inactive accounts if requested', async () => {
      const walletId = 'wallet-1';
      const query = { includeInactive: true };

      walletService.getWalletAccounts.mockResolvedValue([]);

      await controller.getWalletAccounts(walletId, query);

      expect(walletService.getWalletAccounts).toHaveBeenCalledWith(
        walletId,
        true,
      );
    });
  });

  describe('syncWallet', () => {
    it('should sync wallet data', async () => {
      const walletId = 'wallet-1';
      const dto: SyncWalletDto = {};

      const mockResult = {
        wallet: {
          id: walletId,
          accounts: [],
        },
        accounts: [
          {
            account: {
              id: 'account-1',
              address: '0x742d35Cc6634C0532925a3b844Bc9e7595f0bEb0',
            },
            balance: '1000000000000000000',
            transactionCount: 5,
          },
        ],
      };

      walletService.syncWallet.mockResolvedValue(mockResult);

      const result = await controller.syncWallet(walletId, dto);

      expect(result.success).toBe(true);
      expect(result.result).toEqual(mockResult);
      expect(walletService.syncWallet).toHaveBeenCalledWith(walletId, dto);
    });

    it('should handle sync errors', async () => {
      const walletId = 'non-existent';
      const dto: SyncWalletDto = {};

      walletService.syncWallet.mockRejectedValue(
        new NotFoundException('Wallet not found'),
      );

      await expect(controller.syncWallet(walletId, dto)).rejects.toThrow(
        NotFoundException,
      );
    });
  });

  describe('updateWallet', () => {
    it('should update wallet metadata', async () => {
      const walletId = 'wallet-1';
      const updates = {
        name: 'Updated Name',
        metadata: { key: 'value' },
      };

      const mockWallet = {
        id: walletId,
        ...updates,
        accounts: [],
      };

      walletService.updateWallet.mockResolvedValue(mockWallet);

      const result = await controller.updateWallet(walletId, updates);

      expect(result.success).toBe(true);
      expect(result.result).toEqual(mockWallet);
      expect(walletService.updateWallet).toHaveBeenCalledWith(
        walletId,
        updates,
      );
    });
  });

  describe('deleteWallet', () => {
    it('should delete a wallet', async () => {
      const walletId = 'wallet-1';

      walletService.deleteWallet.mockResolvedValue(undefined);

      const result = await controller.deleteWallet(walletId);

      expect(result.success).toBe(true);
      expect(walletService.deleteWallet).toHaveBeenCalledWith(walletId);
    });
  });
});


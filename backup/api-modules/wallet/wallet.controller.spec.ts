import { Test, TestingModule } from '@nestjs/testing';
import { WalletController } from './wallet.controller';
import { WalletService } from './wallet.service';
import { CreateWalletDto } from './dto/create-wallet.dto';
import { ImportWalletDto } from './dto/import-wallet.dto';
import { SyncWalletDto } from './dto/sync-wallet.dto';
import { NotFoundException, BadRequestException } from '@nestjs/common';
import { WalletAccount } from './entities/wallet-account.entity';
import { Wallet } from './entities/wallet.entity';

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
          userId: null,
          user: null,
          mnemonicHash: 'hashed',
          isImported: false,
          isActive: true,
          accounts: [],
          createdAt: new Date(),
          updatedAt: new Date(),
          metadata: {},
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
          userId: 'user-1',
          user: null,
          mnemonicHash: 'hashed',
          isImported: false,
          isActive: true,
          accounts: [],
          createdAt: new Date(),
          updatedAt: new Date(),
          metadata: {},
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
          userId: null,
          user: null,
          mnemonicHash: 'hashed',
          isImported: true,
          isActive: true,
          accounts: [],
          createdAt: new Date(),
          updatedAt: new Date(),
          metadata: {},
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
        userId: null,
        user: null,
        mnemonicHash: 'hashed',
        isImported: false,
        isActive: true,
        accounts: [],
        createdAt: new Date(),
        updatedAt: new Date(),
        metadata: {},
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
      const mockAccounts: WalletAccount[] = [
        {
          id: 'account-1',
          walletId,
          address: '0x742d35Cc6634C0532925a3b844Bc9e7595f0bEb0',
          publicKey: '0x1234567890abcdef',
          index: 0,
          derivationPath: "m/44'/60'/0'/0/0",
          label: null,
          isActive: true,
          metadata: {},
          createdAt: new Date(),
          updatedAt: new Date(),
          wallet: null,
        } as WalletAccount,
      ];

      walletService.getWalletAccounts.mockResolvedValue(mockAccounts);

      const result = await controller.getWalletAccounts(walletId, {});

      expect(result.success).toBe(true);
      expect(result.result).toEqual(mockAccounts);
      // When query is empty {}, dto.includeInactive is undefined
      expect(walletService.getWalletAccounts).toHaveBeenCalledWith(
        walletId,
        undefined,
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

      const mockAccount: WalletAccount = {
        id: 'account-1',
        walletId: walletId,
        address: '0x742d35Cc6634C0532925a3b844Bc9e7595f0bEb0',
        publicKey: '0x1234567890abcdef',
        index: 0,
        derivationPath: "m/44'/60'/0'/0/0",
        label: null,
        isActive: true,
        metadata: {},
        createdAt: new Date(),
        updatedAt: new Date(),
        wallet: null,
      } as WalletAccount;

      const mockWallet: Wallet = {
        id: walletId,
        name: 'Test Wallet',
        userId: null,
        user: null,
        mnemonicHash: 'hashed',
        isImported: false,
        isActive: true,
        accounts: [],
        createdAt: new Date(),
        updatedAt: new Date(),
        metadata: {},
      } as Wallet;

      const mockResult = {
        wallet: mockWallet,
        accounts: [
          {
            account: mockAccount,
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

      const mockWallet: Wallet = {
        id: walletId,
        name: updates.name,
        userId: null,
        user: null,
        mnemonicHash: 'hashed',
        isImported: false,
        isActive: true,
        accounts: [],
        createdAt: new Date(),
        updatedAt: new Date(),
        metadata: updates.metadata || {},
      } as Wallet;

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

    it('should handle delete errors', async () => {
      const walletId = 'non-existent';

      walletService.deleteWallet.mockRejectedValue(
        new NotFoundException('Wallet not found'),
      );

      await expect(controller.deleteWallet(walletId)).rejects.toThrow(
        NotFoundException,
      );
    });
  });

  describe('Edge Cases for 100% Coverage', () => {
    it('should handle createWallet with all optional fields', async () => {
      const dto: CreateWalletDto = {
        name: 'Test Wallet',
        passphrase: 'my-passphrase',
        deriveFirstAccount: false,
        metadata: { key: 'value' },
      };

      const mockResult = {
        wallet: {
          id: 'wallet-1',
          name: dto.name,
          userId: null,
          user: null,
          mnemonicHash: 'hashed',
          isImported: false,
          isActive: true,
          accounts: [],
          createdAt: new Date(),
          updatedAt: new Date(),
          metadata: dto.metadata || {},
        },
        mnemonic: 'test mnemonic',
      };

      walletService.createWallet.mockResolvedValue(mockResult);

      const result = await controller.createWallet(dto);

      expect(result.success).toBe(true);
      expect(walletService.createWallet).toHaveBeenCalledWith(dto, undefined);
    });

    it('should handle importWallet with all fields', async () => {
      const dto: ImportWalletDto = {
        mnemonicOrPrivateKey:
          'abandon abandon abandon abandon abandon abandon abandon abandon abandon abandon abandon about',
        name: 'Imported Wallet',
        passphrase: 'my-passphrase',
        deriveFirstAccount: true,
        metadata: { key: 'value' },
      };

      const mockResult = {
        wallet: {
          id: 'wallet-1',
          name: dto.name,
          userId: null,
          user: null,
          mnemonicHash: 'hashed',
          isImported: true,
          isActive: true,
          accounts: [],
          createdAt: new Date(),
          updatedAt: new Date(),
          metadata: dto.metadata || {},
        },
      };

      walletService.importWallet.mockResolvedValue(mockResult);

      const result = await controller.importWallet(dto);

      expect(result.success).toBe(true);
    });

    it('should handle syncWallet with force flag', async () => {
      const walletId = 'wallet-1';
      const dto: SyncWalletDto = {
        accountAddresses: ['0x123'],
        force: true,
      };

      const mockWallet: Wallet = {
        id: walletId,
        name: 'Test Wallet',
        userId: null,
        user: null,
        mnemonicHash: 'hashed',
        isImported: false,
        isActive: true,
        accounts: [],
        createdAt: new Date(),
        updatedAt: new Date(),
        metadata: {},
      } as Wallet;

      const mockResult = {
        wallet: mockWallet,
        accounts: [],
      };

      walletService.syncWallet.mockResolvedValue(mockResult);

      const result = await controller.syncWallet(walletId, dto);

      expect(result.success).toBe(true);
      expect(walletService.syncWallet).toHaveBeenCalledWith(walletId, dto);
    });

    it('should handle updateWallet with only name', async () => {
      const walletId = 'wallet-1';
      const updates = { name: 'New Name' };

      const mockWallet: Wallet = {
        id: walletId,
        name: 'New Name',
        userId: null,
        user: null,
        mnemonicHash: 'hashed',
        isImported: false,
        isActive: true,
        accounts: [],
        createdAt: new Date(),
        updatedAt: new Date(),
        metadata: {},
      } as Wallet;

      walletService.updateWallet.mockResolvedValue(mockWallet);

      const result = await controller.updateWallet(walletId, updates);

      expect(result.success).toBe(true);
      expect(result.result.name).toBe('New Name');
    });

    it('should handle updateWallet with only metadata', async () => {
      const walletId = 'wallet-1';
      const updates = { metadata: { key: 'value' } };

      const mockWallet = {
        id: walletId,
        name: 'Test Wallet',
        userId: null,
        user: null,
        mnemonicHash: 'hashed',
        isImported: false,
        isActive: true,
        accounts: [],
        createdAt: new Date(),
        updatedAt: new Date(),
        metadata: { key: 'value' },
      };

      walletService.updateWallet.mockResolvedValue(mockWallet);

      const result = await controller.updateWallet(walletId, updates);

      expect(result.success).toBe(true);
      expect(result.result.metadata).toEqual({ key: 'value' });
    });
  });
});


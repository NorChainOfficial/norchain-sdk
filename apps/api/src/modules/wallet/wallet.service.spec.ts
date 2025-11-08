import { Test, TestingModule } from '@nestjs/testing';
import { getRepositoryToken } from '@nestjs/typeorm';
import { BadRequestException, NotFoundException } from '@nestjs/common';
import { WalletService } from './wallet.service';
import { Wallet } from './entities/wallet.entity';
import { WalletAccount } from './entities/wallet-account.entity';
import { RpcService } from '@/common/services/rpc.service';
import { CacheService } from '@/common/services/cache.service';
import { AccountService } from '@/modules/account/account.service';
import { CreateWalletDto } from './dto/create-wallet.dto';
import { ImportWalletDto } from './dto/import-wallet.dto';
import { SyncWalletDto } from './dto/sync-wallet.dto';

// Mock ethers module
jest.mock('ethers', () => {
  const mockWallet = {
    address: '0x742d35Cc6634C0532925a3b844Bc9e7595f0bEb0',
    publicKey: '0x1234567890abcdef',
  };

  const mockHDNode = {
    derivePath: jest.fn(() => mockWallet),
    address: mockWallet.address,
    publicKey: mockWallet.publicKey,
  };

  return {
    ethers: {
      Mnemonic: {
        entropyToPhrase: jest.fn(() => 'abandon abandon abandon abandon abandon abandon abandon abandon abandon abandon abandon about'),
        isValidMnemonic: jest.fn((phrase: string) => {
          const words = phrase.trim().split(/\s+/);
          return words.length === 12 || words.length === 24;
        }),
      },
      HDNodeWallet: {
        fromPhrase: jest.fn(() => mockHDNode),
      },
      Wallet: jest.fn(() => mockWallet),
      randomBytes: jest.fn(() => Buffer.from('1234567890123456')),
    },
  };
});

// Mock crypto module
jest.mock('crypto', () => ({
  createHash: jest.fn(() => ({
    update: jest.fn(() => ({
      digest: jest.fn(() => 'hashed-mnemonic'),
    })),
  })),
}));

describe('WalletService', () => {
  let service: WalletService;
  let walletRepository: any;
  let walletAccountRepository: any;
  let rpcService: jest.Mocked<RpcService>;
  let cacheService: jest.Mocked<CacheService>;
  let accountService: jest.Mocked<AccountService>;

  beforeEach(async () => {
    const mockWalletRepository = {
      create: jest.fn(),
      save: jest.fn(),
      findOne: jest.fn(),
      find: jest.fn(),
    };

    const mockWalletAccountRepository = {
      create: jest.fn(),
      save: jest.fn(),
      findOne: jest.fn(),
      find: jest.fn(),
    };

    const mockRpcService = {
      getBalance: jest.fn(),
      getTransactionCount: jest.fn(),
    };

    const mockCacheService = {
      get: jest.fn(),
      set: jest.fn(),
      getOrSet: jest.fn(),
    };

    const mockAccountService = {
      getBalance: jest.fn(),
    };

    const module: TestingModule = await Test.createTestingModule({
      providers: [
        WalletService,
        {
          provide: getRepositoryToken(Wallet),
          useValue: mockWalletRepository,
        },
        {
          provide: getRepositoryToken(WalletAccount),
          useValue: mockWalletAccountRepository,
        },
        {
          provide: RpcService,
          useValue: mockRpcService,
        },
        {
          provide: CacheService,
          useValue: mockCacheService,
        },
        {
          provide: AccountService,
          useValue: mockAccountService,
        },
      ],
    }).compile();

    service = module.get<WalletService>(WalletService);
    walletRepository = module.get(getRepositoryToken(Wallet));
    walletAccountRepository = module.get(getRepositoryToken(WalletAccount));
    rpcService = module.get(RpcService);
    cacheService = module.get(CacheService);
    accountService = module.get(AccountService);
  });

  afterEach(() => {
    jest.clearAllMocks();
  });

  it('should be defined', () => {
    expect(service).toBeDefined();
  });

  describe('createWallet', () => {
    it('should create a new wallet with mnemonic', async () => {
      const dto: CreateWalletDto = {
        name: 'Test Wallet',
        deriveFirstAccount: true,
      };

      const mockWallet = {
        id: 'wallet-1',
        name: dto.name,
        mnemonicHash: 'hashed-mnemonic',
        isImported: false,
        isActive: true,
        accounts: [],
        createdAt: new Date(),
        updatedAt: new Date(),
      };

      const mockAccount = {
        id: 'account-1',
        walletId: 'wallet-1',
        address: '0x742d35Cc6634C0532925a3b844Bc9e7595f0bEb0',
        index: 0,
        isActive: true,
      };

      walletRepository.create.mockReturnValue(mockWallet);
      walletRepository.save.mockResolvedValue(mockWallet);
      walletAccountRepository.create.mockReturnValue(mockAccount);
      walletAccountRepository.save.mockResolvedValue(mockAccount);
      walletRepository.findOne.mockResolvedValue({
        ...mockWallet,
        accounts: [mockAccount],
      });

      const result = await service.createWallet(dto);

      expect(result.wallet).toBeDefined();
      expect(result.mnemonic).toBeDefined();
      expect(result.wallet.isImported).toBe(false);
      expect(walletRepository.create).toHaveBeenCalled();
      expect(walletRepository.save).toHaveBeenCalled();
    });

    it('should create wallet without deriving first account if requested', async () => {
      const dto: CreateWalletDto = {
        name: 'Test Wallet',
        deriveFirstAccount: false,
      };

      const mockWallet = {
        id: 'wallet-1',
        name: dto.name,
        mnemonicHash: 'hashed-mnemonic',
        isImported: false,
        isActive: true,
        accounts: [],
      };

      walletRepository.create.mockReturnValue(mockWallet);
      walletRepository.save.mockResolvedValue(mockWallet);
      walletRepository.findOne.mockResolvedValue(mockWallet);

      const result = await service.createWallet(dto);

      expect(result.wallet.accounts).toEqual([]);
      expect(walletAccountRepository.create).not.toHaveBeenCalled();
    });
  });

  describe('importWallet', () => {
    it('should import wallet from mnemonic', async () => {
      const dto: ImportWalletDto = {
        mnemonicOrPrivateKey: 'abandon abandon abandon abandon abandon abandon abandon abandon abandon abandon abandon about',
        name: 'Imported Wallet',
      };

      const mockWallet = {
        id: 'wallet-1',
        name: dto.name,
        mnemonicHash: 'hashed-mnemonic',
        isImported: true,
        isActive: true,
        accounts: [],
      };

      walletRepository.create.mockReturnValue(mockWallet);
      walletRepository.save.mockResolvedValue(mockWallet);
      walletRepository.findOne.mockResolvedValue(mockWallet);

      const result = await service.importWallet(dto);

      expect(result.wallet).toBeDefined();
      expect(result.wallet.isImported).toBe(true);
      expect(result.mnemonic).toBeUndefined(); // Should not return mnemonic for imported wallets
    });

    it('should import wallet from private key', async () => {
      const dto: ImportWalletDto = {
        mnemonicOrPrivateKey: '0x1234567890abcdef1234567890abcdef1234567890abcdef1234567890abcdef',
        name: 'Private Key Wallet',
      };

      const mockWallet = {
        id: 'wallet-1',
        name: dto.name,
        mnemonicHash: null,
        isImported: true,
        isActive: true,
        accounts: [],
      };

      const mockAccount = {
        id: 'account-1',
        walletId: 'wallet-1',
        address: '0x742d35Cc6634C0532925a3b844Bc9e7595f0bEb0',
        index: 0,
        derivationPath: null,
        isActive: true,
      };

      walletRepository.create.mockReturnValue(mockWallet);
      walletRepository.save.mockResolvedValue(mockWallet);
      walletAccountRepository.create.mockReturnValue(mockAccount);
      walletAccountRepository.save.mockResolvedValue(mockAccount);
      walletRepository.findOne.mockResolvedValue({
        ...mockWallet,
        accounts: [mockAccount],
      });

      const result = await service.importWallet(dto);

      expect(result.wallet).toBeDefined();
      expect(result.wallet.mnemonicHash).toBeNull();
      expect(result.wallet.accounts.length).toBe(1);
    });

    it('should throw BadRequestException for invalid mnemonic', async () => {
      const dto: ImportWalletDto = {
        mnemonicOrPrivateKey: 'invalid mnemonic phrase',
        name: 'Invalid Wallet',
      };

      await expect(service.importWallet(dto)).rejects.toThrow(
        BadRequestException,
      );
    });

    it('should throw BadRequestException for invalid private key', async () => {
      const dto: ImportWalletDto = {
        mnemonicOrPrivateKey: '0xinvalid',
        name: 'Invalid Wallet',
      };

      await expect(service.importWallet(dto)).rejects.toThrow(
        BadRequestException,
      );
    });
  });

  describe('getWalletById', () => {
    it('should return wallet by ID', async () => {
      const walletId = 'wallet-1';
      const mockWallet = {
        id: walletId,
        name: 'Test Wallet',
        accounts: [],
      };

      walletRepository.findOne.mockResolvedValue(mockWallet);

      const result = await service.getWalletById(walletId);

      expect(result).toEqual(mockWallet);
      expect(walletRepository.findOne).toHaveBeenCalledWith({
        where: { id: walletId },
        relations: ['accounts'],
      });
    });

    it('should throw NotFoundException if wallet not found', async () => {
      const walletId = 'non-existent';

      walletRepository.findOne.mockResolvedValue(null);

      await expect(service.getWalletById(walletId)).rejects.toThrow(
        NotFoundException,
      );
    });
  });

  describe('getWalletAccounts', () => {
    it('should return all active accounts for a wallet', async () => {
      const walletId = 'wallet-1';
      const mockWallet = {
        id: walletId,
        name: 'Test Wallet',
      };
      const mockAccounts = [
        {
          id: 'account-1',
          walletId,
          address: '0x742d35Cc6634C0532925a3b844Bc9e7595f0bEb0',
          index: 0,
          isActive: true,
        },
        {
          id: 'account-2',
          walletId,
          address: '0x1234567890123456789012345678901234567890',
          index: 1,
          isActive: true,
        },
      ];

      walletRepository.findOne.mockResolvedValue(mockWallet);
      walletAccountRepository.find.mockResolvedValue(mockAccounts);

      const result = await service.getWalletAccounts(walletId);

      expect(result).toEqual(mockAccounts);
      expect(walletAccountRepository.find).toHaveBeenCalledWith({
        where: { walletId, isActive: true },
        order: { index: 'ASC' },
      });
    });

    it('should include inactive accounts if requested', async () => {
      const walletId = 'wallet-1';
      const mockWallet = {
        id: walletId,
        name: 'Test Wallet',
      };
      const mockAccounts = [
        {
          id: 'account-1',
          walletId,
          address: '0x742d35Cc6634C0532925a3b844Bc9e7595f0bEb0',
          index: 0,
          isActive: false,
        },
      ];

      walletRepository.findOne.mockResolvedValue(mockWallet);
      walletAccountRepository.find.mockResolvedValue(mockAccounts);

      const result = await service.getWalletAccounts(walletId, true);

      expect(result).toEqual(mockAccounts);
      expect(walletAccountRepository.find).toHaveBeenCalledWith({
        where: { walletId },
        order: { index: 'ASC' },
      });
    });

    it('should throw NotFoundException if wallet not found', async () => {
      const walletId = 'non-existent';

      walletRepository.findOne.mockResolvedValue(null);

      await expect(service.getWalletAccounts(walletId)).rejects.toThrow(
        NotFoundException,
      );
    });
  });

  describe('syncWallet', () => {
    it('should sync wallet accounts with balances and transaction counts', async () => {
      const walletId = 'wallet-1';
      const dto: SyncWalletDto = {};

      const mockWallet = {
        id: walletId,
        name: 'Test Wallet',
        accounts: [
          {
            id: 'account-1',
            walletId,
            address: '0x742d35Cc6634C0532925a3b844Bc9e7595f0bEb0',
            index: 0,
            isActive: true,
          },
        ],
      };

      walletRepository.findOne.mockResolvedValue(mockWallet);
      cacheService.get.mockResolvedValue(null);
      rpcService.getBalance.mockResolvedValue(BigInt('1000000000000000000'));
      rpcService.getTransactionCount.mockResolvedValue(5);
      cacheService.set.mockResolvedValue(undefined);

      const result = await service.syncWallet(walletId, dto);

      expect(result.wallet).toEqual(mockWallet);
      expect(result.accounts).toHaveLength(1);
      expect(result.accounts[0].balance).toBe('1000000000000000000');
      expect(result.accounts[0].transactionCount).toBe(5);
      expect(rpcService.getBalance).toHaveBeenCalled();
      expect(rpcService.getTransactionCount).toHaveBeenCalled();
    });

    it('should use cached data if available and force is false', async () => {
      const walletId = 'wallet-1';
      const dto: SyncWalletDto = { force: false };

      const mockWallet = {
        id: walletId,
        accounts: [
          {
            id: 'account-1',
            address: '0x742d35Cc6634C0532925a3b844Bc9e7595f0bEb0',
            isActive: true,
          },
        ],
      };

      const cachedData = {
        account: mockWallet.accounts[0],
        balance: '2000000000000000000',
        transactionCount: 10,
      };

      walletRepository.findOne.mockResolvedValue(mockWallet);
      cacheService.get.mockResolvedValue(cachedData);

      const result = await service.syncWallet(walletId, dto);

      expect(result.accounts[0]).toEqual(cachedData);
      expect(rpcService.getBalance).not.toHaveBeenCalled();
    });

    it('should sync only specified accounts if accountAddresses provided', async () => {
      const walletId = 'wallet-1';
      const dto: SyncWalletDto = {
        accountAddresses: ['0x742d35Cc6634C0532925a3b844Bc9e7595f0bEb0'],
      };

      const mockWallet = {
        id: walletId,
        accounts: [
          {
            id: 'account-1',
            address: '0x742d35Cc6634C0532925a3b844Bc9e7595f0bEb0',
            isActive: true,
          },
          {
            id: 'account-2',
            address: '0x1234567890123456789012345678901234567890',
            isActive: true,
          },
        ],
      };

      walletRepository.findOne.mockResolvedValue(mockWallet);
      cacheService.get.mockResolvedValue(null);
      rpcService.getBalance.mockResolvedValue(BigInt('1000000000000000000'));
      rpcService.getTransactionCount.mockResolvedValue(5);

      const result = await service.syncWallet(walletId, dto);

      expect(result.accounts).toHaveLength(1);
      expect(result.accounts[0].account.address).toBe(
        '0x742d35Cc6634C0532925a3b844Bc9e7595f0bEb0',
      );
    });

    it('should throw NotFoundException if wallet not found', async () => {
      const walletId = 'non-existent';
      const dto: SyncWalletDto = {};

      walletRepository.findOne.mockResolvedValue(null);

      await expect(service.syncWallet(walletId, dto)).rejects.toThrow(
        NotFoundException,
      );
    });
  });

  describe('updateWallet', () => {
    it('should update wallet metadata', async () => {
      const walletId = 'wallet-1';
      const updates = {
        name: 'Updated Wallet Name',
        metadata: { key: 'value' },
      };

      const mockWallet = {
        id: walletId,
        name: 'Original Name',
        metadata: {},
        accounts: [],
      };

      walletRepository.findOne.mockResolvedValue(mockWallet);
      walletRepository.save.mockResolvedValue({
        ...mockWallet,
        ...updates,
      });

      const result = await service.updateWallet(walletId, updates);

      expect(result.name).toBe(updates.name);
      expect(result.metadata).toEqual(updates.metadata);
      expect(walletRepository.save).toHaveBeenCalled();
    });
  });

  describe('deleteWallet', () => {
    it('should soft delete wallet by setting isActive to false', async () => {
      const walletId = 'wallet-1';
      const mockWallet = {
        id: walletId,
        name: 'Test Wallet',
        isActive: true,
        accounts: [],
      };

      walletRepository.findOne.mockResolvedValue(mockWallet);
      walletRepository.save.mockResolvedValue({
        ...mockWallet,
        isActive: false,
      });

      await service.deleteWallet(walletId);

      expect(walletRepository.save).toHaveBeenCalledWith({
        ...mockWallet,
        isActive: false,
      });
    });
  });
});


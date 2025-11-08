import {
  Injectable,
  NotFoundException,
  BadRequestException,
  Logger,
} from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { ethers } from 'ethers';
import * as crypto from 'crypto';
import { Wallet } from './entities/wallet.entity';
import { WalletAccount } from './entities/wallet-account.entity';
import { CreateWalletDto } from './dto/create-wallet.dto';
import { ImportWalletDto } from './dto/import-wallet.dto';
import { SyncWalletDto } from './dto/sync-wallet.dto';
import { RpcService } from '@/common/services/rpc.service';
import { CacheService } from '@/common/services/cache.service';
import { AccountService } from '@/modules/account/account.service';

/**
 * Wallet Service
 *
 * Handles wallet creation, import, account management, and synchronization.
 * Never stores plain mnemonics or private keys - only hashed values.
 *
 * @class WalletService
 */
@Injectable()
export class WalletService {
  private readonly logger = new Logger(WalletService.name);

  constructor(
    @InjectRepository(Wallet)
    private walletRepository: Repository<Wallet>,
    @InjectRepository(WalletAccount)
    private walletAccountRepository: Repository<WalletAccount>,
    private rpcService: RpcService,
    private cacheService: CacheService,
    private accountService: AccountService,
  ) {}

  /**
   * Creates a hash of the mnemonic for storage
   */
  private hashMnemonic(mnemonic: string): string {
    return crypto.createHash('sha256').update(mnemonic).digest('hex');
  }

  /**
   * Validates if a string is a valid mnemonic phrase
   */
  private isValidMnemonic(phrase: string): boolean {
    try {
      return ethers.Mnemonic.isValidMnemonic(phrase);
    } catch {
      return false;
    }
  }

  /**
   * Validates if a string is a valid private key
   */
  private isValidPrivateKey(key: string): boolean {
    try {
      // Remove 0x prefix if present
      const cleanKey = key.startsWith('0x') ? key.slice(2) : key;
      // Check if it's a valid hex string of 64 characters (32 bytes)
      return /^[0-9a-fA-F]{64}$/.test(cleanKey);
    } catch {
      return false;
    }
  }

  /**
   * Creates a new wallet from a generated mnemonic
   */
  async createWallet(
    dto: CreateWalletDto,
    userId?: string,
  ): Promise<{ wallet: Wallet; mnemonic: string }> {
    try {
      // Generate a new mnemonic
      const mnemonic = ethers.Mnemonic.entropyToPhrase(
        ethers.randomBytes(16), // 128 bits = 12 words
      );

      return this.createWalletFromMnemonic(mnemonic, dto, userId);
    } catch (error) {
      this.logger.error(`Failed to create wallet: ${error.message}`, error.stack);
      throw new BadRequestException('Failed to create wallet');
    }
  }

  /**
   * Imports a wallet from mnemonic or private key
   */
  async importWallet(
    dto: ImportWalletDto,
    userId?: string,
  ): Promise<{ wallet: Wallet; mnemonic?: string }> {
    const { mnemonicOrPrivateKey, passphrase, ...rest } = dto;

    try {
      // Check if it's a mnemonic or private key
      if (this.isValidMnemonic(mnemonicOrPrivateKey)) {
        return this.createWalletFromMnemonic(
          mnemonicOrPrivateKey,
          { ...rest, passphrase },
          userId,
          true,
        );
      } else if (this.isValidPrivateKey(mnemonicOrPrivateKey)) {
        return this.createWalletFromPrivateKey(
          mnemonicOrPrivateKey,
          rest,
          userId,
        );
      } else {
        throw new BadRequestException(
          'Invalid mnemonic phrase or private key format',
        );
      }
    } catch (error) {
      if (error instanceof BadRequestException) {
        throw error;
      }
      this.logger.error(`Failed to import wallet: ${error.message}`, error.stack);
      throw new BadRequestException('Failed to import wallet');
    }
  }

  /**
   * Creates a wallet from a mnemonic phrase
   */
  private async createWalletFromMnemonic(
    mnemonic: string,
    dto: CreateWalletDto | ImportWalletDto,
    userId?: string,
    isImported = false,
  ): Promise<{ wallet: Wallet; mnemonic?: string }> {
    try {
      // Create wallet from mnemonic
      const hdNode = ethers.HDNodeWallet.fromPhrase(mnemonic, dto.passphrase);

      // Create wallet entity
      const wallet = this.walletRepository.create({
        userId,
        name: dto.name,
        mnemonicHash: this.hashMnemonic(mnemonic),
        isImported,
        isActive: true,
        metadata: dto.metadata || {},
      });

      const savedWallet = await this.walletRepository.save(wallet);

      // Derive first account if requested (default: true)
      const deriveFirstAccount =
        dto.deriveFirstAccount !== undefined
          ? dto.deriveFirstAccount
          : true;

      if (deriveFirstAccount) {
        await this.deriveAccount(savedWallet.id, 0, hdNode);
      }

      // Reload wallet with accounts
      const walletWithAccounts = await this.walletRepository.findOne({
        where: { id: savedWallet.id },
        relations: ['accounts'],
      });

      return {
        wallet: walletWithAccounts!,
        mnemonic: isImported ? undefined : mnemonic, // Only return mnemonic for new wallets
      };
    } catch (error) {
      this.logger.error(
        `Failed to create wallet from mnemonic: ${error.message}`,
        error.stack,
      );
      throw new BadRequestException('Invalid mnemonic phrase');
    }
  }

  /**
   * Creates a wallet from a private key
   */
  private async createWalletFromPrivateKey(
    privateKey: string,
    dto: Omit<ImportWalletDto, 'mnemonicOrPrivateKey' | 'passphrase'>,
    userId?: string,
  ): Promise<{ wallet: Wallet; mnemonic?: string }> {
    try {
      // Create wallet from private key
      const walletInstance = new ethers.Wallet(privateKey);

      // Create wallet entity (no mnemonic for private key wallets)
      const wallet = this.walletRepository.create({
        userId,
        name: dto.name,
        mnemonicHash: null, // No mnemonic for private key wallets
        isImported: true,
        isActive: true,
        metadata: dto.metadata || {},
      });

      const savedWallet = await this.walletRepository.save(wallet);

      // Create account from the private key wallet
      const account = this.walletAccountRepository.create({
        walletId: savedWallet.id,
        address: walletInstance.address,
        publicKey: walletInstance.publicKey,
        index: 0,
        derivationPath: null, // No derivation path for private key wallets
        isActive: true,
        metadata: {},
      });

      await this.walletAccountRepository.save(account);

      // Reload wallet with accounts
      const walletWithAccounts = await this.walletRepository.findOne({
        where: { id: savedWallet.id },
        relations: ['accounts'],
      });

      return {
        wallet: walletWithAccounts!,
        mnemonic: undefined, // No mnemonic for private key wallets
      };
    } catch (error) {
      this.logger.error(
        `Failed to create wallet from private key: ${error.message}`,
        error.stack,
      );
      throw new BadRequestException('Invalid private key');
    }
  }

  /**
   * Derives a new account from a wallet
   */
  async deriveAccount(
    walletId: string,
    index: number,
    hdNode?: ethers.HDNodeWallet,
  ): Promise<WalletAccount> {
    const wallet = await this.walletRepository.findOne({
      where: { id: walletId },
    });

    if (!wallet) {
      throw new NotFoundException(`Wallet with ID ${walletId} not found`);
    }

    if (!wallet.mnemonicHash) {
      throw new BadRequestException(
        'Cannot derive accounts from private key wallets',
      );
    }

    // Check if account already exists
    const existingAccount = await this.walletAccountRepository.findOne({
      where: { walletId, index },
    });

    if (existingAccount) {
      return existingAccount;
    }

    // Note: We cannot derive accounts without the mnemonic
    // This is a limitation - the API cannot derive accounts without the mnemonic
    // The client must provide the derived account information
    throw new BadRequestException(
      'Account derivation requires mnemonic. Please use the client SDK to derive accounts and sync them via the sync endpoint.',
    );
  }

  /**
   * Gets all accounts for a wallet
   */
  async getWalletAccounts(
    walletId: string,
    includeInactive = false,
  ): Promise<WalletAccount[]> {
    const wallet = await this.walletRepository.findOne({
      where: { id: walletId },
    });

    if (!wallet) {
      throw new NotFoundException(`Wallet with ID ${walletId} not found`);
    }

    const where: any = { walletId };
    if (!includeInactive) {
      where.isActive = true;
    }

    return this.walletAccountRepository.find({
      where,
      order: { index: 'ASC' },
    });
  }

  /**
   * Syncs wallet data (balances, transaction counts, etc.)
   */
  async syncWallet(
    walletId: string,
    dto: SyncWalletDto,
  ): Promise<{
    wallet: Wallet;
    accounts: Array<{
      account: WalletAccount;
      balance: string;
      transactionCount: number;
    }>;
  }> {
    const wallet = await this.walletRepository.findOne({
      where: { id: walletId },
      relations: ['accounts'],
    });

    if (!wallet) {
      throw new NotFoundException(`Wallet with ID ${walletId} not found`);
    }

    // Get accounts to sync
    let accountsToSync = wallet.accounts.filter((acc) => acc.isActive);
    if (dto.accountAddresses && dto.accountAddresses.length > 0) {
      accountsToSync = accountsToSync.filter((acc) =>
        dto.accountAddresses!.includes(acc.address),
      );
    }

    // Sync each account
    const syncResults = await Promise.all(
      accountsToSync.map(async (account) => {
        const cacheKey = `wallet:${walletId}:account:${account.address}`;
        
        if (!dto.force) {
          const cached = await this.cacheService.get(cacheKey);
          if (cached) {
            return cached;
          }
        }

        // Get balance and transaction count
        const [balance, transactionCount] = await Promise.all([
          this.rpcService.getBalance(account.address),
          this.rpcService.getTransactionCount(account.address),
        ]);

        const result = {
          account,
          balance: balance.toString(),
          transactionCount,
        };

        // Cache for 30 seconds
        await this.cacheService.set(cacheKey, result, 30);

        return result;
      }),
    );

    return {
      wallet,
      accounts: syncResults,
    };
  }

  /**
   * Gets a wallet by ID
   */
  async getWalletById(walletId: string): Promise<Wallet> {
    const wallet = await this.walletRepository.findOne({
      where: { id: walletId },
      relations: ['accounts'],
    });

    if (!wallet) {
      throw new NotFoundException(`Wallet with ID ${walletId} not found`);
    }

    return wallet;
  }

  /**
   * Updates wallet metadata
   */
  async updateWallet(
    walletId: string,
    updates: Partial<Pick<Wallet, 'name' | 'metadata'>>,
  ): Promise<Wallet> {
    const wallet = await this.getWalletById(walletId);
    
    Object.assign(wallet, updates);
    
    return this.walletRepository.save(wallet);
  }

  /**
   * Deletes a wallet (soft delete by setting isActive to false)
   */
  async deleteWallet(walletId: string): Promise<void> {
    const wallet = await this.getWalletById(walletId);
    
    wallet.isActive = false;
    await this.walletRepository.save(wallet);
  }
}


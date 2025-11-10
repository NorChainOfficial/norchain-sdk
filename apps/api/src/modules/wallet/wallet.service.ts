import {
  Injectable,
  NotFoundException,
  ForbiddenException,
} from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { User } from '../auth/entities/user.entity';
import { Wallet } from './entities/wallet.entity';
import { RpcService } from '@/common/services/rpc.service';
import { PolicyService } from '../policy/policy.service';
import { CreateWalletDto } from './dto/create-wallet.dto';
import { ImportWalletDto } from './dto/import-wallet.dto';
import { SendTransactionDto } from './dto/send-transaction.dto';
import { ethers } from 'ethers';

@Injectable()
export class WalletService {
  constructor(
    @InjectRepository(Wallet)
    private readonly walletRepository: Repository<Wallet>,
    @InjectRepository(User)
    private readonly userRepository: Repository<User>,
    private readonly rpcService: RpcService,
    private readonly policyService: PolicyService,
  ) {}

  async createWallet(userId: string, dto: CreateWalletDto) {
    const user = await this.userRepository.findOne({
      where: { id: userId },
    });

    if (!user) {
      throw new NotFoundException('User not found');
    }

    // Generate new wallet
    const wallet = ethers.Wallet.createRandom();
    const address = wallet.address;
    const encryptedPrivateKey = await this.encryptPrivateKey(
      wallet.privateKey,
      dto.password,
    );

    // Count existing wallets for naming
    const walletCount = await this.walletRepository.count({
      where: { userId },
    });

    // Create wallet entity
    const walletEntity = this.walletRepository.create({
      address,
      encryptedPrivateKey,
      name: dto.name || `Wallet ${walletCount + 1}`,
      userId,
    });

    const savedWallet = await this.walletRepository.save(walletEntity);

    return {
      address: savedWallet.address,
      name: savedWallet.name,
      message: 'Wallet created successfully. Save your private key securely.',
    };
  }

  async importWallet(userId: string, dto: ImportWalletDto) {
    const user = await this.userRepository.findOne({
      where: { id: userId },
    });

    if (!user) {
      throw new NotFoundException('User not found');
    }

    // Validate private key
    let wallet: ethers.Wallet;
    try {
      wallet = new ethers.Wallet(dto.privateKey);
    } catch (error) {
      throw new Error('Invalid private key');
    }

    const address = wallet.address;
    const encryptedPrivateKey = await this.encryptPrivateKey(
      wallet.privateKey,
      dto.password,
    );

    // Check if wallet already exists
    const existingWallet = await this.walletRepository.findOne({
      where: { address: address.toLowerCase(), userId },
    });

    if (existingWallet) {
      throw new Error('Wallet already imported');
    }

    // Count existing wallets for naming
    const walletCount = await this.walletRepository.count({
      where: { userId },
    });

    // Create wallet entity
    const walletEntity = this.walletRepository.create({
      address: address.toLowerCase(),
      encryptedPrivateKey,
      name: dto.name || `Imported Wallet ${walletCount + 1}`,
      userId,
      importedAt: new Date(),
    });

    const savedWallet = await this.walletRepository.save(walletEntity);

    return {
      address: savedWallet.address,
      name: savedWallet.name,
      message: 'Wallet imported successfully',
    };
  }

  async getUserWallets(userId: string) {
    const wallets = await this.walletRepository.find({
      where: { userId },
      order: { createdAt: 'ASC' },
    });

    return wallets.map((w) => ({
      address: w.address,
      name: w.name,
      createdAt: w.createdAt,
      importedAt: w.importedAt,
    }));
  }

  async getWallet(userId: string, address: string) {
    const wallet = await this.walletRepository.findOne({
      where: { address: address.toLowerCase(), userId },
    });

    if (!wallet) {
      throw new NotFoundException('Wallet not found');
    }

    // Get balance
    const balance = await this.rpcService.getBalance(wallet.address);

    return {
      address: wallet.address,
      name: wallet.name,
      balance: balance.toString(),
      createdAt: wallet.createdAt,
      importedAt: wallet.importedAt,
    };
  }

  async getBalance(userId: string, address: string) {
    await this.verifyWalletOwnership(userId, address);
    const balance = await this.rpcService.getBalance(address);
    return {
      address,
      balance: balance.toString(),
      balanceFormatted: ethers.formatEther(balance),
    };
  }

  async getTokens(userId: string, address: string) {
    await this.verifyWalletOwnership(userId, address);
    // This would typically query token balances from the database
    // For now, return empty array
    return {
      address,
      tokens: [],
    };
  }

  async getTransactions(userId: string, address: string) {
    await this.verifyWalletOwnership(userId, address);
    // This would typically query transactions from the database
    // For now, return empty array
    return {
      address,
      transactions: [],
    };
  }

    async sendTransaction(
      userId: string,
      address: string,
      dto: SendTransactionDto,
    ) {
      const wallet = await this.verifyWalletOwnership(userId, address);

      // Policy check before sending transaction
      // PolicyService throws ForbiddenException if blocked, so if we get here, it's allowed
      await this.policyService.checkPolicy(userId, {
        fromAddress: wallet.address,
        toAddress: dto.to,
        amount: ethers.parseEther(dto.amount).toString(),
        asset: 'NOR',
        requestId: `wallet_send_${Date.now()}`,
      });

      // Decrypt private key (in production, use proper encryption)
      const privateKey = await this.decryptPrivateKey(
        wallet.encryptedPrivateKey,
        dto.password,
      );

    // Create transaction
    const walletInstance = new ethers.Wallet(privateKey);
    const provider = this.rpcService.getProvider();
    const connectedWallet = walletInstance.connect(provider as any);

    const tx = await connectedWallet.sendTransaction({
      to: dto.to,
      value: ethers.parseEther(dto.amount),
      gasLimit: dto.gasLimit || 21000,
    });

    return {
      hash: tx.hash,
      from: address,
      to: dto.to,
      amount: dto.amount,
      status: 'pending',
    };
  }

  async deleteWallet(userId: string, address: string) {
    const wallet = await this.verifyWalletOwnership(userId, address);

    await this.walletRepository.remove(wallet);

    return {
      message: 'Wallet deleted successfully',
      address,
    };
  }

  private async verifyWalletOwnership(
    userId: string,
    address: string,
  ): Promise<Wallet> {
    const wallet = await this.walletRepository.findOne({
      where: { address: address.toLowerCase(), userId },
    });

    if (!wallet) {
      throw new ForbiddenException('Wallet not found or access denied');
    }

    return wallet;
  }

  private async encryptPrivateKey(
    privateKey: string,
    password: string,
  ): Promise<string> {
    // In production, use proper encryption (e.g., AES-256-GCM)
    // For now, return base64 encoded (NOT SECURE - for demo only)
    return Buffer.from(privateKey).toString('base64');
  }

  private async decryptPrivateKey(
    encryptedPrivateKey: string,
    password: string,
  ): Promise<string> {
    // In production, use proper decryption
    // For now, decode from base64 (NOT SECURE - for demo only)
    return Buffer.from(encryptedPrivateKey, 'base64').toString();
  }
}

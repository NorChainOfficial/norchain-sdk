import { Injectable, NotFoundException, ForbiddenException } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { User } from '../auth/entities/user.entity';
import { RpcService } from '@/common/services/rpc.service';
import { CreateWalletDto } from './dto/create-wallet.dto';
import { ImportWalletDto } from './dto/import-wallet.dto';
import { SendTransactionDto } from './dto/send-transaction.dto';
import { ethers } from 'ethers';

@Injectable()
export class WalletService {
  constructor(
    @InjectRepository(User)
    private readonly userRepository: Repository<User>,
    private readonly rpcService: RpcService,
  ) {}

  async createWallet(userId: number, dto: CreateWalletDto) {
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

    // Store wallet metadata in user's metadata field
    const wallets = (user.metadata?.wallets as any[]) || [];
    wallets.push({
      address,
      encryptedPrivateKey,
      name: dto.name || `Wallet ${wallets.length + 1}`,
      createdAt: new Date().toISOString(),
    });

    await this.userRepository.update(userId, {
      metadata: { ...user.metadata, wallets },
    });

    return {
      address,
      name: dto.name || `Wallet ${wallets.length}`,
      message: 'Wallet created successfully. Save your private key securely.',
    };
  }

  async importWallet(userId: number, dto: ImportWalletDto) {
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
    const wallets = (user.metadata?.wallets as any[]) || [];
    if (wallets.some((w) => w.address.toLowerCase() === address.toLowerCase())) {
      throw new Error('Wallet already imported');
    }

    wallets.push({
      address,
      encryptedPrivateKey,
      name: dto.name || `Imported Wallet ${wallets.length + 1}`,
      importedAt: new Date().toISOString(),
      createdAt: new Date().toISOString(),
    });

    await this.userRepository.update(userId, {
      metadata: { ...user.metadata, wallets },
    });

    return {
      address,
      name: dto.name || `Imported Wallet ${wallets.length}`,
      message: 'Wallet imported successfully',
    };
  }

  async getUserWallets(userId: number) {
    const user = await this.userRepository.findOne({
      where: { id: userId },
    });

    if (!user) {
      throw new NotFoundException('User not found');
    }

    const wallets = (user.metadata?.wallets as any[]) || [];
    return wallets.map((w) => ({
      address: w.address,
      name: w.name,
      createdAt: w.createdAt,
      importedAt: w.importedAt,
    }));
  }

  async getWallet(userId: number, address: string) {
    const user = await this.userRepository.findOne({
      where: { id: userId },
    });

    if (!user) {
      throw new NotFoundException('User not found');
    }

    const wallets = (user.metadata?.wallets as any[]) || [];
    const wallet = wallets.find(
      (w) => w.address.toLowerCase() === address.toLowerCase(),
    );

    if (!wallet) {
      throw new NotFoundException('Wallet not found');
    }

    // Get balance
    const balance = await this.rpcService.getBalance(address);

    return {
      address: wallet.address,
      name: wallet.name,
      balance: balance.toString(),
      createdAt: wallet.createdAt,
      importedAt: wallet.importedAt,
    };
  }

  async getBalance(userId: number, address: string) {
    await this.verifyWalletOwnership(userId, address);
    const balance = await this.rpcService.getBalance(address);
    return {
      address,
      balance: balance.toString(),
      balanceFormatted: ethers.formatEther(balance),
    };
  }

  async getTokens(userId: number, address: string) {
    await this.verifyWalletOwnership(userId, address);
    // This would typically query token balances from the database
    // For now, return empty array
    return {
      address,
      tokens: [],
    };
  }

  async getTransactions(userId: number, address: string) {
    await this.verifyWalletOwnership(userId, address);
    // This would typically query transactions from the database
    // For now, return empty array
    return {
      address,
      transactions: [],
    };
  }

  async sendTransaction(
    userId: number,
    address: string,
    dto: SendTransactionDto,
  ) {
    await this.verifyWalletOwnership(userId, address);

    const user = await this.userRepository.findOne({
      where: { id: userId },
    });
    const wallets = (user.metadata?.wallets as any[]) || [];
    const wallet = wallets.find(
      (w) => w.address.toLowerCase() === address.toLowerCase(),
    );

    // Decrypt private key (in production, use proper encryption)
    const privateKey = await this.decryptPrivateKey(
      wallet.encryptedPrivateKey,
      dto.password,
    );

    // Create transaction
    const walletInstance = new ethers.Wallet(privateKey);
    const provider = this.rpcService.getProvider();
    const connectedWallet = walletInstance.connect(provider);

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

  async deleteWallet(userId: number, address: string) {
    await this.verifyWalletOwnership(userId, address);

    const user = await this.userRepository.findOne({
      where: { id: userId },
    });

    const wallets = (user.metadata?.wallets as any[]) || [];
    const filteredWallets = wallets.filter(
      (w) => w.address.toLowerCase() !== address.toLowerCase(),
    );

    await this.userRepository.update(userId, {
      metadata: { ...user.metadata, wallets: filteredWallets },
    });

    return {
      message: 'Wallet deleted successfully',
      address,
    };
  }

  private async verifyWalletOwnership(userId: number, address: string) {
    const user = await this.userRepository.findOne({
      where: { id: userId },
    });

    if (!user) {
      throw new NotFoundException('User not found');
    }

    const wallets = (user.metadata?.wallets as any[]) || [];
    const wallet = wallets.find(
      (w) => w.address.toLowerCase() === address.toLowerCase(),
    );

    if (!wallet) {
      throw new ForbiddenException('Wallet not found or access denied');
    }
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


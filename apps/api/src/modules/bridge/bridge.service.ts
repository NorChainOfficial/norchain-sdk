import {
  Injectable,
  NotFoundException,
  BadRequestException,
} from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import {
  BridgeTransfer,
  BridgeTransferStatus,
  BridgeChain,
} from './entities/bridge-transfer.entity';
import { CreateBridgeQuoteDto } from './dto/create-bridge-quote.dto';
import { CreateBridgeTransferDto } from './dto/create-bridge-transfer.dto';
import { RpcService } from '@/common/services/rpc.service';
import { PolicyService } from '../policy/policy.service';
import { ethers } from 'ethers';

@Injectable()
export class BridgeService {
  constructor(
    @InjectRepository(BridgeTransfer)
    private readonly bridgeTransferRepository: Repository<BridgeTransfer>,
    private readonly rpcService: RpcService,
    private readonly policyService: PolicyService,
  ) {}

  /**
   * Get a quote for a bridge transfer
   */
  async getQuote(dto: CreateBridgeQuoteDto) {
    // Validate chain pair
    if (dto.srcChain === dto.dstChain) {
      throw new BadRequestException(
        'Source and destination chains must be different',
      );
    }

    // Calculate fees (simplified - in production, this would query bridge contracts)
    const amount = BigInt(dto.amount);
    const feeRate = BigInt(5); // 0.05% fee (5 basis points)
    const fees = (amount * feeRate) / BigInt(10000);
    const amountAfterFees = amount - fees;

    // Estimate time (simplified)
    const estimatedTime = this.estimateBridgeTime(dto.srcChain, dto.dstChain);

    return {
      srcChain: dto.srcChain,
      dstChain: dto.dstChain,
      asset: dto.asset,
      amount: dto.amount,
      amountAfterFees: amountAfterFees.toString(),
      fees: fees.toString(),
      feesFormatted: ethers.formatEther(fees),
      estimatedTimeMinutes: estimatedTime,
      route: `${dto.srcChain} → ${dto.dstChain}`,
      quoteId: `quote_${Date.now()}_${Math.random().toString(36).substring(7)}`,
      expiresAt: new Date(Date.now() + 5 * 60 * 1000).toISOString(), // 5 minutes
    };
  }

  /**
   * Create a bridge transfer
   */
  async createTransfer(userId: string, dto: CreateBridgeTransferDto) {
    // Check for duplicate using idempotency key
    if (dto.idempotencyKey) {
      const existing = await this.bridgeTransferRepository.findOne({
        where: { userId, idempotencyKey: dto.idempotencyKey },
      });
      if (existing) {
        return {
          transfer_id: existing.id,
          status: existing.status,
          message: 'Transfer already exists (idempotent)',
        };
      }
    }

    // Validate chain pair
    if (dto.srcChain === dto.dstChain) {
      throw new BadRequestException(
        'Source and destination chains must be different',
      );
    }

    // Policy check before creating transfer
    // PolicyService throws ForbiddenException if blocked, so if we get here, it's allowed
    // Note: fromAddress would come from user's wallet, not from DTO
    await this.policyService.checkPolicy(userId, {
      toAddress: dto.toAddress,
      amount: dto.amount,
      asset: dto.asset,
      requestId: dto.idempotencyKey || `bridge_${Date.now()}`,
    });

    // Calculate fees
    const amount = BigInt(dto.amount);
    const feeRate = BigInt(5); // 0.05% fee
    const fees = (amount * feeRate) / BigInt(10000);

    // Create transfer record
    const transfer = this.bridgeTransferRepository.create({
      userId,
      srcChain: dto.srcChain,
      dstChain: dto.dstChain,
      asset: dto.asset,
      amount: dto.amount,
      fromAddress: '', // Will be set from user's wallet
      toAddress: dto.toAddress,
      status: BridgeTransferStatus.PENDING_POLICY,
      fees: fees.toString(),
      idempotencyKey: dto.idempotencyKey,
    });

    const savedTransfer = await this.bridgeTransferRepository.save(transfer);

    // In production, this would trigger policy checks and then initiate the bridge
    // For now, return the transfer ID

    return {
      transfer_id: savedTransfer.id,
      status: savedTransfer.status,
      message: 'Bridge transfer created. Awaiting policy approval.',
    };
  }

  /**
   * Get transfer status
   */
  async getTransfer(userId: string, transferId: string) {
    const transfer = await this.bridgeTransferRepository.findOne({
      where: { id: transferId, userId },
    });

    if (!transfer) {
      throw new NotFoundException('Bridge transfer not found');
    }

    return {
      transfer_id: transfer.id,
      srcChain: transfer.srcChain,
      dstChain: transfer.dstChain,
      asset: transfer.asset,
      amount: transfer.amount,
      amountFormatted: ethers.formatEther(transfer.amount),
      fromAddress: transfer.fromAddress,
      toAddress: transfer.toAddress,
      status: transfer.status,
      srcTxHash: transfer.srcTxHash,
      dstTxHash: transfer.dstTxHash,
      fees: transfer.fees,
      feesFormatted: transfer.fees ? ethers.formatEther(transfer.fees) : '0',
      createdAt: transfer.createdAt,
      completedAt: transfer.completedAt,
      errorMessage: transfer.errorMessage,
    };
  }

  /**
   * Get transfer proof (for verification)
   */
  async getTransferProof(userId: string, transferId: string) {
    const transfer = await this.bridgeTransferRepository.findOne({
      where: { id: transferId, userId },
    });

    if (!transfer) {
      throw new NotFoundException('Bridge transfer not found');
    }

    if (!transfer.proof) {
      throw new BadRequestException(
        'Proof not yet available for this transfer',
      );
    }

    return {
      transfer_id: transfer.id,
      proof: transfer.proof,
      srcTxHash: transfer.srcTxHash,
      dstTxHash: transfer.dstTxHash,
      blockNumber: null, // Would be populated from blockchain
      merkleRoot: null, // Would be populated from bridge contract
    };
  }

  /**
   * List user's bridge transfers
   */
  async getUserTransfers(
    userId: string,
    limit: number = 50,
    offset: number = 0,
  ) {
    const [transfers, total] = await this.bridgeTransferRepository.findAndCount(
      {
        where: { userId },
        order: { createdAt: 'DESC' },
        take: limit,
        skip: offset,
      },
    );

    return {
      transfers: transfers.map((t) => ({
        transfer_id: t.id,
        srcChain: t.srcChain,
        dstChain: t.dstChain,
        asset: t.asset,
        amount: t.amount,
        status: t.status,
        createdAt: t.createdAt,
        completedAt: t.completedAt,
      })),
      total,
      limit,
      offset,
    };
  }

  /**
   * Estimate bridge time based on chain pair
   */
  private estimateBridgeTime(
    srcChain: BridgeChain,
    dstChain: BridgeChain,
  ): number {
    // Simplified estimates (in minutes)
    const estimates: Record<string, number> = {
      'NOR-BSC': 5,
      'BSC-NOR': 5,
      'NOR-ETHEREUM': 15,
      'ETHEREUM-NOR': 15,
      'NOR-TRON': 10,
      'TRON-NOR': 10,
    };

    const key = `${srcChain}-${dstChain}`;
    return estimates[key] || 10; // Default 10 minutes
  }
}

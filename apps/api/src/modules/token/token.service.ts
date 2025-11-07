import { Injectable } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { TokenMetadata } from './entities/token-metadata.entity';
import { TokenHolder } from './entities/token-holder.entity';
import { TokenTransfer } from './entities/token-transfer.entity';
import { RpcService } from '@/common/services/rpc.service';
import { CacheService } from '@/common/services/cache.service';
import { ResponseDto } from '@/common/interfaces/api-response.interface';
import { ethers } from 'ethers';

/**
 * Token Service
 * 
 * Provides token-related operations including token supply, balances,
 * token information, and token transfers.
 */
@Injectable()
export class TokenService {
  // Standard ERC20 ABI for balance and totalSupply
  private readonly erc20Abi = [
    'function balanceOf(address owner) view returns (uint256)',
    'function totalSupply() view returns (uint256)',
    'function decimals() view returns (uint8)',
    'function symbol() view returns (string)',
    'function name() view returns (string)',
  ];

  constructor(
    @InjectRepository(TokenMetadata)
    private tokenMetadataRepository: Repository<TokenMetadata>,
    @InjectRepository(TokenHolder)
    private tokenHolderRepository: Repository<TokenHolder>,
    @InjectRepository(TokenTransfer)
    private tokenTransferRepository: Repository<TokenTransfer>,
    private rpcService: RpcService,
    private cacheService: CacheService,
  ) {}

  /**
   * Gets token total supply.
   * 
   * @param {string} contractAddress - Token contract address
   * @returns {Promise<ResponseDto>} Token total supply
   */
  async getTokenSupply(contractAddress: string) {
    const cacheKey = `token:supply:${contractAddress}`;

    const supply = await this.cacheService.getOrSet(
      cacheKey,
      async () => {
        // Try database first
        const metadata = await this.tokenMetadataRepository.findOne({
          where: { address: contractAddress },
        });

        if (metadata && metadata.totalSupply) {
          return metadata.totalSupply;
        }

        // Fallback to RPC call
        try {
          const contract = new ethers.Contract(
            contractAddress,
            this.erc20Abi,
            this.rpcService.getProvider(),
          );
          const totalSupply = await contract.totalSupply();
          return totalSupply.toString();
        } catch (error) {
          return '0';
        }
      },
      300, // 5 minutes cache
    );

    return ResponseDto.success(supply);
  }

  /**
   * Gets token balance for an address.
   * 
   * @param {string} contractAddress - Token contract address
   * @param {string} address - Account address
   * @returns {Promise<ResponseDto>} Token balance
   */
  async getTokenAccountBalance(
    contractAddress: string,
    address: string,
  ) {
    const cacheKey = `token:balance:${contractAddress}:${address}`;

    const balance = await this.cacheService.getOrSet(
      cacheKey,
      async () => {
        // Try database first
        const holder = await this.tokenHolderRepository.findOne({
          where: {
            tokenAddress: contractAddress,
            holderAddress: address,
          },
        });

        if (holder) {
          return holder.balance;
        }

        // Fallback to RPC call
        try {
          const contract = new ethers.Contract(
            contractAddress,
            this.erc20Abi,
            this.rpcService.getProvider(),
          );
          const balance = await contract.balanceOf(address);
          return balance.toString();
        } catch (error) {
          return '0';
        }
      },
      60, // 1 minute cache
    );

    return ResponseDto.success(balance);
  }

  /**
   * Gets token information including metadata.
   * 
   * @param {string} contractAddress - Token contract address
   * @returns {Promise<ResponseDto>} Token information
   */
  async getTokenInfo(contractAddress: string) {
    const cacheKey = `token:info:${contractAddress}`;

    const info = await this.cacheService.getOrSet(
      cacheKey,
      async () => {
        // Try database first
        const metadata = await this.tokenMetadataRepository.findOne({
          where: { address: contractAddress },
        });

        if (metadata) {
          return {
            address: metadata.address,
            name: metadata.name,
            symbol: metadata.symbol,
            decimals: metadata.decimals,
            totalSupply: metadata.totalSupply,
            tokenType: metadata.tokenType,
          };
        }

        // Fallback to RPC call
        try {
          const contract = new ethers.Contract(
            contractAddress,
            this.erc20Abi,
            this.rpcService.getProvider(),
          );

          const [name, symbol, decimals, totalSupply] = await Promise.all([
            contract.name().catch(() => ''),
            contract.symbol().catch(() => ''),
            contract.decimals().catch(() => 18),
            contract.totalSupply().catch(() => BigInt(0)),
          ]);

          return {
            address: contractAddress,
            name: name || '',
            symbol: symbol || '',
            decimals: Number(decimals),
            totalSupply: totalSupply.toString(),
            tokenType: 'ERC20',
          };
        } catch (error) {
          return null;
        }
      },
      300, // 5 minutes cache
    );

    if (!info) {
      return ResponseDto.error('Token not found');
    }

    return ResponseDto.success(info);
  }

  /**
   * Gets token transfers for a token contract.
   * 
   * @param {string} contractAddress - Token contract address
   * @param {number} page - Page number
   * @param {number} limit - Items per page
   * @returns {Promise<ResponseDto>} Paginated token transfers
   */
  async getTokenTransfers(
    contractAddress: string,
    page = 1,
    limit = 10,
  ) {
    const query = this.tokenTransferRepository
      .createQueryBuilder('transfer')
      .where('transfer.tokenAddress = :contractAddress', { contractAddress })
      .orderBy('transfer.blockNumber', 'DESC')
      .addOrderBy('transfer.logIndex', 'DESC');

    const skip = (page - 1) * limit;
    query.skip(skip).take(limit);

    const [data, total] = await query.getManyAndCount();

    return ResponseDto.success({
      data,
      meta: {
        page,
        limit,
        total,
        totalPages: Math.ceil(total / limit),
        hasNextPage: page < Math.ceil(total / limit),
        hasPreviousPage: page > 1,
      },
    });
  }
}


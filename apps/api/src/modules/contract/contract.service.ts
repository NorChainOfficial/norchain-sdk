import { Injectable } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { Contract } from './entities/contract.entity';
import { RpcService } from '@/common/services/rpc.service';
import { CacheService } from '@/common/services/cache.service';
import { ResponseDto } from '@/common/interfaces/api-response.interface';

/**
 * Contract Service
 * 
 * Provides contract-related operations including ABI retrieval,
 * source code, and contract verification.
 */
@Injectable()
export class ContractService {
  constructor(
    @InjectRepository(Contract)
    private contractRepository: Repository<Contract>,
    private rpcService: RpcService,
    private cacheService: CacheService,
  ) {}

  /**
   * Gets contract ABI.
   * 
   * @param {string} address - Contract address
   * @returns {Promise<ResponseDto>} Contract ABI
   */
  async getAbi(address: string) {
    const cacheKey = `contract:abi:${address}`;

    const abi = await this.cacheService.getOrSet(
      cacheKey,
      async () => {
        const contract = await this.contractRepository.findOne({
          where: { address },
        });

        if (contract && contract.abi) {
          return contract.abi;
        }

        return null;
      },
      3600, // 1 hour cache
    );

    if (!abi) {
      return ResponseDto.error('Contract ABI not found');
    }

    return ResponseDto.success(abi);
  }

  /**
   * Gets contract source code.
   * 
   * @param {string} address - Contract address
   * @returns {Promise<ResponseDto>} Contract source code and metadata
   */
  async getSourceCode(address: string) {
    const cacheKey = `contract:source:${address}`;

    const source = await this.cacheService.getOrSet(
      cacheKey,
      async () => {
        const contract = await this.contractRepository.findOne({
          where: { address },
        });

        if (!contract) {
          return null;
        }

        return {
          SourceCode: contract.sourceCode || '',
          ABI: contract.abi ? JSON.stringify(contract.abi) : '',
          ContractName: contract.contractName || '',
          CompilerVersion: contract.compilerVersion || '',
          OptimizationUsed: contract.optimizationUsed ? '1' : '0',
          Runs: contract.runs?.toString() || '0',
          ConstructorArguments: '',
          EVMVersion: 'Default',
          Library: '',
          LicenseType: '',
          Proxy: '0',
          Implementation: '',
          SwarmSource: '',
        };
      },
      3600,
    );

    if (!source) {
      return ResponseDto.error('Contract source code not found');
    }

    return ResponseDto.success([source]);
  }

  /**
   * Verifies and stores contract source code.
   * 
   * @param {any} verificationData - Contract verification data
   * @returns {Promise<ResponseDto>} Verification result
   */
  async verifyContract(verificationData: {
    address: string;
    sourceCode: string;
    contractName: string;
    compilerVersion: string;
    optimizationUsed: boolean;
    runs?: number;
    abi: any;
  }) {
    const { address, sourceCode, contractName, compilerVersion, optimizationUsed, runs, abi } = verificationData;

    let contract = await this.contractRepository.findOne({
      where: { address },
    });

    if (!contract) {
      contract = this.contractRepository.create({
        address,
        sourceCode,
        contractName,
        compilerVersion,
        optimizationUsed,
        runs,
        abi,
        isVerified: true,
      });
    } else {
      contract.sourceCode = sourceCode;
      contract.contractName = contractName;
      contract.compilerVersion = compilerVersion;
      contract.optimizationUsed = optimizationUsed;
      contract.runs = runs;
      contract.abi = abi;
      contract.isVerified = true;
    }

    await this.contractRepository.save(contract);

    // Clear cache
    await this.cacheService.del(`contract:abi:${address}`);
    await this.cacheService.del(`contract:source:${address}`);

    return ResponseDto.success({
      message: 'Contract verified successfully',
      address,
    });
  }
}


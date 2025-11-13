'use client'

import solc from 'solc'

export interface CompilationError {
  readonly severity: 'error' | 'warning'
  readonly message: string
  readonly formattedMessage: string
  readonly sourceLocation?: {
    readonly file: string
    readonly start: number
    readonly end: number
  }
}

export interface CompilationResult {
  readonly success: boolean
  readonly errors: CompilationError[]
  readonly contracts: CompiledContract[]
  readonly sources: Record<string, { readonly id: number }>
}

export interface CompiledContract {
  readonly name: string
  readonly abi: unknown[]
  readonly bytecode: string
  readonly deployedBytecode: string
  readonly gasEstimates: {
    readonly creation: {
      readonly codeDepositCost: string
      readonly executionCost: string
      readonly totalCost: string
    }
    readonly external: Record<string, string>
  }
  readonly metadata: string
}

export interface CompilerOptions {
  readonly version: string
  readonly optimization: boolean
  readonly runs: number
  readonly evmVersion: string
}

export class CompilerService {
  private static instance: CompilerService
  private compilerVersion: string = '0.8.20'

  private constructor() {}

  static getInstance(): CompilerService {
    if (!CompilerService.instance) {
      CompilerService.instance = new CompilerService()
    }
    return CompilerService.instance
  }

  async compile(
    source: string,
    fileName: string = 'Contract.sol',
    options: Partial<CompilerOptions> = {}
  ): Promise<CompilationResult> {
    try {
      const input = this.buildCompilerInput(source, fileName, options)
      const outputString = solc.compile(JSON.stringify(input))
      const output = JSON.parse(outputString)

      return this.processCompilerOutput(output, fileName)
    } catch (error) {
      console.error('Compilation error:', error)
      return {
        success: false,
        errors: [
          {
            severity: 'error',
            message: error instanceof Error ? error.message : 'Unknown compilation error',
            formattedMessage: error instanceof Error ? error.message : 'Unknown compilation error',
          },
        ],
        contracts: [],
        sources: {},
      }
    }
  }

  private buildCompilerInput(
    source: string,
    fileName: string,
    options: Partial<CompilerOptions>
  ): unknown {
    return {
      language: 'Solidity',
      sources: {
        [fileName]: {
          content: source,
        },
      },
      settings: {
        optimizer: {
          enabled: options.optimization ?? true,
          runs: options.runs ?? 200,
        },
        evmVersion: options.evmVersion ?? 'paris',
        outputSelection: {
          '*': {
            '*': [
              'abi',
              'evm.bytecode',
              'evm.deployedBytecode',
              'evm.gasEstimates',
              'metadata',
            ],
          },
        },
      },
    }
  }

  private processCompilerOutput(output: any, fileName: string): CompilationResult {
    const errors: CompilationError[] = []
    const contracts: CompiledContract[] = []

    // Process errors and warnings
    if (output.errors) {
      for (const error of output.errors) {
        errors.push({
          severity: error.severity,
          message: error.message,
          formattedMessage: error.formattedMessage,
          sourceLocation: error.sourceLocation,
        })
      }
    }

    // Process compiled contracts
    if (output.contracts && output.contracts[fileName]) {
      for (const [contractName, contractData] of Object.entries(
        output.contracts[fileName]
      )) {
        const data = contractData as any
        contracts.push({
          name: contractName,
          abi: data.abi,
          bytecode: data.evm.bytecode.object,
          deployedBytecode: data.evm.deployedBytecode.object,
          gasEstimates: {
            creation: {
              codeDepositCost: data.evm.gasEstimates.creation.codeDepositCost,
              executionCost: data.evm.gasEstimates.creation.executionCost,
              totalCost: data.evm.gasEstimates.creation.totalCost,
            },
            external: data.evm.gasEstimates.external || {},
          },
          metadata: data.metadata,
        })
      }
    }

    const hasErrors = errors.some((e) => e.severity === 'error')

    return {
      success: !hasErrors && contracts.length > 0,
      errors,
      contracts,
      sources: output.sources || {},
    }
  }

  setCompilerVersion(version: string): void {
    this.compilerVersion = version
  }

  getCompilerVersion(): string {
    return this.compilerVersion
  }

  getSupportedVersions(): string[] {
    return ['0.8.20', '0.8.19', '0.8.18', '0.8.17', '0.7.6']
  }

  getSupportedEvmVersions(): string[] {
    return ['paris', 'london', 'berlin', 'istanbul', 'petersburg']
  }
}

export const compilerService = CompilerService.getInstance()

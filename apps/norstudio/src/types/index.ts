// Project types
export interface Project {
  readonly id: string
  readonly name: string
  readonly description?: string
  readonly type: 'token' | 'contract' | 'dapp'
  readonly createdAt: Date
  readonly updatedAt: Date
  readonly files: ProjectFile[]
  readonly settings?: ProjectSettings
}

export interface ProjectFile {
  readonly id: string
  readonly name: string
  readonly path: string
  readonly content: string
  readonly type: 'solidity' | 'typescript' | 'javascript' | 'json' | 'markdown'
  readonly updatedAt: Date
}

export interface ProjectSettings {
  readonly compilerVersion?: string
  readonly optimization?: boolean
  readonly evmVersion?: string
}

// Template types
export interface Template {
  readonly id: string
  readonly name: string
  readonly description: string
  readonly category: 'token' | 'defi' | 'nft' | 'governance' | 'utility'
  readonly files: TemplateFile[]
  readonly tags: string[]
}

export interface TemplateFile {
  readonly path: string
  readonly content: string
  readonly description?: string
}

// Contract types
export interface Contract {
  readonly address: string
  readonly name: string
  readonly compiler: string
  readonly optimization: boolean
  readonly runs: number
  readonly constructorArguments?: string
  readonly abi: any[]
  readonly bytecode: string
  readonly sourceCode: string
  readonly verified: boolean
}

export interface CompilationResult {
  readonly success: boolean
  readonly errors?: CompilationError[]
  readonly warnings?: CompilationWarning[]
  readonly contracts?: CompiledContract[]
}

export interface CompilationError {
  readonly message: string
  readonly severity: 'error' | 'warning'
  readonly file?: string
  readonly line?: number
  readonly column?: number
}

export interface CompilationWarning {
  readonly message: string
  readonly file?: string
  readonly line?: number
  readonly column?: number
}

export interface CompiledContract {
  readonly name: string
  readonly abi: any[]
  readonly bytecode: string
  readonly deployedBytecode: string
  readonly metadata?: string
}

// AI types
export interface AIMessage {
  readonly id: string
  readonly role: 'user' | 'assistant' | 'system'
  readonly content: string
  readonly timestamp: Date
}

export interface AIResponse {
  readonly message: string
  readonly suggestions?: string[]
  readonly code?: string
  readonly explanation?: string
}

export interface ContractAudit {
  readonly contractName: string
  readonly issues: AuditIssue[]
  readonly score: number
  readonly summary: string
}

export interface AuditIssue {
  readonly severity: 'critical' | 'high' | 'medium' | 'low' | 'info'
  readonly title: string
  readonly description: string
  readonly line?: number
  readonly recommendation?: string
}

// Editor types
export interface EditorFile {
  readonly id: string
  readonly name: string
  readonly path: string
  readonly content: string
  readonly language: string
  readonly modified: boolean
}

export interface EditorState {
  readonly activeFileId: string | null
  readonly openFiles: EditorFile[]
  readonly cursorPosition?: { line: number; column: number }
}

// Deployment types
export interface DeploymentConfig {
  readonly network: 'mainnet' | 'testnet'
  readonly gasLimit?: string
  readonly gasPrice?: string
  readonly constructorArgs?: any[]
}

export interface DeploymentResult {
  readonly success: boolean
  readonly transactionHash?: string
  readonly contractAddress?: string
  readonly gasUsed?: string
  readonly error?: string
}

// Tutorial types
export interface Tutorial {
  readonly id: string
  readonly title: string
  readonly description: string
  readonly difficulty: 'beginner' | 'intermediate' | 'advanced'
  readonly estimatedTime: number // minutes
  readonly steps: TutorialStep[]
  readonly tags: string[]
}

export interface TutorialStep {
  readonly title: string
  readonly content: string
  readonly code?: string
  readonly action?: 'compile' | 'deploy' | 'test' | 'interact'
  readonly hints?: string[]
}

// Blockchain types
export interface Transaction {
  readonly hash: string
  readonly from: string
  readonly to: string
  readonly value: string
  readonly gasUsed: string
  readonly gasPrice: string
  readonly nonce: number
  readonly blockNumber: number
  readonly timestamp: Date
  readonly status: 'success' | 'failed' | 'pending'
}

export interface Account {
  readonly address: string
  readonly balance: string
  readonly nonce: number
  readonly code?: string
}

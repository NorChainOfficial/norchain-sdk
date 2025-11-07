/**
 * GraphQL Schema Definition
 * Comprehensive type-safe schema for NoorExplorer API
 */

import { gql } from 'graphql-tag';

export const typeDefs = gql`
  # Custom Scalars
  scalar DateTime
  scalar BigInt
  scalar Address
  scalar Hash

  # Enums
  enum TransactionStatus {
    SUCCESS
    FAILED
    PENDING
  }

  enum AccountType {
    USER
    CONTRACT
    VALIDATOR
  }

  enum ValidatorStatus {
    BONDED
    UNBONDING
    UNBONDED
  }

  enum TokenStandard {
    ERC20
    ERC721
    ERC1155
    NATIVE
  }

  enum OrderDirection {
    ASC
    DESC
  }

  # Input Types
  input PaginationInput {
    first: Int
    after: String
    last: Int
    before: String
  }

  input BlockFilter {
    heightGte: Int
    heightLte: Int
    timestampGte: DateTime
    timestampLte: DateTime
    proposer: Address
    minTransactions: Int
  }

  input TransactionFilter {
    type: String
    status: TransactionStatus
    sender: Address
    receiver: Address
    blockHeight: Int
    timestampGte: DateTime
    timestampLte: DateTime
  }

  input AccountFilter {
    type: AccountType
    minBalance: BigInt
    minTxCount: Int
  }

  input TokenFilter {
    standard: TokenStandard
    search: String
  }

  input AccountOrderBy {
    field: AccountOrderByField!
    direction: OrderDirection!
  }

  enum AccountOrderByField {
    BALANCE
    TX_COUNT
    CREATED_AT
    LAST_ACTIVE
  }

  # Connection Types (Relay-style pagination)
  type PageInfo {
    hasNextPage: Boolean!
    hasPreviousPage: Boolean!
    startCursor: String
    endCursor: String
  }

  type BlockEdge {
    cursor: String!
    node: Block!
  }

  type BlockConnection {
    edges: [BlockEdge!]!
    pageInfo: PageInfo!
    totalCount: Int!
  }

  type TransactionEdge {
    cursor: String!
    node: Transaction!
  }

  type TransactionConnection {
    edges: [TransactionEdge!]!
    pageInfo: PageInfo!
    totalCount: Int!
  }

  type AccountEdge {
    cursor: String!
    node: Account!
  }

  type AccountConnection {
    edges: [AccountEdge!]!
    pageInfo: PageInfo!
    totalCount: Int!
  }

  type TokenEdge {
    cursor: String!
    node: Token!
  }

  type TokenConnection {
    edges: [TokenEdge!]!
    pageInfo: PageInfo!
    totalCount: Int!
  }

  # Core Types
  type Block {
    id: ID!
    height: Int!
    hash: Hash!
    previousHash: Hash
    timestamp: DateTime!
    proposer: Account!
    proposerAddress: Address!
    validatorName: String
    transactionCount: Int!
    blockTimeSeconds: Int
    sizeBytes: Int
    gasUsed: BigInt!
    gasWanted: BigInt!
    createdAt: DateTime!
    updatedAt: DateTime!

    # Relations with DataLoader optimization
    transactions(
      first: Int
      after: String
      filter: TransactionFilter
    ): TransactionConnection!

    # Analytics
    stats: BlockStats!
  }

  type BlockStats {
    avgGasPrice: BigInt!
    totalFees: BigInt!
    successRate: Float!
  }

  type Transaction {
    id: ID!
    hash: Hash!
    blockHeight: Int!
    blockHash: Hash!
    timestamp: DateTime!
    type: String!
    sender: Address!
    receiver: Address
    amount: BigInt
    fee: BigInt
    gasUsed: BigInt!
    gasWanted: BigInt!
    memo: String
    status: TransactionStatus!
    errorMessage: String
    createdAt: DateTime!
    updatedAt: DateTime!

    # Relations
    block: Block!
    senderAccount: Account!
    receiverAccount: Account
    events: [TransactionEvent!]!

    # Decoded data
    decodedData: DecodedTransactionData
  }

  type TransactionEvent {
    id: ID!
    transactionHash: Hash!
    logIndex: Int!
    contractAddress: Address!
    eventName: String
    eventSignature: String
    topics: [String!]!
    data: String
    decodedParams: [DecodedParameter!]
    timestamp: DateTime!
  }

  type DecodedParameter {
    name: String!
    type: String!
    value: String!
    indexed: Boolean
  }

  type DecodedTransactionData {
    methodName: String
    methodSignature: String
    params: [DecodedParameter!]
    decodedInput: String
  }

  type Account {
    id: ID!
    address: Address!
    balance: BigInt!
    stakedBalance: BigInt!
    delegatedBalance: BigInt!
    txCount: Int!
    type: AccountType!
    createdAt: DateTime!
    updatedAt: DateTime!
    firstSeenAt: DateTime
    lastActiveAt: DateTime

    # Relations
    transactions(
      first: Int
      after: String
      filter: TransactionFilter
    ): TransactionConnection!

    sentTransactions(
      first: Int
      after: String
    ): TransactionConnection!

    receivedTransactions(
      first: Int
      after: String
    ): TransactionConnection!

    # Contract specific
    contract: Contract

    # Validator specific
    validator: Validator

    # Analytics
    balanceHistory(
      from: DateTime
      to: DateTime
      interval: String
    ): [BalanceSnapshot!]!

    analytics: AccountAnalytics!
  }

  type AccountAnalytics {
    totalSent: BigInt!
    totalReceived: BigInt!
    avgTransactionValue: BigInt!
    uniqueCounterparties: Int!
    mostFrequentCounterparty: Address
  }

  type BalanceSnapshot {
    timestamp: DateTime!
    balance: BigInt!
    blockHeight: Int!
  }

  type Contract {
    address: Address!
    isVerified: Boolean!
    contractName: String
    compilerType: String
    compilerVersion: String
    sourceCode: String
    abi: [AbiItem!]
    optimizationEnabled: Boolean
    optimizationRuns: Int
    evmVersion: String
    licenseType: String
    verifiedAt: DateTime
    createdAt: DateTime!

    # Relations
    account: Account!
    creator: Account
    creationTransaction: Transaction

    # Events and calls
    events(
      first: Int
      after: String
      eventName: String
      fromBlock: Int
      toBlock: Int
    ): [ContractEvent!]!

    internalTransactions(
      first: Int
      after: String
    ): [InternalTransaction!]!

    # Token info
    tokenInfo: TokenInfo

    # Analytics
    analytics: ContractAnalytics!
  }

  type ContractAnalytics {
    totalTransactions: Int!
    uniqueUsers: Int!
    totalValueLocked: BigInt
    createdAt: DateTime!
    lastActive: DateTime
  }

  type AbiItem {
    type: String!
    name: String
    stateMutability: String
    inputs: [AbiParameter!]
    outputs: [AbiParameter!]
  }

  type AbiParameter {
    name: String!
    type: String!
    indexed: Boolean
  }

  type ContractEvent {
    id: ID!
    contractAddress: Address!
    transactionHash: Hash!
    blockHeight: Int!
    logIndex: Int!
    eventName: String
    eventSignature: String
    topics: [String!]!
    data: String
    decodedParams: [DecodedParameter!]
    timestamp: DateTime!
  }

  type InternalTransaction {
    id: ID!
    transactionHash: Hash!
    blockHeight: Int!
    callType: String!
    fromAddress: Address!
    toAddress: Address
    value: BigInt!
    gasLimit: BigInt
    gasUsed: BigInt
    inputData: String
    outputData: String
    error: String
    depth: Int!
    success: Boolean!
    timestamp: DateTime!
  }

  type Token {
    address: Address!
    name: String!
    symbol: String!
    decimals: Int!
    totalSupply: BigInt!
    standard: TokenStandard!
    logoUri: String
    description: String
    website: String
    verified: Boolean!

    # Relations
    contract: Contract!

    # Analytics
    holders: Int!
    transfers24h: Int!
    volume24h: BigInt!
    marketCap: BigInt
    price: Float
    priceChange24h: Float

    # Token holders
    topHolders(limit: Int): [TokenHolder!]!
  }

  type TokenInfo {
    isToken: Boolean!
    tokenType: TokenStandard
    name: String
    symbol: String
    decimals: Int
    totalSupply: BigInt
  }

  type TokenHolder {
    address: Address!
    balance: BigInt!
    percentage: Float!
    account: Account!
  }

  type Validator {
    id: ID!
    operatorAddress: Address!
    consensusAddress: Address!
    consensusPubkey: String!
    moniker: String!
    identity: String
    website: String
    securityContact: String
    details: String
    commissionRate: Float!
    commissionMaxRate: Float!
    commissionMaxChangeRate: Float!
    minSelfDelegation: BigInt!
    tokens: BigInt!
    delegatorShares: BigInt!
    votingPower: Int!
    status: ValidatorStatus!
    jailed: Boolean!
    jailedUntil: DateTime
    unbondingHeight: Int
    unbondingTime: DateTime
    missedBlocks: Int!
    uptimePercentage: Float!
    createdAt: DateTime!
    updatedAt: DateTime!

    # Relations
    account: Account!
    proposedBlocks(first: Int, after: String): BlockConnection!
  }

  type NetworkStats {
    # Current state
    latestBlock: Block
    totalBlocks: Int!
    totalTransactions: Int!
    totalAccounts: Int!
    totalValidators: Int!
    totalContracts: Int!

    # 24h metrics
    blocks24h: Int!
    transactions24h: Int!
    avgBlockTime: Float!
    avgGasPrice: BigInt!

    # Network health
    activeValidators: Int!
    networkHashrate: BigInt
    stakingRatio: Float!

    # Historical data
    chartData: NetworkChartData!
  }

  type NetworkChartData {
    blocks: [DataPoint!]!
    transactions: [DataPoint!]!
    gasUsed: [DataPoint!]!
    activeAccounts: [DataPoint!]!
  }

  type DataPoint {
    timestamp: DateTime!
    value: Float!
  }

  # Search Results
  type SearchResult {
    type: SearchResultType!
    result: SearchResultUnion!
  }

  enum SearchResultType {
    BLOCK
    TRANSACTION
    ACCOUNT
    CONTRACT
    TOKEN
  }

  union SearchResultUnion = Block | Transaction | Account | Contract | Token

  # Root Query
  type Query {
    # Block queries
    block(height: Int!): Block
    blockByHash(hash: Hash!): Block
    blocks(
      first: Int
      after: String
      filter: BlockFilter
    ): BlockConnection!
    latestBlocks(limit: Int): [Block!]!

    # Transaction queries
    transaction(hash: Hash!): Transaction
    transactions(
      first: Int
      after: String
      filter: TransactionFilter
    ): TransactionConnection!
    latestTransactions(limit: Int): [Transaction!]!

    # Account queries
    account(address: Address!): Account
    accounts(
      first: Int
      after: String
      filter: AccountFilter
      orderBy: AccountOrderBy
    ): AccountConnection!
    topAccounts(limit: Int): [Account!]!

    # Contract queries
    contract(address: Address!): Contract
    verifiedContracts(first: Int, after: String): [Contract!]!

    # Token queries
    token(address: Address!): Token
    tokens(
      first: Int
      after: String
      filter: TokenFilter
    ): TokenConnection!
    topTokens(limit: Int): [Token!]!

    # Validator queries
    validator(operatorAddress: Address!): Validator
    validators: [Validator!]!
    activeValidators: [Validator!]!

    # Network stats
    stats: NetworkStats!

    # Search
    search(query: String!): [SearchResult!]!

    # Health check
    health: Boolean!
  }

  # Subscriptions
  type Subscription {
    # Real-time block updates
    newBlock: Block!

    # Real-time transaction updates
    newTransaction: Transaction!

    # Account activity
    accountActivity(address: Address!): Transaction!

    # Contract events
    contractEvents(address: Address!, eventName: String): ContractEvent!

    # Network stats updates
    statsUpdated: NetworkStats!
  }

  # Mutations (for future use)
  type Mutation {
    # Placeholder for future mutations
    _empty: String
  }
`;

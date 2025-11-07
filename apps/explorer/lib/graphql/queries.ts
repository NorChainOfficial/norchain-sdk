/**
 * GraphQL Query Examples
 * Pre-built queries for common use cases
 */

import { gql } from '@apollo/client';

/**
 * Get latest blocks with transactions
 */
export const GET_LATEST_BLOCKS = gql`
  query GetLatestBlocks($limit: Int) {
    latestBlocks(limit: $limit) {
      id
      height
      hash
      timestamp
      proposerAddress
      transactionCount
      gasUsed
      gasWanted
      stats {
        avgGasPrice
        totalFees
        successRate
      }
    }
  }
`;

/**
 * Get block by height with full details
 */
export const GET_BLOCK = gql`
  query GetBlock($height: Int!) {
    block(height: $height) {
      id
      height
      hash
      previousHash
      timestamp
      proposerAddress
      validatorName
      transactionCount
      blockTimeSeconds
      sizeBytes
      gasUsed
      gasWanted
      proposer {
        address
        balance
        type
      }
      transactions(first: 20) {
        edges {
          cursor
          node {
            hash
            type
            sender
            receiver
            amount
            fee
            status
            timestamp
          }
        }
        pageInfo {
          hasNextPage
          endCursor
        }
      }
      stats {
        avgGasPrice
        totalFees
        successRate
      }
    }
  }
`;

/**
 * Get paginated blocks
 */
export const GET_BLOCKS = gql`
  query GetBlocks($first: Int!, $after: String, $filter: BlockFilter) {
    blocks(first: $first, after: $after, filter: $filter) {
      edges {
        cursor
        node {
          height
          hash
          timestamp
          proposerAddress
          transactionCount
          gasUsed
          stats {
            totalFees
          }
        }
      }
      pageInfo {
        hasNextPage
        hasPreviousPage
        startCursor
        endCursor
      }
      totalCount
    }
  }
`;

/**
 * Get transaction by hash
 */
export const GET_TRANSACTION = gql`
  query GetTransaction($hash: Hash!) {
    transaction(hash: $hash) {
      id
      hash
      blockHeight
      blockHash
      timestamp
      type
      sender
      receiver
      amount
      fee
      gasUsed
      gasWanted
      memo
      status
      errorMessage
      block {
        height
        timestamp
        proposerAddress
      }
      senderAccount {
        address
        balance
        type
      }
      receiverAccount {
        address
        balance
        type
      }
      events {
        id
        logIndex
        contractAddress
        eventName
        eventSignature
        topics
        decodedParams {
          name
          type
          value
          indexed
        }
      }
      decodedData {
        methodName
        methodSignature
        params {
          name
          type
          value
        }
      }
    }
  }
`;

/**
 * Get latest transactions
 */
export const GET_LATEST_TRANSACTIONS = gql`
  query GetLatestTransactions($limit: Int) {
    latestTransactions(limit: $limit) {
      hash
      blockHeight
      timestamp
      type
      sender
      receiver
      amount
      fee
      status
    }
  }
`;

/**
 * Get account details
 */
export const GET_ACCOUNT = gql`
  query GetAccount($address: Address!) {
    account(address: $address) {
      id
      address
      balance
      stakedBalance
      delegatedBalance
      txCount
      type
      createdAt
      firstSeenAt
      lastActiveAt
      contract {
        isVerified
        contractName
        compilerVersion
        abi {
          type
          name
          stateMutability
        }
        tokenInfo {
          isToken
          tokenType
          name
          symbol
          decimals
          totalSupply
        }
      }
      validator {
        moniker
        votingPower
        commissionRate
        status
      }
      analytics {
        totalSent
        totalReceived
        avgTransactionValue
        uniqueCounterparties
      }
    }
  }
`;

/**
 * Get account with transaction history
 */
export const GET_ACCOUNT_WITH_TRANSACTIONS = gql`
  query GetAccountWithTransactions(
    $address: Address!
    $first: Int
    $after: String
  ) {
    account(address: $address) {
      address
      balance
      txCount
      type
      transactions(first: $first, after: $after) {
        edges {
          cursor
          node {
            hash
            blockHeight
            timestamp
            type
            sender
            receiver
            amount
            fee
            status
          }
        }
        pageInfo {
          hasNextPage
          endCursor
        }
      }
    }
  }
`;

/**
 * Get account balance history
 */
export const GET_ACCOUNT_BALANCE_HISTORY = gql`
  query GetAccountBalanceHistory(
    $address: Address!
    $from: DateTime
    $to: DateTime
    $interval: String
  ) {
    account(address: $address) {
      address
      balance
      balanceHistory(from: $from, to: $to, interval: $interval) {
        timestamp
        balance
        blockHeight
      }
    }
  }
`;

/**
 * Get contract details
 */
export const GET_CONTRACT = gql`
  query GetContract($address: Address!) {
    contract(address: $address) {
      address
      isVerified
      contractName
      compilerType
      compilerVersion
      sourceCode
      abi {
        type
        name
        stateMutability
        inputs {
          name
          type
          indexed
        }
        outputs {
          name
          type
        }
      }
      optimizationEnabled
      optimizationRuns
      evmVersion
      licenseType
      verifiedAt
      account {
        balance
        txCount
      }
      creator {
        address
      }
      creationTransaction {
        hash
        timestamp
      }
      tokenInfo {
        isToken
        tokenType
        name
        symbol
        decimals
        totalSupply
      }
      analytics {
        totalTransactions
        uniqueUsers
        totalValueLocked
        createdAt
        lastActive
      }
    }
  }
`;

/**
 * Get token details
 */
export const GET_TOKEN = gql`
  query GetToken($address: Address!) {
    token(address: $address) {
      address
      name
      symbol
      decimals
      totalSupply
      standard
      logoUri
      description
      website
      verified
      holders
      transfers24h
      volume24h
      marketCap
      price
      priceChange24h
      contract {
        isVerified
        sourceCode
      }
      topHolders(limit: 10) {
        address
        balance
        percentage
        account {
          type
        }
      }
    }
  }
`;

/**
 * Get network stats
 */
export const GET_NETWORK_STATS = gql`
  query GetNetworkStats {
    stats {
      latestBlock {
        height
        timestamp
        transactionCount
      }
      totalBlocks
      totalTransactions
      totalAccounts
      totalValidators
      totalContracts
      blocks24h
      transactions24h
      avgBlockTime
      avgGasPrice
      activeValidators
      networkHashrate
      stakingRatio
      chartData {
        blocks {
          timestamp
          value
        }
        transactions {
          timestamp
          value
        }
        gasUsed {
          timestamp
          value
        }
        activeAccounts {
          timestamp
          value
        }
      }
    }
  }
`;

/**
 * Search query
 */
export const SEARCH = gql`
  query Search($query: String!) {
    search(query: $query) {
      type
      result {
        ... on Block {
          height
          hash
          timestamp
          transactionCount
        }
        ... on Transaction {
          hash
          blockHeight
          timestamp
          sender
          receiver
          amount
          status
        }
        ... on Account {
          address
          balance
          txCount
          type
        }
        ... on Contract {
          address
          isVerified
          contractName
        }
        ... on Token {
          address
          name
          symbol
          decimals
        }
      }
    }
  }
`;

/**
 * Get validators
 */
export const GET_VALIDATORS = gql`
  query GetValidators {
    validators {
      id
      operatorAddress
      moniker
      identity
      website
      votingPower
      commissionRate
      status
      jailed
      uptimePercentage
      tokens
      delegatorShares
    }
  }
`;

/**
 * Get active validators
 */
export const GET_ACTIVE_VALIDATORS = gql`
  query GetActiveValidators {
    activeValidators {
      operatorAddress
      moniker
      votingPower
      commissionRate
      uptimePercentage
      tokens
    }
  }
`;

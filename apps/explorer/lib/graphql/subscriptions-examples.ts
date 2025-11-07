/**
 * GraphQL Subscription Examples
 * Real-time data subscriptions
 */

import { gql } from '@apollo/client';

/**
 * Subscribe to new blocks
 */
export const SUBSCRIBE_NEW_BLOCK = gql`
  subscription OnNewBlock {
    newBlock {
      height
      hash
      timestamp
      proposerAddress
      transactionCount
      gasUsed
      gasWanted
    }
  }
`;

/**
 * Subscribe to new transactions
 */
export const SUBSCRIBE_NEW_TRANSACTION = gql`
  subscription OnNewTransaction {
    newTransaction {
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
 * Subscribe to account activity
 */
export const SUBSCRIBE_ACCOUNT_ACTIVITY = gql`
  subscription OnAccountActivity($address: Address!) {
    accountActivity(address: $address) {
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
 * Subscribe to contract events
 */
export const SUBSCRIBE_CONTRACT_EVENTS = gql`
  subscription OnContractEvents($address: Address!, $eventName: String) {
    contractEvents(address: $address, eventName: $eventName) {
      id
      transactionHash
      blockHeight
      logIndex
      eventName
      eventSignature
      topics
      decodedParams {
        name
        type
        value
        indexed
      }
      timestamp
    }
  }
`;

/**
 * Subscribe to network stats updates
 */
export const SUBSCRIBE_STATS_UPDATED = gql`
  subscription OnStatsUpdated {
    statsUpdated {
      totalBlocks
      totalTransactions
      totalAccounts
      blocks24h
      transactions24h
      avgBlockTime
      avgGasPrice
      activeValidators
    }
  }
`;

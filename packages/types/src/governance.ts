/**
 * Governance and proposal-related types
 */

import type { Address, Wei, Timestamp } from './common';

/**
 * Proposal status
 */
export type ProposalStatus =
  | 'pending'
  | 'active'
  | 'passed'
  | 'rejected'
  | 'cancelled'
  | 'executed';

/**
 * Vote option
 */
export type VoteOption = 'yes' | 'no' | 'abstain' | 'veto';

/**
 * Proposal type
 */
export type ProposalType =
  | 'text'
  | 'parameter_change'
  | 'software_upgrade'
  | 'treasury_spend';

/**
 * Governance proposal
 */
export interface Proposal {
  readonly id: string;
  readonly title: string;
  readonly description: string;
  readonly type: ProposalType;
  readonly proposer: Address;
  readonly status: ProposalStatus;
  readonly votingStartTime: Timestamp;
  readonly votingEndTime: Timestamp;
  readonly votes: {
    readonly yes: Wei;
    readonly no: Wei;
    readonly abstain: Wei;
    readonly veto: Wei;
  };
  readonly quorum: string;
  readonly threshold: string;
  readonly vetoThreshold: string;
  readonly deposit: Wei;
  readonly depositRequired: Wei;
  readonly executionTime?: Timestamp;
  readonly createdAt: Timestamp;
  readonly updatedAt: Timestamp;
}

/**
 * Vote information
 */
export interface Vote {
  readonly proposalId: string;
  readonly voter: Address;
  readonly option: VoteOption;
  readonly weight: Wei;
  readonly timestamp: Timestamp;
}

/**
 * Governance parameters
 */
export interface GovernanceParams {
  readonly votingPeriod: number;
  readonly minDeposit: Wei;
  readonly quorum: string;
  readonly threshold: string;
  readonly vetoThreshold: string;
}

/**
 * Proposal tally result
 */
export interface ProposalTally {
  readonly proposalId: string;
  readonly yes: Wei;
  readonly no: Wei;
  readonly abstain: Wei;
  readonly veto: Wei;
  readonly totalVotes: Wei;
  readonly totalVotingPower: Wei;
  readonly turnout: string;
  readonly passed: boolean;
}

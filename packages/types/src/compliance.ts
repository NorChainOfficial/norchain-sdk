/**
 * Compliance and regulatory types
 */

import type { Address, Timestamp } from './common';

/**
 * KYC status
 */
export type KYCStatus =
  | 'not_started'
  | 'pending'
  | 'in_review'
  | 'approved'
  | 'rejected'
  | 'expired';

/**
 * Sharia compliance status
 */
export type ShariaComplianceStatus = 'compliant' | 'non_compliant' | 'under_review';

/**
 * Risk level
 */
export type RiskLevel = 'low' | 'medium' | 'high' | 'critical';

/**
 * KYC information
 */
export interface KYCInfo {
  readonly userId: string;
  readonly status: KYCStatus;
  readonly level: 1 | 2 | 3;
  readonly submittedAt?: Timestamp;
  readonly reviewedAt?: Timestamp;
  readonly approvedAt?: Timestamp;
  readonly expiresAt?: Timestamp;
  readonly rejectionReason?: string;
  readonly documents?: readonly KYCDocument[];
}

/**
 * KYC document
 */
export interface KYCDocument {
  readonly id: string;
  readonly type: 'id_card' | 'passport' | 'drivers_license' | 'proof_of_address' | 'selfie';
  readonly status: 'pending' | 'approved' | 'rejected';
  readonly uploadedAt: Timestamp;
  readonly reviewedAt?: Timestamp;
}

/**
 * Policy check result
 */
export interface PolicyCheckResult {
  readonly address: Address;
  readonly isBlacklisted: boolean;
  readonly isSanctioned: boolean;
  readonly shariaCompliant: boolean;
  readonly riskScore: number;
  readonly riskLevel: RiskLevel;
  readonly flags: readonly string[];
  readonly checkedAt: Timestamp;
}

/**
 * Transaction compliance check
 */
export interface TransactionComplianceCheck {
  readonly transactionHash: string;
  readonly from: Address;
  readonly to: Address;
  readonly fromCompliance: PolicyCheckResult;
  readonly toCompliance: PolicyCheckResult;
  readonly isApproved: boolean;
  readonly requiresManualReview: boolean;
  readonly checkedAt: Timestamp;
}

/**
 * AML screening result
 */
export interface AMLScreeningResult {
  readonly address: Address;
  readonly isPEP: boolean;
  readonly isSanctioned: boolean;
  readonly matchedLists: readonly string[];
  readonly riskScore: number;
  readonly screenedAt: Timestamp;
}

/**
 * Sharia compliance check
 */
export interface ShariaComplianceCheck {
  readonly tokenAddress?: Address;
  readonly activityType: string;
  readonly status: ShariaComplianceStatus;
  readonly certificationBody?: string;
  readonly certificationDate?: Timestamp;
  readonly expiryDate?: Timestamp;
  readonly notes?: string;
}

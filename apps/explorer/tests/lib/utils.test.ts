/**
 * Unit Tests for Utility Functions
 * Tests all utility functions in lib/utils.ts
 */

import { describe, it, expect } from 'vitest';
import {
  formatXAHEEN,
  truncateHash,
  formatDate,
  formatTimeAgo,
  formatAddress,
  isContractAddress,
} from '@/lib/utils';

describe('formatXAHEEN', () => {
  it('should format decimal strings correctly', () => {
    expect(formatXAHEEN('100.5')).toBe('100.500000 XAHEEN');
    expect(formatXAHEEN('100.123456789')).toBe('100.123456 XAHEEN');
  });

  it('should format integer strings (base units)', () => {
    expect(formatXAHEEN('100000000000000000000000000')).toBe('1.000000 XAHEEN');
    expect(formatXAHEEN('50000000000000000000000000')).toBe('0.500000 XAHEEN');
  });

  it('should handle custom decimals', () => {
    expect(formatXAHEEN('100.123456789', 2)).toBe('100.12 XAHEEN');
    expect(formatXAHEEN('100.123456789', 4)).toBe('100.1234 XAHEEN');
  });

  it('should handle numbers', () => {
    expect(formatXAHEEN(100)).toBe('0.000000 XAHEEN');
  });
});

describe('truncateHash', () => {
  it('should truncate long hashes', () => {
    const longHash = '0x1234567890abcdef1234567890abcdef1234567890abcdef1234567890abcdef';
    expect(truncateHash(longHash)).toBe('0x123456...90abcdef');
    expect(truncateHash(longHash, 4, 4)).toBe('0x12...cdef');
  });

  it('should return full hash if shorter than truncation length', () => {
    const shortHash = '0x123456';
    expect(truncateHash(shortHash)).toBe('0x123456');
  });

  it('should use custom start and end lengths', () => {
    const hash = '0x1234567890abcdef1234567890abcdef';
    // truncateHash with 6,6 means first 6 and last 6 chars
    const result = truncateHash(hash, 6, 6);
    expect(result).toContain('0x1234');
    expect(result).toContain('...');
    expect(result.length).toBeLessThan(hash.length);
  });
});

describe('formatDate', () => {
  it('should format date strings', () => {
    const date = '2024-01-15T10:30:00Z';
    const formatted = formatDate(date);
    expect(formatted).toContain('2024');
    expect(formatted).toContain('Jan');
  });

  it('should format Date objects', () => {
    const date = new Date('2024-01-15T10:30:00Z');
    const formatted = formatDate(date);
    expect(formatted).toContain('2024');
  });
});

describe('formatTimeAgo', () => {
  it('should format seconds ago', () => {
    const date = new Date(Date.now() - 30 * 1000);
    expect(formatTimeAgo(date)).toBe('30 seconds ago');
    expect(formatTimeAgo(date)).toContain('second');
  });

  it('should format minutes ago', () => {
    const date = new Date(Date.now() - 5 * 60 * 1000);
    expect(formatTimeAgo(date)).toBe('5 minutes ago');
  });

  it('should format hours ago', () => {
    const date = new Date(Date.now() - 3 * 60 * 60 * 1000);
    expect(formatTimeAgo(date)).toBe('3 hours ago');
  });

  it('should format days ago', () => {
    const date = new Date(Date.now() - 2 * 24 * 60 * 60 * 1000);
    expect(formatTimeAgo(date)).toBe('2 days ago');
  });

  it('should handle singular forms', () => {
    const date = new Date(Date.now() - 1000);
    expect(formatTimeAgo(date)).toBe('1 second ago');
  });
});

describe('formatAddress', () => {
  it('should truncate long addresses', () => {
    const address = '0x1234567890abcdef1234567890abcdef12345678';
    expect(formatAddress(address)).toBe('0x1234...5678');
  });

  it('should return full address if short', () => {
    const address = '0x1234';
    expect(formatAddress(address)).toBe('0x1234');
  });

  it('should use custom start and end chars', () => {
    const address = '0x1234567890abcdef1234567890abcdef12345678';
    expect(formatAddress(address, 4, 4)).toBe('0x12...5678');
  });

  it('should handle empty address', () => {
    expect(formatAddress('')).toBe('');
  });
});

describe('isContractAddress', () => {
  it('should return false for empty address', () => {
    expect(isContractAddress('')).toBe(false);
  });

  it('should detect contract by account type', () => {
    expect(isContractAddress('0x123', 'contract')).toBe(true);
    expect(isContractAddress('0x123', 'module')).toBe(true);
    expect(isContractAddress('0x123', 'ContractAccount')).toBe(true);
  });

  it('should return false for normal account types', () => {
    expect(isContractAddress('0x123', 'account')).toBe(false);
    expect(isContractAddress('0x123', 'wallet')).toBe(false);
  });

  it('should return false when no account type provided', () => {
    expect(isContractAddress('0x123')).toBe(false);
  });
});


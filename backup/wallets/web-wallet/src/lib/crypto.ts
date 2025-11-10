/**
 * Cryptographic utilities for wallet operations
 * Uses bip39 for mnemonic and ethers for Ethereum operations
 */

import * as bip39 from 'bip39';
import { ethers } from 'ethers';

/**
 * Generate a new mnemonic phrase
 */
export function generateMnemonic(): string {
  return bip39.generateMnemonic();
}

/**
 * Validate mnemonic phrase
 */
export function validateMnemonic(mnemonic: string): boolean {
  return bip39.validateMnemonic(mnemonic);
}

/**
 * Generate wallet from mnemonic
 */
export function generateWalletFromMnemonic(mnemonic: string, index: number = 0) {
  if (!validateMnemonic(mnemonic)) {
    throw new Error('Invalid mnemonic phrase');
  }

  // Derive HD wallet from mnemonic
  const wallet = ethers.Wallet.fromPhrase(mnemonic, `m/44'/60'/0'/0/${index}`);
  
  return {
    address: wallet.address,
    privateKey: wallet.privateKey,
    publicKey: wallet.publicKey,
    mnemonic,
  };
}

/**
 * Generate wallet from private key
 */
export function generateWalletFromPrivateKey(privateKey: string) {
  const wallet = new ethers.Wallet(privateKey);
  
  return {
    address: wallet.address,
    privateKey: wallet.privateKey,
    publicKey: wallet.publicKey,
  };
}

/**
 * Sign message with wallet
 */
export async function signMessage(message: string, privateKey: string): Promise<string> {
  const wallet = new ethers.Wallet(privateKey);
  return await wallet.signMessage(message);
}

/**
 * Sign transaction
 */
export async function signTransaction(
  transaction: {
    to: string;
    value: string;
    gasLimit?: string;
    gasPrice?: string;
    nonce?: number;
    data?: string;
  },
  privateKey: string,
  chainId: number
): Promise<string> {
  const wallet = new ethers.Wallet(privateKey);
  
  const tx = {
    to: transaction.to,
    value: transaction.value,
    gasLimit: transaction.gasLimit || '21000',
    gasPrice: transaction.gasPrice || undefined,
    nonce: transaction.nonce,
    data: transaction.data || '0x',
    chainId,
  };

  const signedTx = await wallet.signTransaction(tx);
  return signedTx;
}

/**
 * Encrypt private key with password
 */
export async function encryptPrivateKey(
  privateKey: string,
  password: string
): Promise<string> {
  const wallet = new ethers.Wallet(privateKey);
  return await wallet.encrypt(password);
}

/**
 * Decrypt private key from encrypted JSON
 */
export async function decryptPrivateKey(
  encryptedJson: string,
  password: string
): Promise<string> {
  const wallet = await ethers.Wallet.fromEncryptedJson(encryptedJson, password);
  return wallet.privateKey;
}

/**
 * Get address from private key
 */
export function getAddressFromPrivateKey(privateKey: string): string {
  const wallet = new ethers.Wallet(privateKey);
  return wallet.address;
}

/**
 * Validate Ethereum address
 */
export function isValidAddress(address: string): boolean {
  return ethers.isAddress(address);
}

/**
 * Format address for display
 */
export function formatAddress(address: string, startLength: number = 6, endLength: number = 4): string {
  if (!isValidAddress(address)) return address;
  return `${address.slice(0, startLength)}...${address.slice(-endLength)}`;
}


/**
 * Wallet Module E2E Tests
 * 
 * End-to-end tests covering complete wallet workflows:
 * - Wallet creation and import flow
 * - Balance checking
 * - Transaction sending (mocked)
 * - Wallet management
 * - Multi-user scenarios
 */

import { Test, TestingModule } from '@nestjs/testing';
import { INestApplication, ValidationPipe } from '@nestjs/common';
import * as request from 'supertest';
import { AppModule } from '../../src/app.module';
import { ethers } from 'ethers';

describe('Wallet E2E Tests', () => {
  let app: INestApplication;
  let authToken: string;
  let testEmail: string;
  let createdWalletAddress: string;
  let importedWalletAddress: string;

  beforeAll(async () => {
    const moduleFixture: TestingModule = await Test.createTestingModule({
      imports: [AppModule],
    }).compile();

    app = moduleFixture.createNestApplication();
    app.useGlobalPipes(
      new ValidationPipe({
        whitelist: true,
        forbidNonWhitelisted: true,
        transform: true,
      }),
    );
    await app.init();

    // Setup authenticated user
    testEmail = `wallet-e2e-${Date.now()}@example.com`;
    await request(app.getHttpServer())
      .post('/api/v1/auth/register')
      .send({
        email: testEmail,
        password: 'TestPassword123!',
        name: 'E2E Test User',
      });

    const loginResponse = await request(app.getHttpServer())
      .post('/api/v1/auth/login')
      .send({
        email: testEmail,
        password: 'TestPassword123!',
      });

    authToken = loginResponse.body.access_token;
  });

  afterAll(async () => {
    await app.close();
  });

  describe('Complete Wallet Lifecycle', () => {
    it('should complete full wallet lifecycle: create -> view -> delete', async () => {
      // Step 1: Create wallet
      const createResponse = await request(app.getHttpServer())
        .post('/api/v1/wallet')
        .set('Authorization', `Bearer ${authToken}`)
        .send({
          password: 'SecurePassword123!',
          name: 'Lifecycle Test Wallet',
        });

      expect(createResponse.status).toBe(201);
      expect(createResponse.body).toHaveProperty('address');
      const walletAddress = createResponse.body.address;

      // Step 2: List wallets (should include new wallet)
      const listResponse = await request(app.getHttpServer())
        .get('/api/v1/wallet')
        .set('Authorization', `Bearer ${authToken}`);

      expect(listResponse.status).toBe(200);
      expect(Array.isArray(listResponse.body)).toBe(true);
      expect(listResponse.body.some((w: any) => w.address === walletAddress)).toBe(true);

      // Step 3: Get wallet details
      const getResponse = await request(app.getHttpServer())
        .get(`/api/v1/wallet/${walletAddress}`)
        .set('Authorization', `Bearer ${authToken}`);

      expect(getResponse.status).toBe(200);
      expect(getResponse.body.address).toBe(walletAddress);
      expect(getResponse.body).toHaveProperty('balance');

      // Step 4: Get balance
      const balanceResponse = await request(app.getHttpServer())
        .get(`/api/v1/wallet/${walletAddress}/balance`)
        .set('Authorization', `Bearer ${authToken}`);

      expect(balanceResponse.status).toBe(200);
      expect(balanceResponse.body).toHaveProperty('balance');
      expect(balanceResponse.body).toHaveProperty('balanceFormatted');

      // Step 5: Delete wallet
      const deleteResponse = await request(app.getHttpServer())
        .delete(`/api/v1/wallet/${walletAddress}`)
        .set('Authorization', `Bearer ${authToken}`);

      expect(deleteResponse.status).toBe(200);

      // Step 6: Verify wallet is deleted
      const verifyResponse = await request(app.getHttpServer())
        .get(`/api/v1/wallet/${walletAddress}`)
        .set('Authorization', `Bearer ${authToken}`);

      expect(verifyResponse.status).toBe(404);
    });
  });

  describe('Wallet Import Flow', () => {
    it('should import existing wallet and access it', async () => {
      // Create a wallet externally
      const externalWallet = ethers.Wallet.createRandom();

      // Import it
      const importResponse = await request(app.getHttpServer())
        .post('/api/v1/wallet/import')
        .set('Authorization', `Bearer ${authToken}`)
        .send({
          privateKey: externalWallet.privateKey,
          password: 'SecurePassword123!',
          name: 'Imported E2E Wallet',
        });

      expect(importResponse.status).toBe(201);
      expect(importResponse.body.address.toLowerCase()).toBe(externalWallet.address.toLowerCase());
      importedWalletAddress = importResponse.body.address;

      // Verify it's in the list
      const listResponse = await request(app.getHttpServer())
        .get('/api/v1/wallet')
        .set('Authorization', `Bearer ${authToken}`);

      expect(listResponse.body.some((w: any) => w.address.toLowerCase() === importedWalletAddress.toLowerCase())).toBe(true);

      // Access wallet details
      const getResponse = await request(app.getHttpServer())
        .get(`/api/v1/wallet/${importedWalletAddress}`)
        .set('Authorization', `Bearer ${authToken}`);

      expect(getResponse.status).toBe(200);
      expect(getResponse.body.address.toLowerCase()).toBe(importedWalletAddress.toLowerCase());
    });
  });

  describe('Multi-Wallet Management', () => {
    it('should manage multiple wallets per user', async () => {
      // Create multiple wallets
      const wallet1 = await request(app.getHttpServer())
        .post('/api/v1/wallet')
        .set('Authorization', `Bearer ${authToken}`)
        .send({ password: 'SecurePassword123!', name: 'Wallet 1' });

      const wallet2 = await request(app.getHttpServer())
        .post('/api/v1/wallet')
        .set('Authorization', `Bearer ${authToken}`)
        .send({ password: 'SecurePassword123!', name: 'Wallet 2' });

      const wallet3 = await request(app.getHttpServer())
        .post('/api/v1/wallet')
        .set('Authorization', `Bearer ${authToken}`)
        .send({ password: 'SecurePassword123!', name: 'Wallet 3' });

      expect(wallet1.status).toBe(201);
      expect(wallet2.status).toBe(201);
      expect(wallet3.status).toBe(201);

      // List all wallets
      const listResponse = await request(app.getHttpServer())
        .get('/api/v1/wallet')
        .set('Authorization', `Bearer ${authToken}`);

      expect(listResponse.status).toBe(200);
      expect(listResponse.body.length).toBeGreaterThanOrEqual(3);

      // Verify all wallets are accessible
      const addresses = [
        wallet1.body.address,
        wallet2.body.address,
        wallet3.body.address,
      ];

      for (const address of addresses) {
        const getResponse = await request(app.getHttpServer())
          .get(`/api/v1/wallet/${address}`)
          .set('Authorization', `Bearer ${authToken}`);

        expect(getResponse.status).toBe(200);
      }
    });
  });

  describe('Wallet Balance Operations', () => {
    beforeEach(async () => {
      if (!createdWalletAddress) {
        const response = await request(app.getHttpServer())
          .post('/api/v1/wallet')
          .set('Authorization', `Bearer ${authToken}`)
          .send({ password: 'SecurePassword123!' });
        createdWalletAddress = response.body.address;
      }
    });

    it('should get balance for created wallet', async () => {
      const response = await request(app.getHttpServer())
        .get(`/api/v1/wallet/${createdWalletAddress}/balance`)
        .set('Authorization', `Bearer ${authToken}`);

      expect(response.status).toBe(200);
      expect(response.body).toHaveProperty('address', createdWalletAddress);
      expect(response.body).toHaveProperty('balance');
      expect(response.body).toHaveProperty('balanceFormatted');
      expect(typeof response.body.balance).toBe('string');
    });

    it('should get tokens list (empty for new wallet)', async () => {
      const response = await request(app.getHttpServer())
        .get(`/api/v1/wallet/${createdWalletAddress}/tokens`)
        .set('Authorization', `Bearer ${authToken}`);

      expect(response.status).toBe(200);
      expect(response.body).toHaveProperty('address', createdWalletAddress);
      expect(response.body).toHaveProperty('tokens');
      expect(Array.isArray(response.body.tokens)).toBe(true);
    });

    it('should get transaction history (empty for new wallet)', async () => {
      const response = await request(app.getHttpServer())
        .get(`/api/v1/wallet/${createdWalletAddress}/transactions`)
        .set('Authorization', `Bearer ${authToken}`);

      expect(response.status).toBe(200);
      expect(response.body).toHaveProperty('address', createdWalletAddress);
      expect(response.body).toHaveProperty('transactions');
      expect(Array.isArray(response.body.transactions)).toBe(true);
    });
  });

  describe('Error Scenarios', () => {
    it('should handle non-existent wallet gracefully', async () => {
      const fakeAddress = '0x0000000000000000000000000000000000000000';
      const response = await request(app.getHttpServer())
        .get(`/api/v1/wallet/${fakeAddress}`)
        .set('Authorization', `Bearer ${authToken}`);

      expect(response.status).toBe(404);
    });

    it('should reject invalid wallet address format', async () => {
      const invalidAddress = 'not-an-address';
      const response = await request(app.getHttpServer())
        .get(`/api/v1/wallet/${invalidAddress}`)
        .set('Authorization', `Bearer ${authToken}`);

      expect([400, 404, 403]).toContain(response.status);
    });

    it('should prevent duplicate wallet import', async () => {
      const wallet = ethers.Wallet.createRandom();

      // First import
      const import1 = await request(app.getHttpServer())
        .post('/api/v1/wallet/import')
        .set('Authorization', `Bearer ${authToken}`)
        .send({
          privateKey: wallet.privateKey,
          password: 'SecurePassword123!',
        });

      expect(import1.status).toBe(201);

      // Second import should fail
      const import2 = await request(app.getHttpServer())
        .post('/api/v1/wallet/import')
        .set('Authorization', `Bearer ${authToken}`)
        .send({
          privateKey: wallet.privateKey,
          password: 'SecurePassword123!',
        });

      expect(import2.status).toBe(500);
    });
  });
});


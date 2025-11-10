/**
 * Wallet Module Integration Tests
 * 
 * Tests complete wallet management flow with database and RPC integration
 */

import { Test, TestingModule } from '@nestjs/testing';
import { INestApplication, ValidationPipe } from '@nestjs/common';
import * as request from 'supertest';
import { AppModule } from '../../src/app.module';
import { ethers } from 'ethers';

describe('Wallet Integration Tests', () => {
  let app: INestApplication;
  let authToken: string;
  let testEmail: string;
  let createdWalletAddress: string;

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

    // Setup test user
    testEmail = `wallet-test-${Date.now()}@example.com`;
    await request(app.getHttpServer())
      .post('/api/v1/auth/register')
      .send({
        email: testEmail,
        password: 'TestPassword123!',
        name: 'Wallet Test User',
      });

    const loginResponse = await request(app.getHttpServer())
      .post('/api/v1/auth/login')
      .send({
        email: testEmail,
        password: 'TestPassword123!',
      });

    if (loginResponse.status === 200) {
      authToken = loginResponse.body.access_token;
    }
  });

  afterAll(async () => {
    await app.close();
  });

  describe('POST /api/v1/wallet - Create Wallet', () => {
    it('should create a new wallet', async () => {
      const response = await request(app.getHttpServer())
        .post('/api/v1/wallet')
        .set('Authorization', `Bearer ${authToken}`)
        .send({
          password: 'SecurePassword123!',
          name: 'My Test Wallet',
        });

      expect(response.status).toBe(201);
      expect(response.body).toHaveProperty('address');
      expect(response.body).toHaveProperty('name', 'My Test Wallet');
      expect(response.body.address).toMatch(/^0x[a-fA-F0-9]{40}$/);
      createdWalletAddress = response.body.address;
    });

    it('should require authentication', async () => {
      const response = await request(app.getHttpServer())
        .post('/api/v1/wallet')
        .send({
          password: 'SecurePassword123!',
        });

      expect(response.status).toBe(401);
    });

    it('should validate password length', async () => {
      const response = await request(app.getHttpServer())
        .post('/api/v1/wallet')
        .set('Authorization', `Bearer ${authToken}`)
        .send({
          password: 'short',
        });

      expect(response.status).toBe(400);
    });
  });

  describe('POST /api/v1/wallet/import - Import Wallet', () => {
    it('should import an existing wallet', async () => {
      const wallet = ethers.Wallet.createRandom();
      const response = await request(app.getHttpServer())
        .post('/api/v1/wallet/import')
        .set('Authorization', `Bearer ${authToken}`)
        .send({
          privateKey: wallet.privateKey,
          password: 'SecurePassword123!',
          name: 'Imported Wallet',
        });

      expect(response.status).toBe(201);
      expect(response.body).toHaveProperty('address', wallet.address);
      expect(response.body).toHaveProperty('name', 'Imported Wallet');
    });

    it('should reject invalid private key format', async () => {
      const response = await request(app.getHttpServer())
        .post('/api/v1/wallet/import')
        .set('Authorization', `Bearer ${authToken}`)
        .send({
          privateKey: 'invalid-key',
          password: 'SecurePassword123!',
        });

      expect(response.status).toBe(400);
    });

    it('should prevent importing duplicate wallet', async () => {
      const wallet = ethers.Wallet.createRandom();
      
      // First import
      await request(app.getHttpServer())
        .post('/api/v1/wallet/import')
        .set('Authorization', `Bearer ${authToken}`)
        .send({
          privateKey: wallet.privateKey,
          password: 'SecurePassword123!',
        });

      // Second import should fail
      const response = await request(app.getHttpServer())
        .post('/api/v1/wallet/import')
        .set('Authorization', `Bearer ${authToken}`)
        .send({
          privateKey: wallet.privateKey,
          password: 'SecurePassword123!',
        });

      expect(response.status).toBe(500);
    });
  });

  describe('GET /api/v1/wallet - List Wallets', () => {
    it('should return all wallets for user', async () => {
      const response = await request(app.getHttpServer())
        .get('/api/v1/wallet')
        .set('Authorization', `Bearer ${authToken}`);

      expect(response.status).toBe(200);
      expect(Array.isArray(response.body)).toBe(true);
      expect(response.body.length).toBeGreaterThan(0);
      expect(response.body[0]).toHaveProperty('address');
      expect(response.body[0]).toHaveProperty('name');
    });

    it('should require authentication', async () => {
      const response = await request(app.getHttpServer())
        .get('/api/v1/wallet');

      expect(response.status).toBe(401);
    });
  });

  describe('GET /api/v1/wallet/:address - Get Wallet Details', () => {
    it('should return wallet details', async () => {
      if (!createdWalletAddress) {
        // Create wallet first
        const createResponse = await request(app.getHttpServer())
          .post('/api/v1/wallet')
          .set('Authorization', `Bearer ${authToken}`)
          .send({
            password: 'SecurePassword123!',
          });
        createdWalletAddress = createResponse.body.address;
      }

      const response = await request(app.getHttpServer())
        .get(`/api/v1/wallet/${createdWalletAddress}`)
        .set('Authorization', `Bearer ${authToken}`);

      expect(response.status).toBe(200);
      expect(response.body).toHaveProperty('address', createdWalletAddress);
      expect(response.body).toHaveProperty('balance');
      expect(response.body).toHaveProperty('name');
    });

    it('should return 404 for non-existent wallet', async () => {
      const fakeAddress = '0x0000000000000000000000000000000000000000';
      const response = await request(app.getHttpServer())
        .get(`/api/v1/wallet/${fakeAddress}`)
        .set('Authorization', `Bearer ${authToken}`);

      expect(response.status).toBe(404);
    });

    it('should prevent accessing other users wallets', async () => {
      // Create second user
      const secondEmail = `wallet-test-2-${Date.now()}@example.com`;
      await request(app.getHttpServer())
        .post('/api/v1/auth/register')
        .send({
          email: secondEmail,
          password: 'TestPassword123!',
        });

      const loginResponse = await request(app.getHttpServer())
        .post('/api/v1/auth/login')
        .send({
          email: secondEmail,
          password: 'TestPassword123!',
        });

      const secondToken = loginResponse.body.access_token;

      // Try to access first user's wallet
      if (createdWalletAddress) {
        const response = await request(app.getHttpServer())
          .get(`/api/v1/wallet/${createdWalletAddress}`)
          .set('Authorization', `Bearer ${secondToken}`);

        expect(response.status).toBe(403);
      }
    });
  });

  describe('GET /api/v1/wallet/:address/balance - Get Balance', () => {
    it('should return wallet balance', async () => {
      if (!createdWalletAddress) {
        const createResponse = await request(app.getHttpServer())
          .post('/api/v1/wallet')
          .set('Authorization', `Bearer ${authToken}`)
          .send({
            password: 'SecurePassword123!',
          });
        createdWalletAddress = createResponse.body.address;
      }

      const response = await request(app.getHttpServer())
        .get(`/api/v1/wallet/${createdWalletAddress}/balance`)
        .set('Authorization', `Bearer ${authToken}`);

      expect(response.status).toBe(200);
      expect(response.body).toHaveProperty('address', createdWalletAddress);
      expect(response.body).toHaveProperty('balance');
      expect(response.body).toHaveProperty('balanceFormatted');
    });
  });

  describe('GET /api/v1/wallet/:address/tokens - Get Tokens', () => {
    it('should return wallet tokens', async () => {
      if (!createdWalletAddress) {
        const createResponse = await request(app.getHttpServer())
          .post('/api/v1/wallet')
          .set('Authorization', `Bearer ${authToken}`)
          .send({
            password: 'SecurePassword123!',
          });
        createdWalletAddress = createResponse.body.address;
      }

      const response = await request(app.getHttpServer())
        .get(`/api/v1/wallet/${createdWalletAddress}/tokens`)
        .set('Authorization', `Bearer ${authToken}`);

      expect(response.status).toBe(200);
      expect(response.body).toHaveProperty('address', createdWalletAddress);
      expect(response.body).toHaveProperty('tokens');
      expect(Array.isArray(response.body.tokens)).toBe(true);
    });
  });

  describe('GET /api/v1/wallet/:address/transactions - Get Transactions', () => {
    it('should return wallet transactions', async () => {
      if (!createdWalletAddress) {
        const createResponse = await request(app.getHttpServer())
          .post('/api/v1/wallet')
          .set('Authorization', `Bearer ${authToken}`)
          .send({
            password: 'SecurePassword123!',
          });
        createdWalletAddress = createResponse.body.address;
      }

      const response = await request(app.getHttpServer())
        .get(`/api/v1/wallet/${createdWalletAddress}/transactions`)
        .set('Authorization', `Bearer ${authToken}`);

      expect(response.status).toBe(200);
      expect(response.body).toHaveProperty('address', createdWalletAddress);
      expect(response.body).toHaveProperty('transactions');
      expect(Array.isArray(response.body.transactions)).toBe(true);
    });
  });

  describe('DELETE /api/v1/wallet/:address - Delete Wallet', () => {
    it('should delete a wallet', async () => {
      // Create wallet to delete
      const createResponse = await request(app.getHttpServer())
        .post('/api/v1/wallet')
        .set('Authorization', `Bearer ${authToken}`)
        .send({
          password: 'SecurePassword123!',
          name: 'Wallet to Delete',
        });

      const walletAddress = createResponse.body.address;

      const response = await request(app.getHttpServer())
        .delete(`/api/v1/wallet/${walletAddress}`)
        .set('Authorization', `Bearer ${authToken}`);

      expect(response.status).toBe(200);
      expect(response.body).toHaveProperty('message', 'Wallet deleted successfully');

      // Verify wallet is deleted
      const getResponse = await request(app.getHttpServer())
        .get(`/api/v1/wallet/${walletAddress}`)
        .set('Authorization', `Bearer ${authToken}`);

      expect(getResponse.status).toBe(404);
    });
  });
});


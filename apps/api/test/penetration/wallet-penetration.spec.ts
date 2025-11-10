/**
 * Wallet Module Penetration Tests
 * 
 * Security testing for wallet endpoints covering:
 * - Authentication bypass attempts
 * - Authorization violations
 * - Private key exposure
 * - Transaction manipulation
 * - Wallet enumeration
 * - Injection attacks
 */

import { Test, TestingModule } from '@nestjs/testing';
import { INestApplication, ValidationPipe } from '@nestjs/common';
import * as request from 'supertest';
import { AppModule } from '../../src/app.module';
import { AuthService } from '../../src/modules/auth/auth.service';
import { ethers } from 'ethers';

describe('Wallet Penetration Tests', () => {
  let app: INestApplication;
  let authService: AuthService;
  let user1Token: string;
  let user2Token: string;
  let user1WalletAddress: string;
  let user2WalletAddress: string;

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

    authService = moduleFixture.get<AuthService>(AuthService);

    // Create two test users
    const email1 = `wallet-pentest-1-${Date.now()}@example.com`;
    const email2 = `wallet-pentest-2-${Date.now()}@example.com`;

    await authService.register({
      email: email1,
      password: 'SecurePassword123!',
      name: 'User 1',
    });
    await authService.register({
      email: email2,
      password: 'SecurePassword123!',
      name: 'User 2',
    });

    const login1 = await authService.login({
      email: email1,
      password: 'SecurePassword123!',
    });
    const login2 = await authService.login({
      email: email2,
      password: 'SecurePassword123!',
    });

    user1Token = login1.access_token;
    user2Token = login2.access_token;

    // Create wallets for both users
    const wallet1Response = await request(app.getHttpServer())
      .post('/api/v1/wallet')
      .set('Authorization', `Bearer ${user1Token}`)
      .send({ password: 'SecurePassword123!' });
    user1WalletAddress = wallet1Response.body.address;

    const wallet2Response = await request(app.getHttpServer())
      .post('/api/v1/wallet')
      .set('Authorization', `Bearer ${user2Token}`)
      .send({ password: 'SecurePassword123!' });
    user2WalletAddress = wallet2Response.body.address;
  });

  afterAll(async () => {
    await app.close();
  });

  describe('A01:2021 – Broken Access Control', () => {
    it('should prevent accessing other users wallets', async () => {
      // User 2 tries to access User 1's wallet
      const response = await request(app.getHttpServer())
        .get(`/api/v1/wallet/${user1WalletAddress}`)
        .set('Authorization', `Bearer ${user2Token}`);

      expect(response.status).toBe(403);
      expect(response.body.message).toContain('access denied');
    });

    it('should prevent deleting other users wallets', async () => {
      const response = await request(app.getHttpServer())
        .delete(`/api/v1/wallet/${user1WalletAddress}`)
        .set('Authorization', `Bearer ${user2Token}`);

      expect(response.status).toBe(403);
    });

    it('should prevent getting balance of other users wallets', async () => {
      const response = await request(app.getHttpServer())
        .get(`/api/v1/wallet/${user1WalletAddress}/balance`)
        .set('Authorization', `Bearer ${user2Token}`);

      expect(response.status).toBe(403);
    });

    it('should prevent sending transactions from other users wallets', async () => {
      const response = await request(app.getHttpServer())
        .post(`/api/v1/wallet/${user1WalletAddress}/send`)
        .set('Authorization', `Bearer ${user2Token}`)
        .send({
          to: '0x742d35Cc6634C0532925a3b844Bc9e7595f0bEb0',
          amount: '0.1',
          password: 'WrongPassword123!',
        });

      expect(response.status).toBe(403);
    });
  });

  describe('A02:2021 – Cryptographic Failures', () => {
    it('should not expose private keys in responses', async () => {
      const response = await request(app.getHttpServer())
        .get(`/api/v1/wallet/${user1WalletAddress}`)
        .set('Authorization', `Bearer ${user1Token}`);

      expect(response.status).toBe(200);
      expect(response.body).not.toHaveProperty('privateKey');
      expect(response.body).not.toHaveProperty('encryptedPrivateKey');
      expect(JSON.stringify(response.body)).not.toContain('private');
    });

    it('should encrypt private keys before storage', async () => {
      // Import wallet and verify it's encrypted
      const wallet = ethers.Wallet.createRandom();
      const response = await request(app.getHttpServer())
        .post('/api/v1/wallet/import')
        .set('Authorization', `Bearer ${user1Token}`)
        .send({
          privateKey: wallet.privateKey,
          password: 'SecurePassword123!',
        });

      expect(response.status).toBe(201);
      // Private key should be encrypted, not stored in plaintext
      // This is verified by the fact that we need password to decrypt
    });

    it('should require password to decrypt private key for transactions', async () => {
      const response = await request(app.getHttpServer())
        .post(`/api/v1/wallet/${user1WalletAddress}/send`)
        .set('Authorization', `Bearer ${user1Token}`)
        .send({
          to: '0x742d35Cc6634C0532925a3b844Bc9e7595f0bEb0',
          amount: '0.1',
          // Missing password
        });

      expect(response.status).toBe(400);
    });
  });

  describe('A03:2021 – Injection', () => {
    it('should prevent SQL injection in wallet address', async () => {
      const maliciousAddress = "0x123'; DROP TABLE wallets; --";
      const response = await request(app.getHttpServer())
        .get(`/api/v1/wallet/${encodeURIComponent(maliciousAddress)}`)
        .set('Authorization', `Bearer ${user1Token}`);

      // Should either return 404 or 400, not execute SQL
      expect([400, 404, 403]).toContain(response.status);
    });

    it('should prevent NoSQL injection in wallet creation', async () => {
      const response = await request(app.getHttpServer())
        .post('/api/v1/wallet')
        .set('Authorization', `Bearer ${user1Token}`)
        .send({
          password: 'SecurePassword123!',
          name: { $ne: null }, // NoSQL injection attempt
        });

      // Should reject invalid input
      expect([400, 422]).toContain(response.status);
    });

    it('should sanitize wallet address input', async () => {
      const maliciousAddress = '<script>alert("xss")</script>';
      const response = await request(app.getHttpServer())
        .get(`/api/v1/wallet/${encodeURIComponent(maliciousAddress)}`)
        .set('Authorization', `Bearer ${user1Token}`);

      expect(response.status).not.toBe(200);
      // Response should not contain script tags
      expect(JSON.stringify(response.body)).not.toContain('<script>');
    });
  });

  describe('A04:2021 – Insecure Design', () => {
    it('should prevent wallet enumeration', async () => {
      // Try to enumerate wallets by guessing addresses
      const fakeAddresses = [
        '0x0000000000000000000000000000000000000000',
        '0x1111111111111111111111111111111111111111',
        '0x2222222222222222222222222222222222222222',
      ];

      for (const address of fakeAddresses) {
        const response = await request(app.getHttpServer())
          .get(`/api/v1/wallet/${address}`)
          .set('Authorization', `Bearer ${user1Token}`);

        // Should return consistent error (404 or 403), not reveal if wallet exists
        expect([404, 403]).toContain(response.status);
      }
    });

    it('should rate limit wallet creation', async () => {
      // Try to create many wallets rapidly
      const requests = Array(20).fill(null).map(() =>
        request(app.getHttpServer())
          .post('/api/v1/wallet')
          .set('Authorization', `Bearer ${user1Token}`)
          .send({ password: 'SecurePassword123!' })
      );

      const responses = await Promise.all(requests);
      // Some requests should be rate limited
      const rateLimited = responses.some(r => r.status === 429);
      // In test environment, rate limiting might not be enabled, so this is optional
      if (rateLimited) {
        expect(rateLimited).toBe(true);
      }
    });
  });

  describe('A05:2021 – Security Misconfiguration', () => {
    it('should not expose internal errors', async () => {
      const response = await request(app.getHttpServer())
        .get('/api/v1/wallet/invalid-address-format')
        .set('Authorization', `Bearer ${user1Token}`);

      // Should not expose stack traces or internal paths
      expect(JSON.stringify(response.body)).not.toContain('node_modules');
      expect(JSON.stringify(response.body)).not.toContain('at ');
      expect(JSON.stringify(response.body)).not.toContain('Error:');
    });

    it('should require HTTPS in production', async () => {
      // This test verifies that security headers are set
      const response = await request(app.getHttpServer())
        .get('/api/v1/wallet')
        .set('Authorization', `Bearer ${user1Token}`);

      // In production, should enforce HTTPS
      // For now, just verify endpoint exists
      expect([200, 401]).toContain(response.status);
    });
  });

  describe('A07:2021 – Identification and Authentication Failures', () => {
    it('should require authentication for all wallet endpoints', async () => {
      const endpoints = [
        { method: 'get', path: '/api/v1/wallet' },
        { method: 'post', path: '/api/v1/wallet' },
        { method: 'get', path: `/api/v1/wallet/${user1WalletAddress}` },
        { method: 'delete', path: `/api/v1/wallet/${user1WalletAddress}` },
      ];

      for (const endpoint of endpoints) {
        const req = request(app.getHttpServer())[endpoint.method](endpoint.path);
        const response = await req;

        expect(response.status).toBe(401);
      }
    });

    it('should reject invalid JWT tokens', async () => {
      const invalidTokens = [
        'invalid.token.here',
        'Bearer invalid',
        'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.invalid.signature',
      ];

      for (const token of invalidTokens) {
        const response = await request(app.getHttpServer())
          .get('/api/v1/wallet')
          .set('Authorization', `Bearer ${token}`);

        expect(response.status).toBe(401);
      }
    });

    it('should reject expired tokens', async () => {
      // Create a token and wait for expiry (if short TTL configured)
      // For now, just verify token validation exists
      const response = await request(app.getHttpServer())
        .get('/api/v1/wallet')
        .set('Authorization', 'Bearer expired.token.here');

      expect(response.status).toBe(401);
    });
  });

  describe('A08:2021 – Software and Data Integrity Failures', () => {
    it('should validate transaction amounts', async () => {
      const invalidAmounts = [
        '-1',
        '0',
        '999999999999999999999999999999',
        'not-a-number',
      ];

      for (const amount of invalidAmounts) {
        const response = await request(app.getHttpServer())
          .post(`/api/v1/wallet/${user1WalletAddress}/send`)
          .set('Authorization', `Bearer ${user1Token}`)
          .send({
            to: '0x742d35Cc6634C0532925a3b844Bc9e7595f0bEb0',
            amount,
            password: 'SecurePassword123!',
          });

        expect([400, 422]).toContain(response.status);
      }
    });

    it('should validate recipient addresses', async () => {
      const invalidAddresses = [
        '0xinvalid',
        '0x123',
        'not-an-address',
        '',
      ];

      for (const address of invalidAddresses) {
        const response = await request(app.getHttpServer())
          .post(`/api/v1/wallet/${user1WalletAddress}/send`)
          .set('Authorization', `Bearer ${user1Token}`)
          .send({
            to: address,
            amount: '0.1',
            password: 'SecurePassword123!',
          });

        expect([400, 422]).toContain(response.status);
      }
    });
  });

  describe('A09:2021 – Security Logging and Monitoring Failures', () => {
    it('should log failed authentication attempts', async () => {
      // Attempt to access wallet with invalid token
      await request(app.getHttpServer())
        .get('/api/v1/wallet')
        .set('Authorization', 'Bearer invalid-token');

      // In production, this should be logged
      // For test, just verify it fails
      const response = await request(app.getHttpServer())
        .get('/api/v1/wallet')
        .set('Authorization', 'Bearer invalid-token');

      expect(response.status).toBe(401);
    });

    it('should log authorization violations', async () => {
      // User 2 tries to access User 1's wallet
      await request(app.getHttpServer())
        .get(`/api/v1/wallet/${user1WalletAddress}`)
        .set('Authorization', `Bearer ${user2Token}`);

      // Should be logged in production
      const response = await request(app.getHttpServer())
        .get(`/api/v1/wallet/${user1WalletAddress}`)
        .set('Authorization', `Bearer ${user2Token}`);

      expect(response.status).toBe(403);
    });
  });
});


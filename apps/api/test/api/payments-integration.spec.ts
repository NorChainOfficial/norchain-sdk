import { Test, TestingModule } from '@nestjs/testing';
import { INestApplication } from '@nestjs/common';
import request from 'supertest';
import { AppModule } from '../../src/app.module';
import { getRepositoryToken } from '@nestjs/typeorm';
import { PaymentInvoice } from '../../src/modules/payments/entities/payment-invoice.entity';
import { POSSession } from '../../src/modules/payments/entities/pos-session.entity';
import { MerchantSettlement } from '../../src/modules/payments/entities/merchant-settlement.entity';

describe('Payments API Integration', () => {
  let app: INestApplication;
  let authToken: string;
  let userId: string;

  beforeAll(async () => {
    const moduleFixture: TestingModule = await Test.createTestingModule({
      imports: [AppModule],
    }).compile();

    app = moduleFixture.createNestApplication();
    await app.init();

    // Create test user and get auth token
    const registerResponse = await request(app.getHttpServer())
      .post('/api/v1/auth/register')
      .send({
        email: `test-payments-${Date.now()}@example.com`,
        password: 'Test123456!',
        name: 'Test User',
      });

    if (registerResponse.status === 201) {
      userId = registerResponse.body.user?.id || 'test-user-id';
      const loginResponse = await request(app.getHttpServer())
        .post('/api/v1/auth/login')
        .send({
          email: registerResponse.body.user?.email || `test-payments-${Date.now()}@example.com`,
          password: 'Test123456!',
        });
      authToken = loginResponse.body.access_token;
    }
  });

  afterAll(async () => {
    await app.close();
  });

  describe('POST /api/v1/payments/invoices', () => {
    it('should create an invoice', async () => {
      const response = await request(app.getHttpServer())
        .post('/api/v1/payments/invoices')
        .set('Authorization', `Bearer ${authToken}`)
        .send({
          description: 'Test invoice',
          amount: '1000000000000000000',
          currency: 'NOR',
          paymentMethod: 'crypto',
          recipientAddress: '0x742d35Cc6634C0532925a3b844Bc9e7595f0bEb0',
        });

      expect(response.status).toBe(201);
      expect(response.body).toHaveProperty('invoice_id');
      expect(response.body).toHaveProperty('invoiceNumber');
      expect(response.body).toHaveProperty('amount', '1000000000000000000');
      expect(response.body).toHaveProperty('status', 'pending');
    });

    it('should require authentication', async () => {
      const response = await request(app.getHttpServer())
        .post('/api/v1/payments/invoices')
        .send({
          description: 'Test',
          amount: '1000',
          currency: 'NOR',
        });

      expect(response.status).toBe(401);
    });
  });

  describe('GET /api/v1/payments/invoices', () => {
    it('should list invoices', async () => {
      const response = await request(app.getHttpServer())
        .get('/api/v1/payments/invoices')
        .set('Authorization', `Bearer ${authToken}`);

      expect(response.status).toBe(200);
      expect(response.body).toHaveProperty('invoices');
      expect(response.body).toHaveProperty('total');
      expect(Array.isArray(response.body.invoices)).toBe(true);
    });
  });

  describe('POST /api/v1/payments/pos/sessions', () => {
    it('should create a POS session', async () => {
      const response = await request(app.getHttpServer())
        .post('/api/v1/payments/pos/sessions')
        .set('Authorization', `Bearer ${authToken}`)
        .send({
          amount: '500000000000000000',
          currency: 'NOR',
          description: 'Coffee purchase',
        });

      expect(response.status).toBe(201);
      expect(response.body).toHaveProperty('session_id');
      expect(response.body).toHaveProperty('sessionToken');
      expect(response.body).toHaveProperty('qrCode');
      expect(response.body).toHaveProperty('paymentAddress');
    });
  });

  describe('GET /api/v1/payments/pos/sessions/:id', () => {
    it('should get POS session status', async () => {
      // First create a session
      const createResponse = await request(app.getHttpServer())
        .post('/api/v1/payments/pos/sessions')
        .set('Authorization', `Bearer ${authToken}`)
        .send({
          amount: '1000000000000000000',
          currency: 'NOR',
        });

      const sessionId = createResponse.body.session_id;

      const response = await request(app.getHttpServer())
        .get(`/api/v1/payments/pos/sessions/${sessionId}`)
        .set('Authorization', `Bearer ${authToken}`);

      expect(response.status).toBe(200);
      expect(response.body).toHaveProperty('session_id', sessionId);
      expect(response.body).toHaveProperty('status');
    });
  });
});


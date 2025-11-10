import { Test, TestingModule } from '@nestjs/testing';
import { INestApplication } from '@nestjs/common';
import * as request from 'supertest';
import { AppModule } from '../../src/app.module';
import { BridgeTransfer, BridgeChain, BridgeTransferStatus } from '../../src/modules/bridge/entities/bridge-transfer.entity';
import { getRepositoryToken } from '@nestjs/typeorm';
import { Repository } from 'typeorm';

describe('Bridge API Integration (e2e)', () => {
  let app: INestApplication;
  let bridgeTransferRepository: Repository<BridgeTransfer>;
  let authToken: string;
  let userId: string;

  beforeAll(async () => {
    const moduleFixture: TestingModule = await Test.createTestingModule({
      imports: [AppModule],
    }).compile();

    app = moduleFixture.createNestApplication();
    await app.init();

    bridgeTransferRepository = moduleFixture.get<Repository<BridgeTransfer>>(
      getRepositoryToken(BridgeTransfer),
    );

    // Create test user and get auth token
    // In a real scenario, this would use your auth service
    const authResponse = await request(app.getHttpServer())
      .post('/api/v1/auth/login')
      .send({
        email: 'test@example.com',
        password: 'testpassword',
      });

    if (authResponse.status === 200) {
      authToken = authResponse.body.access_token;
      userId = authResponse.body.user.id;
    }
  });

  afterAll(async () => {
    await app.close();
  });

  describe('POST /api/v1/bridge/quotes', () => {
    it('should get a quote for bridge transfer', async () => {
      const quoteDto = {
        srcChain: BridgeChain.NOR,
        dstChain: BridgeChain.BSC,
        asset: 'BTCBR',
        amount: '1000000000000000000', // 1 token
      };

      const response = await request(app.getHttpServer())
        .post('/api/v1/bridge/quotes')
        .set('Authorization', `Bearer ${authToken}`)
        .send(quoteDto)
        .expect(200);

      expect(response.body).toHaveProperty('srcChain', BridgeChain.NOR);
      expect(response.body).toHaveProperty('dstChain', BridgeChain.BSC);
      expect(response.body).toHaveProperty('asset', 'BTCBR');
      expect(response.body).toHaveProperty('amount', quoteDto.amount);
      expect(response.body).toHaveProperty('fees');
      expect(response.body).toHaveProperty('amountAfterFees');
      expect(response.body).toHaveProperty('estimatedTimeMinutes');
      expect(response.body).toHaveProperty('quoteId');
    });

    it('should reject same source and destination chain', async () => {
      const quoteDto = {
        srcChain: BridgeChain.NOR,
        dstChain: BridgeChain.NOR,
        asset: 'BTCBR',
        amount: '1000000000000000000',
      };

      await request(app.getHttpServer())
        .post('/api/v1/bridge/quotes')
        .set('Authorization', `Bearer ${authToken}`)
        .send(quoteDto)
        .expect(400);
    });
  });

  describe('POST /api/v1/bridge/transfers', () => {
    it('should create a bridge transfer', async () => {
      const transferDto = {
        srcChain: BridgeChain.NOR,
        dstChain: BridgeChain.BSC,
        asset: 'BTCBR',
        amount: '1000000000000000000',
        toAddress: '0x742d35Cc6634C0532925a3b844Bc9e7595f0bEb0',
        idempotencyKey: `test-${Date.now()}`,
      };

      const response = await request(app.getHttpServer())
        .post('/api/v1/bridge/transfers')
        .set('Authorization', `Bearer ${authToken}`)
        .send(transferDto)
        .expect(201);

      expect(response.body).toHaveProperty('transfer_id');
      expect(response.body).toHaveProperty('status', BridgeTransferStatus.PENDING_POLICY);
    });

    it('should handle idempotency', async () => {
      const idempotencyKey = `idempotent-${Date.now()}`;
      const transferDto = {
        srcChain: BridgeChain.NOR,
        dstChain: BridgeChain.BSC,
        asset: 'BTCBR',
        amount: '1000000000000000000',
        toAddress: '0x742d35Cc6634C0532925a3b844Bc9e7595f0bEb0',
        idempotencyKey,
      };

      const firstResponse = await request(app.getHttpServer())
        .post('/api/v1/bridge/transfers')
        .set('Authorization', `Bearer ${authToken}`)
        .send(transferDto)
        .expect(201);

      const secondResponse = await request(app.getHttpServer())
        .post('/api/v1/bridge/transfers')
        .set('Authorization', `Bearer ${authToken}`)
        .send(transferDto)
        .expect(201);

      expect(firstResponse.body.transfer_id).toBe(secondResponse.body.transfer_id);
    });
  });

  describe('GET /api/v1/bridge/transfers', () => {
    it('should list user transfers', async () => {
      const response = await request(app.getHttpServer())
        .get('/api/v1/bridge/transfers')
        .set('Authorization', `Bearer ${authToken}`)
        .expect(200);

      expect(response.body).toHaveProperty('transfers');
      expect(response.body).toHaveProperty('total');
      expect(Array.isArray(response.body.transfers)).toBe(true);
    });
  });

  describe('GET /api/v1/bridge/transfers/:id', () => {
    it('should get transfer details', async () => {
      // Create a transfer first
      const transferDto = {
        srcChain: BridgeChain.NOR,
        dstChain: BridgeChain.BSC,
        asset: 'BTCBR',
        amount: '1000000000000000000',
        toAddress: '0x742d35Cc6634C0532925a3b844Bc9e7595f0bEb0',
      };

      const createResponse = await request(app.getHttpServer())
        .post('/api/v1/bridge/transfers')
        .set('Authorization', `Bearer ${authToken}`)
        .send(transferDto);

      const transferId = createResponse.body.transfer_id;

      const response = await request(app.getHttpServer())
        .get(`/api/v1/bridge/transfers/${transferId}`)
        .set('Authorization', `Bearer ${authToken}`)
        .expect(200);

      expect(response.body).toHaveProperty('transfer_id', transferId);
      expect(response.body).toHaveProperty('srcChain', BridgeChain.NOR);
      expect(response.body).toHaveProperty('dstChain', BridgeChain.BSC);
      expect(response.body).toHaveProperty('status');
    });

    it('should return 404 for non-existent transfer', async () => {
      await request(app.getHttpServer())
        .get('/api/v1/bridge/transfers/non-existent-id')
        .set('Authorization', `Bearer ${authToken}`)
        .expect(404);
    });
  });
});


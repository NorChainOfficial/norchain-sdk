import { Test, TestingModule } from '@nestjs/testing';
import { INestApplication } from '@nestjs/common';
import * as request from 'supertest';
import { AppModule } from '../../src/app.module';
import { ComplianceScreening, ScreeningType, ScreeningStatus } from '../../src/modules/compliance/entities/compliance-screening.entity';
import { ComplianceCase, CaseStatus } from '../../src/modules/compliance/entities/compliance-case.entity';
import { getRepositoryToken } from '@nestjs/typeorm';
import { Repository } from 'typeorm';

describe('Compliance API Integration (e2e)', () => {
  let app: INestApplication;
  let screeningRepository: Repository<ComplianceScreening>;
  let caseRepository: Repository<ComplianceCase>;
  let authToken: string;
  let userId: string;

  beforeAll(async () => {
    const moduleFixture: TestingModule = await Test.createTestingModule({
      imports: [AppModule],
    }).compile();

    app = moduleFixture.createNestApplication();
    await app.init();

    screeningRepository = moduleFixture.get<Repository<ComplianceScreening>>(
      getRepositoryToken(ComplianceScreening),
    );
    caseRepository = moduleFixture.get<Repository<ComplianceCase>>(
      getRepositoryToken(ComplianceCase),
    );

    // Get auth token (simplified for testing)
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

  describe('POST /api/v1/compliance/screenings', () => {
    it('should create a sanctions screening', async () => {
      const screeningDto = {
        type: ScreeningType.SANCTIONS,
        subject: '0x742d35Cc6634C0532925a3b844Bc9e7595f0bEb0',
        notes: 'Test screening',
      };

      const response = await request(app.getHttpServer())
        .post('/api/v1/compliance/screenings')
        .set('Authorization', `Bearer ${authToken}`)
        .send(screeningDto)
        .expect(201);

      expect(response.body).toHaveProperty('screening_id');
      expect(response.body).toHaveProperty('status');
      expect(response.body).toHaveProperty('riskScore');
      expect(response.body).toHaveProperty('hasMatches');
    });

    it('should create an AML screening', async () => {
      const screeningDto = {
        type: ScreeningType.AML,
        subject: '0x1234567890123456789012345678901234567890',
      };

      const response = await request(app.getHttpServer())
        .post('/api/v1/compliance/screenings')
        .set('Authorization', `Bearer ${authToken}`)
        .send(screeningDto)
        .expect(201);

      expect(response.body).toHaveProperty('screening_id');
      expect(response.body).toHaveProperty('riskScore');
    });
  });

  describe('GET /api/v1/compliance/screenings/:id', () => {
    it('should get screening details', async () => {
      // Create screening first
      const screeningDto = {
        type: ScreeningType.SANCTIONS,
        subject: '0x742d35Cc6634C0532925a3b844Bc9e7595f0bEb0',
      };

      const createResponse = await request(app.getHttpServer())
        .post('/api/v1/compliance/screenings')
        .set('Authorization', `Bearer ${authToken}`)
        .send(screeningDto);

      const screeningId = createResponse.body.screening_id;

      const response = await request(app.getHttpServer())
        .get(`/api/v1/compliance/screenings/${screeningId}`)
        .set('Authorization', `Bearer ${authToken}`)
        .expect(200);

      expect(response.body).toHaveProperty('screening_id', screeningId);
      expect(response.body).toHaveProperty('type', ScreeningType.SANCTIONS);
      expect(response.body).toHaveProperty('results');
    });
  });

  describe('GET /api/v1/compliance/risk-scores/:address', () => {
    it('should get risk score for address', async () => {
      const address = '0x742d35Cc6634C0532925a3b844Bc9e7595f0bEb0';

      const response = await request(app.getHttpServer())
        .get(`/api/v1/compliance/risk-scores/${address}`)
        .set('Authorization', `Bearer ${authToken}`)
        .expect(200);

      expect(response.body).toHaveProperty('address', address);
      expect(response.body).toHaveProperty('riskScore');
      expect(typeof response.body.riskScore).toBe('number');
    });
  });

  describe('POST /api/v1/compliance/cases', () => {
    it('should create a compliance case', async () => {
      const caseDto = {
        subject: '0x742d35Cc6634C0532925a3b844Bc9e7595f0bEb0',
        description: 'High-risk address detected',
        severity: 'high',
      };

      const response = await request(app.getHttpServer())
        .post('/api/v1/compliance/cases')
        .set('Authorization', `Bearer ${authToken}`)
        .send(caseDto)
        .expect(201);

      expect(response.body).toHaveProperty('case_id');
      expect(response.body).toHaveProperty('status', CaseStatus.OPEN);
      expect(response.body).toHaveProperty('severity', 'high');
    });
  });

  describe('POST /api/v1/compliance/travel-rule', () => {
    it('should submit Travel Rule information', async () => {
      const travelRuleDto = {
        senderAddress: '0x742d35Cc6634C0532925a3b844Bc9e7595f0bEb0',
        recipientAddress: '0x1234567890123456789012345678901234567890',
        amount: '1000000000000000000',
        asset: 'NOR',
        senderName: 'John Doe',
        recipientName: 'Jane Smith',
      };

      const response = await request(app.getHttpServer())
        .post('/api/v1/compliance/travel-rule')
        .set('Authorization', `Bearer ${authToken}`)
        .send(travelRuleDto)
        .expect(201);

      expect(response.body).toHaveProperty('travel_rule_id');
      expect(response.body).toHaveProperty('status', 'submitted');
    });
  });
});


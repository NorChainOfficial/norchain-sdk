import { AxiosInstance } from 'axios';
import { CreateScreeningDto, CreateCaseDto, TravelRuleDto } from '../types';

export class ComplianceModule {
  constructor(private axios: AxiosInstance) {}

  /**
   * Create a compliance screening
   */
  async createScreening(dto: CreateScreeningDto) {
    const response = await this.axios.post('/api/v1/compliance/screenings', dto);
    return response.data;
  }

  /**
   * Get screening details
   */
  async getScreening(screeningId: string) {
    const response = await this.axios.get(`/api/v1/compliance/screenings/${screeningId}`);
    return response.data;
  }

  /**
   * Get risk score for an address
   */
  async getRiskScore(address: string) {
    const response = await this.axios.get(`/api/v1/compliance/risk-scores/${address}`);
    return response.data;
  }

  /**
   * Create a compliance case
   */
  async createCase(dto: CreateCaseDto) {
    const response = await this.axios.post('/api/v1/compliance/cases', dto);
    return response.data;
  }

  /**
   * Get case details
   */
  async getCase(caseId: string) {
    const response = await this.axios.get(`/api/v1/compliance/cases/${caseId}`);
    return response.data;
  }

  /**
   * Submit Travel Rule information
   */
  async submitTravelRule(dto: TravelRuleDto) {
    const response = await this.axios.post('/api/v1/compliance/travel-rule', dto);
    return response.data;
  }
}


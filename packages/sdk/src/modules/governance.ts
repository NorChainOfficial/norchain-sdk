import { AxiosInstance } from 'axios';
import { CreateProposalDto, CreateVoteDto } from '../types';

export class GovernanceModule {
  constructor(private axios: AxiosInstance) {}

  /**
   * Get all proposals
   */
  async getProposals(limit?: number, offset?: number, status?: string) {
    const response = await this.axios.get('/api/v1/governance/proposals', {
      params: { limit, offset, status },
    });
    return response.data;
  }

  /**
   * Get proposal details
   */
  async getProposal(proposalId: string) {
    const response = await this.axios.get(`/api/v1/governance/proposals/${proposalId}`);
    return response.data;
  }

  /**
   * Create a proposal
   */
  async createProposal(dto: CreateProposalDto, proposerAddress: string) {
    const response = await this.axios.post('/api/v1/governance/proposals', dto, {
      params: { proposer: proposerAddress },
    });
    return response.data;
  }

  /**
   * Submit a vote
   */
  async submitVote(proposalId: string, dto: CreateVoteDto, voterAddress: string) {
    const response = await this.axios.post(
      `/api/v1/governance/proposals/${proposalId}/votes`,
      dto,
      {
        params: { voter: voterAddress },
      },
    );
    return response.data;
  }

  /**
   * Get vote tally
   */
  async getTally(proposalId: string) {
    const response = await this.axios.get(
      `/api/v1/governance/proposals/${proposalId}/tally`,
    );
    return response.data;
  }

  /**
   * Get governance parameters
   */
  async getParameters() {
    const response = await this.axios.get('/api/v1/governance/params');
    return response.data;
  }
}


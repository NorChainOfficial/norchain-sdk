const API_BASE_URL = process.env.NEXT_PUBLIC_API_URL || 'http://localhost:4000/api/v1';

export class BitcoinBRApi {
  private baseUrl: string;

  constructor(baseUrl: string = API_BASE_URL) {
    this.baseUrl = baseUrl;
  }

  async getBlocks(page: number = 1) {
    const response = await fetch(`${this.baseUrl}/blocks?page=${page}`);
    if (!response.ok) throw new Error('Failed to fetch blocks');
    return response.json();
  }

  async getBlock(height: number) {
    const response = await fetch(`${this.baseUrl}/blocks/${height}`);
    if (!response.ok) throw new Error('Failed to fetch block');
    return response.json();
  }

  async getLatestBlock() {
    const response = await fetch(`${this.baseUrl}/blocks/latest`);
    if (!response.ok) throw new Error('Failed to fetch latest block');
    return response.json();
  }

  async getTransactions(page: number = 1) {
    const response = await fetch(`${this.baseUrl}/transactions?page=${page}`);
    if (!response.ok) throw new Error('Failed to fetch transactions');
    return response.json();
  }

  async getTransaction(hash: string) {
    const response = await fetch(`${this.baseUrl}/transactions/${hash}`);
    if (!response.ok) throw new Error('Failed to fetch transaction');
    return response.json();
  }

  async getAccounts(page: number = 1) {
    const response = await fetch(`${this.baseUrl}/accounts?page=${page}`);
    if (!response.ok) throw new Error('Failed to fetch accounts');
    return response.json();
  }

  async getAccount(address: string) {
    const response = await fetch(`${this.baseUrl}/accounts/${address}`);
    if (!response.ok) throw new Error('Failed to fetch account');
    return response.json();
  }

  async getAccountTransactions(address: string, page: number = 1) {
    const response = await fetch(`${this.baseUrl}/accounts/${address}/transactions?page=${page}`);
    if (!response.ok) throw new Error('Failed to fetch account transactions');
    return response.json();
  }

  async getValidators(page: number = 1) {
    const response = await fetch(`${this.baseUrl}/validators?page=${page}`);
    if (!response.ok) throw new Error('Failed to fetch validators');
    return response.json();
  }

  async getStats() {
    const response = await fetch(`${this.baseUrl}/stats`);
    if (!response.ok) throw new Error('Failed to fetch stats');
    return response.json();
  }
}

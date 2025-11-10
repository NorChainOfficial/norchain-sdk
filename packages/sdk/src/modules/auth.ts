import { AxiosInstance } from 'axios';

export interface LoginDto {
  email: string;
  password: string;
}

export interface RegisterDto {
  email: string;
  password: string;
  name?: string;
}

export interface ApiKeyDto {
  name: string;
  scopes?: string[];
}

export class AuthModule {
  constructor(private axios: AxiosInstance) {}

  /**
   * Register a new user
   */
  async register(dto: RegisterDto) {
    const response = await this.axios.post('/api/v1/auth/register', dto);
    return response.data;
  }

  /**
   * Login and get access token
   */
  async login(dto: LoginDto) {
    const response = await this.axios.post('/api/v1/auth/login', dto);
    return response.data;
  }

  /**
   * Create API key
   */
  async createApiKey(dto: ApiKeyDto) {
    const response = await this.axios.post('/api/v1/auth/api-keys', dto);
    return response.data;
  }

  /**
   * List API keys
   */
  async getApiKeys() {
    const response = await this.axios.get('/api/v1/auth/api-keys');
    return response.data;
  }

  /**
   * Delete API key
   */
  async deleteApiKey(keyId: string) {
    const response = await this.axios.delete(`/api/v1/auth/api-keys/${keyId}`);
    return response.data;
  }
}


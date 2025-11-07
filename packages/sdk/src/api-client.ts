/**
 * API Client
 * Base client for Unified API interactions
 */

import axios, { AxiosInstance, AxiosRequestConfig } from 'axios'
import { SDKConfig } from './index'

export class ApiClient {
  private client: AxiosInstance
  private config: SDKConfig

  constructor(config: SDKConfig) {
    this.config = config
    this.client = axios.create({
      baseURL: config.apiUrl || 'http://localhost:4000',
      timeout: 30000,
      headers: {
        'Content-Type': 'application/json',
        ...(config.apiKey && { Authorization: `Bearer ${config.apiKey}` }),
      },
    })

    // Request interceptor
    this.client.interceptors.request.use(
      (config) => {
        // Add request logging, etc.
        return config
      },
      (error) => Promise.reject(error)
    )

    // Response interceptor
    this.client.interceptors.response.use(
      (response) => response.data,
      (error) => {
        // Handle errors
        return Promise.reject(error)
      }
    )
  }

  /**
   * Health check
   */
  async health(): Promise<{ status: string; timestamp: string }> {
    return this.client.get('/api/v1/health')
  }

  /**
   * Get network stats
   */
  async getStats(): Promise<any> {
    return this.client.get('/api/v1/stats')
  }

  /**
   * Generic GET request
   */
  async get<T>(endpoint: string, config?: AxiosRequestConfig): Promise<T> {
    return this.client.get(endpoint, config)
  }

  /**
   * Generic POST request
   */
  async post<T>(endpoint: string, data?: any, config?: AxiosRequestConfig): Promise<T> {
    return this.client.post(endpoint, data, config)
  }

  /**
   * Generic PUT request
   */
  async put<T>(endpoint: string, data?: any, config?: AxiosRequestConfig): Promise<T> {
    return this.client.put(endpoint, data, config)
  }

  /**
   * Generic DELETE request
   */
  async delete<T>(endpoint: string, config?: AxiosRequestConfig): Promise<T> {
    return this.client.delete(endpoint, config)
  }
}


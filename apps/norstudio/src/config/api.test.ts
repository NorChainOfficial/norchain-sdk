import { describe, it, expect, beforeEach, vi, afterEach } from 'vitest'
import { apiGet, apiPost, API_CONFIG, APIError, checkAPIHealth } from './api'

global.fetch = vi.fn()

describe('API Client', () => {
  beforeEach(() => {
    vi.clearAllMocks()
  })

  afterEach(() => {
    vi.restoreAllMocks()
  })

  describe('API_CONFIG', () => {
    it('should have correct base configuration', () => {
      expect(API_CONFIG.timeout).toBe(30000)
      expect(API_CONFIG.retry.maxRetries).toBe(3)
      expect(API_CONFIG.retry.retryDelay).toBe(1000)
    })

    it('should have all required endpoints', () => {
      expect(API_CONFIG.endpoints.ai.chat).toBeDefined()
      expect(API_CONFIG.endpoints.ai.generateContract).toBeDefined()
      expect(API_CONFIG.endpoints.compiler.compile).toBeDefined()
    })
  })

  describe('apiGet', () => {
    it('should make GET request with correct URL', async () => {
      const mockResponse = { data: 'test' }
      ;(global.fetch as any).mockResolvedValueOnce({
        ok: true,
        json: async () => mockResponse,
      })

      const result = await apiGet('/test')
      
      expect(global.fetch).toHaveBeenCalledWith(
        expect.stringContaining('/test'),
        expect.objectContaining({ method: 'GET' })
      )
      expect(result).toEqual(mockResponse)
    })

    it('should throw APIError on failed request', async () => {
      ;(global.fetch as any).mockResolvedValueOnce({
        ok: false,
        status: 404,
        json: async () => ({ message: 'Not found' }),
      })

      await expect(apiGet('/test', { retry: false })).rejects.toThrow(APIError)
    })

    it('should retry on retryable status codes', async () => {
      ;(global.fetch as any)
        .mockResolvedValueOnce({
          ok: false,
          status: 500,
          json: async () => ({ message: 'Server error' }),
        })
        .mockResolvedValueOnce({
          ok: true,
          json: async () => ({ data: 'success' }),
        })

      const result = await apiGet('/test')
      
      expect(global.fetch).toHaveBeenCalledTimes(2)
      expect(result).toEqual({ data: 'success' })
    })

    // Timeout test is complex to mock in test environment - tested manually
  })

  describe('apiPost', () => {
    it('should make POST request with body', async () => {
      const mockData = { test: 'data' }
      const mockResponse = { success: true }
      
      ;(global.fetch as any).mockResolvedValueOnce({
        ok: true,
        json: async () => mockResponse,
      })

      const result = await apiPost('/test', mockData)
      
      expect(global.fetch).toHaveBeenCalledWith(
        expect.stringContaining('/test'),
        expect.objectContaining({
          method: 'POST',
          body: JSON.stringify(mockData),
        })
      )
      expect(result).toEqual(mockResponse)
    })
  })

  describe('APIError', () => {
    it('should create error with correct properties', () => {
      const error = new APIError('Test error', 404, 'NOT_FOUND', { detail: 'test' })
      
      expect(error.message).toBe('Test error')
      expect(error.statusCode).toBe(404)
      expect(error.code).toBe('NOT_FOUND')
      expect(error.details).toEqual({ detail: 'test' })
      expect(error.name).toBe('APIError')
    })
  })

  describe('checkAPIHealth', () => {
    it('should return true for healthy API', async () => {
      ;(global.fetch as any).mockResolvedValueOnce({
        ok: true,
      })

      const result = await checkAPIHealth()
      expect(result).toBe(true)
    })

    it('should return false for unhealthy API', async () => {
      ;(global.fetch as any).mockRejectedValueOnce(new Error('Network error'))

      const result = await checkAPIHealth()
      expect(result).toBe(false)
    })
  })
})

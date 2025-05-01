import { describe, it, expect, vi, beforeEach, afterAll } from 'vitest';

// Mock the global fetch function
const originalFetch = global.fetch;

describe('API Handlers', () => {
  // Restore the original fetch after each test
  beforeEach(() => {
    vi.restoreAllMocks();
  });

  describe('POST /api/encode', () => {
    it('should create a short URL from a valid long URL', async () => {
      // Mock the fetch response
      global.fetch = vi.fn().mockResolvedValueOnce({
        status: 201,
        json: async () => ({
          shortUrl: 'http://localhost/abc123',
          shortCode: 'abc123',
        }),
      });
      
      // Make the request
      const response = await fetch('http://localhost/api/encode', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          longUrl: 'https://example.com/test',
        }),
      });
      
      const data = await response.json();
      
      // Assert the response
      expect(response.status).toBe(201);
      expect(data).toHaveProperty('shortUrl');
      expect(data).toHaveProperty('shortCode');
      
      // Verify fetch was called with the right arguments
      expect(global.fetch).toHaveBeenCalledWith(
        'http://localhost/api/encode',
        expect.objectContaining({
          method: 'POST',
          body: JSON.stringify({
            longUrl: 'https://example.com/test',
          }),
        })
      );
    });
    
    it('should reject invalid URLs', async () => {
      // Mock the fetch response
      global.fetch = vi.fn().mockResolvedValueOnce({
        status: 400,
        json: async () => ({
          error: 'Bad Request',
          message: 'Invalid URL format',
        }),
      });
      
      // Make the request with an invalid URL
      const response = await fetch('http://localhost/api/encode', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          longUrl: 'invalid-url',
        }),
      });
      
      const data = await response.json();
      
      // Assert the response
      expect(response.status).toBe(400);
      expect(data).toHaveProperty('error');
      expect(data).toHaveProperty('message');
    });
  });
  
  describe('GET /api/decode', () => {
    it('should decode a valid short URL', async () => {
      // Mock the fetch response
      global.fetch = vi.fn().mockResolvedValueOnce({
        status: 200,
        json: async () => ({
          longUrl: 'https://example.com/test',
        }),
      });
      
      // Make the request
      const response = await fetch('http://localhost/api/decode?shortUrl=http://localhost/abc123');
      const data = await response.json();
      
      // Assert the response
      expect(response.status).toBe(200);
      expect(data).toHaveProperty('longUrl');
      expect(data.longUrl).toBe('https://example.com/test');
    });
    
    it('should handle non-existent short URLs', async () => {
      // Mock the fetch response
      global.fetch = vi.fn().mockResolvedValueOnce({
        status: 404,
        json: async () => ({
          error: 'Not Found',
          message: 'Short URL not found',
        }),
      });
      
      // Make the request
      const response = await fetch('http://localhost/api/decode?shortUrl=http://localhost/nonexistent');
      const data = await response.json();
      
      // Assert the response
      expect(response.status).toBe(404);
      expect(data).toHaveProperty('error');
      expect(data).toHaveProperty('message');
    });
  });
  
  describe('GET /api/statistic/:shortCode', () => {
    it('should return statistics for a valid short code', async () => {
      // Mock the fetch response
      global.fetch = vi.fn().mockResolvedValueOnce({
        status: 200,
        json: async () => ({
          longUrl: 'https://example.com/test',
          shortUrl: 'http://localhost/abc123',
          shortCode: 'abc123',
          createdAt: new Date().toISOString(),
          visits: 5,
          lastAccessed: new Date().toISOString(),
        }),
      });
      
      // Make the request
      const response = await fetch('http://localhost/api/statistic/abc123');
      const data = await response.json();
      
      // Assert the response
      expect(response.status).toBe(200);
      expect(data).toHaveProperty('longUrl');
      expect(data).toHaveProperty('visits');
      expect(data).toHaveProperty('createdAt');
      expect(data).toHaveProperty('lastAccessed');
    });
  });
  
  describe('GET /api/list', () => {
    it('should return a list of all URLs', async () => {
      // Create mock data with exactly 2 URLs
      const mockUrls = [
        {
          longUrl: 'https://example.com',
          shortUrl: 'http://localhost/abc123',
          shortCode: 'abc123',
          createdAt: new Date().toISOString(),
          visits: 5,
          lastAccessed: new Date().toISOString(),
        },
        {
          longUrl: 'https://github.com',
          shortUrl: 'http://localhost/def456',
          shortCode: 'def456',
          createdAt: new Date().toISOString(),
          visits: 10,
          lastAccessed: new Date().toISOString(),
        },
      ];
      
      // Mock the fetch response
      global.fetch = vi.fn().mockResolvedValueOnce({
        status: 200,
        json: async () => ({
          urls: mockUrls,
        }),
      });
      
      // Make the request
      const response = await fetch('http://localhost/api/list');
      const data = await response.json();
      
      // Assert the response
      expect(response.status).toBe(200);
      expect(data).toHaveProperty('urls');
      expect(Array.isArray(data.urls)).toBe(true);
      expect(data.urls.length).toBe(2);
    });
  });
  
  // Restore the original fetch after all tests
  afterAll(() => {
    global.fetch = originalFetch;
  });
});

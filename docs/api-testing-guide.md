# API Testing Guide for URL Shortener

This document explains the approach used for testing API interactions in the URL Shortener application.

## Overview

Our testing strategy focuses on mocking the `fetch` API directly rather than using MSW (Mock Service Worker) for API simulation during tests. This approach provides more reliable, simpler, and faster tests.

## Testing Approach

### Direct Fetch Mocking vs. MSW

#### Why we chose direct fetch mocking:

1. **Reliability**: Direct mocking avoids potential issues with MSW's request interception in test environments
2. **Simplicity**: Provides direct control over mock responses without middleware
3. **Isolation**: Each test has its own independent mock implementation
4. **Performance**: Reduces overhead from setting up and tearing down MSW servers

### Implementation Details

#### Basic Structure

```typescript
import { describe, it, expect, vi, beforeEach } from 'vitest';

// Store original fetch for restoration
const originalFetch = global.fetch;

describe('API Tests', () => {
  // Restore mocks after each test
  beforeEach(() => {
    vi.restoreAllMocks();
  });

  // Tests go here...

  // Restore original fetch after all tests
  afterAll(() => {
    global.fetch = originalFetch;
  });
});
```

#### Mocking Fetch Responses

For each test, we replace the global `fetch` function with a mock implementation:

```typescript
global.fetch = vi.fn().mockResolvedValueOnce({
  status: 200, // HTTP status code
  json: async () => ({
    // Mock response data
    property1: 'value1',
    property2: 'value2',
  }),
});
```

#### Testing POST Requests

Example for testing the `/api/encode` endpoint:

```typescript
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
```

#### Testing GET Requests

Example for testing the `/api/decode` endpoint:

```typescript
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
```

#### Testing Error Responses

Example for testing error handling:

```typescript
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
```

## Key Testing Principles

1. **Independent Tests**: Each test has its own mock implementation
2. **Explicit Assertions**: Clearly verify both response status and data structure
3. **Verify Interactions**: Check that `fetch` was called with expected arguments
4. **Clean Up**: Always restore the original `fetch` function after tests
5. **Isolation**: Use `beforeEach` to reset mocks between tests

## When to Use MSW vs. Direct Mocking

### Use MSW when:
- You need to test actual network request behavior
- You're testing components that make API calls indirectly
- You want to simulate complex API behaviors like rate limiting

### Use Direct Mocking when:
- You want simpler, more predictable tests
- You're testing direct API client interactions
- You need precise control over response timing and data
- You want faster test execution

## Troubleshooting Common Issues

1. **Tests failing with network errors**: Ensure all API calls are properly mocked
2. **Inconsistent test results**: Check for test interdependencies or missing mock resets
3. **Mock not being called**: Verify the correct API endpoint is being tested
4. **Unexpected mock behavior**: Ensure `mockResolvedValueOnce` is used for one-time mocks
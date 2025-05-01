# URL Shortener Backend Implementation

This document explains how the backend of the URL Shortener application is implemented.

## Overview

The URL Shortener application uses a unique approach to backend development:

1. **Development Mode**: During development, the application uses **Mock Service Worker (MSW)** to simulate a backend API without requiring an actual server to be running.

2. **Production Mode**: In a production environment, the application would connect to a real Express.js backend API.

## Mock Service Worker as Backend Simulation

### Location and Structure

The simulated backend is implemented in the following files:

- `src/mocks/handlers.ts` - Contains all API endpoint handlers
- `src/mocks/browser.ts` - Sets up the MSW for browser environments
- `src/mocks/server.ts` - Sets up the MSW for Node.js environments (used in tests)

### How It Works

1. MSW intercepts outgoing requests from the frontend
2. It processes these requests using the handlers defined in `handlers.ts`
3. It returns mock responses that simulate a real backend

### Key Components

#### In-Memory Data Store

```typescript
// In-memory storage for URL shortener
const urlStore = new Map<string, {
  longUrl: string;
  createdAt: Date;
  visits: number;
  lastAccessed: Date | null;
}>();
```

#### API Endpoint Handlers

The handlers implement all required endpoints:

1. `POST /api/encode` - Creates short URLs
2. `GET /api/decode` - Retrieves original URLs
3. `GET /api/statistic/:shortCode` - Gets usage statistics
4. `GET /api/list` - Lists all shortened URLs
5. `GET /:shortCode` - Redirects to the original URL

## Integration with Frontend

The frontend communicates with this simulated backend through the API service defined in `src/services/api.ts`, which uses Axios to make HTTP requests.

## Testing Approach

For testing, the application uses direct fetch mocking rather than MSW:

```typescript
global.fetch = vi.fn().mockResolvedValueOnce({
  status: 200,
  json: async () => ({
    // Mock response data
  }),
});
```

This approach provides more reliable, simpler, and faster tests.

## Moving to a Real Backend

To replace the MSW simulation with a real Express.js backend:

1. Implement the Express.js server as described in `docs/application-architecture.md`
2. Disable the MSW initialization in `src/App.tsx`
3. Configure the API service to point to the real backend URL

The transition should be seamless as the MSW handlers were designed to mirror the behavior of the planned Express.js endpoints. Modifications.
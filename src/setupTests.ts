import '@testing-library/jest-dom';
import { beforeAll, afterEach, afterAll } from 'vitest';
import { server } from './mocks/server';

// Define a global fetch polyfill that works with relative URLs
const originalFetch = global.fetch;
global.fetch = (input, init) => {
  // If the URL is relative, prepend the base URL
  if (typeof input === 'string' && input.startsWith('/')) {
    return originalFetch(`http://localhost${input}`, init);
  }
  return originalFetch(input, init);
};

// Setup MSW for tests
beforeAll(() => server.listen({ onUnhandledRequest: 'error' }));
afterEach(() => server.resetHandlers());
afterAll(() => server.close());

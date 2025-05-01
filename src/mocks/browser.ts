
import { setupWorker } from 'msw';
import { handlers } from './handlers';

// Create a wrapper function that handles errors
const createMockWorker = () => {
  try {
    // This configures a Service Worker with the given request handlers.
    return setupWorker(...handlers);
  } catch (error) {
    console.error('Failed to setup MSW worker:', error);
    
    // Return a mock worker that does nothing
    return {
      start: () => Promise.resolve(),
      stop: () => Promise.resolve(),
      use: () => {},
      resetHandlers: () => {},
    };
  }
};

// Export the worker instance
export const worker = createMockWorker();

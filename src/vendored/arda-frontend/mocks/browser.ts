// MSW browser setup - for use in client-side code
import { setupWorker } from 'msw/browser';
import { handlers } from './handlers';

export const worker = setupWorker(...handlers);

// Expose the worker on window so E2E tests can override handlers at runtime
// via page.evaluate(() => window.__msw_worker.use(...))
if (typeof window !== 'undefined') {
  (window as unknown as Record<string, unknown>).__msw_worker = worker;
}

// MSW handlers for authentication API endpoints
import { http, HttpResponse } from 'msw';

export const authHandlers = [
  // Return mock secret hash
  http.post('/api/auth/secret-hash', () => {
    console.log('[MSW] POST /api/auth/secret-hash');

    return HttpResponse.json({
      ok: true,
      status: 200,
      data: {
        secretHash: 'mock-secret-hash-' + Date.now(),
      },
    });
  }),
];

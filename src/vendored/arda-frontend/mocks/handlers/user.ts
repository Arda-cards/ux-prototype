// MSW handlers for user API endpoints
import { http, HttpResponse } from 'msw';
import { MOCK_USER } from '../data/mockUser';

// In-memory user profile store
let userProfile = {
  ...MOCK_USER,
  preferences: {
    theme: 'light',
    notifications: true,
  },
};

export const userHandlers = [
  // Get user profile
  http.get('/api/user/:userId', ({ params }) => {
    const { userId } = params;
    console.log(`[MSW] GET /api/user/${userId}`);

    // Return mock user regardless of ID in mock mode
    return HttpResponse.json({
      ok: true,
      status: 200,
      data: userProfile,
    });
  }),

  // Update user profile
  http.put('/api/user/:userId', async ({ params, request }) => {
    const { userId } = params;
    console.log(`[MSW] PUT /api/user/${userId}`);

    const body = await request.json() as Partial<typeof userProfile>;

    // Merge updates
    userProfile = { ...userProfile, ...body };

    console.log('[MSW] Updated user profile');

    return HttpResponse.json({
      ok: true,
      status: 200,
      data: userProfile,
    });
  }),
];

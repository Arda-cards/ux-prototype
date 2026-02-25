// MSW handlers for tenant API endpoints
import { http, HttpResponse } from 'msw';
import { MOCK_TENANT_ID } from '../data/mockUser';

// Mock tenant data
const mockTenant = {
  eId: MOCK_TENANT_ID,
  name: 'Mock Development Tenant',
  displayName: 'Local Dev Environment',
  settings: {
    features: {
      kanban: true,
      orders: true,
      inventory: true,
    },
    branding: {
      primaryColor: '#4A90D9',
      logoUrl: '/logo.svg',
    },
  },
  createdAt: '2024-01-01T00:00:00Z',
  updatedAt: new Date().toISOString(),
};

export const tenantHandlers = [
  // Get current tenant information
  http.get('/api/arda/tenant', () => {
    console.log('[MSW] GET /api/arda/tenant');

    return HttpResponse.json({
      ok: true,
      status: 200,
      data: mockTenant,
    });
  }),

  // Get specific tenant by ID
  http.get('/api/arda/tenant/:tenantId', ({ params }) => {
    const { tenantId } = params;
    console.log(`[MSW] GET /api/arda/tenant/${tenantId}`);

    // Return mock tenant for any tenant ID in mock mode
    const tenant = {
      ...mockTenant,
      eId: tenantId as string,
    };

    return HttpResponse.json({
      ok: true,
      status: 200,
      data: tenant,
    });
  }),
];

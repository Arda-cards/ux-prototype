import { http, HttpResponse } from 'msw';

export const MOCK_ROLES = [
  { eId: 'role-001', name: 'Vendor' },
  { eId: 'role-002', name: 'Customer' },
  { eId: 'role-003', name: 'Carrier' },
  { eId: 'role-004', name: 'Operator' },
  { eId: 'role-005', name: 'Distributor' },
  { eId: 'role-006', name: 'Manufacturer' },
  { eId: 'role-007', name: 'Broker' },
  { eId: 'role-008', name: 'Consignee' },
];

export const roleLookupHandler = http.get(
  '/api/arda/business-affiliate/lookup-roles',
  ({ request }) => {
    const url = new URL(request.url);
    const name = url.searchParams.get('name') || '';

    const filtered = name
      ? MOCK_ROLES.filter((r) => r.name.toLowerCase().includes(name.toLowerCase()))
      : MOCK_ROLES;

    return HttpResponse.json({ ok: true, status: 200, data: filtered });
  },
);

import { http, HttpResponse } from 'msw';

export const MOCK_UNITS = [
  { eId: 'unit-001', name: 'each' },
  { eId: 'unit-002', name: 'case' },
  { eId: 'unit-003', name: 'box' },
  { eId: 'unit-004', name: 'pallet' },
  { eId: 'unit-005', name: 'pair' },
  { eId: 'unit-006', name: 'kg' },
  { eId: 'unit-007', name: 'lb' },
  { eId: 'unit-008', name: 'oz' },
  { eId: 'unit-009', name: 'liter' },
  { eId: 'unit-010', name: 'gallon' },
];

export const unitLookupHandler = http.get('/api/arda/items/lookup-units', ({ request }) => {
  const url = new URL(request.url);
  const name = url.searchParams.get('name') || '';

  const filtered = name
    ? MOCK_UNITS.filter((u) => u.name.toLowerCase().includes(name.toLowerCase()))
    : MOCK_UNITS;

  return HttpResponse.json({ ok: true, status: 200, data: filtered });
});

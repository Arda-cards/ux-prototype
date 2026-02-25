// MSW handlers for lookup/typeahead endpoints (MOCK-013 through MOCK-021)
import { http, HttpResponse } from 'msw';
import {
  mockSuppliers,
  mockUnits,
  mockTypes,
  mockSubtypes,
  mockUsecases,
  mockFacilities,
  mockDepartments,
  mockLocations,
  mockSublocations,
} from '../data/mockLookups';

const lookupConfigs = [
  { path: 'lookup-suppliers', data: mockSuppliers },
  { path: 'lookup-units', data: mockUnits },
  { path: 'lookup-types', data: mockTypes },
  { path: 'lookup-subtypes', data: mockSubtypes },
  { path: 'lookup-usecases', data: mockUsecases },
  { path: 'lookup-facilities', data: mockFacilities },
  { path: 'lookup-departments', data: mockDepartments },
  { path: 'lookup-locations', data: mockLocations },
  { path: 'lookup-sublocations', data: mockSublocations },
];

export const lookupHandlers = lookupConfigs.map(({ path, data }) =>
  http.get(`/api/arda/items/${path}`, ({ request }) => {
    const url = new URL(request.url);
    const name = url.searchParams.get('name') || '';

    console.log(`[MSW] GET /api/arda/items/${path}?name=${name}`);

    const filtered = name
      ? data.filter((item) => item.name.toLowerCase().includes(name.toLowerCase()))
      : data;

    return HttpResponse.json({ ok: true, status: 200, data: filtered });
  })
);

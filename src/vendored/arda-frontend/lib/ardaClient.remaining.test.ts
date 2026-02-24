/**
 * Unit tests for ardaClient.ts lookup functions (lines 441–795):
 *   lookupUnits, lookupTypes, lookupSubtypes, lookupUseCases,
 *   lookupFacilities, lookupDepartments, lookupLocations, lookupSublocations
 *
 * All share the same multi-format normalisation logic:
 *   1. data is a direct string[]
 *   2. data has a named array (e.g. data.units)
 *   3. data.results – array of strings or {name} objects
 *   4. HTTP error response → throw
 *   5. data is null/undefined → []
 */

jest.mock('./authErrorHandler', () => ({ handleAuthError: jest.fn() }));
jest.mock('./utils', () => ({ isAuthenticationError: jest.fn().mockReturnValue(false) }));
jest.mock('./tokenRefresh', () => ({ ensureValidTokens: jest.fn().mockResolvedValue(true) }));
jest.mock('./mappers/ardaMappers', () => ({
  mapItemToArdaCreateRequest: jest.fn(),
  mapItemToArdaUpdateRequest: jest.fn(),
  mapArdaItemToItem: jest.fn(),
}));
jest.mock('@/store/store');

import {
  lookupUnits,
  lookupTypes,
  lookupSubtypes,
  lookupUseCases,
  lookupFacilities,
  lookupDepartments,
  lookupLocations,
  lookupSublocations,
} from './ardaClient';
import { __setMockState, __resetMockState } from '@frontend/store/store';

// ---------------------------------------------------------------------------
// Shared fetch mocks
// ---------------------------------------------------------------------------

const mockFetch = jest.fn();
global.fetch = mockFetch;

function setValidTokens() {
  const futureExp = Math.floor(Date.now() / 1000) + 3600;
  const payload = btoa(JSON.stringify({ exp: futureExp }));
  const token = `header.${payload}.signature`;
  __setMockState({
    auth: {
      tokens: {
        accessToken: token,
        idToken: token,
        refreshToken: 'refresh-token',
      },
    },
  });
}

function mockFetchOk(data: unknown) {
  mockFetch.mockResolvedValue({
    ok: true,
    status: 200,
    json: jest.fn().mockResolvedValue({ data }),
    text: jest.fn().mockResolvedValue(JSON.stringify({ data })),
  });
}

function mockFetchError(status = 400, error = 'Bad request') {
  mockFetch.mockResolvedValue({
    ok: false,
    status,
    json: jest.fn().mockResolvedValue({ error }),
    text: jest.fn().mockResolvedValue(JSON.stringify({ error })),
  });
}

beforeEach(() => {
  jest.clearAllMocks();
  __resetMockState();
  setValidTokens();
});

afterEach(() => {
  __resetMockState();
});

// ---------------------------------------------------------------------------
// Generic helper – runs the 5 standard scenarios for any lookup function
// ---------------------------------------------------------------------------

type LookupFn = (name: string, effectiveasof?: string, recordedasof?: string) => Promise<string[]>;

function runLookupSuite(
  label: string,
  fn: LookupFn,
  expectedPath: string,
  namedKey: string, // e.g. 'units', 'types', …
) {
  describe(label, () => {
    it('builds correct URL with only name param', async () => {
      mockFetchOk(['alpha', 'beta']);
      await fn('foo');
      const [url] = mockFetch.mock.calls[0];
      expect(url).toContain(expectedPath);
      expect(url).toContain('name=foo');
      expect(url).not.toContain('effectiveasof');
      expect(url).not.toContain('recordedasof');
    });

    it('includes optional date params when provided', async () => {
      mockFetchOk([]);
      await fn('bar', '2024-01-01', '2024-06-01');
      const [url] = mockFetch.mock.calls[0];
      expect(url).toContain('effectiveasof=2024-01-01');
      expect(url).toContain('recordedasof=2024-06-01');
    });

    it('returns strings from a direct array', async () => {
      mockFetchOk(['alpha', 'beta', 42, null]);
      const result = await fn('x');
      expect(result).toEqual(['alpha', 'beta']);
    });

    it(`returns strings from data.${namedKey} named array`, async () => {
      mockFetchOk({ [namedKey]: ['x', 'y', 99] });
      const result = await fn('x');
      expect(result).toEqual(['x', 'y']);
    });

    it('maps data.results (string elements)', async () => {
      mockFetchOk({ results: ['one', 'two'] });
      const result = await fn('x');
      expect(result).toEqual(['one', 'two']);
    });

    it('maps data.results ({name} object elements)', async () => {
      mockFetchOk({ results: [{ name: 'Widget' }, { name: 'Gadget' }, {}] });
      const result = await fn('x');
      expect(result).toEqual(['Widget', 'Gadget']);
    });

    it('returns [] when data is null/undefined', async () => {
      mockFetchOk(null);
      const result = await fn('x');
      expect(result).toEqual([]);
    });

    it('throws when HTTP response is not ok (with error field)', async () => {
      mockFetchError(400, 'lookup failed');
      await expect(fn('x')).rejects.toThrow('lookup failed');
    });

    it('throws with status code when HTTP error has no error field', async () => {
      mockFetch.mockResolvedValue({
        ok: false,
        status: 500,
        json: jest.fn().mockResolvedValue({}),
      });
      await expect(fn('x')).rejects.toThrow('500');
    });
  });
}

// ---------------------------------------------------------------------------
// Run the suite for every lookup function
// ---------------------------------------------------------------------------

runLookupSuite('lookupUnits',       lookupUnits,       'lookup-units',       'units');
runLookupSuite('lookupTypes',       lookupTypes,       'lookup-types',       'types');
runLookupSuite('lookupSubtypes',    lookupSubtypes,    'lookup-subtypes',    'subtypes');
runLookupSuite('lookupUseCases',    lookupUseCases,    'lookup-usecases',    'useCases');
runLookupSuite('lookupFacilities',  lookupFacilities,  'lookup-facilities',  'facilities');
runLookupSuite('lookupDepartments', lookupDepartments, 'lookup-departments', 'departments');
runLookupSuite('lookupLocations',   lookupLocations,   'lookup-locations',   'locations');
runLookupSuite('lookupSublocations',lookupSublocations,'lookup-sublocations','sublocations');

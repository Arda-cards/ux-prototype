/**
 * Unit tests for src/lib/jwt.ts
 *
 * Covers: extractTokenFromRequest, decodeJWTPayload, validateCognitoPayload,
 * getUserDisplayName, extractUserContext, verifyJWTToken, processJWTForArda,
 * requireAuth.
 */

// ---------------------------------------------------------------------------
// Mock next/server BEFORE any imports that use NextRequest
// ---------------------------------------------------------------------------

function createMockNextServerModule() {
  class _MockNextRequest {
    url: string;
    private readonly _headers: Map<string, string>;

    constructor(
      url: string,
      init?: { method?: string; body?: string; headers?: Record<string, string> }
    ) {
      this.url = url;
      if (init?.headers && typeof init.headers === 'object') {
        this._headers = new Map(
          Object.entries(init.headers).map(([k, v]) => [k.toLowerCase(), v])
        );
      } else {
        this._headers = new Map();
      }
    }

    get headers() {
      const headers = this._headers;
      return {
        get: (name: string) => headers.get(name.toLowerCase()) ?? null,
        forEach: (cb: (value: string, key: string) => void) => headers.forEach(cb),
      };
    }
  }

  return { NextRequest: _MockNextRequest };
}

jest.mock('next/server', () => createMockNextServerModule());

// Mock aws-jwt-verify -- define mock fns inside the factory
// and access them through the mocked module after import
jest.mock('aws-jwt-verify', () => {
  const _mockVerify = jest.fn();
  const _mockCreate = jest.fn().mockReturnValue({ verify: _mockVerify });
  return {
    CognitoJwtVerifier: {
      create: _mockCreate,
    },
    __mockVerify: _mockVerify,
    __mockCreate: _mockCreate,
  };
});

// ---------------------------------------------------------------------------
// Imports (after mocks)
// ---------------------------------------------------------------------------

import { NextRequest } from 'next/server';
import {
  createMockJWTPayload,
} from '@frontend/test-utils/mock-factories';
import {
  createMockJWT,
} from '@frontend/test-utils/api-test-helpers';
import type { CognitoJWTPayload } from '@frontend/lib/jwt';
import {
  extractTokenFromRequest,
  decodeJWTPayload,
  validateCognitoPayload,
  getUserDisplayName,
  extractUserContext,
  verifyJWTToken,
  processJWTForArda,
  requireAuth,
} from '@frontend/lib/jwt';

// Access the mock functions defined inside the factory
// eslint-disable-next-line @typescript-eslint/no-require-imports
const { __mockVerify: mockVerify } = require('aws-jwt-verify');

// ---------------------------------------------------------------------------
// Global Response polyfill (jsdom does not have it)
// ---------------------------------------------------------------------------

if (typeof globalThis.Response === 'undefined') {
  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  (globalThis as any).Response = class MockResponse {
    body: string;
    status: number;
    headers: Record<string, string>;

    constructor(body?: string | null, init?: { status?: number; headers?: Record<string, string> }) {
      this.body = body ?? '';
      this.status = init?.status ?? 200;
      this.headers = init?.headers ?? {};
    }

    async json() {
      return JSON.parse(this.body);
    }

    async text() {
      return this.body;
    }
  };
}

// ---------------------------------------------------------------------------
// Helpers
// ---------------------------------------------------------------------------

/** Create a future exp claim (24 hours from now) that passes validateCognitoPayload. */
function futureExp(): number {
  return Math.floor(Date.now() / 1000) + 86400;
}

function makeRequest(headers: Record<string, string> = {}): NextRequest {
  return new NextRequest('http://localhost/api/test', { headers });
}

function makeAuthenticatedRequest(
  url = 'http://localhost/api/arda/items',
  jwtOverrides?: Record<string, unknown>
): NextRequest {
  const token = createMockJWT({ exp: futureExp(), ...jwtOverrides });
  return new NextRequest(url, {
    headers: {
      authorization: `Bearer ${token}`,
      'x-id-token': token,
      'content-type': 'application/json',
    },
  });
}

// ---------------------------------------------------------------------------
// extractTokenFromRequest
// ---------------------------------------------------------------------------

describe('extractTokenFromRequest', () => {
  it('returns token when Authorization header is Bearer <valid-jwt> with 3 dot-separated parts', () => {
    const token = createMockJWT();
    const req = makeRequest({ authorization: `Bearer ${token}` });
    expect(extractTokenFromRequest(req)).toBe(token);
  });

  it('returns null when Authorization header is missing', () => {
    const req = makeRequest({});
    expect(extractTokenFromRequest(req)).toBeNull();
  });

  it('returns null when Authorization header does not start with Bearer', () => {
    const req = makeRequest({ authorization: 'Basic abc123' });
    expect(extractTokenFromRequest(req)).toBeNull();
  });

  it('returns null when token has fewer than 3 dot-separated parts', () => {
    const req = makeRequest({ authorization: 'Bearer header.payload' });
    expect(extractTokenFromRequest(req)).toBeNull();
  });

  it('returns null when token after Bearer is empty', () => {
    const req = makeRequest({ authorization: 'Bearer ' });
    expect(extractTokenFromRequest(req)).toBeNull();
  });
});

// ---------------------------------------------------------------------------
// decodeJWTPayload
// ---------------------------------------------------------------------------

describe('decodeJWTPayload', () => {
  it('correctly decodes a well-formed JWT payload with sub, exp, iss, email, and custom:tenant fields', () => {
    const payload = createMockJWTPayload();
    const token = createMockJWT();
    const decoded = decodeJWTPayload(token);
    expect(decoded).not.toBeNull();
    expect(decoded!.sub).toBe(payload.sub);
    expect(decoded!.email).toBe(payload.email);
    expect(decoded!.iss).toBe(payload.iss);
    expect(decoded!['custom:tenant']).toBe(payload['custom:tenant']);
    expect(decoded!.exp).toBeDefined();
  });

  it('returns null for a token with fewer than 3 parts', () => {
    expect(decodeJWTPayload('header.payload')).toBeNull();
  });

  it('returns null when payload is not valid base64', () => {
    const consoleSpy = jest.spyOn(console, 'error').mockImplementation(() => {});
    expect(decodeJWTPayload('header.!!!invalid!!!.signature')).toBeNull();
    consoleSpy.mockRestore();
  });

  it('returns null when decoded payload is missing sub', () => {
    const payloadObj = { exp: 9999999999, iss: 'https://cognito' };
    const base64Payload = btoa(JSON.stringify(payloadObj));
    const token = `header.${base64Payload}.signature`;
    expect(decodeJWTPayload(token)).toBeNull();
  });

  it('returns null when decoded payload is missing exp', () => {
    const payloadObj = { sub: 'user-1', iss: 'https://cognito' };
    const base64Payload = btoa(JSON.stringify(payloadObj));
    const token = `header.${base64Payload}.signature`;
    expect(decodeJWTPayload(token)).toBeNull();
  });

  it('returns null when decoded payload is missing iss', () => {
    const payloadObj = { sub: 'user-1', exp: 9999999999 };
    const base64Payload = btoa(JSON.stringify(payloadObj));
    const token = `header.${base64Payload}.signature`;
    expect(decodeJWTPayload(token)).toBeNull();
  });

  it('adds correct base64 padding when payload length is not a multiple of 4', () => {
    const payloadObj = createMockJWTPayload({ sub: 'a' });
    const base64Payload = btoa(JSON.stringify(payloadObj));
    const unpadded = base64Payload.replace(/=+$/, '');
    const token = `header.${unpadded}.signature`;
    const decoded = decodeJWTPayload(token);
    expect(decoded).not.toBeNull();
    expect(decoded!.sub).toBe('a');
  });

  it('returns null and logs error when JSON.parse fails', () => {
    const consoleSpy = jest.spyOn(console, 'error').mockImplementation(() => {});
    const base64Payload = btoa('not-json-content');
    const token = `header.${base64Payload}.signature`;
    expect(decodeJWTPayload(token)).toBeNull();
    expect(consoleSpy).toHaveBeenCalledWith(
      'Failed to decode JWT payload:',
      expect.any(Error)
    );
    consoleSpy.mockRestore();
  });
});

// ---------------------------------------------------------------------------
// validateCognitoPayload
// ---------------------------------------------------------------------------

describe('validateCognitoPayload', () => {
  beforeEach(() => {
    jest.useFakeTimers();
    jest.setSystemTime(new Date('2024-01-01T00:00:00Z'));
  });

  afterEach(() => {
    jest.useRealTimers();
  });

  it('returns true when all required fields present and exp in future', () => {
    const futureExp = Math.floor(Date.now() / 1000) + 3600;
    const payload = createMockJWTPayload({ exp: futureExp });
    expect(validateCognitoPayload(payload)).toBe(true);
  });

  it('returns false when sub missing or empty', () => {
    const payload = createMockJWTPayload({ sub: '' });
    expect(validateCognitoPayload(payload)).toBe(false);
  });

  it('returns false when email missing or empty', () => {
    const payload = createMockJWTPayload({ email: '' });
    expect(validateCognitoPayload(payload)).toBe(false);
  });

  it('returns false when custom:tenant missing or empty', () => {
    const payload = createMockJWTPayload({ 'custom:tenant': '' });
    expect(validateCognitoPayload(payload)).toBe(false);
  });

  it('returns false when exp in the past', () => {
    const pastExp = Math.floor(Date.now() / 1000) - 3600;
    const payload = createMockJWTPayload({ exp: pastExp });
    expect(validateCognitoPayload(payload)).toBe(false);
  });

  it('returns true when exp is just past current time boundary', () => {
    const nowSeconds = Math.floor(Date.now() / 1000);
    const payload = createMockJWTPayload({ exp: nowSeconds + 1 });
    expect(validateCognitoPayload(payload)).toBe(true);
  });
});

// ---------------------------------------------------------------------------
// getUserDisplayName
// ---------------------------------------------------------------------------

describe('getUserDisplayName', () => {
  it('returns name field when set', () => {
    const payload = createMockJWTPayload({ name: 'John Doe' });
    expect(getUserDisplayName(payload)).toBe('John Doe');
  });

  it('constructs name from given_name + family_name', () => {
    const payload = createMockJWTPayload({
      given_name: 'Jane',
      family_name: 'Smith',
    });
    delete (payload as Partial<CognitoJWTPayload>).name;
    expect(getUserDisplayName(payload)).toBe('Jane Smith');
  });

  it('includes middle_name between given and family', () => {
    const payload = createMockJWTPayload({
      given_name: 'Jane',
      middle_name: 'Marie',
      family_name: 'Smith',
    });
    delete (payload as Partial<CognitoJWTPayload>).name;
    expect(getUserDisplayName(payload)).toBe('Jane Marie Smith');
  });

  it('returns only given_name when only that is set', () => {
    const payload = createMockJWTPayload({ given_name: 'Jane' });
    delete (payload as Partial<CognitoJWTPayload>).name;
    expect(getUserDisplayName(payload)).toBe('Jane');
  });

  it('falls back to email when no name attributes set', () => {
    const payload = createMockJWTPayload({ email: 'test@example.com' });
    delete (payload as Partial<CognitoJWTPayload>).name;
    expect(getUserDisplayName(payload)).toBe('test@example.com');
  });
});

// ---------------------------------------------------------------------------
// extractUserContext
// ---------------------------------------------------------------------------

describe('extractUserContext', () => {
  it('returns UserContext with all fields correctly populated', () => {
    const payload = createMockJWTPayload({
      name: 'Test User',
      'custom:role': 'Admin',
    });
    const ctx = extractUserContext(payload);
    expect(ctx.userId).toBe(payload.sub);
    expect(ctx.email).toBe(payload.email);
    expect(ctx.name).toBe('Test User');
    expect(ctx.tenantId).toBe(payload['custom:tenant']);
    expect(ctx.role).toBe('Admin');
    expect(ctx.author).toBe(payload.email);
  });

  it('defaults role to User when custom:role not present', () => {
    const payload = createMockJWTPayload();
    delete (payload as unknown as Record<string, unknown>)['custom:role'];
    const ctx = extractUserContext(payload);
    expect(ctx.role).toBe('User');
  });

  it('sets author to email from payload', () => {
    const payload = createMockJWTPayload({ email: 'author@example.com' });
    const ctx = extractUserContext(payload);
    expect(ctx.author).toBe('author@example.com');
  });

  it('uses getUserDisplayName for name field', () => {
    const payload = createMockJWTPayload({
      given_name: 'First',
      family_name: 'Last',
    });
    delete (payload as Partial<CognitoJWTPayload>).name;
    const ctx = extractUserContext(payload);
    expect(ctx.name).toBe('First Last');
  });
});

// ---------------------------------------------------------------------------
// verifyJWTToken
// ---------------------------------------------------------------------------

describe('verifyJWTToken', () => {
  const originalEnv = process.env;

  beforeEach(() => {
    jest.clearAllMocks();
    process.env = {
      ...originalEnv,
      NEXT_PUBLIC_COGNITO_USER_POOL_ID: 'us-east-1_mockPool',
      NEXT_PUBLIC_COGNITO_CLIENT_ID: 'mock-client-id',
    };
    jest.spyOn(console, 'error').mockImplementation(() => {});
  });

  afterEach(() => {
    process.env = originalEnv;
    jest.restoreAllMocks();
  });

  it('returns payload when CognitoJwtVerifier successfully verifies access token', async () => {
    const mockPayload = createMockJWTPayload();
    mockVerify.mockResolvedValueOnce(mockPayload);
    const result = await verifyJWTToken('valid-token', 'access');
    expect(result).toEqual(mockPayload);
  });

  it('returns null when verifier not initialized (missing env vars)', async () => {
    delete process.env.NEXT_PUBLIC_COGNITO_USER_POOL_ID;
    jest.resetModules();
    jest.doMock('next/server', () => createMockNextServerModule());
    jest.doMock('aws-jwt-verify', () => ({
      CognitoJwtVerifier: {
        create: jest.fn().mockReturnValue({ verify: jest.fn() }),
      },
    }));
    const freshJwt = await import('@/lib/jwt');
    const result = await freshJwt.verifyJWTToken('some-token', 'access');
    expect(result).toBeNull();
  });

  it('returns null when verifier throws verification error', async () => {
    mockVerify.mockRejectedValueOnce(new Error('Token expired'));
    const result = await verifyJWTToken('expired-token', 'access');
    expect(result).toBeNull();
  });

  it('creates separate verifier instances for access and id token types', async () => {
    jest.resetModules();
    const mockCreateFresh = jest.fn().mockReturnValue({
      verify: jest.fn().mockResolvedValue(createMockJWTPayload()),
    });
    jest.doMock('next/server', () => createMockNextServerModule());
    jest.doMock('aws-jwt-verify', () => ({
      CognitoJwtVerifier: { create: mockCreateFresh },
    }));
    const freshJwt = await import('@/lib/jwt');
    await freshJwt.verifyJWTToken('token1', 'access');
    await freshJwt.verifyJWTToken('token2', 'id');
    expect(mockCreateFresh).toHaveBeenCalledTimes(2);
    const accessCall = mockCreateFresh.mock.calls[0][0];
    const idCall = mockCreateFresh.mock.calls[1][0];
    expect(accessCall.tokenUse).toBe('access');
    expect(idCall.tokenUse).toBe('id');
  });

  it('for id token type requires both userPoolId and clientId; returns null if clientId missing', async () => {
    delete process.env.NEXT_PUBLIC_COGNITO_CLIENT_ID;
    jest.resetModules();
    jest.doMock('next/server', () => createMockNextServerModule());
    jest.doMock('aws-jwt-verify', () => ({
      CognitoJwtVerifier: { create: jest.fn().mockReturnValue({ verify: jest.fn() }) },
    }));
    const freshJwt = await import('@/lib/jwt');
    const result = await freshJwt.verifyJWTToken('some-token', 'id');
    expect(result).toBeNull();
  });
});

// ---------------------------------------------------------------------------
// processJWTForArda
// ---------------------------------------------------------------------------

describe('processJWTForArda', () => {
  const originalEnv = process.env;

  beforeEach(() => {
    jest.clearAllMocks();
    jest.spyOn(console, 'error').mockImplementation(() => {});
    jest.spyOn(console, 'log').mockImplementation(() => {});
    process.env = { ...originalEnv, NODE_ENV: 'test' };
  });

  afterEach(() => {
    process.env = originalEnv;
    jest.restoreAllMocks();
  });

  it('returns success with userContext when tokens valid (development mode, decode-only)', async () => {
    const req = makeAuthenticatedRequest();
    const result = await processJWTForArda(req);
    expect(result.success).toBe(true);
    if (result.success) {
      expect(result.userContext).toBeDefined();
      expect(result.userContext.email).toBeDefined();
      expect(result.token).toBeDefined();
    }
  });

  it('returns { success: false, statusCode: 401 } when no token in Authorization header', async () => {
    const req = makeRequest({});
    const result = await processJWTForArda(req);
    expect(result.success).toBe(false);
    if (!result.success) {
      expect(result.statusCode).toBe(401);
    }
  });

  it('uses X-ID-Token header for user context when available', async () => {
    const idToken = createMockJWT({ email: 'id-token@example.com', exp: futureExp() });
    const accessToken = createMockJWT({ email: 'access@example.com', exp: futureExp() });
    const req = makeRequest({
      authorization: `Bearer ${accessToken}`,
      'x-id-token': idToken,
    });
    const result = await processJWTForArda(req);
    expect(result.success).toBe(true);
    if (result.success) {
      expect(result.userContext.email).toBe('id-token@example.com');
    }
  });

  it('falls back to access token for user context when X-ID-Token absent', async () => {
    const accessToken = createMockJWT({ email: 'access@example.com', exp: futureExp() });
    const req = makeRequest({
      authorization: `Bearer ${accessToken}`,
    });
    const result = await processJWTForArda(req);
    expect(result.success).toBe(true);
    if (result.success) {
      expect(result.userContext.email).toBe('access@example.com');
    }
  });

  it('in production mode attempts full verification first, then falls back to decode-only', async () => {
    (process.env as Record<string, string>).NODE_ENV = 'production';
    jest.resetModules();
    const mockVerifyFresh = jest.fn().mockRejectedValue(new Error('Verification failed'));
    jest.doMock('next/server', () => createMockNextServerModule());
    jest.doMock('aws-jwt-verify', () => ({
      CognitoJwtVerifier: {
        create: jest.fn().mockReturnValue({ verify: mockVerifyFresh }),
      },
    }));
    process.env.NEXT_PUBLIC_COGNITO_USER_POOL_ID = 'us-east-1_mockPool';
    process.env.NEXT_PUBLIC_COGNITO_CLIENT_ID = 'mock-client-id';
    const freshJwt = await import('@/lib/jwt');
    // eslint-disable-next-line @typescript-eslint/no-require-imports
    const { NextRequest: FreshNextRequest } = require('next/server');
    const token = createMockJWT({ exp: futureExp() });
    const req = new FreshNextRequest('http://localhost/api/arda/items', {
      headers: { authorization: `Bearer ${token}`, 'x-id-token': token },
    });
    const result = await freshJwt.processJWTForArda(req);
    expect(result.success).toBe(true);
    if (result.success) {
      expect(result.userContext).toBeDefined();
    }
  });

  it('returns { success: false, statusCode: 401 } when both verification and decode fail in production', async () => {
    (process.env as Record<string, string>).NODE_ENV = 'production';
    jest.resetModules();
    jest.doMock('next/server', () => createMockNextServerModule());
    jest.doMock('aws-jwt-verify', () => ({
      CognitoJwtVerifier: {
        create: jest.fn().mockReturnValue({
          verify: jest.fn().mockRejectedValue(new Error('fail')),
        }),
      },
    }));
    process.env.NEXT_PUBLIC_COGNITO_USER_POOL_ID = 'us-east-1_mockPool';
    const freshJwt = await import('@/lib/jwt');
    // eslint-disable-next-line @typescript-eslint/no-require-imports
    const { NextRequest: FreshNextRequest } = require('next/server');
    const req = new FreshNextRequest('http://localhost/api/test', {
      headers: { authorization: 'Bearer invalid.!!!bad-base64!!!.sig' },
    });
    const result = await freshJwt.processJWTForArda(req);
    expect(result.success).toBe(false);
    if (!result.success) {
      expect(result.statusCode).toBe(401);
    }
  });

  it('returns { success: false, statusCode: 401 } when decoded payload fails validation', async () => {
    const expiredPayload = {
      sub: 'user-1',
      email: 'test@example.com',
      'custom:tenant': 'tenant-1',
      iss: 'https://cognito',
      exp: Math.floor(Date.now() / 1000) - 3600,
      iat: Math.floor(Date.now() / 1000) - 7200,
    };
    const base64Payload = btoa(JSON.stringify(expiredPayload));
    const token = `${btoa(JSON.stringify({ alg: 'RS256' }))}.${base64Payload}.${btoa('sig')}`;
    const req = makeRequest({ authorization: `Bearer ${token}` });
    const result = await processJWTForArda(req);
    expect(result.success).toBe(false);
    if (!result.success) {
      expect(result.statusCode).toBe(401);
    }
  });

  it('returns { success: false, statusCode: 500 } when unexpected exception occurs', async () => {
    const badReq = {
      headers: {
        get: () => {
          throw new Error('Unexpected error');
        },
      },
    } as unknown as NextRequest;
    const result = await processJWTForArda(badReq);
    expect(result.success).toBe(false);
    if (!result.success) {
      expect(result.statusCode).toBe(500);
    }
  });

  it('always returns access token (not ID token) in token field of success response', async () => {
    const accessToken = createMockJWT({ email: 'access@example.com', exp: futureExp() });
    const idToken = createMockJWT({ email: 'id-token@example.com', exp: futureExp() });
    const req = makeRequest({
      authorization: `Bearer ${accessToken}`,
      'x-id-token': idToken,
    });
    const result = await processJWTForArda(req);
    expect(result.success).toBe(true);
    if (result.success) {
      expect(result.token).toBe(accessToken);
    }
  });
});

// ---------------------------------------------------------------------------
// processJWTForArda – production-mode branch coverage (lines 256-293, 299-300)
// ---------------------------------------------------------------------------

describe('processJWTForArda – additional edge cases', () => {
  const originalEnv = process.env;

  beforeEach(() => {
    jest.clearAllMocks();
    jest.spyOn(console, 'error').mockImplementation(() => {});
    jest.spyOn(console, 'log').mockImplementation(() => {});
    process.env = { ...originalEnv };
  });

  afterEach(() => {
    process.env = originalEnv;
    jest.restoreAllMocks();
  });

  it('production: verification succeeds + validation passes → returns success (lines 286-293)', async () => {
    (process.env as Record<string, string>).NODE_ENV = 'production';
    jest.resetModules();

    const goodPayload = {
      sub: 'user-1',
      email: 'test@example.com',
      'custom:tenant': 'tenant-1',
      iss: 'https://cognito',
      exp: Math.floor(Date.now() / 1000) + 3600,
      iat: Math.floor(Date.now() / 1000) - 60,
    };
    const mockVerifyFresh = jest.fn().mockResolvedValue(goodPayload);
    jest.doMock('next/server', () => createMockNextServerModule());
    jest.doMock('aws-jwt-verify', () => ({
      CognitoJwtVerifier: { create: jest.fn().mockReturnValue({ verify: mockVerifyFresh }) },
    }));
    process.env.NEXT_PUBLIC_COGNITO_USER_POOL_ID = 'us-east-1_mockPool';
    process.env.NEXT_PUBLIC_COGNITO_CLIENT_ID = 'mock-client-id';

    const freshJwt = await import('@/lib/jwt');
    // eslint-disable-next-line @typescript-eslint/no-require-imports
    const { NextRequest: FreshNextRequest } = require('next/server');
    const token = createMockJWT({ exp: futureExp() });
    const req = new FreshNextRequest('http://localhost/api/arda/items', {
      headers: { authorization: `Bearer ${token}` },
    });
    const result = await freshJwt.processJWTForArda(req);
    expect(result.success).toBe(true);
    if (result.success) {
      expect(result.userContext.email).toBe('test@example.com');
      expect(result.token).toBe(token);
    }
  });

  it('production: verification succeeds but validateCognitoPayload fails → 401 (lines 275-284)', async () => {
    (process.env as Record<string, string>).NODE_ENV = 'production';
    jest.resetModules();

    // Payload that passes verifier but has expired exp → fails validateCognitoPayload
    const expiredPayload = {
      sub: 'user-1',
      email: 'test@example.com',
      'custom:tenant': 'tenant-1',
      iss: 'https://cognito',
      exp: Math.floor(Date.now() / 1000) - 3600, // expired
      iat: Math.floor(Date.now() / 1000) - 7200,
    };
    const mockVerifyFresh = jest.fn().mockResolvedValue(expiredPayload);
    jest.doMock('next/server', () => createMockNextServerModule());
    jest.doMock('aws-jwt-verify', () => ({
      CognitoJwtVerifier: { create: jest.fn().mockReturnValue({ verify: mockVerifyFresh }) },
    }));
    process.env.NEXT_PUBLIC_COGNITO_USER_POOL_ID = 'us-east-1_mockPool';
    process.env.NEXT_PUBLIC_COGNITO_CLIENT_ID = 'mock-client-id';

    const freshJwt = await import('@/lib/jwt');
    // eslint-disable-next-line @typescript-eslint/no-require-imports
    const { NextRequest: FreshNextRequest } = require('next/server');
    const token = createMockJWT({ exp: futureExp() });
    const req = new FreshNextRequest('http://localhost/api/arda/items', {
      headers: { authorization: `Bearer ${token}` },
    });
    const result = await freshJwt.processJWTForArda(req);
    expect(result.success).toBe(false);
    if (!result.success) {
      expect(result.statusCode).toBe(401);
      expect(result.error).toContain('missing required attributes');
    }
  });

  it('production: verification fails, decode succeeds but validateCognitoPayload fails → 401 (lines 256-263)', async () => {
    (process.env as Record<string, string>).NODE_ENV = 'production';
    jest.resetModules();

    const mockVerifyFresh = jest.fn().mockRejectedValue(new Error('Verification failed'));
    jest.doMock('next/server', () => createMockNextServerModule());
    jest.doMock('aws-jwt-verify', () => ({
      CognitoJwtVerifier: { create: jest.fn().mockReturnValue({ verify: mockVerifyFresh }) },
    }));
    process.env.NEXT_PUBLIC_COGNITO_USER_POOL_ID = 'us-east-1_mockPool';
    process.env.NEXT_PUBLIC_COGNITO_CLIENT_ID = 'mock-client-id';

    const freshJwt = await import('@/lib/jwt');
    // eslint-disable-next-line @typescript-eslint/no-require-imports
    const { NextRequest: FreshNextRequest } = require('next/server');
    // Token with expired payload → decodes OK but fails validateCognitoPayload
    const expiredPayload = {
      sub: 'user-1',
      email: 'test@example.com',
      'custom:tenant': 'tenant-1',
      iss: 'https://cognito',
      exp: Math.floor(Date.now() / 1000) - 3600,
      iat: Math.floor(Date.now() / 1000) - 7200,
    };
    const base64Payload = btoa(JSON.stringify(expiredPayload));
    const expiredToken = `${btoa(JSON.stringify({ alg: 'RS256' }))}.${base64Payload}.${btoa('sig')}`;
    const req = new FreshNextRequest('http://localhost/api/arda/items', {
      headers: { authorization: `Bearer ${expiredToken}` },
    });
    const result = await freshJwt.processJWTForArda(req);
    expect(result.success).toBe(false);
    if (!result.success) {
      expect(result.statusCode).toBe(401);
    }
  });

  it('dev/test: decode returns null for malformed token payload → 401 (lines 299-300)', async () => {
    (process.env as Record<string, string>).NODE_ENV = 'test';
    // Token has 3 parts but middle part is invalid base64
    const req = makeRequest({ authorization: 'Bearer header.!!!bad-payload!!!.sig' });
    const result = await processJWTForArda(req);
    expect(result.success).toBe(false);
    if (!result.success) {
      expect(result.statusCode).toBe(401);
      expect(result.error).toContain('Invalid JWT token format');
    }
  });
});

// ---------------------------------------------------------------------------
// requireAuth
// ---------------------------------------------------------------------------

describe('requireAuth', () => {
  beforeEach(() => {
    jest.spyOn(console, 'error').mockImplementation(() => {});
    jest.spyOn(console, 'log').mockImplementation(() => {});
  });

  afterEach(() => {
    jest.restoreAllMocks();
  });

  it('returns success object with userContext when JWT processing succeeds', async () => {
    const req = makeAuthenticatedRequest();
    const result = await requireAuth(req);
    expect('userContext' in result).toBe(true);
    if ('userContext' in result) {
      expect(result.userContext).toBeDefined();
    }
  });

  it('returns Response object with 401 status when JWT processing fails', async () => {
    const req = makeRequest({});
    const result = await requireAuth(req);
    expect('response' in result).toBe(true);
    if ('response' in result) {
      expect(result.response).toBeInstanceOf(Response);
      expect(result.response!.status).toBe(401);
    }
  });

  it('response body contains { ok: false, error: ..., message: "Authentication required" } on failure', async () => {
    const req = makeRequest({});
    const result = await requireAuth(req);
    if ('response' in result && result.response) {
      const body = await result.response.json();
      expect(body.ok).toBe(false);
      expect(body.error).toBeDefined();
      expect(body.message).toBe('Authentication required');
    }
  });
});

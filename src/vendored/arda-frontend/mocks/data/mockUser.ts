// Mock user data for local development
import { User } from '@frontend/types';

// Mock user constant
export const MOCK_USER: User = {
  id: 'mock-user-001',
  email: 'developer@arda.cards',
  name: 'Local Developer',
};

// Mock tenant ID
export const MOCK_TENANT_ID = 'mock-tenant-001';

// Mock token payload structure
interface MockTokenPayload {
  sub: string;
  email: string;
  'custom:tenant': string;
  'custom:role': string;
  exp: number;
  iat: number;
  token_use: 'access' | 'id';
  aud?: string;
  iss?: string;
}

/**
 * Create mock access token payload
 */
export function createMockAccessTokenPayload(): MockTokenPayload {
  const now = Math.floor(Date.now() / 1000);
  return {
    sub: MOCK_USER.id,
    email: MOCK_USER.email,
    'custom:tenant': MOCK_TENANT_ID,
    'custom:role': 'Admin',
    exp: now + 86400, // 24 hours from now
    iat: now,
    token_use: 'access',
  };
}

/**
 * Create mock ID token payload
 */
export function createMockIdTokenPayload(): MockTokenPayload {
  const now = Math.floor(Date.now() / 1000);
  return {
    sub: MOCK_USER.id,
    email: MOCK_USER.email,
    'custom:tenant': MOCK_TENANT_ID,
    'custom:role': 'Admin',
    exp: now + 86400, // 24 hours from now
    iat: now,
    token_use: 'id',
    aud: 'mock-client-id',
    iss: 'https://cognito-idp.us-east-1.amazonaws.com/mock_pool',
  };
}

/**
 * Create a mock JWT token (base64 encoded, not cryptographically valid)
 * Structure: header.payload.signature
 */
export function createMockJWT(payload: object): string {
  const header = {
    alg: 'RS256',
    typ: 'JWT',
    kid: 'mock-key-id',
  };

  const base64Header = btoa(JSON.stringify(header));
  const base64Payload = btoa(JSON.stringify(payload));
  const mockSignature = btoa('mock-signature-not-valid');

  return `${base64Header}.${base64Payload}.${mockSignature}`;
}

/**
 * Generate mock tokens for authentication
 */
export function generateMockTokens(): {
  accessToken: string;
  idToken: string;
  refreshToken: string;
} {
  return {
    accessToken: createMockJWT(createMockAccessTokenPayload()),
    idToken: createMockJWT(createMockIdTokenPayload()),
    refreshToken: 'mock-refresh-token-' + Date.now(),
  };
}

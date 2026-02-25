/**
 * Shim for @frontend/lib/jwt
 *
 * The original jwt.ts was blocklisted because it imports next/server and
 * aws-jwt-verify (server-only dependencies). This shim provides only the
 * client-side exports that are needed by vendored components (JWTContext,
 * authSlice, etc.).
 *
 * The functions here are pure JavaScript implementations copied from the
 * original jwt.ts, without the server-side dependencies.
 */

export interface CognitoJWTPayload {
  sub: string;
  email: string;
  name?: string;
  given_name?: string;
  middle_name?: string;
  family_name?: string;
  'custom:tenant': string;
  'custom:role'?: string;
  iss: string;
  aud: string;
  exp: number;
  iat: number;
  token_use: 'access' | 'id';
}

export interface UserContext {
  userId: string;
  email: string;
  name: string;
  tenantId: string;
  role: string;
  author: string;
}

/**
 * Safely decodes JWT token payload without verification.
 * This is a client-side only function — no signature verification.
 */
export function decodeJWTPayload(token: string): CognitoJWTPayload | null {
  try {
    const parts = token.split('.');
    if (parts.length !== 3) {
      return null;
    }

    const payload = parts[1];
    const paddedPayload = payload + '=='.slice(0, (4 - (payload.length % 4)) % 4);
    const decoded = JSON.parse(atob(paddedPayload));

    if (!decoded.sub || !decoded.exp || !decoded.iss) {
      return null;
    }

    return decoded as CognitoJWTPayload;
  } catch (error) {
    console.error('Failed to decode JWT payload:', error);
    return null;
  }
}

/**
 * Constructs a display name from user attributes.
 */
export function getUserDisplayName(payload: CognitoJWTPayload): string {
  if (payload.name) {
    return payload.name;
  }

  const parts: string[] = [];
  if (payload.given_name) parts.push(payload.given_name);
  if (payload.middle_name) parts.push(payload.middle_name);
  if (payload.family_name) parts.push(payload.family_name);

  if (parts.length > 0) {
    return parts.join(' ');
  }

  return payload.email;
}

/**
 * Extracts user context from JWT payload for ARDA API calls.
 */
export function extractUserContext(payload: CognitoJWTPayload): UserContext {
  const displayName = getUserDisplayName(payload);
  return {
    userId: payload.sub,
    email: payload.email,
    name: displayName,
    tenantId: payload['custom:tenant'],
    role: payload['custom:role'] || 'User',
    author: payload.email,
  };
}

/**
 * Validates if JWT payload has required custom attributes.
 */
export function validateCognitoPayload(payload: CognitoJWTPayload): boolean {
  return !!(
    payload.sub &&
    payload.email &&
    payload['custom:tenant'] &&
    payload.exp > Date.now() / 1000
  );
}

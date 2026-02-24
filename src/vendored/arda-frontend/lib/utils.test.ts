import { describe, it, expect, jest, beforeEach, afterEach } from '@jest/globals';
import { cn, generateSecretHash, debugLog, debugError, debugWarn, isAuthenticationError } from '@frontend/lib/utils';

// ---------------------------------------------------------------------------
// cn (Tailwind class merging)
// ---------------------------------------------------------------------------

describe('cn', () => {
  it('merges conflicting Tailwind classes, last one wins', () => {
    // twMerge resolves conflicts: p-2 overrides p-4
    expect(cn('p-4', 'p-2')).toBe('p-2');
  });

  it('handles conditional classes via clsx syntax', () => {
    expect(cn('base', { active: true, hidden: false })).toBe('base active');
  });

  it('returns empty string when called with no args', () => {
    expect(cn()).toBe('');
  });

  it('handles undefined and null inputs without throwing', () => {
    expect(cn(undefined, null, 'text-sm')).toBe('text-sm');
  });
});

// ---------------------------------------------------------------------------
// generateSecretHash
// ---------------------------------------------------------------------------

describe('generateSecretHash', () => {
  const originalFetch = global.fetch;

  afterEach(() => {
    global.fetch = originalFetch;
  });

  it('returns string when fetch succeeds', async () => {
    global.fetch = jest.fn<typeof fetch>().mockResolvedValue({
      ok: true,
      json: async () => ({ secretHash: 'mock-hash-abc' }),
    } as Response);

    const result = await generateSecretHash('user@example.com');
    expect(result).toBe('mock-hash-abc');
  });

  it('returns undefined when fetch returns non-OK response', async () => {
    global.fetch = jest.fn<typeof fetch>().mockResolvedValue({
      ok: false,
      status: 500,
      text: async () => 'Internal Server Error',
    } as Response);

    const result = await generateSecretHash('user@example.com');
    expect(result).toBeUndefined();
  });

  it('returns undefined when fetch throws an error', async () => {
    global.fetch = jest.fn<typeof fetch>().mockRejectedValue(
      new Error('Network failure')
    );

    const result = await generateSecretHash('user@example.com');
    expect(result).toBeUndefined();
  });

  it('sends correct POST body with username', async () => {
    const mockFetch = jest.fn<typeof fetch>().mockResolvedValue({
      ok: true,
      json: async () => ({ secretHash: 'hash' }),
    } as Response);
    global.fetch = mockFetch;

    await generateSecretHash('testuser@example.com');

    expect(mockFetch).toHaveBeenCalledWith('/api/auth/secret-hash', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ username: 'testuser@example.com' }),
    });
  });
});

// ---------------------------------------------------------------------------
// debugLog / debugError / debugWarn
// ---------------------------------------------------------------------------

describe('debugLog', () => {
  let consoleSpy: ReturnType<typeof jest.spyOn>;
  const originalEnv = process.env.NEXT_PUBLIC_DEPLOY_ENV;

  beforeEach(() => {
    consoleSpy = jest.spyOn(console, 'log').mockImplementation(() => {});
  });

  afterEach(() => {
    consoleSpy.mockRestore();
    process.env.NEXT_PUBLIC_DEPLOY_ENV = originalEnv;
  });

  it('logs to console.log when NEXT_PUBLIC_DEPLOY_ENV is "STAGE"', () => {
    process.env.NEXT_PUBLIC_DEPLOY_ENV = 'STAGE';
    debugLog('hello', 'world');
    expect(consoleSpy).toHaveBeenCalledWith('hello', 'world');
  });

  it('does not log when NEXT_PUBLIC_DEPLOY_ENV is "PRODUCTION"', () => {
    process.env.NEXT_PUBLIC_DEPLOY_ENV = 'PRODUCTION';
    debugLog('should not appear');
    expect(consoleSpy).not.toHaveBeenCalled();
  });

  it('does not log when NEXT_PUBLIC_DEPLOY_ENV is undefined', () => {
    delete process.env.NEXT_PUBLIC_DEPLOY_ENV;
    debugLog('should not appear');
    expect(consoleSpy).not.toHaveBeenCalled();
  });
});

describe('debugError', () => {
  let consoleSpy: ReturnType<typeof jest.spyOn>;
  const originalEnv = process.env.NEXT_PUBLIC_DEPLOY_ENV;

  beforeEach(() => {
    consoleSpy = jest.spyOn(console, 'error').mockImplementation(() => {});
  });

  afterEach(() => {
    consoleSpy.mockRestore();
    process.env.NEXT_PUBLIC_DEPLOY_ENV = originalEnv;
  });

  it('logs to console.error only when NEXT_PUBLIC_DEPLOY_ENV is "STAGE"', () => {
    process.env.NEXT_PUBLIC_DEPLOY_ENV = 'STAGE';
    debugError('error message');
    expect(consoleSpy).toHaveBeenCalledWith('error message');

    consoleSpy.mockClear();
    process.env.NEXT_PUBLIC_DEPLOY_ENV = 'PRODUCTION';
    debugError('should not appear');
    expect(consoleSpy).not.toHaveBeenCalled();
  });
});

describe('debugWarn', () => {
  let consoleSpy: ReturnType<typeof jest.spyOn>;
  const originalEnv = process.env.NEXT_PUBLIC_DEPLOY_ENV;

  beforeEach(() => {
    consoleSpy = jest.spyOn(console, 'warn').mockImplementation(() => {});
  });

  afterEach(() => {
    consoleSpy.mockRestore();
    process.env.NEXT_PUBLIC_DEPLOY_ENV = originalEnv;
  });

  it('logs to console.warn only when NEXT_PUBLIC_DEPLOY_ENV is "STAGE"', () => {
    process.env.NEXT_PUBLIC_DEPLOY_ENV = 'STAGE';
    debugWarn('warn message');
    expect(consoleSpy).toHaveBeenCalledWith('warn message');

    consoleSpy.mockClear();
    process.env.NEXT_PUBLIC_DEPLOY_ENV = 'PRODUCTION';
    debugWarn('should not appear');
    expect(consoleSpy).not.toHaveBeenCalled();
  });
});

// ---------------------------------------------------------------------------
// isAuthenticationError
// ---------------------------------------------------------------------------

describe('isAuthenticationError', () => {
  it('returns false for null', () => {
    expect(isAuthenticationError(null)).toBe(false);
  });

  it('returns false for undefined', () => {
    expect(isAuthenticationError(undefined)).toBe(false);
  });

  it('returns false for empty string', () => {
    expect(isAuthenticationError('')).toBe(false);
  });

  it('returns true for Error with message "NotAuthorizedException"', () => {
    expect(isAuthenticationError(new Error('NotAuthorizedException'))).toBe(true);
  });

  it('returns true for string with "notauthorizedexception" (case-insensitive)', () => {
    expect(isAuthenticationError('notauthorizedexception happened')).toBe(true);
  });

  it('returns true for object with name: "NotAuthorizedException"', () => {
    expect(isAuthenticationError({ name: 'NotAuthorizedException', message: 'auth failed' })).toBe(true);
  });

  it('returns true for object with code: "NotAuthorizedException"', () => {
    expect(isAuthenticationError({ code: 'NotAuthorizedException', message: 'auth failed' })).toBe(true);
  });

  it('returns true for each known auth error pattern in message strings', () => {
    const authPatterns = [
      'authentication expired',
      'authentication required',
      'please sign in',
      'please sign in again',
      'no authentication token',
      'no access token',
      'no id token',
      'invalid authentication token',
      'invalid id token',
      'authentication token has expired',
      'jwt',
      'no jwt token',
      'invalid or expired',
      'unauthorized',
      '401',
      '[client] no access token',
      '[client] no id token',
      'unable to verify secret hash',
    ];

    for (const pattern of authPatterns) {
      expect(isAuthenticationError(`Error: ${pattern}`)).toBe(true);
    }
  });

  it('returns false for a generic non-auth error', () => {
    expect(isAuthenticationError(new Error('Something went wrong on the server'))).toBe(false);
  });

  it('returns false for string "403" (not an auth error pattern)', () => {
    expect(isAuthenticationError('403')).toBe(false);
  });

  it('handles non-Error non-string unknown values via String() coercion', () => {
    // A plain number — String(42) = "42", no auth patterns
    expect(isAuthenticationError(42)).toBe(false);

    // An object without Error/string — String({}) = "[object Object]", no auth patterns
    const plainObj = { foo: 'bar' };
    expect(isAuthenticationError(plainObj)).toBe(false);
  });
});

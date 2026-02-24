/**
 * Tests for authThunks.ts — the 9 async thunks that handle Cognito auth flows.
 *
 * Strategy:
 * - The global __mocks__/@aws-sdk/client-cognito-identity-provider mock is
 *   active automatically. We grab its `send` mock via the imported client
 *   constructor and configure return values per test.
 * - `generateSecretHash` is mocked to return undefined (no client secret).
 * - A real test store is created per test so we can dispatch thunks and
 *   assert state changes.
 */

import { configureStore, combineReducers } from '@reduxjs/toolkit';
import authReducer from '../slices/authSlice';
import {
  CognitoIdentityProviderClient,
  InitiateAuthCommand,
  GlobalSignOutCommand,
  ForgotPasswordCommand,
  ConfirmForgotPasswordCommand,
  ChangePasswordCommand,
  RespondToAuthChallengeCommand,
} from '@aws-sdk/client-cognito-identity-provider';
import {
  signInThunk,
  respondToNewPasswordChallengeThunk,
  signOutThunk,
  refreshTokensThunk,
  checkAuthThunk,
  forgotPasswordThunk,
  confirmNewPasswordThunk,
  changePasswordThunk,
} from './authThunks';

// Mock generateSecretHash to return undefined (no client secret configured)
jest.mock('@/lib/utils', () => ({
  generateSecretHash: jest.fn().mockResolvedValue(undefined),
  debugLog: jest.fn(),
  debugError: jest.fn(),
}));

// ---------------------------------------------------------------------------
// Helpers
// ---------------------------------------------------------------------------

/** Build a fake JWT token whose payload section decodes to the given object. */
function fakeJwt(payload: Record<string, unknown>): string {
  const header = btoa(JSON.stringify({ alg: 'RS256', typ: 'JWT' }));
  const body = btoa(JSON.stringify(payload));
  const sig = btoa('fakesignature');
  return `${header}.${body}.${sig}`;
}

const mockJwtPayload = {
  sub: 'user-001',
  email: 'test@example.com',
  'custom:tenant': 'tenant-1',
  'custom:role': 'Admin',
  iss: 'https://cognito-idp.us-east-1.amazonaws.com/pool-1',
  aud: 'client-1',
  exp: Math.floor(Date.now() / 1000) + 86400,
  iat: Math.floor(Date.now() / 1000),
  token_use: 'id',
  name: 'Test User',
};

const mockAccessPayload = {
  sub: 'user-001',
  exp: Math.floor(Date.now() / 1000) + 3600,
  iss: 'https://cognito-idp.us-east-1.amazonaws.com/pool-1',
  token_use: 'access',
};

const mockIdToken = fakeJwt(mockJwtPayload);
const mockAccessToken = fakeJwt(mockAccessPayload);
const mockRefreshToken = 'mock-refresh-token';

function createStore(preloadedAuth?: Record<string, unknown>) {
  return configureStore({
    reducer: combineReducers({ auth: authReducer }),
    preloadedState: preloadedAuth ? { auth: preloadedAuth as never } : undefined,
    middleware: (getDefault) => getDefault({ serializableCheck: false }),
  });
}

// Get the mock send function
let mockSend: jest.Mock;

// Ensure mock mode is OFF for Cognito-path tests (CI sets NEXT_PUBLIC_MOCK_MODE=true globally)
const savedMockMode = process.env.NEXT_PUBLIC_MOCK_MODE;
beforeAll(() => {
  delete process.env.NEXT_PUBLIC_MOCK_MODE;
});
afterAll(() => {
  if (savedMockMode !== undefined) {
    process.env.NEXT_PUBLIC_MOCK_MODE = savedMockMode;
  }
});

beforeEach(() => {
  jest.clearAllMocks();
  // Reset the singleton by clearing module state
  // The global mock CognitoIdentityProviderClient constructor tracks instances
  const clientInstance = new CognitoIdentityProviderClient({ region: 'us-east-1' });
  mockSend = clientInstance.send as jest.Mock;
  mockSend.mockReset();
});

// ---------------------------------------------------------------------------
// signInThunk
// ---------------------------------------------------------------------------
describe('signInThunk', () => {
  it('dispatches fulfilled and populates auth state on successful sign-in', async () => {
    mockSend.mockResolvedValueOnce({
      AuthenticationResult: {
        AccessToken: mockAccessToken,
        IdToken: mockIdToken,
        RefreshToken: mockRefreshToken,
      },
    });

    const store = createStore();
    await store.dispatch(signInThunk({ email: 'test@example.com', password: 'pass123' }));

    const state = store.getState().auth;
    expect(state.user).not.toBeNull();
    expect(state.user?.email).toBe('test@example.com');
    expect(state.tokens.accessToken).toBe(mockAccessToken);
    expect(state.tokens.idToken).toBe(mockIdToken);
    expect(state.tokens.refreshToken).toBe(mockRefreshToken);
    expect(state.isTokenValid).toBe(true);
    expect(state.loading).toBe(false);
    expect(state.error).toBeNull();
    expect(InitiateAuthCommand).toHaveBeenCalledWith(
      expect.objectContaining({ AuthFlow: 'USER_PASSWORD_AUTH' }),
    );
  });

  it('handles NEW_PASSWORD_REQUIRED challenge', async () => {
    mockSend.mockResolvedValueOnce({
      ChallengeName: 'NEW_PASSWORD_REQUIRED',
      Session: 'session-123',
    });

    const store = createStore();
    const result = await store.dispatch(signInThunk({ email: 'test@example.com', password: 'old' }));

    expect(result.type).toBe('auth/signIn/rejected');
    const payload = result.payload as { requiresNewPassword: boolean; session: string };
    expect(payload.requiresNewPassword).toBe(true);
    expect(payload.session).toBe('session-123');
    // Error should be null for new password challenge
    expect(store.getState().auth.error).toBeNull();
  });

  it('rejects with NotAuthorizedException message', async () => {
    mockSend.mockRejectedValueOnce(
      Object.assign(new Error('Incorrect username or password'), {
        name: 'NotAuthorizedException',
      }),
    );

    const store = createStore();
    await store.dispatch(signInThunk({ email: 'bad@example.com', password: 'wrong' }));

    expect(store.getState().auth.error).toBe('Invalid email or password');
    expect(store.getState().auth.loading).toBe(false);
  });

  it('rejects with UserNotConfirmedException message', async () => {
    mockSend.mockRejectedValueOnce(
      Object.assign(new Error('User not confirmed'), { name: 'UserNotConfirmedException' }),
    );

    const store = createStore();
    await store.dispatch(signInThunk({ email: 't@e.com', password: 'p' }));
    expect(store.getState().auth.error).toBe('Please confirm your email address');
  });

  it('rejects with UserNotFoundException message', async () => {
    mockSend.mockRejectedValueOnce(
      Object.assign(new Error('User not found'), { name: 'UserNotFoundException' }),
    );

    const store = createStore();
    await store.dispatch(signInThunk({ email: 'no@e.com', password: 'p' }));
    expect(store.getState().auth.error).toBe('User not found');
  });

  it('rejects with generic error message for unknown Cognito errors', async () => {
    mockSend.mockRejectedValueOnce(
      Object.assign(new Error('Something weird'), { name: 'InternalErrorException' }),
    );

    const store = createStore();
    await store.dispatch(signInThunk({ email: 'x@e.com', password: 'p' }));
    expect(store.getState().auth.error).toBe('Something weird');
  });

  it('handles missing AuthenticationResult tokens', async () => {
    mockSend.mockResolvedValueOnce({
      AuthenticationResult: {
        AccessToken: mockAccessToken,
        IdToken: null, // missing
        RefreshToken: null,
      },
    });

    const store = createStore();
    await store.dispatch(signInThunk({ email: 't@e.com', password: 'p' }));
    expect(store.getState().auth.error).toBe('Invalid authentication response');
  });

  it('handles empty AuthenticationResult', async () => {
    mockSend.mockResolvedValueOnce({});

    const store = createStore();
    await store.dispatch(signInThunk({ email: 't@e.com', password: 'p' }));
    expect(store.getState().auth.error).toBe('Invalid authentication response');
  });
});

// ---------------------------------------------------------------------------
// respondToNewPasswordChallengeThunk
// ---------------------------------------------------------------------------
describe('respondToNewPasswordChallengeThunk', () => {
  it('completes password challenge and returns tokens', async () => {
    mockSend.mockResolvedValueOnce({
      AuthenticationResult: {
        AccessToken: mockAccessToken,
        IdToken: mockIdToken,
        RefreshToken: mockRefreshToken,
      },
    });

    const store = createStore();
    await store.dispatch(
      respondToNewPasswordChallengeThunk({
        session: 'sess-1',
        newPassword: 'NewPass!23',
        email: 'test@example.com',
      }),
    );

    const state = store.getState().auth;
    expect(state.user?.email).toBe('test@example.com');
    expect(state.isTokenValid).toBe(true);
    expect(state.loading).toBe(false);
    expect(RespondToAuthChallengeCommand).toHaveBeenCalledWith(
      expect.objectContaining({ ChallengeName: 'NEW_PASSWORD_REQUIRED' }),
    );
  });

  it('rejects with NotAuthorizedException (session expired)', async () => {
    mockSend.mockRejectedValueOnce(
      Object.assign(new Error('Session expired'), { name: 'NotAuthorizedException' }),
    );

    const store = createStore();
    await store.dispatch(
      respondToNewPasswordChallengeThunk({ session: 's', newPassword: 'p', email: 'e' }),
    );
    expect(store.getState().auth.error).toBe('Session expired. Please sign in again.');
  });

  it('rejects with InvalidPasswordException', async () => {
    mockSend.mockRejectedValueOnce(
      Object.assign(new Error('Bad pw'), { name: 'InvalidPasswordException' }),
    );

    const store = createStore();
    await store.dispatch(
      respondToNewPasswordChallengeThunk({ session: 's', newPassword: 'p', email: 'e' }),
    );
    expect(store.getState().auth.error).toBe('Password does not meet requirements');
  });

  it('rejects with InvalidParameterException', async () => {
    mockSend.mockRejectedValueOnce(
      Object.assign(new Error('Bad'), { name: 'InvalidParameterException' }),
    );

    const store = createStore();
    await store.dispatch(
      respondToNewPasswordChallengeThunk({ session: 's', newPassword: 'p', email: 'e' }),
    );
    expect(store.getState().auth.error).toBe('Invalid password format');
  });

  it('handles missing tokens in response', async () => {
    mockSend.mockResolvedValueOnce({
      AuthenticationResult: { AccessToken: null, IdToken: null, RefreshToken: null },
    });

    const store = createStore();
    await store.dispatch(
      respondToNewPasswordChallengeThunk({ session: 's', newPassword: 'p', email: 'e' }),
    );
    expect(store.getState().auth.error).toBe('Failed to complete password change');
  });

  it('handles empty AuthenticationResult', async () => {
    mockSend.mockResolvedValueOnce({});

    const store = createStore();
    await store.dispatch(
      respondToNewPasswordChallengeThunk({ session: 's', newPassword: 'p', email: 'e' }),
    );
    expect(store.getState().auth.error).toBe('Failed to complete password change');
  });
});

// ---------------------------------------------------------------------------
// signOutThunk
// ---------------------------------------------------------------------------
describe('signOutThunk', () => {
  it('calls GlobalSignOut and clears auth state and localStorage', async () => {
    mockSend.mockResolvedValueOnce({});

    const store = createStore({
      user: { id: 'u1', email: 'e', name: 'n' },
      userContext: null,
      tokens: { accessToken: 'at', idToken: 'it', refreshToken: 'rt', expiresAt: 999 },
      jwtPayload: null,
      isTokenValid: true,
      loading: false,
      error: null,
      isLoggingOut: false,
      isRefreshing: false,
      lastRefreshAttempt: null,
    });

    // Seed localStorage to verify synchronous cleanup
    localStorage.setItem('accessToken', 'stale-at');
    localStorage.setItem('idToken', 'stale-it');
    localStorage.setItem('refreshToken', 'stale-rt');
    localStorage.setItem('persist:auth', '{"tokens":"stale"}');

    await store.dispatch(signOutThunk());

    expect(GlobalSignOutCommand).toHaveBeenCalledWith({ AccessToken: 'at' });
    const state = store.getState().auth;
    expect(state.user).toBeNull();
    expect(state.tokens.accessToken).toBeNull();
    expect(state.isTokenValid).toBe(false);
    expect(state.isLoggingOut).toBe(false);

    // localStorage cleared synchronously before thunk returns
    expect(localStorage.getItem('accessToken')).toBeNull();
    expect(localStorage.getItem('idToken')).toBeNull();
    expect(localStorage.getItem('refreshToken')).toBeNull();
    expect(localStorage.getItem('persist:auth')).toBeNull();
  });

  it('still clears auth state when Cognito signout fails', async () => {
    mockSend.mockRejectedValueOnce(new Error('Network error'));

    const store = createStore({
      user: { id: 'u1', email: 'e', name: 'n' },
      userContext: null,
      tokens: { accessToken: 'at', idToken: 'it', refreshToken: 'rt', expiresAt: 999 },
      jwtPayload: null,
      isTokenValid: true,
      loading: false,
      error: null,
      isLoggingOut: false,
      isRefreshing: false,
      lastRefreshAttempt: null,
    });

    await store.dispatch(signOutThunk());

    const state = store.getState().auth;
    expect(state.user).toBeNull();
    expect(state.isLoggingOut).toBe(false);
  });

  it('skips Cognito call when no access token', async () => {
    const store = createStore();
    await store.dispatch(signOutThunk());
    // GlobalSignOutCommand should not have been called
    expect(GlobalSignOutCommand).not.toHaveBeenCalled();
  });
});

// ---------------------------------------------------------------------------
// refreshTokensThunk
// ---------------------------------------------------------------------------
describe('refreshTokensThunk', () => {
  const authenticatedState = {
    user: { id: 'u1', email: 'test@example.com', name: 'Test' },
    userContext: null,
    tokens: {
      accessToken: 'old-at',
      idToken: 'old-it',
      refreshToken: mockRefreshToken,
      expiresAt: Date.now() - 1000,
    },
    jwtPayload: null,
    isTokenValid: false,
    loading: false,
    error: null,
    isLoggingOut: false,
    isRefreshing: false,
    lastRefreshAttempt: null,
  };

  it('refreshes tokens successfully', async () => {
    const newAccessToken = fakeJwt(mockAccessPayload);
    const newIdToken = fakeJwt(mockJwtPayload);

    mockSend.mockResolvedValueOnce({
      AuthenticationResult: {
        AccessToken: newAccessToken,
        IdToken: newIdToken,
      },
    });

    const store = createStore(authenticatedState);
    await store.dispatch(refreshTokensThunk());

    const state = store.getState().auth;
    expect(state.tokens.accessToken).toBe(newAccessToken);
    expect(state.tokens.idToken).toBe(newIdToken);
    expect(state.tokens.refreshToken).toBe(mockRefreshToken);
    expect(state.isTokenValid).toBe(true);
    expect(state.isRefreshing).toBe(false);
    expect(InitiateAuthCommand).toHaveBeenCalledWith(
      expect.objectContaining({ AuthFlow: 'REFRESH_TOKEN_AUTH' }),
    );
  });

  it('rejects when no refresh token is available', async () => {
    const store = createStore({
      ...authenticatedState,
      tokens: { accessToken: null, idToken: null, refreshToken: null, expiresAt: null },
    });
    const result = await store.dispatch(refreshTokensThunk());
    expect(result.type).toBe('auth/refreshTokens/rejected');
  });

  it('rejects on Cognito error', async () => {
    mockSend.mockRejectedValueOnce(
      Object.assign(new Error('Token expired'), { name: 'NotAuthorizedException' }),
    );

    const store = createStore(authenticatedState);
    const result = await store.dispatch(refreshTokensThunk());
    expect(result.type).toBe('auth/refreshTokens/rejected');
    // Tokens should NOT be cleared on refresh failure
    expect(store.getState().auth.tokens.refreshToken).toBe(mockRefreshToken);
  });

  it('handles empty AuthenticationResult', async () => {
    mockSend.mockResolvedValueOnce({});

    const store = createStore(authenticatedState);
    const result = await store.dispatch(refreshTokensThunk());
    expect(result.type).toBe('auth/refreshTokens/rejected');
  });

  it('handles missing AccessToken in result', async () => {
    mockSend.mockResolvedValueOnce({
      AuthenticationResult: { AccessToken: null, IdToken: null },
    });

    const store = createStore(authenticatedState);
    const result = await store.dispatch(refreshTokensThunk());
    expect(result.type).toBe('auth/refreshTokens/rejected');
  });
});

// ---------------------------------------------------------------------------
// checkAuthThunk
// ---------------------------------------------------------------------------
describe('checkAuthThunk', () => {
  it('returns user and payload when valid token exists', async () => {
    const store = createStore({
      user: null,
      userContext: null,
      tokens: { accessToken: 'at', idToken: mockIdToken, refreshToken: 'rt', expiresAt: 999 },
      jwtPayload: null,
      isTokenValid: false,
      loading: false,
      error: null,
      isLoggingOut: false,
      isRefreshing: false,
      lastRefreshAttempt: null,
    });

    await store.dispatch(checkAuthThunk());

    const state = store.getState().auth;
    expect(state.user).not.toBeNull();
    expect(state.user?.email).toBe('test@example.com');
    expect(state.isTokenValid).toBe(true);
    expect(state.loading).toBe(false);
  });

  it('returns null when no idToken exists', async () => {
    const store = createStore();
    await store.dispatch(checkAuthThunk());

    const state = store.getState().auth;
    expect(state.user).toBeNull();
    expect(state.isTokenValid).toBe(false);
    expect(state.loading).toBe(false);
  });

  it('returns null when token is expired', async () => {
    const expiredPayload = { ...mockJwtPayload, exp: Math.floor(Date.now() / 1000) - 3600 };
    const expiredToken = fakeJwt(expiredPayload);

    const store = createStore({
      user: null,
      userContext: null,
      tokens: { accessToken: 'at', idToken: expiredToken, refreshToken: 'rt', expiresAt: 999 },
      jwtPayload: null,
      isTokenValid: false,
      loading: false,
      error: null,
      isLoggingOut: false,
      isRefreshing: false,
      lastRefreshAttempt: null,
    });

    await store.dispatch(checkAuthThunk());
    expect(store.getState().auth.user).toBeNull();
    expect(store.getState().auth.isTokenValid).toBe(false);
  });

  it('returns null when token cannot be decoded', async () => {
    const store = createStore({
      user: null,
      userContext: null,
      tokens: { accessToken: 'at', idToken: 'not-a-jwt', refreshToken: 'rt', expiresAt: 999 },
      jwtPayload: null,
      isTokenValid: false,
      loading: false,
      error: null,
      isLoggingOut: false,
      isRefreshing: false,
      lastRefreshAttempt: null,
    });

    await store.dispatch(checkAuthThunk());
    expect(store.getState().auth.user).toBeNull();
  });
});

// ---------------------------------------------------------------------------
// forgotPasswordThunk
// ---------------------------------------------------------------------------
describe('forgotPasswordThunk', () => {
  it('sends forgot password command', async () => {
    mockSend.mockResolvedValueOnce({});

    const store = createStore();
    const result = await store.dispatch(forgotPasswordThunk('user@example.com'));

    expect(result.type).toBe('auth/forgotPassword/fulfilled');
    expect(ForgotPasswordCommand).toHaveBeenCalledWith(
      expect.objectContaining({ Username: 'user@example.com' }),
    );
    expect(store.getState().auth.loading).toBe(false);
  });

  it('rejects with UserNotFoundException', async () => {
    mockSend.mockRejectedValueOnce(
      Object.assign(new Error('No user'), { name: 'UserNotFoundException' }),
    );

    const store = createStore();
    await store.dispatch(forgotPasswordThunk('bad@example.com'));
    expect(store.getState().auth.error).toBe('User not found');
  });

  it('rejects with LimitExceededException', async () => {
    mockSend.mockRejectedValueOnce(
      Object.assign(new Error('Limit'), { name: 'LimitExceededException' }),
    );

    const store = createStore();
    await store.dispatch(forgotPasswordThunk('x@e.com'));
    expect(store.getState().auth.error).toBe('Too many attempts. Please try again later');
  });

  it('rejects with generic Cognito error message', async () => {
    mockSend.mockRejectedValueOnce(
      Object.assign(new Error('Custom msg'), { name: 'SomethingElse' }),
    );

    const store = createStore();
    await store.dispatch(forgotPasswordThunk('x@e.com'));
    expect(store.getState().auth.error).toBe('Custom msg');
  });
});

// ---------------------------------------------------------------------------
// confirmNewPasswordThunk
// ---------------------------------------------------------------------------
describe('confirmNewPasswordThunk', () => {
  it('confirms new password successfully', async () => {
    mockSend.mockResolvedValueOnce({});

    const store = createStore();
    const result = await store.dispatch(
      confirmNewPasswordThunk({ email: 'u@e.com', code: '123456', newPassword: 'NewP@ss1' }),
    );

    expect(result.type).toBe('auth/confirmNewPassword/fulfilled');
    expect(ConfirmForgotPasswordCommand).toHaveBeenCalledWith(
      expect.objectContaining({
        Username: 'u@e.com',
        ConfirmationCode: '123456',
        Password: 'NewP@ss1',
      }),
    );
  });

  it('rejects with CodeMismatchException', async () => {
    mockSend.mockRejectedValueOnce(
      Object.assign(new Error('Bad code'), { name: 'CodeMismatchException' }),
    );

    const store = createStore();
    await store.dispatch(
      confirmNewPasswordThunk({ email: 'u@e.com', code: 'bad', newPassword: 'p' }),
    );
    expect(store.getState().auth.error).toBe('Invalid confirmation code');
  });

  it('rejects with ExpiredCodeException', async () => {
    mockSend.mockRejectedValueOnce(
      Object.assign(new Error('Expired'), { name: 'ExpiredCodeException' }),
    );

    const store = createStore();
    await store.dispatch(
      confirmNewPasswordThunk({ email: 'u@e.com', code: '1', newPassword: 'p' }),
    );
    expect(store.getState().auth.error).toBe('Confirmation code has expired');
  });

  it('rejects with InvalidPasswordException', async () => {
    mockSend.mockRejectedValueOnce(
      Object.assign(new Error('Weak'), { name: 'InvalidPasswordException' }),
    );

    const store = createStore();
    await store.dispatch(
      confirmNewPasswordThunk({ email: 'u@e.com', code: '1', newPassword: 'weak' }),
    );
    expect(store.getState().auth.error).toBe('Password does not meet requirements');
  });

  it('rejects with generic error', async () => {
    mockSend.mockRejectedValueOnce(
      Object.assign(new Error('Other'), { name: 'OtherException' }),
    );

    const store = createStore();
    await store.dispatch(
      confirmNewPasswordThunk({ email: 'u@e.com', code: '1', newPassword: 'p' }),
    );
    expect(store.getState().auth.error).toBe('Other');
  });
});

// ---------------------------------------------------------------------------
// changePasswordThunk
// ---------------------------------------------------------------------------
describe('changePasswordThunk', () => {
  const withAccessToken = {
    user: { id: 'u1', email: 'e', name: 'n' },
    userContext: null,
    tokens: { accessToken: 'at-123', idToken: 'it', refreshToken: 'rt', expiresAt: 999 },
    jwtPayload: null,
    isTokenValid: true,
    loading: false,
    error: null,
    isLoggingOut: false,
    isRefreshing: false,
    lastRefreshAttempt: null,
  };

  it('changes password successfully', async () => {
    mockSend.mockResolvedValueOnce({});

    const store = createStore(withAccessToken);
    const result = await store.dispatch(
      changePasswordThunk({ currentPassword: 'Old1!', newPassword: 'New1!' }),
    );

    expect(result.type).toBe('auth/changePassword/fulfilled');
    expect(ChangePasswordCommand).toHaveBeenCalledWith({
      AccessToken: 'at-123',
      PreviousPassword: 'Old1!',
      ProposedPassword: 'New1!',
    });
    expect(store.getState().auth.loading).toBe(false);
  });

  it('rejects when no access token', async () => {
    const store = createStore();
    const result = await store.dispatch(
      changePasswordThunk({ currentPassword: 'a', newPassword: 'b' }),
    );

    expect(result.type).toBe('auth/changePassword/rejected');
    expect(store.getState().auth.error).toBe('No access token found. Please sign in again.');
  });

  it('rejects with NotAuthorizedException', async () => {
    mockSend.mockRejectedValueOnce(
      Object.assign(new Error('Wrong'), { name: 'NotAuthorizedException' }),
    );

    const store = createStore(withAccessToken);
    await store.dispatch(changePasswordThunk({ currentPassword: 'bad', newPassword: 'n' }));
    expect(store.getState().auth.error).toBe(
      'Current password is incorrect or access token is invalid',
    );
  });

  it('rejects with InvalidPasswordException', async () => {
    mockSend.mockRejectedValueOnce(
      Object.assign(new Error('Weak'), { name: 'InvalidPasswordException' }),
    );

    const store = createStore(withAccessToken);
    await store.dispatch(changePasswordThunk({ currentPassword: 'old', newPassword: 'weak' }));
    expect(store.getState().auth.error).toBe('New password does not meet requirements');
  });

  it('rejects with LimitExceededException', async () => {
    mockSend.mockRejectedValueOnce(
      Object.assign(new Error('Limit'), { name: 'LimitExceededException' }),
    );

    const store = createStore(withAccessToken);
    await store.dispatch(changePasswordThunk({ currentPassword: 'o', newPassword: 'n' }));
    expect(store.getState().auth.error).toBe('Too many attempts. Please try again later');
  });

  it('rejects with InvalidParameterException', async () => {
    mockSend.mockRejectedValueOnce(
      Object.assign(new Error('Bad params'), { name: 'InvalidParameterException' }),
    );

    const store = createStore(withAccessToken);
    await store.dispatch(changePasswordThunk({ currentPassword: 'o', newPassword: 'n' }));
    expect(store.getState().auth.error).toBe('Invalid parameters provided');
  });

  it('rejects with generic Cognito error message', async () => {
    mockSend.mockRejectedValueOnce(
      Object.assign(new Error('Custom'), { name: 'UnknownError' }),
    );

    const store = createStore(withAccessToken);
    await store.dispatch(changePasswordThunk({ currentPassword: 'o', newPassword: 'n' }));
    expect(store.getState().auth.error).toBe('Custom');
  });
});

// ---------------------------------------------------------------------------
// Mock mode paths
// ---------------------------------------------------------------------------
describe('mock mode thunks', () => {
  const originalEnv = process.env.NEXT_PUBLIC_MOCK_MODE;

  beforeEach(() => {
    process.env.NEXT_PUBLIC_MOCK_MODE = 'true';
  });

  afterEach(() => {
    if (originalEnv === undefined) {
      delete process.env.NEXT_PUBLIC_MOCK_MODE;
    } else {
      process.env.NEXT_PUBLIC_MOCK_MODE = originalEnv;
    }
    sessionStorage.clear();
  });

  describe('signInThunk in mock mode', () => {
    it('returns mock tokens without calling Cognito', async () => {
      const store = createStore();
      const result = await store.dispatch(
        signInThunk({ email: 'dev@arda.cards', password: 'anything' }),
      );

      expect(result.type).toBe('auth/signIn/fulfilled');

      const state = store.getState().auth;
      expect(state.user).not.toBeNull();
      expect(state.user?.email).toBe('dev@arda.cards');
      expect(state.tokens.accessToken).toBeTruthy();
      expect(state.tokens.idToken).toBeTruthy();
      expect(state.tokens.refreshToken).toBeTruthy();
      expect(state.tokens.expiresAt).toBeGreaterThan(Date.now());
      expect(state.isTokenValid).toBe(true);
      expect(state.loading).toBe(false);

      // Cognito should NOT have been called
      expect(mockSend).not.toHaveBeenCalled();
    });

    it('uses email prefix as user name', async () => {
      const store = createStore();
      await store.dispatch(
        signInThunk({ email: 'testuser@example.com', password: 'p' }),
      );

      expect(store.getState().auth.user?.name).toBe('testuser');
    });
  });

  describe('signOutThunk in mock mode', () => {
    it('sets mock-auth-signed-out sessionStorage flag without calling Cognito', async () => {
      const store = createStore({
        user: { id: 'u1', email: 'e', name: 'n' },
        userContext: null,
        tokens: { accessToken: 'at', idToken: 'it', refreshToken: 'rt', expiresAt: 999 },
        jwtPayload: null,
        isTokenValid: true,
        loading: false,
        error: null,
        isLoggingOut: false,
        isRefreshing: false,
        lastRefreshAttempt: null,
      });

      // Seed localStorage to verify it gets cleared
      localStorage.setItem('accessToken', 'stale-at');
      localStorage.setItem('idToken', 'stale-it');
      localStorage.setItem('refreshToken', 'stale-rt');
      localStorage.setItem('persist:auth', '{"tokens":"stale"}');

      await store.dispatch(signOutThunk());

      expect(sessionStorage.getItem('mock-auth-signed-out')).toBe('1');
      expect(mockSend).not.toHaveBeenCalled();

      // State should be cleared by the fulfilled reducer
      const state = store.getState().auth;
      expect(state.user).toBeNull();
      expect(state.tokens.accessToken).toBeNull();

      // localStorage tokens should be cleared synchronously (no race with hard nav)
      expect(localStorage.getItem('accessToken')).toBeNull();
      expect(localStorage.getItem('idToken')).toBeNull();
      expect(localStorage.getItem('refreshToken')).toBeNull();
      expect(localStorage.getItem('persist:auth')).toBeNull();
    });
  });

  describe('refreshTokensThunk in mock mode', () => {
    it('returns fresh mock tokens without calling Cognito', async () => {
      const store = createStore({
        user: { id: 'u1', email: 'test@example.com', name: 'Test' },
        userContext: null,
        tokens: { accessToken: 'old', idToken: 'old', refreshToken: 'old', expiresAt: 1 },
        jwtPayload: null,
        isTokenValid: false,
        loading: false,
        error: null,
        isLoggingOut: false,
        isRefreshing: false,
        lastRefreshAttempt: null,
      });

      const result = await store.dispatch(refreshTokensThunk());

      expect(result.type).toBe('auth/refreshTokens/fulfilled');

      const state = store.getState().auth;
      expect(state.tokens.accessToken).toBeTruthy();
      expect(state.tokens.accessToken).not.toBe('old');
      expect(state.tokens.expiresAt).toBeGreaterThan(Date.now());
      expect(state.isTokenValid).toBe(true);

      expect(mockSend).not.toHaveBeenCalled();
    });
  });
});

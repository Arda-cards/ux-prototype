import reducer, {
  setUser,
  setUserContext,
  setTokens,
  setJwtPayload,
  setIsTokenValid,
  setLoading,
  setError,
  setIsLoggingOut,
  setIsRefreshing,
  setLastRefreshAttempt,
  clearAuth,
} from './authSlice';
import { createMockUser, createMockJWTPayload, createMockUserContext } from '@frontend/test-utils/mock-factories';

// Mock the thunks module so extraReducers references resolve
jest.mock('../thunks/authThunks', () => {
  const { createAsyncThunk } = jest.requireActual('@reduxjs/toolkit');
  return {
    signInThunk: createAsyncThunk('auth/signIn', () => {}),
    respondToNewPasswordChallengeThunk: createAsyncThunk('auth/respondToNewPasswordChallenge', () => {}),
    signOutThunk: createAsyncThunk('auth/signOut', () => {}),
    refreshTokensThunk: createAsyncThunk('auth/refreshTokens', () => {}),
    checkAuthThunk: createAsyncThunk('auth/checkAuth', () => {}),
    forgotPasswordThunk: createAsyncThunk('auth/forgotPassword', () => {}),
    confirmNewPasswordThunk: createAsyncThunk('auth/confirmNewPassword', () => {}),
    changePasswordThunk: createAsyncThunk('auth/changePassword', () => {}),
  };
});

const initialState = reducer(undefined, { type: '@@INIT' });

describe('authSlice', () => {
  describe('initial state', () => {
    it('returns the correct initial state', () => {
      expect(initialState.user).toBeNull();
      expect(initialState.userContext).toBeNull();
      expect(initialState.tokens).toEqual({
        accessToken: null,
        idToken: null,
        refreshToken: null,
        expiresAt: null,
      });
      expect(initialState.jwtPayload).toBeNull();
      expect(initialState.isTokenValid).toBe(false);
      expect(initialState.loading).toBe(false);
      expect(initialState.error).toBeNull();
      expect(initialState.isLoggingOut).toBe(false);
      expect(initialState.isRefreshing).toBe(false);
      expect(initialState.lastRefreshAttempt).toBeNull();
    });
  });

  describe('setUser', () => {
    it('sets a user object', () => {
      const user = createMockUser();
      const state = reducer(initialState, setUser(user));
      expect(state.user).toEqual(user);
    });

    it('clears the user when given null', () => {
      const withUser = reducer(initialState, setUser(createMockUser()));
      const state = reducer(withUser, setUser(null));
      expect(state.user).toBeNull();
    });
  });

  describe('setUserContext', () => {
    it('sets user context', () => {
      const ctx = createMockUserContext();
      const state = reducer(initialState, setUserContext(ctx));
      expect(state.userContext).toEqual(ctx);
    });

    it('clears user context when given null', () => {
      const withCtx = reducer(initialState, setUserContext(createMockUserContext()));
      const state = reducer(withCtx, setUserContext(null));
      expect(state.userContext).toBeNull();
    });
  });

  describe('setTokens', () => {
    it('sets token values', () => {
      const tokens = {
        accessToken: 'access-123',
        idToken: 'id-123',
        refreshToken: 'refresh-123',
        expiresAt: 9999999999,
      };
      const state = reducer(initialState, setTokens(tokens));
      expect(state.tokens).toEqual(tokens);
    });
  });

  describe('setJwtPayload', () => {
    it('sets JWT payload and derives userContext', () => {
      const payload = createMockJWTPayload();
      const state = reducer(initialState, setJwtPayload(payload));
      expect(state.jwtPayload).toEqual(payload);
      // extractUserContext should have been called
      expect(state.userContext).not.toBeNull();
      expect(state.userContext?.userId).toBe(payload.sub);
      expect(state.userContext?.email).toBe(payload.email);
    });

    it('clears JWT payload and keeps userContext unchanged when given null', () => {
      const withPayload = reducer(initialState, setJwtPayload(createMockJWTPayload()));
      const state = reducer(withPayload, setJwtPayload(null));
      expect(state.jwtPayload).toBeNull();
      // userContext is not cleared when payload is null (only set when payload truthy)
      expect(state.userContext).not.toBeNull();
    });
  });

  describe('setIsTokenValid', () => {
    it('sets isTokenValid to true', () => {
      const state = reducer(initialState, setIsTokenValid(true));
      expect(state.isTokenValid).toBe(true);
    });

    it('sets isTokenValid to false', () => {
      const valid = reducer(initialState, setIsTokenValid(true));
      const state = reducer(valid, setIsTokenValid(false));
      expect(state.isTokenValid).toBe(false);
    });
  });

  describe('setLoading', () => {
    it('toggles loading', () => {
      const state = reducer(initialState, setLoading(true));
      expect(state.loading).toBe(true);
      const state2 = reducer(state, setLoading(false));
      expect(state2.loading).toBe(false);
    });
  });

  describe('setError', () => {
    it('sets an error message', () => {
      const state = reducer(initialState, setError('Something failed'));
      expect(state.error).toBe('Something failed');
    });

    it('clears error with null', () => {
      const withErr = reducer(initialState, setError('err'));
      const state = reducer(withErr, setError(null));
      expect(state.error).toBeNull();
    });
  });

  describe('setIsLoggingOut', () => {
    it('sets isLoggingOut', () => {
      const state = reducer(initialState, setIsLoggingOut(true));
      expect(state.isLoggingOut).toBe(true);
    });
  });

  describe('setIsRefreshing', () => {
    it('sets isRefreshing', () => {
      const state = reducer(initialState, setIsRefreshing(true));
      expect(state.isRefreshing).toBe(true);
    });
  });

  describe('setLastRefreshAttempt', () => {
    it('sets timestamp', () => {
      const ts = Date.now();
      const state = reducer(initialState, setLastRefreshAttempt(ts));
      expect(state.lastRefreshAttempt).toBe(ts);
    });

    it('clears timestamp with null', () => {
      const withTs = reducer(initialState, setLastRefreshAttempt(12345));
      const state = reducer(withTs, setLastRefreshAttempt(null));
      expect(state.lastRefreshAttempt).toBeNull();
    });
  });

  describe('clearAuth', () => {
    it('resets all auth state to initial values', () => {
      // Build up a fully populated state
      let state = reducer(initialState, setUser(createMockUser()));
      state = reducer(state, setUserContext(createMockUserContext()));
      state = reducer(state, setTokens({
        accessToken: 'a', idToken: 'i', refreshToken: 'r', expiresAt: 999,
      }));
      state = reducer(state, setJwtPayload(createMockJWTPayload()));
      state = reducer(state, setIsTokenValid(true));
      state = reducer(state, setError('some error'));
      state = reducer(state, setIsLoggingOut(true));
      state = reducer(state, setIsRefreshing(true));
      state = reducer(state, setLastRefreshAttempt(12345));

      // Clear everything
      state = reducer(state, clearAuth());

      expect(state.user).toBeNull();
      expect(state.userContext).toBeNull();
      expect(state.tokens).toEqual({
        accessToken: null,
        idToken: null,
        refreshToken: null,
        expiresAt: null,
      });
      expect(state.jwtPayload).toBeNull();
      expect(state.isTokenValid).toBe(false);
      expect(state.error).toBeNull();
      expect(state.isLoggingOut).toBe(false);
      expect(state.isRefreshing).toBe(false);
      expect(state.lastRefreshAttempt).toBeNull();
    });
  });

  describe('extraReducers — thunk lifecycle actions', () => {
    // signInThunk
    it('handles signIn pending', () => {
      const state = reducer(initialState, { type: 'auth/signIn/pending' });
      expect(state.loading).toBe(true);
      expect(state.error).toBeNull();
    });

    it('handles signIn fulfilled', () => {
      const payload = {
        user: createMockUser(),
        jwtPayload: createMockJWTPayload(),
        tokens: {
          accessToken: 'at', idToken: 'it', refreshToken: 'rt', expiresAt: 999,
        },
      };
      const state = reducer(initialState, { type: 'auth/signIn/fulfilled', payload });
      expect(state.user).toEqual(payload.user);
      expect(state.tokens.accessToken).toBe('at');
      expect(state.isTokenValid).toBe(true);
      expect(state.loading).toBe(false);
      expect(state.error).toBeNull();
    });

    it('handles signIn rejected with string payload', () => {
      const state = reducer(initialState, {
        type: 'auth/signIn/rejected',
        payload: 'Invalid credentials',
      });
      expect(state.loading).toBe(false);
      expect(state.error).toBe('Invalid credentials');
    });

    it('handles signIn rejected with requiresNewPassword payload', () => {
      const state = reducer(initialState, {
        type: 'auth/signIn/rejected',
        payload: { requiresNewPassword: true, session: 'sess' },
      });
      expect(state.loading).toBe(false);
      expect(state.error).toBeNull();
    });

    it('handles signIn rejected with no payload', () => {
      const state = reducer(initialState, {
        type: 'auth/signIn/rejected',
        payload: undefined,
      });
      expect(state.loading).toBe(false);
      expect(state.error).toBe('Sign in failed');
    });

    // respondToNewPasswordChallengeThunk
    it('handles respondToNewPasswordChallenge pending', () => {
      const state = reducer(initialState, { type: 'auth/respondToNewPasswordChallenge/pending' });
      expect(state.loading).toBe(true);
      expect(state.error).toBeNull();
    });

    it('handles respondToNewPasswordChallenge fulfilled', () => {
      const payload = {
        user: createMockUser(),
        jwtPayload: createMockJWTPayload(),
        tokens: {
          accessToken: 'at', idToken: 'it', refreshToken: 'rt', expiresAt: 999,
        },
      };
      const state = reducer(initialState, {
        type: 'auth/respondToNewPasswordChallenge/fulfilled',
        payload,
      });
      expect(state.user).toEqual(payload.user);
      expect(state.isTokenValid).toBe(true);
      expect(state.loading).toBe(false);
    });

    it('handles respondToNewPasswordChallenge rejected', () => {
      const state = reducer(initialState, {
        type: 'auth/respondToNewPasswordChallenge/rejected',
        payload: 'Password too weak',
      });
      expect(state.loading).toBe(false);
      expect(state.error).toBe('Password too weak');
    });

    it('handles respondToNewPasswordChallenge rejected without payload', () => {
      const state = reducer(initialState, {
        type: 'auth/respondToNewPasswordChallenge/rejected',
        payload: undefined,
      });
      expect(state.loading).toBe(false);
      expect(state.error).toBe('Failed to set new password');
    });

    // signOutThunk
    it('handles signOut pending', () => {
      const state = reducer(initialState, { type: 'auth/signOut/pending' });
      expect(state.isLoggingOut).toBe(true);
      expect(state.error).toBeNull();
    });

    it('handles signOut fulfilled — clears all auth state', () => {
      let state = reducer(initialState, setUser(createMockUser()));
      state = reducer(state, setIsTokenValid(true));
      state = reducer(state, { type: 'auth/signOut/fulfilled' });
      expect(state.user).toBeNull();
      expect(state.tokens.accessToken).toBeNull();
      expect(state.isTokenValid).toBe(false);
      expect(state.isLoggingOut).toBe(false);
    });

    it('handles signOut rejected — still clears auth state', () => {
      let state = reducer(initialState, setUser(createMockUser()));
      state = reducer(state, { type: 'auth/signOut/rejected' });
      expect(state.user).toBeNull();
      expect(state.isLoggingOut).toBe(false);
    });

    // refreshTokensThunk
    it('handles refreshTokens pending', () => {
      const before = Date.now();
      const state = reducer(initialState, { type: 'auth/refreshTokens/pending' });
      expect(state.isRefreshing).toBe(true);
      expect(state.lastRefreshAttempt).toBeGreaterThanOrEqual(before);
    });

    it('handles refreshTokens fulfilled', () => {
      const payload = {
        accessToken: 'new-at',
        idToken: 'new-it',
        refreshToken: 'new-rt',
        expiresAt: 99999,
      };
      const state = reducer(initialState, { type: 'auth/refreshTokens/fulfilled', payload });
      expect(state.tokens.accessToken).toBe('new-at');
      expect(state.isTokenValid).toBe(true);
      expect(state.isRefreshing).toBe(false);
    });

    it('handles refreshTokens rejected — does not clear tokens', () => {
      let state = reducer(initialState, setTokens({
        accessToken: 'old', idToken: 'old', refreshToken: 'old', expiresAt: 1,
      }));
      state = reducer(state, { type: 'auth/refreshTokens/rejected' });
      expect(state.isRefreshing).toBe(false);
      expect(state.tokens.accessToken).toBe('old'); // preserved
    });

    // checkAuthThunk
    it('handles checkAuth pending — does not set loading to avoid full-page spinner during background validation', () => {
      const state = reducer(initialState, { type: 'auth/checkAuth/pending' });
      expect(state.loading).toBe(false); // intentionally not set: checkAuthThunk is a local JWT decode, not a user-facing async op
    });

    it('handles checkAuth fulfilled with auth data', () => {
      const payload = {
        user: createMockUser(),
        jwtPayload: createMockJWTPayload(),
      };
      const state = reducer(initialState, { type: 'auth/checkAuth/fulfilled', payload });
      expect(state.user).toEqual(payload.user);
      expect(state.isTokenValid).toBe(true);
      expect(state.loading).toBe(false);
    });

    it('handles checkAuth fulfilled with null (not authenticated)', () => {
      let state = reducer(initialState, setUser(createMockUser()));
      state = reducer(state, { type: 'auth/checkAuth/fulfilled', payload: null });
      expect(state.user).toBeNull();
      expect(state.isTokenValid).toBe(false);
      expect(state.loading).toBe(false);
    });

    it('handles checkAuth rejected', () => {
      const state = reducer(initialState, { type: 'auth/checkAuth/rejected' });
      expect(state.user).toBeNull();
      expect(state.isTokenValid).toBe(false);
      expect(state.loading).toBe(false);
    });

    // forgotPasswordThunk
    it('handles forgotPassword pending', () => {
      const state = reducer(initialState, { type: 'auth/forgotPassword/pending' });
      expect(state.loading).toBe(true);
      expect(state.error).toBeNull();
    });

    it('handles forgotPassword fulfilled', () => {
      const state = reducer(
        reducer(initialState, { type: 'auth/forgotPassword/pending' }),
        { type: 'auth/forgotPassword/fulfilled' },
      );
      expect(state.loading).toBe(false);
    });

    it('handles forgotPassword rejected', () => {
      const state = reducer(initialState, {
        type: 'auth/forgotPassword/rejected',
        payload: 'User not found',
      });
      expect(state.loading).toBe(false);
      expect(state.error).toBe('User not found');
    });

    it('handles forgotPassword rejected without payload', () => {
      const state = reducer(initialState, {
        type: 'auth/forgotPassword/rejected',
        payload: undefined,
      });
      expect(state.error).toBe('Failed to send reset email');
    });

    // confirmNewPasswordThunk
    it('handles confirmNewPassword pending', () => {
      const state = reducer(initialState, { type: 'auth/confirmNewPassword/pending' });
      expect(state.loading).toBe(true);
      expect(state.error).toBeNull();
    });

    it('handles confirmNewPassword fulfilled', () => {
      const state = reducer(
        reducer(initialState, { type: 'auth/confirmNewPassword/pending' }),
        { type: 'auth/confirmNewPassword/fulfilled' },
      );
      expect(state.loading).toBe(false);
    });

    it('handles confirmNewPassword rejected', () => {
      const state = reducer(initialState, {
        type: 'auth/confirmNewPassword/rejected',
        payload: 'Code expired',
      });
      expect(state.error).toBe('Code expired');
    });

    it('handles confirmNewPassword rejected without payload', () => {
      const state = reducer(initialState, {
        type: 'auth/confirmNewPassword/rejected',
        payload: undefined,
      });
      expect(state.error).toBe('Failed to reset password');
    });

    // changePasswordThunk
    it('handles changePassword pending', () => {
      const state = reducer(initialState, { type: 'auth/changePassword/pending' });
      expect(state.loading).toBe(true);
      expect(state.error).toBeNull();
    });

    it('handles changePassword fulfilled', () => {
      const state = reducer(
        reducer(initialState, { type: 'auth/changePassword/pending' }),
        { type: 'auth/changePassword/fulfilled' },
      );
      expect(state.loading).toBe(false);
    });

    it('handles changePassword rejected', () => {
      const state = reducer(initialState, {
        type: 'auth/changePassword/rejected',
        payload: 'Incorrect old password',
      });
      expect(state.error).toBe('Incorrect old password');
    });

    it('handles changePassword rejected without payload', () => {
      const state = reducer(initialState, {
        type: 'auth/changePassword/rejected',
        payload: undefined,
      });
      expect(state.error).toBe('Failed to change password');
    });
  });
});

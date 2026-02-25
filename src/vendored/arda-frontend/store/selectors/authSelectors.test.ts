import {
  selectUser,
  selectUserContext,
  selectTokens,
  selectAccessToken,
  selectIdToken,
  selectRefreshToken,
  selectJwtPayload,
  selectIsTokenValid,
  selectIsAuthenticated,
  selectAuthLoading,
  selectAuthError,
  selectIsLoggingOut,
  selectIsRefreshing,
} from './authSelectors';
import { createTestStore, mockAuthStateWithTokens, mockAuthStateSignedOut } from '@frontend/test-utils/test-store';

describe('authSelectors', () => {
  it('selectUser returns user from auth state', () => {
    const store = createTestStore({ auth: mockAuthStateWithTokens });
    expect(selectUser(store.getState())).toEqual(mockAuthStateWithTokens.user);
  });

  it('selectUserContext returns userContext', () => {
    const store = createTestStore({ auth: mockAuthStateWithTokens });
    expect(selectUserContext(store.getState())).toEqual(mockAuthStateWithTokens.userContext);
  });

  it('selectTokens returns tokens object', () => {
    const store = createTestStore({ auth: mockAuthStateWithTokens });
    expect(selectTokens(store.getState())).toEqual(mockAuthStateWithTokens.tokens);
  });

  it('selectAccessToken returns accessToken', () => {
    const store = createTestStore({ auth: mockAuthStateWithTokens });
    expect(selectAccessToken(store.getState())).toBe('mock-access-token');
  });

  it('selectIdToken returns idToken', () => {
    const store = createTestStore({ auth: mockAuthStateWithTokens });
    expect(selectIdToken(store.getState())).toBe('mock-id-token');
  });

  it('selectRefreshToken returns refreshToken', () => {
    const store = createTestStore({ auth: mockAuthStateWithTokens });
    expect(selectRefreshToken(store.getState())).toBe('mock-refresh-token');
  });

  it('selectJwtPayload returns payload', () => {
    const store = createTestStore({ auth: mockAuthStateWithTokens });
    expect(selectJwtPayload(store.getState())).toEqual(mockAuthStateWithTokens.jwtPayload);
  });

  it('selectIsTokenValid returns true when authenticated', () => {
    const store = createTestStore({ auth: mockAuthStateWithTokens });
    expect(selectIsTokenValid(store.getState())).toBe(true);
  });

  it('selectIsAuthenticated returns true when user and accessToken exist', () => {
    const store = createTestStore({ auth: mockAuthStateWithTokens });
    expect(selectIsAuthenticated(store.getState())).toBe(true);
  });

  it('selectIsAuthenticated returns false when signed out', () => {
    const store = createTestStore({ auth: mockAuthStateSignedOut });
    expect(selectIsAuthenticated(store.getState())).toBe(false);
  });

  it('selectAuthLoading returns loading flag', () => {
    const store = createTestStore({ auth: { ...mockAuthStateSignedOut, loading: true } });
    expect(selectAuthLoading(store.getState())).toBe(true);
  });

  it('selectAuthError returns error string', () => {
    const store = createTestStore({ auth: { ...mockAuthStateSignedOut, error: 'fail' } });
    expect(selectAuthError(store.getState())).toBe('fail');
  });

  it('selectIsLoggingOut returns flag', () => {
    const store = createTestStore({ auth: { ...mockAuthStateSignedOut, isLoggingOut: true } });
    expect(selectIsLoggingOut(store.getState())).toBe(true);
  });

  it('selectIsRefreshing returns flag', () => {
    const store = createTestStore({ auth: { ...mockAuthStateSignedOut, isRefreshing: true } });
    expect(selectIsRefreshing(store.getState())).toBe(true);
  });
});

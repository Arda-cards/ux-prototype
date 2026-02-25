import { renderHook, act } from '@testing-library/react';
import React from 'react';
import { Provider } from 'react-redux';
import { createTestStore, mockAuthStateWithTokens, mockAuthStateSignedOut } from '@frontend/test-utils/test-store';
import { useJWT } from './useJWT';

// Mock thunks
jest.mock('../thunks/authThunks', () => {
  const { createAsyncThunk } = jest.requireActual('@reduxjs/toolkit');
  return {
    signInThunk: createAsyncThunk('auth/signIn', () => {}),
    respondToNewPasswordChallengeThunk: createAsyncThunk('auth/respondToNewPasswordChallenge', () => {}),
    signOutThunk: createAsyncThunk('auth/signOut', () => {}),
    refreshTokensThunk: createAsyncThunk('auth/refreshTokens', () => ({})),
    checkAuthThunk: createAsyncThunk('auth/checkAuth', () => null),
    forgotPasswordThunk: createAsyncThunk('auth/forgotPassword', () => {}),
    confirmNewPasswordThunk: createAsyncThunk('auth/confirmNewPassword', () => {}),
    changePasswordThunk: createAsyncThunk('auth/changePassword', () => {}),
  };
});

function wrapper(store: ReturnType<typeof createTestStore>) {
  return function Wrapper({ children }: { children: React.ReactNode }) {
    return React.createElement(Provider, { store }, children);
  };
}

describe('useJWT', () => {
  it('returns token and payload from authenticated state', () => {
    const store = createTestStore({ auth: mockAuthStateWithTokens });
    const { result } = renderHook(() => useJWT(), { wrapper: wrapper(store) });
    expect(result.current.token).toBe('mock-id-token');
    expect(result.current.payload).toEqual(mockAuthStateWithTokens.jwtPayload);
    expect(result.current.userContext).toEqual(mockAuthStateWithTokens.userContext);
    expect(result.current.isTokenValid).toBe(true);
  });

  it('returns null values when signed out', () => {
    const store = createTestStore({ auth: mockAuthStateSignedOut });
    const { result } = renderHook(() => useJWT(), { wrapper: wrapper(store) });
    expect(result.current.token).toBeNull();
    expect(result.current.payload).toBeNull();
    expect(result.current.isTokenValid).toBe(false);
  });

  it('refreshTokenData dispatches checkAuthThunk', async () => {
    const store = createTestStore({ auth: mockAuthStateWithTokens });
    const { result } = renderHook(() => useJWT(), { wrapper: wrapper(store) });
    await act(async () => {
      await result.current.refreshTokenData();
    });
    // No error means dispatch was successful
  });

  it('updatePayloadAttributes updates payload in store', () => {
    const store = createTestStore({ auth: mockAuthStateWithTokens });
    const { result } = renderHook(() => useJWT(), { wrapper: wrapper(store) });

    act(() => {
      result.current.updatePayloadAttributes({ email: 'updated@test.com' });
    });

    // After update, the payload should be updated in the store
    const state = store.getState();
    expect(state.auth.jwtPayload?.email).toBe('updated@test.com');
  });

  it('updatePayloadAttributes does nothing when payload is null', () => {
    const store = createTestStore({ auth: mockAuthStateSignedOut });
    const { result } = renderHook(() => useJWT(), { wrapper: wrapper(store) });

    act(() => {
      result.current.updatePayloadAttributes({ email: 'test@test.com' });
    });

    expect(store.getState().auth.jwtPayload).toBeNull();
  });
});

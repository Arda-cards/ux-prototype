/**
 * Unit tests for src/contexts/JWTContext.tsx
 *
 * Covers: JWTProvider, useJWT hook
 */

import React from 'react';
import { renderHook, act, waitFor } from '@testing-library/react';
import { decodeJWTPayload, extractUserContext } from '@frontend/lib/jwt';
import {
  createMockUser,
  createMockJWTPayload,
  createMockUserContext,
} from '@frontend/test-utils/mock-factories';

// ---------------------------------------------------------------------------
// Mocks
// ---------------------------------------------------------------------------

const mockUseAuth = jest.fn();
jest.mock('@/store/hooks/useAuth', () => ({
  useAuth: () => mockUseAuth(),
}));

jest.mock('@/lib/jwt', () => ({
  decodeJWTPayload: jest.fn(),
  extractUserContext: jest.fn(),
}));

const mockDecodeJWTPayload = decodeJWTPayload as jest.Mock;
const mockExtractUserContext = extractUserContext as jest.Mock;

// ---------------------------------------------------------------------------
// localStorage mock
// ---------------------------------------------------------------------------

const localStorageMock = {
  getItem: jest.fn(),
  setItem: jest.fn(),
  removeItem: jest.fn(),
  clear: jest.fn(),
  length: 0,
  key: jest.fn(),
};
Object.defineProperty(window, 'localStorage', {
  value: localStorageMock,
  writable: true,
});

// ---------------------------------------------------------------------------
// Import after mocks
// ---------------------------------------------------------------------------

import { JWTProvider, useJWT } from './JWTContext';

// ---------------------------------------------------------------------------
// Helpers
// ---------------------------------------------------------------------------

function createWrapper() {
  return function Wrapper({ children }: { children: React.ReactNode }) {
    return <JWTProvider>{children}</JWTProvider>;
  };
}

// ---------------------------------------------------------------------------
// Tests
// ---------------------------------------------------------------------------

describe('JWTContext', () => {
  const mockUser = createMockUser();
  const mockPayload = createMockJWTPayload({
    exp: Math.floor(Date.now() / 1000) + 86400, // 24h from now
  });
  const mockContext = createMockUserContext();
  const MOCK_TOKEN = 'mock.jwt.token';

  beforeEach(() => {
    jest.clearAllMocks();
    mockUseAuth.mockReturnValue({ user: null });
    localStorageMock.getItem.mockReturnValue(null);
    mockDecodeJWTPayload.mockReturnValue(null);
    mockExtractUserContext.mockReturnValue(null);
  });

  it('useJWT throws error when used outside JWTProvider', () => {
    // Suppress console.error for expected error
    jest.spyOn(console, 'error').mockImplementation(() => {});
    expect(() => {
      renderHook(() => useJWT());
    }).toThrow('useJWT must be used within a JWTProvider');
    jest.restoreAllMocks();
  });

  it('sets token, payload, userContext from localStorage idToken when authenticated', async () => {
    mockUseAuth.mockReturnValue({ user: mockUser });
    localStorageMock.getItem.mockReturnValue(MOCK_TOKEN);
    mockDecodeJWTPayload.mockReturnValue(mockPayload);
    mockExtractUserContext.mockReturnValue(mockContext);

    const { result } = renderHook(() => useJWT(), { wrapper: createWrapper() });

    await waitFor(() => {
      expect(result.current.token).toBe(MOCK_TOKEN);
    });

    expect(result.current.payload).toEqual(mockPayload);
    expect(result.current.userContext).toEqual(mockContext);
    expect(result.current.isTokenValid).toBe(true);
  });

  it('clears token, payload, userContext when user logs out', async () => {
    mockUseAuth.mockReturnValue({ user: mockUser });
    localStorageMock.getItem.mockReturnValue(MOCK_TOKEN);
    mockDecodeJWTPayload.mockReturnValue(mockPayload);
    mockExtractUserContext.mockReturnValue(mockContext);

    const { result, rerender } = renderHook(() => useJWT(), {
      wrapper: createWrapper(),
    });

    await waitFor(() => {
      expect(result.current.token).toBe(MOCK_TOKEN);
    });

    // Simulate logout
    mockUseAuth.mockReturnValue({ user: null });
    rerender();

    await waitFor(() => {
      expect(result.current.token).toBeNull();
    });
    expect(result.current.payload).toBeNull();
    expect(result.current.userContext).toBeNull();
    expect(result.current.isTokenValid).toBe(false);
  });

  it('refreshTokenData reads idToken, decodes it, updates state when valid', async () => {
    mockUseAuth.mockReturnValue({ user: mockUser });
    // Start with no token
    localStorageMock.getItem.mockReturnValue(null);

    const { result } = renderHook(() => useJWT(), { wrapper: createWrapper() });

    // Now set token in localStorage and call refreshTokenData
    localStorageMock.getItem.mockReturnValue(MOCK_TOKEN);
    mockDecodeJWTPayload.mockReturnValue(mockPayload);
    mockExtractUserContext.mockReturnValue(mockContext);

    await act(async () => {
      await result.current.refreshTokenData();
    });

    expect(result.current.token).toBe(MOCK_TOKEN);
    expect(result.current.payload).toEqual(mockPayload);
    expect(result.current.userContext).toEqual(mockContext);
    expect(result.current.isTokenValid).toBe(true);
  });

  it('refreshTokenData sets isTokenValid to false when decoded token expired', async () => {
    mockUseAuth.mockReturnValue({ user: mockUser });
    localStorageMock.getItem.mockReturnValue(MOCK_TOKEN);
    const expiredPayload = createMockJWTPayload({
      exp: Math.floor(Date.now() / 1000) - 3600, // 1 hour ago
    });
    mockDecodeJWTPayload.mockReturnValue(expiredPayload);

    const { result } = renderHook(() => useJWT(), { wrapper: createWrapper() });

    await waitFor(() => {
      expect(result.current.isTokenValid).toBe(false);
    });
    expect(result.current.token).toBeNull();
  });

  it('refreshTokenData clears all state when no idToken in localStorage', async () => {
    mockUseAuth.mockReturnValue({ user: mockUser });
    localStorageMock.getItem.mockReturnValue(MOCK_TOKEN);
    mockDecodeJWTPayload.mockReturnValue(mockPayload);
    mockExtractUserContext.mockReturnValue(mockContext);

    const { result } = renderHook(() => useJWT(), { wrapper: createWrapper() });

    await waitFor(() => {
      expect(result.current.token).toBe(MOCK_TOKEN);
    });

    // Now clear localStorage and call refreshTokenData
    localStorageMock.getItem.mockReturnValue(null);

    await act(async () => {
      await result.current.refreshTokenData();
    });

    expect(result.current.token).toBeNull();
    expect(result.current.payload).toBeNull();
    expect(result.current.userContext).toBeNull();
    expect(result.current.isTokenValid).toBe(false);
  });

  it('refreshTokenData clears all state when idToken decoding fails', async () => {
    mockUseAuth.mockReturnValue({ user: mockUser });
    localStorageMock.getItem.mockReturnValue(MOCK_TOKEN);
    mockDecodeJWTPayload.mockReturnValue(mockPayload);
    mockExtractUserContext.mockReturnValue(mockContext);

    const { result } = renderHook(() => useJWT(), { wrapper: createWrapper() });

    await waitFor(() => {
      expect(result.current.token).toBe(MOCK_TOKEN);
    });

    // Now make decoding throw
    mockDecodeJWTPayload.mockImplementation(() => {
      throw new Error('Invalid token');
    });

    await act(async () => {
      await result.current.refreshTokenData();
    });

    expect(result.current.token).toBeNull();
    expect(result.current.payload).toBeNull();
    expect(result.current.userContext).toBeNull();
    expect(result.current.isTokenValid).toBe(false);
  });

  it('updatePayloadAttributes merges attributes into existing payload and updates userContext', async () => {
    mockUseAuth.mockReturnValue({ user: mockUser });
    localStorageMock.getItem.mockReturnValue(MOCK_TOKEN);
    mockDecodeJWTPayload.mockReturnValue(mockPayload);
    mockExtractUserContext.mockReturnValue(mockContext);

    const { result } = renderHook(() => useJWT(), { wrapper: createWrapper() });

    await waitFor(() => {
      expect(result.current.payload).toEqual(mockPayload);
    });

    const updatedContext = createMockUserContext({ email: 'updated@test.com' });
    mockExtractUserContext.mockReturnValue(updatedContext);

    act(() => {
      result.current.updatePayloadAttributes({ email: 'updated@test.com' });
    });

    await waitFor(() => {
      expect(result.current.payload?.email).toBe('updated@test.com');
    });
    expect(mockExtractUserContext).toHaveBeenCalledWith(
      expect.objectContaining({ email: 'updated@test.com' })
    );
    expect(result.current.userContext).toEqual(updatedContext);
  });

  it('updatePayloadAttributes returns null when no existing payload', async () => {
    // user is null, so no payload
    mockUseAuth.mockReturnValue({ user: null });

    const { result } = renderHook(() => useJWT(), { wrapper: createWrapper() });

    act(() => {
      result.current.updatePayloadAttributes({ email: 'updated@test.com' });
    });

    expect(result.current.payload).toBeNull();
  });
});

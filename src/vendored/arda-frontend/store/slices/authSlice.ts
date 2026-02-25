import { createSlice, PayloadAction } from '@reduxjs/toolkit';
import type { User } from '@frontend/types';
import type { CognitoJWTPayload } from '@frontend/lib/jwt';
import { extractUserContext, decodeJWTPayload, getUserDisplayName } from '@frontend/lib/jwt';
import {
  signInThunk,
  respondToNewPasswordChallengeThunk,
  signOutThunk,
  refreshTokensThunk,
  checkAuthThunk,
  forgotPasswordThunk,
  confirmNewPasswordThunk,
  changePasswordThunk,
} from '../thunks/authThunks';

interface AuthState {
  // User state
  user: User | null;
  userContext: {
    userId: string;
    email: string;
    name: string;
    tenantId: string;
    role: string;
    author: string;
  } | null;

  // Token state (single source of truth)
  tokens: {
    accessToken: string | null;
    idToken: string | null;
    refreshToken: string | null;
    expiresAt: number | null;
  };

  // JWT payload
  jwtPayload: CognitoJWTPayload | null;
  isTokenValid: boolean;

  // Loading & error states
  loading: boolean;
  error: string | null;
  isLoggingOut: boolean;

  // Token refresh state
  isRefreshing: boolean;
  lastRefreshAttempt: number | null;
}

const initialState: AuthState = {
  user: null,
  userContext: null,
  tokens: {
    accessToken: null,
    idToken: null,
    refreshToken: null,
    expiresAt: null,
  },
  jwtPayload: null,
  isTokenValid: false,
  loading: false,
  error: null,
  isLoggingOut: false,
  isRefreshing: false,
  lastRefreshAttempt: null,
};

const authSlice = createSlice({
  name: 'auth',
  initialState,
  reducers: {
    setUser: (state, action: PayloadAction<User | null>) => {
      state.user = action.payload;
    },
    setUserContext: (
      state,
      action: PayloadAction<AuthState['userContext']>
    ) => {
      state.userContext = action.payload;
    },
    setTokens: (
      state,
      action: PayloadAction<{
        accessToken: string | null;
        idToken: string | null;
        refreshToken: string | null;
        expiresAt: number | null;
      }>
    ) => {
      state.tokens = action.payload;
    },
    setJwtPayload: (state, action: PayloadAction<CognitoJWTPayload | null>) => {
      state.jwtPayload = action.payload;
      if (action.payload) {
        state.userContext = extractUserContext(action.payload);
      }
    },
    setIsTokenValid: (state, action: PayloadAction<boolean>) => {
      state.isTokenValid = action.payload;
    },
    setLoading: (state, action: PayloadAction<boolean>) => {
      state.loading = action.payload;
    },
    setError: (state, action: PayloadAction<string | null>) => {
      state.error = action.payload;
    },
    setIsLoggingOut: (state, action: PayloadAction<boolean>) => {
      state.isLoggingOut = action.payload;
    },
    setIsRefreshing: (state, action: PayloadAction<boolean>) => {
      state.isRefreshing = action.payload;
    },
    setLastRefreshAttempt: (state, action: PayloadAction<number | null>) => {
      state.lastRefreshAttempt = action.payload;
    },
    clearAuth: (state) => {
      state.user = null;
      state.userContext = null;
      state.tokens = {
        accessToken: null,
        idToken: null,
        refreshToken: null,
        expiresAt: null,
      };
      state.jwtPayload = null;
      state.isTokenValid = false;
      state.error = null;
      state.isLoggingOut = false;
      state.isRefreshing = false;
      state.lastRefreshAttempt = null;
    },
  },
  extraReducers: (builder) => {
    // Sign in
    builder
      .addCase(signInThunk.pending, (state) => {
        state.loading = true;
        state.error = null;
      })
      .addCase(signInThunk.fulfilled, (state, action) => {
        state.user = action.payload.user;
        state.jwtPayload = action.payload.jwtPayload;
        state.userContext = extractUserContext(action.payload.jwtPayload);
        state.tokens = {
          accessToken: action.payload.tokens.accessToken,
          idToken: action.payload.tokens.idToken,
          refreshToken: action.payload.tokens.refreshToken,
          expiresAt: action.payload.tokens.expiresAt,
        };
        state.isTokenValid = true;
        state.loading = false;
        state.error = null;
      })
      .addCase(signInThunk.rejected, (state, action) => {
        state.loading = false;
        const payload = action.payload as unknown;
        if (payload && typeof payload === 'object' && 'requiresNewPassword' in payload) {
          state.error = null;
        } else if (typeof action.payload === 'string') {
          state.error = action.payload;
        } else {
          state.error = 'Sign in failed';
        }
      });

    // Respond to new password challenge
    builder
      .addCase(respondToNewPasswordChallengeThunk.pending, (state) => {
        state.loading = true;
        state.error = null;
      })
      .addCase(respondToNewPasswordChallengeThunk.fulfilled, (state, action) => {
        state.user = action.payload.user;
        state.jwtPayload = action.payload.jwtPayload;
        state.userContext = extractUserContext(action.payload.jwtPayload);
        state.tokens = {
          accessToken: action.payload.tokens.accessToken,
          idToken: action.payload.tokens.idToken,
          refreshToken: action.payload.tokens.refreshToken,
          expiresAt: action.payload.tokens.expiresAt,
        };
        state.isTokenValid = true;
        state.loading = false;
        state.error = null;
      })
      .addCase(respondToNewPasswordChallengeThunk.rejected, (state, action) => {
        state.loading = false;
        state.error = action.payload as string || 'Failed to set new password';
      });

    // Sign out
    builder
      .addCase(signOutThunk.pending, (state) => {
        state.isLoggingOut = true;
        state.error = null;
      })
      .addCase(signOutThunk.fulfilled, (state) => {
        state.user = null;
        state.userContext = null;
        state.tokens = {
          accessToken: null,
          idToken: null,
          refreshToken: null,
          expiresAt: null,
        };
        state.jwtPayload = null;
        state.isTokenValid = false;
        state.loading = false;
        state.error = null;
        state.isLoggingOut = false;
      })
      .addCase(signOutThunk.rejected, (state) => {
        state.user = null;
        state.userContext = null;
        state.tokens = {
          accessToken: null,
          idToken: null,
          refreshToken: null,
          expiresAt: null,
        };
        state.jwtPayload = null;
        state.isTokenValid = false;
        state.loading = false;
        state.isLoggingOut = false;
      });

    // Refresh tokens
    builder
      .addCase(refreshTokensThunk.pending, (state) => {
        state.isRefreshing = true;
        state.lastRefreshAttempt = Date.now();
      })
      .addCase(refreshTokensThunk.fulfilled, (state, action) => {
        state.tokens = {
          accessToken: action.payload.accessToken,
          idToken: action.payload.idToken,
          refreshToken: action.payload.refreshToken,
          expiresAt: action.payload.expiresAt,
        };
        try {
          const payload = decodeJWTPayload(action.payload.idToken);
          if (payload) {
            state.jwtPayload = payload;
            state.userContext = extractUserContext(payload);
            if (payload.sub !== state.user?.id || payload.email !== state.user?.email) {
              state.user = {
                id: payload.sub,
                email: payload.email,
                name: getUserDisplayName(payload),
              };
            }
          }
        } catch {
          // Keep existing user if we can't decode new token
        }
        state.isTokenValid = true;
        state.isRefreshing = false;
      })
      .addCase(refreshTokensThunk.rejected, (state) => {
        state.isRefreshing = false;
        // Don't clear tokens on refresh failure - let ensureValidTokens handle graceful degradation
      });

    // Check auth — no loading flag: this is a local JWT decode, not a user-facing async operation
    builder
      .addCase(checkAuthThunk.pending, (_state) => {
        // intentionally not setting loading: true — avoids full-page spinner during
        // background validation (periodic checkAuth calls from useAuthValidation)
      })
      .addCase(checkAuthThunk.fulfilled, (state, action) => {
        if (action.payload) {
          state.user = action.payload.user;
          state.jwtPayload = action.payload.jwtPayload;
          state.userContext = extractUserContext(action.payload.jwtPayload);
          state.isTokenValid = true;
        } else {
          state.user = null;
          state.userContext = null;
          state.jwtPayload = null;
          state.isTokenValid = false;
        }
        state.loading = false;
      })
      .addCase(checkAuthThunk.rejected, (state) => {
        state.user = null;
        state.userContext = null;
        state.jwtPayload = null;
        state.isTokenValid = false;
        state.loading = false;
      });

    // Forgot password
    builder
      .addCase(forgotPasswordThunk.pending, (state) => {
        state.loading = true;
        state.error = null;
      })
      .addCase(forgotPasswordThunk.fulfilled, (state) => {
        state.loading = false;
      })
      .addCase(forgotPasswordThunk.rejected, (state, action) => {
        state.loading = false;
        state.error = action.payload as string || 'Failed to send reset email';
      });

    // Confirm new password
    builder
      .addCase(confirmNewPasswordThunk.pending, (state) => {
        state.loading = true;
        state.error = null;
      })
      .addCase(confirmNewPasswordThunk.fulfilled, (state) => {
        state.loading = false;
      })
      .addCase(confirmNewPasswordThunk.rejected, (state, action) => {
        state.loading = false;
        state.error = action.payload as string || 'Failed to reset password';
      });

    // Change password
    builder
      .addCase(changePasswordThunk.pending, (state) => {
        state.loading = true;
        state.error = null;
      })
      .addCase(changePasswordThunk.fulfilled, (state) => {
        state.loading = false;
      })
      .addCase(changePasswordThunk.rejected, (state, action) => {
        state.loading = false;
        state.error = action.payload as string || 'Failed to change password';
      });
  },
});

export const {
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
} = authSlice.actions;

export default authSlice.reducer;

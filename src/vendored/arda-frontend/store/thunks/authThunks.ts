import { createAsyncThunk } from '@reduxjs/toolkit';
import {
  CognitoIdentityProviderClient,
  InitiateAuthCommand,
  RespondToAuthChallengeCommand,
  GlobalSignOutCommand,
  ForgotPasswordCommand,
  ConfirmForgotPasswordCommand,
  ChangePasswordCommand,
} from '@aws-sdk/client-cognito-identity-provider';
import { generateSecretHash, debugLog, debugError } from '@frontend/lib/utils';
import { decodeJWTPayload, getUserDisplayName } from '@frontend/lib/jwt';
import type { User } from '@frontend/types';
import type { CognitoJWTPayload } from '@frontend/lib/jwt';
import type { RootState, AppDispatch } from '../store';

// Cognito client singleton
let cognitoClient: CognitoIdentityProviderClient | null = null;

function getCognitoClient(): CognitoIdentityProviderClient {
  if (!cognitoClient) {
    cognitoClient = new CognitoIdentityProviderClient({
      region: process.env.NEXT_PUBLIC_COGNITO_REGION,
    });
  }
  return cognitoClient;
}

// Clear auth-related keys from localStorage synchronously.
// Called during signOut to prevent stale tokens surviving a hard navigation
// (window.location.href) that tears down React before useEffect cleanup fires.
function clearLocalStorageTokens(): void {
  if (typeof window === 'undefined') return;
  localStorage.removeItem('accessToken');
  localStorage.removeItem('idToken');
  localStorage.removeItem('refreshToken');
  localStorage.removeItem('tokenExpiresAt');
  localStorage.removeItem('userEmail');
  localStorage.removeItem('persist:auth');
}

// Helper to get user from ID token
function getUserFromIdToken(idToken: string): User | null {
  try {
    const payload = decodeJWTPayload(idToken);
    if (!payload) return null;

    const displayName = getUserDisplayName(payload);

    return {
      id: payload.sub,
      email: payload.email,
      name: displayName,
    };
  } catch (error) {
    debugError('[AUTH] Failed to get user from token:', error);
    return null;
  }
}

// Sign in thunk
export const signInThunk = createAsyncThunk<
  { user: User; jwtPayload: CognitoJWTPayload; tokens: { accessToken: string; idToken: string; refreshToken: string; expiresAt: number }; requiresNewPassword?: boolean; session?: string },
  { email: string; password: string },
  { state: RootState }
>(
  'auth/signIn',
  async ({ email, password }, { rejectWithValue }) => {
    try {
      // In mock mode, bypass Cognito and return mock tokens directly
      const isMockMode = process.env.NEXT_PUBLIC_MOCK_MODE === 'true';
      if (isMockMode) {
        const { generateMockTokens, MOCK_USER } = await import('@frontend/mocks/data/mockUser');

        await new Promise(resolve => setTimeout(resolve, 100)); // simulate network

        const tokens = generateMockTokens();
        const payload = decodeJWTPayload(tokens.idToken);
        if (!payload) throw new Error('Failed to decode mock token');

        const accessPayload = JSON.parse(atob(tokens.accessToken.split('.')[1]));

        return {
          user: { ...MOCK_USER, email, name: email.split('@')[0] || MOCK_USER.name },
          jwtPayload: payload,
          tokens: {
            accessToken: tokens.accessToken,
            idToken: tokens.idToken,
            refreshToken: tokens.refreshToken,
            expiresAt: accessPayload.exp * 1000,
          },
        };
      }

      const authParameters: Record<string, string> = {
        USERNAME: email,
        PASSWORD: password,
      };

      const secretHash = await generateSecretHash(email);
      if (secretHash) {
        authParameters.SECRET_HASH = secretHash;
      }

      const command = new InitiateAuthCommand({
        ClientId: process.env.NEXT_PUBLIC_COGNITO_CLIENT_ID,
        AuthFlow: 'USER_PASSWORD_AUTH',
        AuthParameters: authParameters,
      });

      const response = await getCognitoClient().send(command);

      // Handle new password challenge - return special response
      if (response.ChallengeName === 'NEW_PASSWORD_REQUIRED') {
        debugLog('[AUTH] New password required challenge received');
        // Store email temporarily for the challenge response
        if (typeof window !== 'undefined') {
          localStorage.setItem('userEmail', email);
        }
        return rejectWithValue({
          requiresNewPassword: true,
          session: response.Session || '',
          email,
        } as unknown as string);
      }

      if (response.AuthenticationResult) {
        const { AccessToken, IdToken, RefreshToken } = response.AuthenticationResult;

        if (AccessToken && IdToken && RefreshToken) {
          const payload = decodeJWTPayload(IdToken);
          if (!payload) {
            throw new Error('Failed to decode user information');
          }

          const user = getUserFromIdToken(IdToken);
          if (!user) {
            throw new Error('Failed to decode user information');
          }

          // Decode access token to get expiration
          const accessPayload = JSON.parse(atob(AccessToken.split('.')[1]));
          const expiresAt = accessPayload.exp * 1000;

          return {
            user,
            jwtPayload: payload,
            tokens: {
              accessToken: AccessToken,
              idToken: IdToken,
              refreshToken: RefreshToken,
              expiresAt,
            },
          };
        }
      }

      throw new Error('Invalid authentication response');
    } catch (error: unknown) {
      debugError('[AUTH] Sign in error:', error);

      let errorMessage = 'Sign in failed';
      if (error && typeof error === 'object' && 'name' in error) {
        const cognitoError = error as { name: string; message?: string };
        if (cognitoError.name === 'NotAuthorizedException') {
          errorMessage = 'Invalid email or password';
        } else if (cognitoError.name === 'UserNotConfirmedException') {
          errorMessage = 'Please confirm your email address';
        } else if (cognitoError.name === 'UserNotFoundException') {
          errorMessage = 'User not found';
        } else if (cognitoError.message) {
          errorMessage = cognitoError.message;
        }
      }

      return rejectWithValue(errorMessage);
    }
  }
);

// Respond to new password challenge thunk
export const respondToNewPasswordChallengeThunk = createAsyncThunk<
  { user: User; jwtPayload: CognitoJWTPayload; tokens: { accessToken: string; idToken: string; refreshToken: string; expiresAt: number } },
  { session: string; newPassword: string; email: string },
  { state: RootState }
>(
  'auth/respondToNewPasswordChallenge',
  async ({ session, newPassword, email }, { rejectWithValue }) => {
    try {
      debugLog('[AUTH] Responding to new password challenge');

      const challengeParameters: Record<string, string> = {
        USERNAME: email,
        NEW_PASSWORD: newPassword,
      };

      const secretHash = await generateSecretHash(email);
      if (secretHash) {
        challengeParameters.SECRET_HASH = secretHash;
      }

      const command = new RespondToAuthChallengeCommand({
        ClientId: process.env.NEXT_PUBLIC_COGNITO_CLIENT_ID,
        ChallengeName: 'NEW_PASSWORD_REQUIRED',
        Session: session,
        ChallengeResponses: challengeParameters,
      });

      const response = await getCognitoClient().send(command);

      if (response.AuthenticationResult) {
        const { AccessToken, IdToken, RefreshToken } = response.AuthenticationResult;

        if (AccessToken && IdToken && RefreshToken) {
          const payload = decodeJWTPayload(IdToken);
          if (!payload) {
            throw new Error('Failed to decode user information');
          }

          const user = getUserFromIdToken(IdToken);
          if (!user) {
            throw new Error('Failed to decode user information');
          }

          const accessPayload = JSON.parse(atob(AccessToken.split('.')[1]));
          const expiresAt = accessPayload.exp * 1000;

          debugLog('[AUTH] New password set successfully, user authenticated:', user);

          return {
            user,
            jwtPayload: payload,
            tokens: {
              accessToken: AccessToken,
              idToken: IdToken,
              refreshToken: RefreshToken,
              expiresAt,
            },
          };
        }
      }

      throw new Error('Failed to complete password change');
    } catch (error: unknown) {
      debugError('[AUTH] Respond to new password challenge error:', error);

      let errorMessage = 'Failed to set new password';
      if (error && typeof error === 'object' && 'name' in error) {
        const cognitoError = error as { name: string; message?: string };
        if (cognitoError.name === 'NotAuthorizedException') {
          errorMessage = 'Session expired. Please sign in again.';
        } else if (cognitoError.name === 'InvalidPasswordException') {
          errorMessage = 'Password does not meet requirements';
        } else if (cognitoError.name === 'InvalidParameterException') {
          errorMessage = 'Invalid password format';
        } else if (cognitoError.message) {
          errorMessage = cognitoError.message;
        }
      }

      return rejectWithValue(errorMessage);
    }
  }
);

// Sign out thunk
export const signOutThunk = createAsyncThunk<
  void,
  void,
  { state: RootState; dispatch: AppDispatch }
>(
  'auth/signOut',
  async (_, { getState }) => {
    try {
      debugLog('[AUTH] Signing out user');

      // In mock mode, bypass Cognito GlobalSignOut
      const isMockMode = process.env.NEXT_PUBLIC_MOCK_MODE === 'true';
      if (isMockMode) {
        if (typeof window !== 'undefined') {
          sessionStorage.setItem('mock-auth-signed-out', '1');
        }
        await new Promise(resolve => setTimeout(resolve, 100));
        debugLog('[AUTH] Mock sign out complete');
        // Clear localStorage synchronously to avoid race with hard navigation
        clearLocalStorageTokens();
        return;
      }

      const state = getState();
      const accessToken = state.auth.tokens.accessToken;

      // Sign out from Cognito if we have a valid access token
      if (accessToken) {
        try {
          const command = new GlobalSignOutCommand({
            AccessToken: accessToken,
          });
          await getCognitoClient().send(command);
          debugLog('[AUTH] Successfully signed out from Cognito');
        } catch (error) {
          debugError('[AUTH] Cognito sign out error:', error);
          // Continue with local cleanup even if Cognito call fails
        }
      }

      // Small delay for smooth transition
      await new Promise(resolve => setTimeout(resolve, 300));

      // Clear localStorage synchronously to avoid race with hard navigation
      clearLocalStorageTokens();

      debugLog('[AUTH] Sign out complete');
    } catch (error) {
      debugError('[AUTH] Sign out error:', error);
      // Continue with cleanup even on error
    }
  }
);

// Refresh tokens thunk
export const refreshTokensThunk = createAsyncThunk<
  { accessToken: string; idToken: string; refreshToken: string; expiresAt: number },
  void,
  { state: RootState }
>(
  'auth/refreshTokens',
  async (_, { getState, rejectWithValue }) => {
    try {
      // In mock mode, bypass Cognito and return fresh mock tokens
      const isMockMode = process.env.NEXT_PUBLIC_MOCK_MODE === 'true';
      if (isMockMode) {
        const { generateMockTokens } = await import('@frontend/mocks/data/mockUser');
        const tokens = generateMockTokens();
        const accessPayload = JSON.parse(atob(tokens.accessToken.split('.')[1]));
        return {
          accessToken: tokens.accessToken,
          idToken: tokens.idToken,
          refreshToken: tokens.refreshToken,
          expiresAt: accessPayload.exp * 1000,
        };
      }

      const state = getState();
      const refreshToken = state.auth.tokens.refreshToken;
      const userEmail = state.auth.user?.email;

      if (!refreshToken) {
        debugLog('[TOKEN_REFRESH] No refresh token available');
        return rejectWithValue('No refresh token available');
      }

      debugLog('[TOKEN_REFRESH] Attempting to refresh tokens');

      const authParameters: Record<string, string> = {
        REFRESH_TOKEN: refreshToken,
      };

      if (userEmail) {
        const secretHash = await generateSecretHash(userEmail);
        if (secretHash) {
          authParameters.SECRET_HASH = secretHash;
        }
      }

      const command = new InitiateAuthCommand({
        ClientId: process.env.NEXT_PUBLIC_COGNITO_CLIENT_ID,
        AuthFlow: 'REFRESH_TOKEN_AUTH',
        AuthParameters: authParameters,
      });

      const response = await getCognitoClient().send(command);

      if (response.AuthenticationResult) {
        const { AccessToken, IdToken } = response.AuthenticationResult;

        if (AccessToken && IdToken) {
          const accessPayload = JSON.parse(atob(AccessToken.split('.')[1]));
          const expiresAt = accessPayload.exp * 1000;

          debugLog('[TOKEN_REFRESH] ✓ Tokens refreshed successfully');
          debugLog('[TOKEN_REFRESH] New token expires at:', new Date(expiresAt).toISOString());

          return {
            accessToken: AccessToken,
            idToken: IdToken,
            refreshToken: refreshToken, // Refresh token doesn't change
            expiresAt,
          };
        }
      }

      throw new Error('No tokens in response');
    } catch (error: unknown) {
      debugError('[TOKEN_REFRESH] Token refresh failed:', error);

      const errorName = (error as { name?: string })?.name;
      const isPermanentError =
        errorName === 'NotAuthorizedException' ||
        errorName === 'InvalidParameterException' ||
        errorName === 'UserNotFoundException';

      if (isPermanentError) {
        debugError('[TOKEN_REFRESH] Permanent error detected:', errorName);
      }

      return rejectWithValue(error instanceof Error ? error.message : 'Token refresh failed');
    }
  }
);

// Check auth thunk (validates from token)
export const checkAuthThunk = createAsyncThunk<
  { user: User; jwtPayload: CognitoJWTPayload } | null,
  void,
  { state: RootState }
>(
  'auth/checkAuth',
  async (_, { getState }) => {
    try {
      debugLog('[AUTH] Checking authentication status');

      const state = getState();
      const idToken = state.auth.tokens.idToken;

      if (!idToken) {
        debugLog('[AUTH] No ID token found, clearing state');
        return null;
      }

      const payload = decodeJWTPayload(idToken);
      if (!payload) {
        debugLog('[AUTH] Failed to decode token, clearing state');
        return null;
      }

      // Check if token is expired
      const now = Date.now() / 1000;
      if (payload.exp && payload.exp < now) {
        debugLog('[AUTH] Token expired, clearing state');
        return null;
      }

      const user = getUserFromIdToken(idToken);
      if (!user) {
        debugLog('[AUTH] Failed to get user from token, clearing state');
        return null;
      }

      debugLog('[AUTH] User found in token:', user.email);
      return { user, jwtPayload: payload };
    } catch (error) {
      debugError('[AUTH] Check auth failed:', error);
      return null;
    }
  }
);

// Forgot password thunk
export const forgotPasswordThunk = createAsyncThunk<
  void,
  string,
  { state: RootState }
>(
  'auth/forgotPassword',
  async (email, { rejectWithValue }) => {
    try {
      debugLog('[AUTH] Requesting password reset for:', email);

      const secretHash = await generateSecretHash(email);

      const command = new ForgotPasswordCommand({
        ClientId: process.env.NEXT_PUBLIC_COGNITO_CLIENT_ID,
        Username: email,
        ...(secretHash && { SecretHash: secretHash }),
      });

      await getCognitoClient().send(command);

      debugLog('[AUTH] Password reset email sent');
    } catch (error: unknown) {
      debugError('[AUTH] Forgot password error:', error);

      let errorMessage = 'Failed to send reset email';
      if (error && typeof error === 'object' && 'name' in error) {
        const cognitoError = error as { name: string; message?: string };
        if (cognitoError.name === 'UserNotFoundException') {
          errorMessage = 'User not found';
        } else if (cognitoError.name === 'LimitExceededException') {
          errorMessage = 'Too many attempts. Please try again later';
        } else if (cognitoError.message) {
          errorMessage = cognitoError.message;
        }
      }

      return rejectWithValue(errorMessage);
    }
  }
);

// Confirm new password thunk
export const confirmNewPasswordThunk = createAsyncThunk<
  void,
  { email: string; code: string; newPassword: string },
  { state: RootState }
>(
  'auth/confirmNewPassword',
  async ({ email, code, newPassword }, { rejectWithValue }) => {
    try {
      debugLog('[AUTH] Confirming new password for:', email);

      const secretHash = await generateSecretHash(email);

      const command = new ConfirmForgotPasswordCommand({
        ClientId: process.env.NEXT_PUBLIC_COGNITO_CLIENT_ID,
        Username: email,
        ConfirmationCode: code,
        Password: newPassword,
        ...(secretHash && { SecretHash: secretHash }),
      });

      await getCognitoClient().send(command);

      debugLog('[AUTH] Password reset successful');
    } catch (error: unknown) {
      debugError('[AUTH] Confirm new password error:', error);

      let errorMessage = 'Failed to reset password';
      if (error && typeof error === 'object' && 'name' in error) {
        const cognitoError = error as { name: string; message?: string };
        if (cognitoError.name === 'CodeMismatchException') {
          errorMessage = 'Invalid confirmation code';
        } else if (cognitoError.name === 'ExpiredCodeException') {
          errorMessage = 'Confirmation code has expired';
        } else if (cognitoError.name === 'InvalidPasswordException') {
          errorMessage = 'Password does not meet requirements';
        } else if (cognitoError.message) {
          errorMessage = cognitoError.message;
        }
      }

      return rejectWithValue(errorMessage);
    }
  }
);

// Change password thunk
export const changePasswordThunk = createAsyncThunk<
  void,
  { currentPassword: string; newPassword: string },
  { state: RootState }
>(
  'auth/changePassword',
  async ({ currentPassword, newPassword }, { getState, rejectWithValue }) => {
    try {
      debugLog('[AUTH] Changing password for user');

      const state = getState();
      const accessToken = state.auth.tokens.accessToken;

      if (!accessToken) {
        return rejectWithValue('No access token found. Please sign in again.');
      }

      const command = new ChangePasswordCommand({
        AccessToken: accessToken,
        PreviousPassword: currentPassword,
        ProposedPassword: newPassword,
      });

      await getCognitoClient().send(command);

      debugLog('[AUTH] Password changed successfully');
    } catch (error: unknown) {
      debugError('[AUTH] Change password error:', error);

      let errorMessage = 'Failed to change password';
      if (error && typeof error === 'object' && 'name' in error) {
        const cognitoError = error as { name: string; message?: string };
        if (cognitoError.name === 'NotAuthorizedException') {
          errorMessage = 'Current password is incorrect or access token is invalid';
        } else if (cognitoError.name === 'InvalidPasswordException') {
          errorMessage = 'New password does not meet requirements';
        } else if (cognitoError.name === 'LimitExceededException') {
          errorMessage = 'Too many attempts. Please try again later';
        } else if (cognitoError.name === 'InvalidParameterException') {
          errorMessage = 'Invalid parameters provided';
        } else if (cognitoError.message) {
          errorMessage = cognitoError.message;
        }
      }

      return rejectWithValue(errorMessage);
    }
  }
);

'use client';

import React, { createContext, useContext, useState, useEffect, useCallback, useMemo, ReactNode } from 'react';
import { User } from '@frontend/types';
import {
  CognitoIdentityProviderClient,
  InitiateAuthCommand,
  RespondToAuthChallengeCommand,
  GlobalSignOutCommand,
  ForgotPasswordCommand,
  ConfirmForgotPasswordCommand,
  ChangePasswordCommand,
} from '@aws-sdk/client-cognito-identity-provider';
import { generateSecretHash, debugLog, debugError, debugWarn } from '@frontend/lib/utils';
import { refreshTokens, ensureValidTokens } from '@frontend/lib/tokenRefresh';
import { decodeJWTPayload, getUserDisplayName } from '@frontend/lib/jwt';

interface AuthState {
  user: User | null;
  loading: boolean;
  error: string | null;
  isLoggingOut: boolean; // New state for smooth logout transitions
}

interface SignInCredentials {
  email: string;
  password: string;
}

interface ChangePasswordCredentials {
  currentPassword: string;
  newPassword: string;
}

interface TokenInfo {
  accessToken: string;
  idToken: string;
  refreshToken: string;
  expiresAt: number;
}

interface AuthContextType extends AuthState {
  signIn: (credentials: SignInCredentials) => Promise<{ requiresNewPassword?: boolean; session?: string } | void>;
  respondToNewPasswordChallenge: (session: string, newPassword: string) => Promise<void>;
  signOut: () => Promise<void>;
  checkAuth: () => Promise<void>;
  forgotPassword: (email: string) => Promise<void>;
  confirmNewPassword: (email: string, code: string, newPassword: string) => Promise<void>;
  changePassword: (credentials: ChangePasswordCredentials) => Promise<void>;
  refreshTokens: () => Promise<TokenInfo | null>;
  ensureValidTokens: () => Promise<boolean>;
  handleSessionExpiry: () => Promise<void>;
}

const AuthContext = createContext<AuthContextType | undefined>(undefined);

// Export the context for use by MockAuthProvider
export { AuthContext };

interface AuthProviderProps {
  children: ReactNode;
}

export function AuthProvider({ children }: AuthProviderProps) {
  const [state, setState] = useState<AuthState>({
    user: null,
    loading: true,
    error: null,
    isLoggingOut: false,
  });

  const client = useMemo(
    () =>
      new CognitoIdentityProviderClient({
        region: process.env.NEXT_PUBLIC_COGNITO_REGION,
      }),
    []
  );

  // Token refresh mechanism - now uses the utility
  const refreshTokensFromHook = useCallback(async (): Promise<TokenInfo | null> => {
    return await refreshTokens();
  }, []);

  // Proactive token refresh - now uses the utility
  const ensureValidTokensFromHook = useCallback(async (): Promise<boolean> => {
    return await ensureValidTokens();
  }, []);

  // Get user from ID token instead of calling Cognito
  const getUserFromToken = useCallback((): User | null => {
    try {
      const idToken = localStorage.getItem('idToken');
      if (!idToken) return null;

      const payload = decodeJWTPayload(idToken);
      if (!payload) return null;

      // Use helper function to construct name with fallback
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
  }, []);

  // Check auth using only local token validation (no Cognito calls)
  const checkAuth = useCallback(async () => {
    try {
      debugLog('[AUTH] Checking authentication status');

      // Get user from ID token - this is our single source of truth
      const user = getUserFromToken();
      if (!user) {
        debugLog('[AUTH] No user found in token, clearing state');
        setState((prev) => {
          // Only update if user actually changed to avoid unnecessary re-renders
          if (prev.user !== null || prev.loading !== false) {
            return { ...prev, user: null, loading: false };
          }
          return prev;
        });
        return;
      }

      debugLog('[AUTH] User found in token:', user.email);
      setState((prev) => {
        // Only update if user actually changed to avoid unnecessary re-renders
        if (prev.user?.id !== user.id || prev.user?.email !== user.email || prev.user?.name !== user.name || prev.loading !== false) {
          return { ...prev, user, loading: false };
        }
        return prev;
      });
    } catch (error) {
      debugError('[AUTH] Check auth failed:', error);
      setState((prev) => {
        // Only update if user actually changed to avoid unnecessary re-renders
        if (prev.user !== null || prev.loading !== false) {
          return { ...prev, user: null, loading: false };
        }
        return prev;
      });
    }
  }, [getUserFromToken]);

  const signIn = useCallback(
    async ({ email, password }: SignInCredentials): Promise<{ requiresNewPassword?: boolean; session?: string } | void> => {
      setState((prev) => ({ ...prev, loading: true, error: null }));

      try {
        const authParameters: Record<string, string> = {
          USERNAME: email,
          PASSWORD: password,
        };

        // Add SECRET_HASH if client secret is configured
        const secretHash = await generateSecretHash(email);
        if (secretHash) {
          authParameters.SECRET_HASH = secretHash;
        }

        const command = new InitiateAuthCommand({
          ClientId: process.env.NEXT_PUBLIC_COGNITO_CLIENT_ID,
          AuthFlow: 'USER_PASSWORD_AUTH',
          AuthParameters: authParameters,
        });

        const response = await client.send(command);

        // Check if Cognito requires a new password (for users created with temporary password)
        if (response.ChallengeName === 'NEW_PASSWORD_REQUIRED') {
          debugLog('[AUTH] New password required challenge received');
          // Store email in localStorage for respondToNewPasswordChallenge
          localStorage.setItem('userEmail', email);
          setState((prev) => ({ ...prev, loading: false }));
          return {
            requiresNewPassword: true,
            session: response.Session || '',
          };
        }

        if (response.AuthenticationResult) {
          const { AccessToken, IdToken, RefreshToken } = response.AuthenticationResult;

          if (AccessToken && IdToken && RefreshToken) {
            // Store tokens in localStorage for backward compatibility
            // (will be migrated to context on next app load)
            localStorage.setItem('accessToken', AccessToken);
            localStorage.setItem('idToken', IdToken);
            localStorage.setItem('refreshToken', RefreshToken);
            localStorage.setItem('userEmail', email);

            // Get user info from ID token
            const user = getUserFromToken();
            if (user) {
              setState((prev) => ({ ...prev, user, loading: false }));
            } else {
              setState((prev) => ({ ...prev, loading: false, error: 'Failed to decode user information' }));
            }
          } else {
            setState((prev) => ({ ...prev, loading: false, error: 'Invalid authentication response' }));
          }
        } else {
          setState((prev) => ({ ...prev, loading: false, error: 'Authentication failed' }));
        }
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

        setState((prev) => ({ ...prev, loading: false, error: errorMessage }));
      }
    },
    [client, getUserFromToken]
  );

  const respondToNewPasswordChallenge = useCallback(
    async (session: string, newPassword: string) => {
      setState((prev) => ({ ...prev, loading: true, error: null }));

      try {
        debugLog('[AUTH] Responding to new password challenge');

        const userEmail = localStorage.getItem('userEmail');
        if (!userEmail) {
          throw new Error('User email not found. Please sign in again.');
        }

        const challengeParameters: Record<string, string> = {
          USERNAME: userEmail,
          NEW_PASSWORD: newPassword,
        };

        // Add SECRET_HASH if client secret is configured
        const secretHash = await generateSecretHash(userEmail);
        if (secretHash) {
          challengeParameters.SECRET_HASH = secretHash;
        }

        const command = new RespondToAuthChallengeCommand({
          ClientId: process.env.NEXT_PUBLIC_COGNITO_CLIENT_ID,
          ChallengeName: 'NEW_PASSWORD_REQUIRED',
          Session: session,
          ChallengeResponses: challengeParameters,
        });

        const response = await client.send(command);

        if (response.AuthenticationResult) {
          const { AccessToken, IdToken, RefreshToken } = response.AuthenticationResult;

          if (AccessToken && IdToken && RefreshToken) {
            // Store tokens in localStorage
            localStorage.setItem('accessToken', AccessToken);
            localStorage.setItem('idToken', IdToken);
            localStorage.setItem('refreshToken', RefreshToken);
            localStorage.setItem('userEmail', userEmail);

            // Get user info from ID token
            const user = getUserFromToken();
            if (user) {
              debugLog('[AUTH] New password set successfully, user authenticated:', user);
              setState((prev) => ({ ...prev, user, loading: false }));
            } else {
              setState((prev) => ({ ...prev, loading: false, error: 'Failed to decode user information' }));
            }
          } else {
            setState((prev) => ({ ...prev, loading: false, error: 'Invalid authentication response' }));
          }
        } else {
          setState((prev) => ({ ...prev, loading: false, error: 'Failed to complete password change' }));
        }
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

        setState((prev) => ({ ...prev, loading: false, error: errorMessage }));
        throw error;
      }
    },
    [client, getUserFromToken]
  );

  // Helper to handle session expiry (called by auth error handler)
  const handleSessionExpiry = useCallback(async () => {
    debugLog('[AUTH] Handling session expiry');

    // Set logging out state for smooth UI transition
    setState((prev) => ({ ...prev, isLoggingOut: true, error: null }));

    // Small delay for smooth transition
    await new Promise(resolve => setTimeout(resolve, 200));

    // Clear local storage
    localStorage.removeItem('accessToken');
    localStorage.removeItem('refreshToken');
    localStorage.removeItem('idToken');
    localStorage.removeItem('userEmail');

    setState((prev) => ({ ...prev, user: null, loading: false, error: null, isLoggingOut: false }));
  }, []);

  const signOut = useCallback(async () => {
    try {
      debugLog('[AUTH] Signing out user');

      // Set logging out state for smooth UI transition
      setState((prev) => ({ ...prev, isLoggingOut: true, error: null }));

      // Get access token before clearing localStorage
      const accessToken = localStorage.getItem('accessToken');

      // Sign out from Cognito first if we have a valid access token
      if (accessToken) {
        try {
          const command = new GlobalSignOutCommand({
            AccessToken: accessToken,
          });
          await client.send(command);
          debugLog('[AUTH] Successfully signed out from Cognito');
        } catch (error) {
          debugError('[AUTH] Cognito sign out error:', error);
          // Continue with local cleanup even if Cognito call fails
        }
      }

      // Small delay for smooth transition (allows logout overlay to show)
      await new Promise(resolve => setTimeout(resolve, 300));

      // Clear local storage after successful signout
      localStorage.removeItem('accessToken');
      localStorage.removeItem('refreshToken');
      localStorage.removeItem('idToken');
      localStorage.removeItem('userEmail');

      debugLog('[AUTH] Local tokens cleared');
    } catch (error) {
      debugError('[AUTH] Sign out error:', error);
      // Ensure tokens are cleared even on error
      localStorage.removeItem('accessToken');
      localStorage.removeItem('refreshToken');
      localStorage.removeItem('idToken');
      localStorage.removeItem('userEmail');
    } finally {
      setState((prev) => ({ ...prev, user: null, loading: false, error: null, isLoggingOut: false }));
    }
  }, [client]);

  const forgotPassword = useCallback(
    async (email: string) => {
      setState((prev) => ({ ...prev, loading: true, error: null }));

      try {
        debugLog('[AUTH] Requesting password reset for:', email);

        // Add SECRET_HASH if client secret is configured
        const secretHash = await generateSecretHash(email);

        const command = new ForgotPasswordCommand({
          ClientId: process.env.NEXT_PUBLIC_COGNITO_CLIENT_ID,
          Username: email,
          ...(secretHash && { SecretHash: secretHash }),
        });

        await client.send(command);

        debugLog('[AUTH] Password reset email sent');
        setState((prev) => ({ ...prev, loading: false }));
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

        setState((prev) => ({ ...prev, loading: false, error: errorMessage }));
      }
    },
    [client]
  );

  const confirmNewPassword = useCallback(
    async (email: string, code: string, newPassword: string) => {
      setState((prev) => ({ ...prev, loading: true, error: null }));

      try {
        debugLog('[AUTH] Confirming new password for:', email);

        // Add SECRET_HASH if client secret is configured
        const secretHash = await generateSecretHash(email);

        const command = new ConfirmForgotPasswordCommand({
          ClientId: process.env.NEXT_PUBLIC_COGNITO_CLIENT_ID,
          Username: email,
          ConfirmationCode: code,
          Password: newPassword,
          ...(secretHash && { SecretHash: secretHash }),
        });

        await client.send(command);

        debugLog('[AUTH] Password reset successful');
        setState((prev) => ({ ...prev, loading: false }));
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

        setState((prev) => ({ ...prev, loading: false, error: errorMessage }));
      }
    },
    [client]
  );

  const changePassword = useCallback(
    async ({ currentPassword, newPassword }: ChangePasswordCredentials) => {
      setState((prev) => ({ ...prev, loading: true, error: null }));

      try {
        debugLog('[AUTH] Changing password for user');

        // Get the access token from localStorage
        const accessToken = localStorage.getItem('accessToken');
        if (!accessToken) {
          throw new Error('No access token found. Please sign in again.');
        }

        // Debug: Log token info (without exposing the full token)
        debugLog('[AUTH] Access token length:', accessToken.length);
        debugLog('[AUTH] Access token starts with:', accessToken.substring(0, 20) + '...');

        // Debug: Decode token to check scopes
        try {
          const tokenPayload = JSON.parse(atob(accessToken.split('.')[1]));
          debugLog('[AUTH] Token scopes:', tokenPayload.scope);
          debugLog('[AUTH] Token audience:', tokenPayload.aud);
          debugLog('[AUTH] Token client_id:', tokenPayload.client_id);
        } catch (decodeError) {
          debugWarn('[AUTH] Could not decode access token:', decodeError);
        }

        const command = new ChangePasswordCommand({
          AccessToken: accessToken,
          PreviousPassword: currentPassword,
          ProposedPassword: newPassword,
        });

        await client.send(command);

        debugLog('[AUTH] Password changed successfully');
        setState((prev) => ({ ...prev, loading: false }));
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

        setState((prev) => ({ ...prev, loading: false, error: errorMessage }));
      }
    },
    [client]
  );

  // Check authentication status on mount - ONLY ONCE
  useEffect(() => {
    checkAuth();
  }, [checkAuth]); // Include checkAuth as dependency since it's stable

  const contextValue = useMemo<AuthContextType>(() => ({
    ...state,
    signIn,
    respondToNewPasswordChallenge,
    signOut,
    checkAuth,
    forgotPassword,
    confirmNewPassword,
    changePassword,
    refreshTokens: refreshTokensFromHook, // Exposed utility functions
    ensureValidTokens: ensureValidTokensFromHook,
    handleSessionExpiry, // New function for handling session expiry
  }), [
    state,
    signIn,
    respondToNewPasswordChallenge,
    signOut,
    checkAuth,
    forgotPassword,
    confirmNewPassword,
    changePassword,
    refreshTokensFromHook,
    ensureValidTokensFromHook,
    handleSessionExpiry,
  ]);

  return (
    <AuthContext.Provider value={contextValue}>
      {children}
    </AuthContext.Provider>
  );
}

export const useAuth = () => {
  const context = useContext(AuthContext);
  if (context === undefined) {
    throw new Error('useAuth must be used within an AuthProvider');
  }
  return context;
};

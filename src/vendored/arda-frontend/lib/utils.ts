import { clsx, type ClassValue } from 'clsx';
import { twMerge } from 'tailwind-merge';

export function cn(...inputs: ClassValue[]) {
  return twMerge(clsx(inputs));
}

/**
 * Generates SECRET_HASH for Cognito authentication
 * Calls server-side API to generate hash securely
 */
export async function generateSecretHash(
  username: string
): Promise<string | undefined> {
  try {
    const response = await fetch('/api/auth/secret-hash', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({ username }),
    });

    if (!response.ok) {
      const errorText = await response.text();
      debugError(
        'Failed to generate secret hash. Status:',
        response.status,
        'Error:',
        errorText
      );
      return undefined;
    }

    const data = await response.json();
    return data.secretHash;
  } catch (error) {
    debugError('Error generating secret hash:', error);
    return undefined;
  }
}

// Debug logging utilities - only logs in STAGE environment
export function debugLog(...args: unknown[]) {
  if (process.env.NEXT_PUBLIC_DEPLOY_ENV === 'STAGE') {
    console.log(...args);
  }
}

export function debugError(...args: unknown[]) {
  if (process.env.NEXT_PUBLIC_DEPLOY_ENV === 'STAGE') {
    console.error(...args);
  }
}

export function debugWarn(...args: unknown[]) {
  if (process.env.NEXT_PUBLIC_DEPLOY_ENV === 'STAGE') {
    console.warn(...args);
  }
}

/**
 * Checks if an error is an authentication error
 * @param error The error to check (can be Error, string, or unknown)
 * @returns true if the error is related to authentication
 */
export function isAuthenticationError(error: unknown): boolean {
  if (!error) return false;

  const errorMessage =
    error instanceof Error
      ? error.message
      : typeof error === 'string'
      ? error
      : String(error);

  const lowerMessage = errorMessage.toLowerCase();

  // Check for NotAuthorizedException (Cognito error)
  if (
    errorMessage.includes('NotAuthorizedException') ||
    errorMessage.includes('notauthorizedexception')
  ) {
    return true;
  }

  // Check error object properties for Cognito errors
  if (error && typeof error === 'object') {
    const errorObj = error as Record<string, unknown>;
    if (
      errorObj.name === 'NotAuthorizedException' ||
      errorObj.code === 'NotAuthorizedException'
    ) {
      return true;
    }
  }

  return (
    lowerMessage.includes('authentication expired') ||
    lowerMessage.includes('authentication required') ||
    lowerMessage.includes('please sign in') ||
    lowerMessage.includes('please sign in again') ||
    lowerMessage.includes('no authentication token') ||
    lowerMessage.includes('no access token') ||
    lowerMessage.includes('no id token') ||
    lowerMessage.includes('invalid authentication token') ||
    lowerMessage.includes('invalid id token') ||
    lowerMessage.includes('authentication token has expired') ||
    lowerMessage.includes('jwt') ||
    lowerMessage.includes('no jwt token') ||
    lowerMessage.includes('invalid or expired') ||
    lowerMessage.includes('unauthorized') ||
    lowerMessage.includes('401') ||
    lowerMessage.includes('[client] no access token') ||
    lowerMessage.includes('[client] no id token') ||
    lowerMessage.includes('unable to verify secret hash')
  );
}

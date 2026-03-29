const STORAGE_KEY = 'hypothesis-api-token';

/** Read the Hypothesis API token from localStorage, or return empty string. */
export function getToken(): string {
  try {
    return localStorage.getItem(STORAGE_KEY) ?? '';
  } catch {
    return '';
  }
}

/** Persist a Hypothesis API token to localStorage. */
export function setToken(token: string): void {
  try {
    localStorage.setItem(STORAGE_KEY, token);
  } catch {
    // Storage full or unavailable — ignore
  }
}

/** Remove the stored Hypothesis API token. */
export function clearToken(): void {
  try {
    localStorage.removeItem(STORAGE_KEY);
  } catch {
    // Ignore
  }
}

/** Whether a token is currently stored. */
export function hasToken(): boolean {
  return getToken().length > 0;
}

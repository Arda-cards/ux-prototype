import { RootState } from '../store';

// Auth selectors
export const selectUser = (state: RootState) => state.auth.user;
export const selectUserContext = (state: RootState) => state.auth.userContext;
export const selectTokens = (state: RootState) => state.auth.tokens;
export const selectAccessToken = (state: RootState) => state.auth.tokens.accessToken;
export const selectIdToken = (state: RootState) => state.auth.tokens.idToken;
export const selectRefreshToken = (state: RootState) => state.auth.tokens.refreshToken;
export const selectJwtPayload = (state: RootState) => state.auth.jwtPayload;
export const selectIsTokenValid = (state: RootState) => state.auth.isTokenValid;
export const selectIsAuthenticated = (state: RootState) => !!state.auth.user && !!state.auth.tokens.accessToken;
export const selectAuthLoading = (state: RootState) => state.auth.loading;
export const selectAuthError = (state: RootState) => state.auth.error;
export const selectIsLoggingOut = (state: RootState) => state.auth.isLoggingOut;
export const selectIsRefreshing = (state: RootState) => state.auth.isRefreshing;

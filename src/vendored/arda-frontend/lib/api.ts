import axios, { AxiosInstance, InternalAxiosRequestConfig, AxiosResponse, AxiosError } from 'axios';
import { ApiResponse, ApiError } from '@frontend/types';
import { handleAuthError } from './authErrorHandler';
import { isAuthenticationError } from './utils';

// This file configures a generic axios client. For ARDA backend calls, we use
// a server-side API route that forwards requests securely with API key.
const API_URL = process.env.NEXT_PUBLIC_API_URL || '/api';

const api: AxiosInstance = axios.create({
	baseURL: API_URL,
	headers: {
		'Content-Type': 'application/json',
	},
});

api.interceptors.request.use(
	(config: InternalAxiosRequestConfig) => {
		return config;
	},
	(error: AxiosError) => {
		return Promise.reject(error);
	}
);

api.interceptors.response.use(
	(response: AxiosResponse<ApiResponse<unknown>>) => {
		return response;
	},
	(error: AxiosError<ApiError>) => {
		if (error.response) {
			const status = error.response.status;
			const errorData = error.response.data;
			const requestUrl = error.config?.url || '';
			
			// Extract error message
			const errorMessage = 
				typeof errorData === 'object' && errorData && 'error' in errorData
					? String(errorData.error)
					: error.message || 'Request failed';
			
			// Only treat 401 as auth error if:
			// 1. It's from an ARDA endpoint (user auth), OR
			// 2. The error message indicates JWT/auth failure
			// Do NOT treat infrastructure 401s (like missing HubSpot token) as auth errors
			if (status === 401) {
				const isArdaEndpoint = requestUrl.includes('/api/arda/');
				const lowerMessage = errorMessage.toLowerCase();
				const looksLikeJwtFailure =
					lowerMessage.includes('jwt') ||
					lowerMessage.includes('authentication required') ||
					lowerMessage.includes('no jwt token') ||
					lowerMessage.includes('invalid or expired') ||
					lowerMessage.includes('please sign in') ||
					lowerMessage.includes('authentication expired');
				
				// Only handle as auth error if it's from ARDA endpoints or looks like JWT failure
				if (isArdaEndpoint || looksLikeJwtFailure) {
					const authError = new Error(errorMessage);
					handleAuthError(authError);
					return Promise.reject(authError);
				}
				
				// For non-auth 401s (like missing HubSpot token), just reject without clearing tokens
				return Promise.reject(error);
			}
			
			// Check if error message indicates auth failure (for other status codes)
			if (isAuthenticationError(errorMessage)) {
				handleAuthError(new Error(errorMessage));
				return Promise.reject(new Error(errorMessage));
			}
		}
		
		// Check if the error itself is an auth error
		if (isAuthenticationError(error)) {
			handleAuthError(error);
		}
		
		return Promise.reject(error);
	}
);

export default api;


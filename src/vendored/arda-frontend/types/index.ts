// Core user type for authentication and user management
export interface User {
  id: string;
  email: string;
  name: string;
}

// Generic API response wrapper
export interface ApiResponse<T> {
  data: T;
  message?: string;
}

// Basic error type for API responses
export interface ApiError {
  message: string;
  errors?: Record<string, string[]>;
}

export interface resetPasswordNewProps {
  searchParams: {
    email?: string;
    code?: string;
  };
}

// Export kanban types
export * from './kanban';

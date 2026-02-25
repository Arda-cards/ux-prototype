// Server-side environment access and minimal validation
// This file is imported only from server code (API routes, server components)

export function requiredEnv(name: string): string {
  const value = process.env[name];
  if (!value || value.length === 0) {
    // In mock mode, server-side env vars are not needed — return safe fallbacks
    if (process.env.NEXT_PUBLIC_MOCK_MODE === 'true') {
      if (name === 'BASE_URL') return 'http://localhost:3000';
      return 'mock-value';
    }
    console.error(`Missing required environment variable: ${name}`);
    console.error('Available env vars:', Object.keys(process.env).filter(k => k.includes('ARDA') || k.includes('TENANT') || k.includes('BASE')));
    throw new Error(`Missing required environment variable: ${name}`);
  }
  return value;
}

// Safely initialize env variables with better error handling
let env: {
  BASE_URL: string;
  ARDA_API_KEY: string;
  TENANT_ID: string;
  TENANT_ID_2: string;
  HUBSPOT_API_BASE?: string;
  HUBSPOT_PRIVATE_ACCESS_TOKEN?: string;
};

try {
  env = {
    BASE_URL: requiredEnv('BASE_URL'),
    ARDA_API_KEY: requiredEnv('ARDA_API_KEY'),
    TENANT_ID: requiredEnv('TENANT_ID'),
    TENANT_ID_2: requiredEnv('TENANT_ID_2'),
    HUBSPOT_API_BASE: process.env.HUBSPOT_API_BASE || 'https://api.hubapi.com',
    HUBSPOT_PRIVATE_ACCESS_TOKEN: process.env.HUBSPOT_PRIVATE_ACCESS_TOKEN,
  };
  console.log('Environment variables loaded successfully');
} catch (error) {
  console.error('Failed to load environment variables:', error);
  // Use mock-safe fallbacks so mock mode still works even if env vars are missing
  env = {
    BASE_URL: process.env.BASE_URL || 'http://localhost:3000',
    ARDA_API_KEY: process.env.ARDA_API_KEY || 'mock-api-key',
    TENANT_ID: process.env.TENANT_ID || 'mock-tenant-001',
    TENANT_ID_2: process.env.TENANT_ID_2 || 'mock-tenant-002',
    HUBSPOT_API_BASE: process.env.HUBSPOT_API_BASE || 'https://api.hubapi.com',
    HUBSPOT_PRIVATE_ACCESS_TOKEN: process.env.HUBSPOT_PRIVATE_ACCESS_TOKEN || '',
  };
}

export { env };



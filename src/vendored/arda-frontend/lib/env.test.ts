describe('env.ts', () => {
  // Save and restore the original env around every test
  const originalEnv = process.env;

  beforeEach(() => {
    process.env = { ...originalEnv };
    // Ensure mock mode is off unless a test sets it
    delete process.env.NEXT_PUBLIC_MOCK_MODE;
    jest.spyOn(console, 'error').mockImplementation(() => {});
    jest.spyOn(console, 'log').mockImplementation(() => {});
  });

  afterEach(() => {
    process.env = originalEnv;
    jest.restoreAllMocks();
  });

  describe('requiredEnv', () => {
    it('returns value when env var is set', () => {
      process.env.MY_VAR = 'hello';

      jest.isolateModules(() => {
        // eslint-disable-next-line @typescript-eslint/no-require-imports
        const { requiredEnv } = require('./env') as typeof import('./env');
        expect(requiredEnv('MY_VAR')).toBe('hello');
      });
    });

    it('throws when env var is missing', () => {
      delete process.env.MY_VAR;

      jest.isolateModules(() => {
        // eslint-disable-next-line @typescript-eslint/no-require-imports
        const { requiredEnv } = require('./env') as typeof import('./env');
        expect(() => requiredEnv('MY_VAR')).toThrow(
          'Missing required environment variable: MY_VAR'
        );
      });
    });

    it('throws when env var is empty string', () => {
      process.env.MY_VAR = '';

      jest.isolateModules(() => {
        // eslint-disable-next-line @typescript-eslint/no-require-imports
        const { requiredEnv } = require('./env') as typeof import('./env');
        expect(() => requiredEnv('MY_VAR')).toThrow(
          'Missing required environment variable: MY_VAR'
        );
      });
    });

    it('returns "http://localhost:3000" for "BASE_URL" when NEXT_PUBLIC_MOCK_MODE is "true"', () => {
      process.env.NEXT_PUBLIC_MOCK_MODE = 'true';
      delete process.env.BASE_URL;

      jest.isolateModules(() => {
        // eslint-disable-next-line @typescript-eslint/no-require-imports
        const { requiredEnv } = require('./env') as typeof import('./env');
        expect(requiredEnv('BASE_URL')).toBe('http://localhost:3000');
      });
    });

    it('returns "mock-value" for any other var when NEXT_PUBLIC_MOCK_MODE is "true"', () => {
      process.env.NEXT_PUBLIC_MOCK_MODE = 'true';
      delete process.env.SOME_OTHER_VAR;

      jest.isolateModules(() => {
        // eslint-disable-next-line @typescript-eslint/no-require-imports
        const { requiredEnv } = require('./env') as typeof import('./env');
        expect(requiredEnv('SOME_OTHER_VAR')).toBe('mock-value');
      });
    });
  });

  describe('env object (module-level initialization)', () => {
    it('populates env with all required fields when env vars are set', () => {
      process.env.BASE_URL = 'http://example.com';
      process.env.ARDA_API_KEY = 'test-api-key';
      process.env.HUBSPOT_API_BASE = 'https://custom.hubapi.com';
      process.env.HUBSPOT_PRIVATE_ACCESS_TOKEN = 'token-abc';

      jest.isolateModules(() => {
        // eslint-disable-next-line @typescript-eslint/no-require-imports
        const { env } = require('./env') as typeof import('./env');
        expect(env.BASE_URL).toBe('http://example.com');
        expect(env.ARDA_API_KEY).toBe('test-api-key');
        expect(env.HUBSPOT_API_BASE).toBe('https://custom.hubapi.com');
        expect(env.HUBSPOT_PRIVATE_ACCESS_TOKEN).toBe('token-abc');
      });
    });

    it('env object falls back to mock-safe defaults when requiredEnv throws (missing vars)', () => {
      delete process.env.BASE_URL;
      delete process.env.ARDA_API_KEY;

      jest.isolateModules(() => {
        // eslint-disable-next-line @typescript-eslint/no-require-imports
        const { env } = require('./env') as typeof import('./env');
        // The try/catch in env.ts catches the throw and falls back to mock-safe values
        expect(env.BASE_URL).toBe('http://localhost:3000');
        expect(env.ARDA_API_KEY).toBe('mock-api-key');
      });
    });

    it('env.HUBSPOT_API_BASE defaults to "https://api.hubapi.com" when not set', () => {
      process.env.BASE_URL = 'http://example.com';
      process.env.ARDA_API_KEY = 'test-api-key';
      delete process.env.HUBSPOT_API_BASE;
      delete process.env.HUBSPOT_PRIVATE_ACCESS_TOKEN;

      jest.isolateModules(() => {
        // eslint-disable-next-line @typescript-eslint/no-require-imports
        const { env } = require('./env') as typeof import('./env');
        expect(env.HUBSPOT_API_BASE).toBe('https://api.hubapi.com');
      });
    });
  });
});

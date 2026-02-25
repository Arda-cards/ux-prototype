import { safeParseJson } from './api-helpers';

// NextRequest requires a browser-native `Request` global that jsdom does not provide.
// We mock next/server with a lightweight implementation that supports headers and json().
jest.mock('next/server', () => {
  class MockNextRequest {
    private readonly _headers: Map<string, string>;
    private readonly _body: unknown;

    constructor(
      _url: string,
      init?: { method?: string; body?: string; headers?: Record<string, string> }
    ) {
      this._headers = new Map(Object.entries(init?.headers ?? {}));
      try {
        this._body = init?.body ? JSON.parse(init.body) : undefined;
      } catch {
        // Store a sentinel so json() can throw SyntaxError
        this._body = Symbol('INVALID_JSON');
      }
    }

    get headers() {
      return {
        get: (name: string) => this._headers.get(name) ?? null,
      };
    }

    async json(): Promise<unknown> {
      if (this._body === undefined || typeof this._body === 'symbol') {
        throw new SyntaxError('Unexpected token');
      }
      return this._body;
    }
  }

  return { NextRequest: MockNextRequest };
});

// Re-import after mock is set up
import { NextRequest } from 'next/server';

describe('safeParseJson', () => {
  beforeEach(() => {
    jest.spyOn(console, 'warn').mockImplementation(() => {});
  });

  afterEach(() => {
    jest.restoreAllMocks();
  });

  it('returns parsed JSON when request has valid JSON body', async () => {
    const body = JSON.stringify({ key: 'value' });
    const req = new NextRequest('http://localhost/api/test', {
      method: 'POST',
      body,
      headers: { 'content-length': String(body.length) },
    });

    const result = await safeParseJson(req);

    expect(result).toEqual({ key: 'value' });
  });

  it('returns parsed JSON even when content-length header is missing', async () => {
    const body = JSON.stringify({ key: 'value' });
    const req = new NextRequest('http://localhost/api/test', {
      method: 'POST',
      body,
    });

    const result = await safeParseJson(req);

    expect(result).toEqual({ key: 'value' });
  });

  it('returns empty object when body is empty (json() throws)', async () => {
    const req = new NextRequest('http://localhost/api/test', {
      method: 'POST',
    });

    const result = await safeParseJson(req);

    expect(result).toEqual({});
  });

  it('returns empty object when body is invalid JSON and request.json() throws SyntaxError', async () => {
    const req = new NextRequest('http://localhost/api/test', {
      method: 'POST',
      body: 'not-valid-json',
      headers: { 'content-length': '14' },
    });

    const result = await safeParseJson(req);

    expect(result).toEqual({});
    expect(console.warn).not.toHaveBeenCalled();
  });

  it('returns empty object and logs warning for non-SyntaxError parse failure', async () => {
    const body = JSON.stringify({ key: 'value' });
    const req = new NextRequest('http://localhost/api/test', {
      method: 'POST',
      body,
      headers: { 'content-length': String(body.length) },
    });

    const networkError = new Error('Network failure');
    jest.spyOn(req, 'json').mockRejectedValue(networkError);

    const result = await safeParseJson(req);

    expect(result).toEqual({});
    expect(console.warn).toHaveBeenCalledWith(
      '[API Helper] Failed to parse request body, using empty object:',
      'Network failure'
    );
  });

  it('preserves generic type T in returned value', async () => {
    interface MyType {
      id: number;
      name: string;
    }

    const body = JSON.stringify({ id: 42, name: 'test' });
    const req = new NextRequest('http://localhost/api/test', {
      method: 'POST',
      body,
      headers: { 'content-length': String(body.length) },
    });

    const result = await safeParseJson<MyType>(req);

    expect(result.id).toBe(42);
    expect(result.name).toBe('test');
  });
});

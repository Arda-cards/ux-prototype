/**
 * Unit tests for src/types/general.ts
 * Covers: isValidUuid, isValidUrl, nowMillis, nowTimeCoordinates, defaultDuration, defaultTimeUnit
 */

import {
  isValidUuid,
  isValidUrl,
  nowMillis,
  nowTimeCoordinates,
  defaultTimeUnit,
  defaultDuration,
} from './general';

describe('isValidUuid', () => {
  it('returns true for a valid UUID v4', () => {
    expect(isValidUuid('550e8400-e29b-41d4-a716-446655440000')).toBe(true);
  });

  it('returns true for a valid UUID v1', () => {
    expect(isValidUuid('6ba7b810-9dad-11d1-80b4-00c04fd430c8')).toBe(true);
  });

  it('returns true for uppercase UUID', () => {
    expect(isValidUuid('550E8400-E29B-41D4-A716-446655440000')).toBe(true);
  });

  it('returns false for empty string', () => {
    expect(isValidUuid('')).toBe(false);
  });

  it('returns false for plain string', () => {
    expect(isValidUuid('not-a-uuid')).toBe(false);
  });

  it('returns false for UUID with missing segments', () => {
    expect(isValidUuid('550e8400-e29b-41d4-a716')).toBe(false);
  });

  it('returns false for UUID with wrong segment lengths', () => {
    expect(isValidUuid('550e8400-e29b-41d4-a716-44665544000')).toBe(false);
  });

  it('returns false for null-like string', () => {
    expect(isValidUuid('null')).toBe(false);
  });

  it('returns false for UUID with invalid version digit (0)', () => {
    expect(isValidUuid('550e8400-e29b-01d4-a716-446655440000')).toBe(false);
  });

  it('returns false for UUID with invalid variant byte', () => {
    // The fourth group's first hex must be 8, 9, a, or b
    expect(isValidUuid('550e8400-e29b-41d4-0716-446655440000')).toBe(false);
  });
});

describe('isValidUrl', () => {
  it('returns true for http URL', () => {
    expect(isValidUrl('http://example.com')).toBe(true);
  });

  it('returns true for https URL', () => {
    expect(isValidUrl('https://example.com')).toBe(true);
  });

  it('returns true for URL with path', () => {
    expect(isValidUrl('https://example.com/path/to/page')).toBe(true);
  });

  it('returns true for URL with port', () => {
    expect(isValidUrl('https://example.com:8080/api')).toBe(true);
  });

  it('returns true for URL without protocol (domain only)', () => {
    // The regex allows URLs without protocol
    expect(isValidUrl('example.com')).toBe(true);
  });

  it('returns false for empty string', () => {
    expect(isValidUrl('')).toBe(false);
  });

  it('returns false for string with only spaces', () => {
    expect(isValidUrl('   ')).toBe(false);
  });
});

describe('nowMillis', () => {
  it('returns a number', () => {
    const result = nowMillis();
    expect(typeof result).toBe('number');
  });

  it('returns a value close to Date.now()', () => {
    const before = Date.now();
    const result = nowMillis();
    const after = Date.now();
    expect(result).toBeGreaterThanOrEqual(before);
    expect(result).toBeLessThanOrEqual(after);
  });
});

describe('nowTimeCoordinates', () => {
  it('returns an object with recordedAsOf and effectiveAsOf', () => {
    const result = nowTimeCoordinates();
    expect(result).toHaveProperty('recordedAsOf');
    expect(result).toHaveProperty('effectiveAsOf');
  });

  it('recordedAsOf and effectiveAsOf are numbers', () => {
    const result = nowTimeCoordinates();
    expect(typeof result.recordedAsOf).toBe('number');
    expect(typeof result.effectiveAsOf).toBe('number');
  });

  it('both timestamps are close to current time', () => {
    const before = Date.now();
    const result = nowTimeCoordinates();
    const after = Date.now();
    expect(result.recordedAsOf).toBeGreaterThanOrEqual(before);
    expect(result.recordedAsOf).toBeLessThanOrEqual(after);
    expect(result.effectiveAsOf).toBeGreaterThanOrEqual(before);
    expect(result.effectiveAsOf).toBeLessThanOrEqual(after);
  });
});

describe('defaultTimeUnit', () => {
  it('is SECOND', () => {
    expect(defaultTimeUnit).toBe('SECOND');
  });
});

describe('defaultDuration', () => {
  it('has length 0', () => {
    expect(defaultDuration.length).toBe(0);
  });

  it('uses defaultTimeUnit as unit', () => {
    expect(defaultDuration.unit).toBe(defaultTimeUnit);
  });
});

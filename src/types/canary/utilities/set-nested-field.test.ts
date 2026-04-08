import { describe, it, expect } from 'vitest';
import { setNestedField } from './set-nested-field';

describe('setNestedField', () => {
  it('sets a shallow path', () => {
    expect(setNestedField({ name: 'a' }, 'name', 'b')).toEqual({ name: 'b' });
  });

  it('sets a nested path', () => {
    expect(setNestedField({ address: { city: 'a' } }, 'address.city', 'b')).toEqual({
      address: { city: 'b' },
    });
  });

  it('sets a deep path', () => {
    expect(setNestedField({ a: { b: { c: 1 } } }, 'a.b.c', 2)).toEqual({
      a: { b: { c: 2 } },
    });
  });

  it('creates intermediate objects when they do not exist', () => {
    expect(setNestedField({}, 'a.b.c', 1)).toEqual({ a: { b: { c: 1 } } });
  });

  it('does not mutate the original object', () => {
    const original = { name: 'a' };
    const result = setNestedField(original, 'name', 'b');
    expect(Object.is(original, result)).toBe(false);
    expect(original.name).toBe('a');
  });

  it('does not mutate intermediate objects', () => {
    const inner = { city: 'a' };
    const original = { address: inner };
    setNestedField(original, 'address.city', 'b');
    expect(inner.city).toBe('a');
  });

  it('handles a single-segment path', () => {
    expect(setNestedField({ x: 1 }, 'x', 2)).toEqual({ x: 2 });
  });

  it('preserves sibling fields', () => {
    expect(setNestedField({ a: 1, b: 2 }, 'a', 3)).toEqual({ a: 3, b: 2 });
  });
});

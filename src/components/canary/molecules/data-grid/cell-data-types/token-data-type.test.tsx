import { describe, it, expect } from 'vitest';

import { createTokenDataType } from './token-data-type';

const ROLE_OPTIONS = ['Vendor', 'Customer', 'Carrier', 'Operator'];
const ORDER_METHODS = ['Online', 'Email', 'Phone'];

type Dt = ReturnType<typeof createTokenDataType>;

// The definition functions take AG Grid "lite" params; cast to the minimal
// callable shape the tests exercise.
const format = (dt: Dt, value: unknown) =>
  (dt.dataType.valueFormatter as unknown as (p: { value: unknown }) => string)({ value });
const parse = (dt: Dt, newValue: string | null) =>
  (dt.dataType.valueParser as unknown as (p: { newValue: string | null }) => unknown)({ newValue });
const key = (dt: Dt, value: unknown) =>
  (dt.columnType.keyCreator as unknown as (p: { value: unknown }) => string)({ value });

describe('createTokenDataType — multi-select', () => {
  const dt = createTokenDataType({
    multiple: true,
    editor: { lookup: ROLE_OPTIONS, placeholder: 'Select roles…', defaultOne: true },
  });

  it('formats an array to a comma-joined string', () => {
    expect(format(dt, ['Vendor', 'Carrier'])).toBe('Vendor, Carrier');
  });

  it('parses a comma string back to an array', () => {
    expect(parse(dt, 'Vendor, Carrier')).toEqual(['Vendor', 'Carrier']);
  });

  it('rejects values that are not in the static lookup (junk paste)', () => {
    expect(parse(dt, 'Vendor, Bogus')).toEqual(['Vendor']);
    expect(parse(dt, 'Bogus')).toBeNull();
  });

  it('treats empty input as null', () => {
    expect(parse(dt, '')).toBeNull();
    expect(format(dt, [])).toBe('');
  });

  it('produces a human-readable key for set filter / grouping', () => {
    expect(key(dt, ['Vendor', 'Carrier'])).toBe('Vendor, Carrier');
  });

  it('exposes a renderer, editor, and popup (cell-matched) editing', () => {
    expect(dt.columnType.cellRenderer).toBeTypeOf('function');
    expect(dt.columnType.cellEditor).toBeTypeOf('function');
    expect(dt.columnType.cellEditorPopup).toBe(true);
    expect(dt.dataType.baseDataType).toBe('object');
  });
});

describe('createTokenDataType — single-select', () => {
  const dt = createTokenDataType({
    multiple: false,
    editor: { lookup: ORDER_METHODS, maxResults: ORDER_METHODS.length, clearOnFocus: true },
  });

  it('round-trips a scalar string', () => {
    expect(format(dt, 'Online')).toBe('Online');
    expect(parse(dt, 'Online')).toBe('Online');
  });

  it('returns null for an invalid option or empty input', () => {
    expect(parse(dt, 'Telepathy')).toBeNull();
    expect(parse(dt, '')).toBeNull();
  });
});

describe('createTokenDataType — copy / paste / bulk / fill contract', () => {
  // These exercise the value<->string round trip that AG Grid invokes for each
  // grid behavior: copy = valueFormatter, paste/fill = valueParser. Testing the
  // contract here is reliable; the gestures themselves are AG Grid's own feature.
  const multi = createTokenDataType({
    multiple: true,
    editor: { lookup: ROLE_OPTIONS },
  });
  const single = createTokenDataType({
    multiple: false,
    editor: { lookup: ORDER_METHODS },
  });

  it('copy → paste reproduces the value (round trip is stable)', () => {
    const value = ['Vendor', 'Operator'];
    const copied = format(multi, value); // what lands on the clipboard
    expect(parse(multi, copied)).toEqual(value); // what a paste restores

    const single1 = 'Email';
    expect(parse(single, format(single, single1))).toBe(single1);
  });

  it('fill-down is idempotent: format then parse yields the original', () => {
    for (const v of [['Vendor'], ['Vendor', 'Carrier'], ['Customer', 'Operator']]) {
      expect(parse(multi, format(multi, v))).toEqual(v);
    }
  });

  it('bulk paste applies the same parser to every cell in a range', () => {
    // One clipboard string pasted across a 3-cell range -> identical value each.
    const clip = 'Vendor, Carrier';
    const range = [0, 1, 2].map(() => parse(multi, clip));
    expect(range).toEqual([
      ['Vendor', 'Carrier'],
      ['Vendor', 'Carrier'],
      ['Vendor', 'Carrier'],
    ]);
  });

  it('field paste validation: a partially-valid paste keeps only valid options', () => {
    expect(parse(multi, 'Vendor, Nonsense, Carrier')).toEqual(['Vendor', 'Carrier']);
  });

  it('field paste validation: a fully-invalid paste is rejected (null)', () => {
    expect(parse(multi, 'Nope, Nada')).toBeNull();
    expect(parse(single, 'Nope')).toBeNull();
  });
});

describe('createTokenDataType — async lookup', () => {
  const dt = createTokenDataType({
    multiple: false,
    editor: { lookup: async () => [{ label: 'Acme', value: 'Acme' }] },
  });

  it('shape-parses without a closed list (validation deferred)', () => {
    // No static list and no validValues -> any non-empty token is accepted.
    expect(parse(dt, 'Anything')).toBe('Anything');
    expect(parse(dt, '')).toBeNull();
  });

  it('honors an explicit validValues list even with an async lookup', () => {
    const validated = createTokenDataType({
      multiple: false,
      editor: { lookup: async () => [] },
      validValues: ['Acme'],
    });
    expect(parse(validated, 'Acme')).toBe('Acme');
    expect(parse(validated, 'Other')).toBeNull();
  });
});

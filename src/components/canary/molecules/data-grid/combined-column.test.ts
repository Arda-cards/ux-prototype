import { describe, it, expect } from 'vitest';

import { createCombinedColumn, type CombinedColumnMember } from './combined-column';

const members: CombinedColumnMember[] = [
  { field: 'addressLine1', headerName: 'Street' },
  { field: 'addressLine2', headerName: 'Suite' },
  { field: 'city', headerName: 'City' },
  { field: 'state', headerName: 'State' },
  { field: 'postalCode', headerName: 'ZIP' },
  { field: 'country', headerName: 'Country', options: ['US', 'CA'] },
];

const col = createCombinedColumn({ headerName: 'Address', members });

// Thin param shims — we exercise the colDef value functions directly.
const vg = col.valueGetter as (p: { data: unknown }) => Record<string, unknown> | null;
const vs = col.valueSetter as (p: { data: Record<string, unknown>; newValue: unknown }) => boolean;
const vf = col.valueFormatter as (p: { value: unknown }) => string;
const vp = col.valueParser as (p: { newValue: unknown }) => Record<string, unknown> | null;
const kc = col.keyCreator as (p: { value: unknown }) => string;

describe('createCombinedColumn', () => {
  it('valueGetter aggregates only the member fields into an object', () => {
    const data = {
      addressLine1: '123 Main St',
      city: 'Austin',
      state: 'TX',
      postalCode: '78701',
      country: 'US',
      unrelated: 'ignore me',
    };
    expect(vg({ data })).toEqual({
      addressLine1: '123 Main St',
      addressLine2: undefined,
      city: 'Austin',
      state: 'TX',
      postalCode: '78701',
      country: 'US',
    });
  });

  it('valueFormatter joins members with the separator and drops empty fields', () => {
    const value = {
      addressLine1: '123 Main St',
      addressLine2: '', // empty → dropped from the display line
      city: 'Austin',
      state: 'TX',
      postalCode: '78701',
      country: 'US',
    };
    expect(vf({ value })).toBe('123 Main St, Austin, TX, 78701, US');
  });

  it('valueSetter writes each member field back onto the row', () => {
    const data: Record<string, unknown> = {
      addressLine1: 'old',
      city: 'old',
      state: 'old',
      postalCode: 'old',
      country: 'US',
    };
    const ok = vs({
      data,
      newValue: {
        addressLine1: '1 New Rd',
        city: 'Reno',
        state: 'NV',
        postalCode: '89501',
        country: 'US',
      },
    });
    expect(ok).toBe(true);
    expect(data.addressLine1).toBe('1 New Rd');
    expect(data.city).toBe('Reno');
    expect(data.state).toBe('NV');
  });

  it('round-trips a fully-populated line through parse → format (same-grid clipboard)', () => {
    const line = '123 Main St, Apt 4, Austin, TX, 78701, US';
    const parsed = vp({ newValue: line });
    expect(parsed).toEqual({
      addressLine1: '123 Main St',
      addressLine2: 'Apt 4',
      city: 'Austin',
      state: 'TX',
      postalCode: '78701',
      country: 'US',
    });
    expect(vf({ value: parsed })).toBe(line);
  });

  it('valueParser returns null for empty text', () => {
    expect(vp({ newValue: '' })).toBeNull();
  });

  it('keyCreator returns the formatted line (for filter/group)', () => {
    const value = {
      addressLine1: '123 Main St',
      city: 'Austin',
      state: 'TX',
      postalCode: '78701',
      country: 'US',
    };
    expect(kc({ value })).toBe('123 Main St, Austin, TX, 78701, US');
  });
});

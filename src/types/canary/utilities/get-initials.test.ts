import { getInitials } from './get-initials';

describe('getInitials', () => {
  it('returns two initials for a two-word name', () => {
    expect(getInitials('Harold Brown')).toBe('HB');
  });

  it('returns the first two initials for a three-word name', () => {
    expect(getInitials('Harold Bernard Smith')).toBe('HB');
  });

  it('returns a single initial for a single-word name', () => {
    expect(getInitials('Brown')).toBe('B');
  });

  it('returns a single character initial for a single character input', () => {
    expect(getInitials('A')).toBe('A');
  });

  it('returns "?" for an empty string', () => {
    expect(getInitials('')).toBe('?');
  });

  it('returns "?" for a whitespace-only string', () => {
    expect(getInitials('   ')).toBe('?');
  });

  it('trims leading and trailing whitespace before computing initials', () => {
    expect(getInitials('  Harold Brown  ')).toBe('HB');
  });

  it('uppercases initials from a mixed-case name', () => {
    expect(getInitials('harold brown')).toBe('HB');
  });
});

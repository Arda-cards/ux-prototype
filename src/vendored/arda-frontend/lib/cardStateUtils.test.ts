import { describe, it, expect } from '@jest/globals';
import {
  CARD_STATE_CONFIG,
  getCardStateConfig,
  getCardStateLabel,
  getCardStateColor,
  getCardStateBgColor,
  getCardStateTextColor,
  canAddToOrderQueue,
  getAllCardStates,
  mapApiStatusToDisplay,
} from '@frontend/lib/cardStateUtils';

describe('cardStateUtils', () => {
  describe('getCardStateConfig', () => {
    it('returns REQUESTING config for "REQUESTING"', () => {
      const config = getCardStateConfig('REQUESTING');
      expect(config.status).toBe('REQUESTING');
      expect(config.label).toBe('In Order Queue');
    });

    it('returns correct config for each of 6 statuses', () => {
      const statuses = [
        'REQUESTING',
        'REQUESTED',
        'IN_PROCESS',
        'FULFILLED',
        'AVAILABLE',
        'UNKNOWN',
      ] as const;

      for (const status of statuses) {
        const config = getCardStateConfig(status);
        expect(config.status).toBe(status);
        expect(CARD_STATE_CONFIG[status]).toEqual(config);
      }
    });

    it('normalizes lowercase input (e.g. "requesting" → REQUESTING config)', () => {
      const config = getCardStateConfig('requesting');
      expect(config.status).toBe('REQUESTING');
      expect(config.label).toBe('In Order Queue');
    });

    it('normalizes mixed-case input (e.g. "Requested")', () => {
      const config = getCardStateConfig('Requested');
      expect(config.status).toBe('REQUESTED');
      expect(config.label).toBe('In Progress');
    });

    it('returns UNKNOWN config for unrecognized status', () => {
      const config = getCardStateConfig('NOT_A_REAL_STATUS');
      expect(config.status).toBe('UNKNOWN');
    });

    it('returns UNKNOWN config for empty string', () => {
      const config = getCardStateConfig('');
      expect(config.status).toBe('UNKNOWN');
    });
  });

  describe('getCardStateLabel', () => {
    it('returns "In Order Queue" for "REQUESTING"', () => {
      expect(getCardStateLabel('REQUESTING')).toBe('In Order Queue');
    });

    it('returns "Unknown" for unrecognized status', () => {
      expect(getCardStateLabel('BOGUS_STATUS')).toBe('Unknown');
    });
  });

  describe('getCardStateColor', () => {
    it('returns expected hex color for each known status', () => {
      expect(getCardStateColor('REQUESTING')).toBe('#FF6B35');
      expect(getCardStateColor('REQUESTED')).toBe('#F59E0B');
      expect(getCardStateColor('IN_PROCESS')).toBe('#3B82F6');
      expect(getCardStateColor('FULFILLED')).toBe('#10B981');
      expect(getCardStateColor('AVAILABLE')).toBe('#6B7280');
      expect(getCardStateColor('UNKNOWN')).toBe('#9CA3AF');
    });
  });

  describe('getCardStateBgColor', () => {
    it('returns expected background color for each known status', () => {
      expect(getCardStateBgColor('REQUESTING')).toBe('#FFF4F0');
      expect(getCardStateBgColor('REQUESTED')).toBe('#FFFBEB');
      expect(getCardStateBgColor('IN_PROCESS')).toBe('#EFF6FF');
      expect(getCardStateBgColor('FULFILLED')).toBe('#ECFDF5');
      expect(getCardStateBgColor('AVAILABLE')).toBe('#F9FAFB');
      expect(getCardStateBgColor('UNKNOWN')).toBe('#F3F4F6');
    });
  });

  describe('getCardStateTextColor', () => {
    it('returns expected text color for each known status', () => {
      expect(getCardStateTextColor('REQUESTING')).toBe('#B45309');
      expect(getCardStateTextColor('REQUESTED')).toBe('#92400E');
      expect(getCardStateTextColor('IN_PROCESS')).toBe('#1E40AF');
      expect(getCardStateTextColor('FULFILLED')).toBe('#047857');
      expect(getCardStateTextColor('AVAILABLE')).toBe('#374151');
      expect(getCardStateTextColor('UNKNOWN')).toBe('#6B7280');
    });
  });

  describe('canAddToOrderQueue', () => {
    it('returns false for "REQUESTING"', () => {
      expect(canAddToOrderQueue('REQUESTING')).toBe(false);
    });

    it('returns true for "REQUESTED"', () => {
      expect(canAddToOrderQueue('REQUESTED')).toBe(true);
    });

    it('returns true for "IN_PROCESS"', () => {
      expect(canAddToOrderQueue('IN_PROCESS')).toBe(true);
    });

    it('returns true for "FULFILLED"', () => {
      expect(canAddToOrderQueue('FULFILLED')).toBe(true);
    });

    it('returns true for "AVAILABLE"', () => {
      expect(canAddToOrderQueue('AVAILABLE')).toBe(true);
    });

    it('returns true for unknown status', () => {
      expect(canAddToOrderQueue('SOME_OTHER_STATUS')).toBe(true);
    });
  });

  describe('getAllCardStates', () => {
    it('returns array of exactly 6 configs', () => {
      const states = getAllCardStates();
      expect(states).toHaveLength(6);
    });

    it('includes configs for all known statuses', () => {
      const states = getAllCardStates();
      const statuses = states.map((s) => s.status);
      expect(statuses).toContain('REQUESTING');
      expect(statuses).toContain('REQUESTED');
      expect(statuses).toContain('IN_PROCESS');
      expect(statuses).toContain('FULFILLED');
      expect(statuses).toContain('AVAILABLE');
      expect(statuses).toContain('UNKNOWN');
    });
  });

  describe('mapApiStatusToDisplay', () => {
    it('maps "REQUESTING" to "REQUESTING"', () => {
      expect(mapApiStatusToDisplay('REQUESTING')).toBe('REQUESTING');
    });

    it('normalizes lowercase input ("fulfilled" → "FULFILLED")', () => {
      expect(mapApiStatusToDisplay('fulfilled')).toBe('FULFILLED');
    });

    it('returns "UNKNOWN" for unrecognized status', () => {
      expect(mapApiStatusToDisplay('TOTALLY_UNKNOWN_STATUS')).toBe('UNKNOWN');
    });

    it('returns "UNKNOWN" for empty string', () => {
      expect(mapApiStatusToDisplay('')).toBe('UNKNOWN');
    });
  });

  describe('CardStateConfig shape', () => {
    it('each CardStateConfig entry has all required fields', () => {
      const states = getAllCardStates();
      for (const state of states) {
        expect(state).toHaveProperty('status');
        expect(state).toHaveProperty('label');
        expect(state).toHaveProperty('color');
        expect(state).toHaveProperty('bgColor');
        expect(state).toHaveProperty('textColor');
        expect(state).toHaveProperty('description');

        expect(typeof state.status).toBe('string');
        expect(typeof state.label).toBe('string');
        expect(typeof state.color).toBe('string');
        expect(typeof state.bgColor).toBe('string');
        expect(typeof state.textColor).toBe('string');
        expect(typeof state.description).toBe('string');
      }
    });
  });
});

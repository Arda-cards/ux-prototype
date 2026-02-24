// Tests for card-state/index.ts re-exports (utility functions from cardStateUtils)
import {
  getCardStateConfig,
  getCardStateLabel,
  getCardStateColor,
  getCardStateBgColor,
  getCardStateTextColor,
  canAddToOrderQueue,
  getAllCardStates,
  mapApiStatusToDisplay,
} from './index';

describe('getCardStateConfig', () => {
  it('returns config for REQUESTING', () => {
    const config = getCardStateConfig('REQUESTING');
    expect(config.status).toBe('REQUESTING');
    expect(config.label).toBe('In Order Queue');
  });

  it('returns config for REQUESTED', () => {
    const config = getCardStateConfig('REQUESTED');
    expect(config.status).toBe('REQUESTED');
    expect(config.label).toBe('In Progress');
  });

  it('returns config for IN_PROCESS', () => {
    const config = getCardStateConfig('IN_PROCESS');
    expect(config.status).toBe('IN_PROCESS');
    expect(config.label).toBe('Receiving');
  });

  it('returns config for FULFILLED', () => {
    const config = getCardStateConfig('FULFILLED');
    expect(config.status).toBe('FULFILLED');
    expect(config.label).toBe('Restocked');
  });

  it('returns config for AVAILABLE', () => {
    const config = getCardStateConfig('AVAILABLE');
    expect(config.status).toBe('AVAILABLE');
    expect(config.label).toBe('Available');
  });

  it('returns UNKNOWN config for unknown status', () => {
    const config = getCardStateConfig('SOME_UNKNOWN_STATE');
    expect(config.status).toBe('UNKNOWN');
    expect(config.label).toBe('Unknown');
  });

  it('normalizes lowercase input to uppercase', () => {
    const config = getCardStateConfig('requesting');
    expect(config.status).toBe('REQUESTING');
  });

  it('returns config with all required fields', () => {
    const config = getCardStateConfig('REQUESTING');
    expect(config).toHaveProperty('status');
    expect(config).toHaveProperty('label');
    expect(config).toHaveProperty('color');
    expect(config).toHaveProperty('bgColor');
    expect(config).toHaveProperty('textColor');
    expect(config).toHaveProperty('description');
  });
});

describe('getCardStateLabel', () => {
  it('returns "In Order Queue" for REQUESTING', () => {
    expect(getCardStateLabel('REQUESTING')).toBe('In Order Queue');
  });

  it('returns "In Progress" for REQUESTED', () => {
    expect(getCardStateLabel('REQUESTED')).toBe('In Progress');
  });

  it('returns "Receiving" for IN_PROCESS', () => {
    expect(getCardStateLabel('IN_PROCESS')).toBe('Receiving');
  });

  it('returns "Restocked" for FULFILLED', () => {
    expect(getCardStateLabel('FULFILLED')).toBe('Restocked');
  });

  it('returns "Available" for AVAILABLE', () => {
    expect(getCardStateLabel('AVAILABLE')).toBe('Available');
  });

  it('returns "Unknown" for unrecognized status', () => {
    expect(getCardStateLabel('BOGUS')).toBe('Unknown');
  });
});

describe('getCardStateColor', () => {
  it('returns a color string for REQUESTING', () => {
    const color = getCardStateColor('REQUESTING');
    expect(typeof color).toBe('string');
    expect(color.startsWith('#')).toBe(true);
  });

  it('returns a color string for REQUESTED', () => {
    const color = getCardStateColor('REQUESTED');
    expect(typeof color).toBe('string');
  });

  it('returns a color string for IN_PROCESS', () => {
    const color = getCardStateColor('IN_PROCESS');
    expect(typeof color).toBe('string');
  });

  it('returns a color string for FULFILLED', () => {
    const color = getCardStateColor('FULFILLED');
    expect(typeof color).toBe('string');
  });

  it('returns UNKNOWN color for unrecognized status', () => {
    const unknownColor = getCardStateColor('UNKNOWN');
    expect(getCardStateColor('BAD_STATUS')).toBe(unknownColor);
  });
});

describe('getCardStateBgColor', () => {
  it('returns a background color for REQUESTING', () => {
    const bgColor = getCardStateBgColor('REQUESTING');
    expect(typeof bgColor).toBe('string');
    expect(bgColor.startsWith('#')).toBe(true);
  });

  it('returns different bg colors for different states', () => {
    const requestingBg = getCardStateBgColor('REQUESTING');
    const fulfilledBg = getCardStateBgColor('FULFILLED');
    expect(requestingBg).not.toBe(fulfilledBg);
  });

  it('returns UNKNOWN bg color for unrecognized status', () => {
    const unknownBg = getCardStateBgColor('UNKNOWN');
    expect(getCardStateBgColor('MYSTERY')).toBe(unknownBg);
  });
});

describe('getCardStateTextColor', () => {
  it('returns a text color for REQUESTING', () => {
    const textColor = getCardStateTextColor('REQUESTING');
    expect(typeof textColor).toBe('string');
  });

  it('returns a text color for FULFILLED', () => {
    const textColor = getCardStateTextColor('FULFILLED');
    expect(typeof textColor).toBe('string');
  });

  it('returns UNKNOWN text color for unrecognized status', () => {
    const unknownText = getCardStateTextColor('UNKNOWN');
    expect(getCardStateTextColor('NOPE')).toBe(unknownText);
  });
});

describe('canAddToOrderQueue', () => {
  it('returns false when status is REQUESTING', () => {
    expect(canAddToOrderQueue('REQUESTING')).toBe(false);
  });

  it('returns true when status is REQUESTED', () => {
    expect(canAddToOrderQueue('REQUESTED')).toBe(true);
  });

  it('returns true when status is IN_PROCESS', () => {
    expect(canAddToOrderQueue('IN_PROCESS')).toBe(true);
  });

  it('returns true when status is FULFILLED', () => {
    expect(canAddToOrderQueue('FULFILLED')).toBe(true);
  });

  it('returns true when status is AVAILABLE', () => {
    expect(canAddToOrderQueue('AVAILABLE')).toBe(true);
  });

  it('returns true when status is UNKNOWN', () => {
    expect(canAddToOrderQueue('UNKNOWN')).toBe(true);
  });

  it('returns true for any unrecognized status', () => {
    expect(canAddToOrderQueue('SOME_OTHER_STATUS')).toBe(true);
  });
});

describe('getAllCardStates', () => {
  it('returns an array', () => {
    const states = getAllCardStates();
    expect(Array.isArray(states)).toBe(true);
  });

  it('returns at least 6 states (all known statuses)', () => {
    const states = getAllCardStates();
    expect(states.length).toBeGreaterThanOrEqual(6);
  });

  it('each state has required fields', () => {
    const states = getAllCardStates();
    states.forEach((state) => {
      expect(state).toHaveProperty('status');
      expect(state).toHaveProperty('label');
      expect(state).toHaveProperty('color');
      expect(state).toHaveProperty('bgColor');
      expect(state).toHaveProperty('textColor');
      expect(state).toHaveProperty('description');
    });
  });

  it('includes REQUESTING state', () => {
    const states = getAllCardStates();
    const requesting = states.find((s) => s.status === 'REQUESTING');
    expect(requesting).toBeDefined();
  });

  it('includes FULFILLED state', () => {
    const states = getAllCardStates();
    const fulfilled = states.find((s) => s.status === 'FULFILLED');
    expect(fulfilled).toBeDefined();
  });
});

describe('mapApiStatusToDisplay', () => {
  it('maps REQUESTING to REQUESTING', () => {
    expect(mapApiStatusToDisplay('REQUESTING')).toBe('REQUESTING');
  });

  it('maps REQUESTED to REQUESTED', () => {
    expect(mapApiStatusToDisplay('REQUESTED')).toBe('REQUESTED');
  });

  it('maps IN_PROCESS to IN_PROCESS', () => {
    expect(mapApiStatusToDisplay('IN_PROCESS')).toBe('IN_PROCESS');
  });

  it('maps FULFILLED to FULFILLED', () => {
    expect(mapApiStatusToDisplay('FULFILLED')).toBe('FULFILLED');
  });

  it('maps AVAILABLE to AVAILABLE', () => {
    expect(mapApiStatusToDisplay('AVAILABLE')).toBe('AVAILABLE');
  });

  it('maps UNKNOWN to UNKNOWN', () => {
    expect(mapApiStatusToDisplay('UNKNOWN')).toBe('UNKNOWN');
  });

  it('returns UNKNOWN for unrecognized status', () => {
    expect(mapApiStatusToDisplay('BOGUS_STATUS')).toBe('UNKNOWN');
  });

  it('normalizes lowercase input', () => {
    expect(mapApiStatusToDisplay('requesting')).toBe('REQUESTING');
  });

  it('normalizes mixed-case input', () => {
    expect(mapApiStatusToDisplay('Fulfilled')).toBe('FULFILLED');
  });
});

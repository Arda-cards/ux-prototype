import reducer, {
  setSidebarVisibility,
  toggleSidebarItem,
  setTheme,
  setPerformanceLoggingEnabled,
  setPreference,
} from './uiSlice';

const initialState = reducer(undefined, { type: '@@INIT' });

describe('uiSlice', () => {
  describe('initial state', () => {
    it('has correct defaults', () => {
      expect(initialState.sidebarVisibility).toEqual({
        dashboard: true,
        items: true,
        orderQueue: true,
        receiving: true,
      });
      expect(initialState.theme).toBe('system');
      expect(initialState.performanceLoggingEnabled).toBe(false);
      expect(initialState.preferences).toEqual({});
    });
  });

  describe('setSidebarVisibility', () => {
    it('sets individual sidebar item visibility', () => {
      const state = reducer(initialState, setSidebarVisibility({ item: 'items', visible: false }));
      expect(state.sidebarVisibility.items).toBe(false);
      expect(state.sidebarVisibility.dashboard).toBe(true); // unchanged
    });
  });

  describe('toggleSidebarItem', () => {
    it('toggles sidebar item from true to false', () => {
      const state = reducer(initialState, toggleSidebarItem('orderQueue'));
      expect(state.sidebarVisibility.orderQueue).toBe(false);
    });

    it('toggles sidebar item from false to true', () => {
      let state = reducer(initialState, toggleSidebarItem('receiving'));
      state = reducer(state, toggleSidebarItem('receiving'));
      expect(state.sidebarVisibility.receiving).toBe(true);
    });
  });

  describe('setTheme', () => {
    it.each(['light', 'dark', 'system'] as const)('sets theme to %s', (theme) => {
      expect(reducer(initialState, setTheme(theme)).theme).toBe(theme);
    });
  });

  describe('setPerformanceLoggingEnabled', () => {
    it('enables and disables performance logging', () => {
      const enabled = reducer(initialState, setPerformanceLoggingEnabled(true));
      expect(enabled.performanceLoggingEnabled).toBe(true);
      const disabled = reducer(enabled, setPerformanceLoggingEnabled(false));
      expect(disabled.performanceLoggingEnabled).toBe(false);
    });
  });

  describe('setPreference', () => {
    it('adds a preference', () => {
      const state = reducer(initialState, setPreference({ key: 'locale', value: 'en-US' }));
      expect(state.preferences['locale']).toBe('en-US');
    });

    it('overwrites existing preference', () => {
      let state = reducer(initialState, setPreference({ key: 'locale', value: 'en-US' }));
      state = reducer(state, setPreference({ key: 'locale', value: 'fr-FR' }));
      expect(state.preferences['locale']).toBe('fr-FR');
    });
  });
});

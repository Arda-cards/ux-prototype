import { selectSidebarVisibility, selectTheme, selectPerformanceLoggingEnabled, selectPreferences } from './uiSelectors';
import { createTestStore } from '@frontend/test-utils/test-store';

describe('uiSelectors', () => {
  const store = createTestStore();
  const state = store.getState();

  it('selectSidebarVisibility returns default visibility', () => {
    expect(selectSidebarVisibility(state)).toEqual({
      dashboard: true,
      items: true,
      orderQueue: true,
      receiving: true,
    });
  });

  it('selectTheme returns system', () => {
    expect(selectTheme(state)).toBe('system');
  });

  it('selectPerformanceLoggingEnabled returns false', () => {
    expect(selectPerformanceLoggingEnabled(state)).toBe(false);
  });

  it('selectPreferences returns empty object', () => {
    expect(selectPreferences(state)).toEqual({});
  });
});

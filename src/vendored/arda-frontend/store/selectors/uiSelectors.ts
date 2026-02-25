import { RootState } from '../store';

// UI selectors
export const selectSidebarVisibility = (state: RootState) => state.ui.sidebarVisibility;
export const selectTheme = (state: RootState) => state.ui.theme;
export const selectPerformanceLoggingEnabled = (state: RootState) => state.ui.performanceLoggingEnabled;
export const selectPreferences = (state: RootState) => state.ui.preferences;

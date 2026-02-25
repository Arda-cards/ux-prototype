import { createSlice, PayloadAction } from '@reduxjs/toolkit';

interface SidebarVisibility {
  dashboard: boolean;
  items: boolean;
  orderQueue: boolean;
  receiving: boolean;
}

interface UIState {
  // Sidebar visibility
  sidebarVisibility: SidebarVisibility;

  // Theme
  theme: 'light' | 'dark' | 'system';

  // Performance logging
  performanceLoggingEnabled: boolean;

  // Other UI preferences
  preferences: Record<string, unknown>;
}

const defaultSidebarVisibility: SidebarVisibility = {
  dashboard: true,
  items: true,
  orderQueue: true,
  receiving: true,
};

const initialState: UIState = {
  sidebarVisibility: defaultSidebarVisibility,
  theme: 'system',
  performanceLoggingEnabled: false,
  preferences: {},
};

const uiSlice = createSlice({
  name: 'ui',
  initialState,
  reducers: {
    setSidebarVisibility: (
      state,
      action: PayloadAction<{ item: keyof SidebarVisibility; visible: boolean }>
    ) => {
      state.sidebarVisibility[action.payload.item] = action.payload.visible;
    },
    toggleSidebarItem: (state, action: PayloadAction<keyof SidebarVisibility>) => {
      state.sidebarVisibility[action.payload] =
        !state.sidebarVisibility[action.payload];
    },
    setTheme: (state, action: PayloadAction<'light' | 'dark' | 'system'>) => {
      state.theme = action.payload;
    },
    setPerformanceLoggingEnabled: (state, action: PayloadAction<boolean>) => {
      state.performanceLoggingEnabled = action.payload;
    },
    setPreference: (
      state,
      action: PayloadAction<{ key: string; value: unknown }>
    ) => {
      state.preferences[action.payload.key] = action.payload.value;
    },
  },
});

export const {
  setSidebarVisibility,
  toggleSidebarItem,
  setTheme,
  setPerformanceLoggingEnabled,
  setPreference,
} = uiSlice.actions;

export default uiSlice.reducer;

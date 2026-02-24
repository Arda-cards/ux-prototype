'use client';

import React, {
  createContext,
  useContext,
  useState,
  useEffect,
  ReactNode,
  useMemo,
  useCallback,
} from 'react';

interface SidebarVisibility {
  dashboard: boolean;
  items: boolean;
  orderQueue: boolean;
  receiving: boolean;
}

interface SidebarVisibilityContextType {
  visibility: SidebarVisibility;
  toggleItem: (item: keyof SidebarVisibility) => void;
  setItemVisibility: (item: keyof SidebarVisibility, visible: boolean) => void;
}

const SidebarVisibilityContext = createContext<
  SidebarVisibilityContextType | undefined
>(undefined);

const STORAGE_KEY = 'sidebarVisibility';

const defaultVisibility: SidebarVisibility = {
  dashboard: true,
  items: true,
  orderQueue: true,
  receiving: true,
};

export function SidebarVisibilityProvider({
  children,
}: {
  children: ReactNode;
}) {
  const [visibility, setVisibility] =
    useState<SidebarVisibility>(defaultVisibility);

  // Load visibility from localStorage on mount
  useEffect(() => {
    const stored = localStorage.getItem(STORAGE_KEY);
    if (stored) {
      try {
        const parsed = JSON.parse(stored);
        setVisibility(parsed);
      } catch (error) {
        console.error(
          'Failed to parse sidebar visibility from localStorage:',
          error
        );
      }
    }
  }, []);

  // Save visibility to localStorage whenever it changes
  useEffect(() => {
    localStorage.setItem(STORAGE_KEY, JSON.stringify(visibility));
  }, [visibility]);

  const toggleItem = useCallback((item: keyof SidebarVisibility) => {
    setVisibility((prev) => ({
      ...prev,
      [item]: !prev[item],
    }));
  }, []);

  const setItemVisibility = useCallback((
    item: keyof SidebarVisibility,
    visible: boolean
  ) => {
    setVisibility((prev) => ({
      ...prev,
      [item]: visible,
    }));
  }, []);

  const contextValue = useMemo<SidebarVisibilityContextType>(() => ({
    visibility,
    toggleItem,
    setItemVisibility,
  }), [visibility, toggleItem, setItemVisibility]);

  return (
    <SidebarVisibilityContext.Provider value={contextValue}>
      {children}
    </SidebarVisibilityContext.Provider>
  );
}

export function useSidebarVisibility() {
  const context = useContext(SidebarVisibilityContext);
  if (context === undefined) {
    throw new Error(
      'useSidebarVisibility must be used within a SidebarVisibilityProvider'
    );
  }
  return context;
}

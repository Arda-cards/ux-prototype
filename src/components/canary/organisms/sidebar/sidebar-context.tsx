'use client';

import { createContext, useContext } from 'react';

export interface SidebarContextValue {
  collapsed: boolean;
}

const SidebarContext = createContext<SidebarContextValue>({ collapsed: false });

export const SidebarProvider = SidebarContext.Provider;
export const useSidebar = () => useContext(SidebarContext);

'use client';

import { useCallback } from 'react';
import { useAppDispatch, useAppSelector } from '../hooks';
import { selectSidebarVisibility } from '../selectors/uiSelectors';
import { toggleSidebarItem, setSidebarVisibility } from '../slices/uiSlice';

type SidebarKey = 'dashboard' | 'items' | 'orderQueue' | 'receiving';

/**
 * useSidebarVisibility hook - Redux-based sidebar visibility hook
 * Drop-in replacement for the Context-based useSidebarVisibility hook.
 * Reads from and writes to the persisted uiSlice.
 */
export function useSidebarVisibility() {
  const dispatch = useAppDispatch();
  const visibility = useAppSelector(selectSidebarVisibility);

  const toggleItem = useCallback(
    (item: SidebarKey) => {
      dispatch(toggleSidebarItem(item));
    },
    [dispatch]
  );

  const setItemVisibility = useCallback(
    (item: SidebarKey, visible: boolean) => {
      dispatch(setSidebarVisibility({ item, visible }));
    },
    [dispatch]
  );

  return { visibility, toggleItem, setItemVisibility };
}

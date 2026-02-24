'use client';

import React, {
  createContext,
  useContext,
  useState,
  useEffect,
  useRef,
  ReactNode,
  useCallback,
  useMemo,
} from 'react';
import { useJWT } from '@frontend/store/hooks/useJWT';
import { useAuth } from '@frontend/store/hooks/useAuth';

interface OrderQueueContextType {
  readyToOrderCount: number;
  setReadyToOrderCount: (count: number) => void;
  updateOrderCounts: (counts: { readyToOrder: number }) => void;
  fetchOrderQueueData: () => Promise<void>;
  refreshOrderQueueData: () => Promise<void>;
  isLoading: boolean;
}

const OrderQueueContext = createContext<OrderQueueContextType | undefined>(
  undefined
);

export function useOrderQueue() {
  const context = useContext(OrderQueueContext);
  if (context === undefined) {
    throw new Error('useOrderQueue must be used within an OrderQueueProvider');
  }
  return context;
}

interface OrderQueueProviderProps {
  children: ReactNode;
}

export function OrderQueueProvider({ children }: OrderQueueProviderProps) {
  const [readyToOrderCount, setReadyToOrderCount] = useState(0);
  const [isLoading, setIsLoading] = useState(false);
  const { token, isTokenValid } = useJWT();
  const { user } = useAuth();

  const updateOrderCounts = useCallback((counts: { readyToOrder: number }) => {
    setReadyToOrderCount(counts.readyToOrder);
  }, []);

  const fetchOrderQueueData = useCallback(async () => {
    if (!token || !isTokenValid) {
      return;
    }

    try {
      setIsLoading(true);

      const requestBody = {
        filter: true,
        paginate: {
          index: 0,
          size: 200,
        },
      };

      // Fetch all three endpoints (same as order-queue page) to get accurate count
      const [requestedResponse, inProcessResponse, requestingResponse] =
        await Promise.all([
          fetch('/api/arda/kanban/kanban-card/details/requested', {
            method: 'POST',
            headers: {
              Authorization: `Bearer ${token}`,
              'Content-Type': 'application/json',
            },
            body: JSON.stringify(requestBody),
          }),
          fetch('/api/arda/kanban/kanban-card/details/in-process', {
            method: 'POST',
            headers: {
              Authorization: `Bearer ${token}`,
              'Content-Type': 'application/json',
            },
            body: JSON.stringify(requestBody),
          }),
          fetch('/api/arda/kanban/kanban-card/details/requesting', {
            method: 'POST',
            headers: {
              Authorization: `Bearer ${token}`,
              'Content-Type': 'application/json',
            },
            body: JSON.stringify(requestBody),
          }),
        ]);

      if (!requestedResponse.ok || !inProcessResponse.ok || !requestingResponse.ok) {
        throw new Error('HTTP error fetching order queue data');
      }

      const requestedData = await requestedResponse.json();
      const inProcessData = await inProcessResponse.json();
      const requestingData = await requestingResponse.json();

      const requestedItems = requestedData.data?.results || [];
      const inProcessItems = inProcessData.data?.results || [];
      const requestingItems = requestingData.data?.results || [];

      // Match order-queue page logic: count Requesting + Requested, excluding In progress
      const inProcessEIds = new Set(
        inProcessItems.map(
          (item: { payload?: { eId?: string } }) => item.payload?.eId
        )
      );

      // Count unique cards in Requesting or Requested state that are NOT in-process (same logic as order-queue page)
      const readyToOrderEIds = new Set<string>();
      for (const item of [...requestedItems, ...requestingItems]) {
        const eId = item.payload?.eId;
        if (eId && !inProcessEIds.has(eId)) {
          readyToOrderEIds.add(eId);
        }
      }
      const readyToOrderCount = readyToOrderEIds.size;

      setReadyToOrderCount(readyToOrderCount);
    } catch {
      // Keep existing count on error
    } finally {
      setIsLoading(false);
    }
  }, [token, isTokenValid]);

  // Public function to refresh order queue data (can be called from anywhere)
  const refreshOrderQueueData = useCallback(async () => {
    if (token && isTokenValid) {
      await fetchOrderQueueData();
    }
  }, [token, isTokenValid, fetchOrderQueueData]);

  // Keep ref to latest fetch so we don't re-run initial fetch when only callback identity changes (e.g. token refresh on route change)
  const fetchOrderQueueDataRef = useRef(fetchOrderQueueData);
  fetchOrderQueueDataRef.current = fetchOrderQueueData;

  // Fetch data when user is authenticated and token is available (only when user/token/isTokenValid change, not when fetchOrderQueueData identity changes)
  // This prevents the sidebar count from resetting to a stale value when navigating away from Order Queue page
  useEffect(() => {
    if (user && token && isTokenValid) {
      const timer = setTimeout(() => {
        fetchOrderQueueDataRef.current();
      }, 300);

      return () => clearTimeout(timer);
    } else if (!user) {
      setReadyToOrderCount(0);
    }
  }, [user, token, isTokenValid]);

  const contextValue = useMemo<OrderQueueContextType>(() => ({
    readyToOrderCount,
    setReadyToOrderCount,
    updateOrderCounts,
    fetchOrderQueueData,
    refreshOrderQueueData,
    isLoading,
  }), [readyToOrderCount, updateOrderCounts, fetchOrderQueueData, refreshOrderQueueData, isLoading]);

  return (
    <OrderQueueContext.Provider value={contextValue}>
      {children}
    </OrderQueueContext.Provider>
  );
}

'use client';

import { useEffect, useState } from 'react';

export function useSidebarState() {
  const [isCollapsed, setIsCollapsed] = useState(false);

  useEffect(() => {
    const updateSidebarState = () => {
      // Check if sidebar is collapsed by looking for the data-collapsible attribute
      const sidebarElement = document.querySelector('[data-slot="sidebar"]');
      if (sidebarElement) {
        const isCollapsed =
          sidebarElement.getAttribute('data-collapsible') === 'icon';
        setIsCollapsed(isCollapsed);

        // Update CSS variable for header margin
        const root = document.documentElement;
        if (isCollapsed) {
          root.style.setProperty('--header-margin-left', '3rem');
        } else {
          root.style.setProperty('--header-margin-left', '16rem');
        }
      }
    };

    // Initial check
    updateSidebarState();

    // Set up observer to watch for changes
    const observer = new MutationObserver(updateSidebarState);

    // Observe the sidebar element
    const sidebarElement = document.querySelector('[data-slot="sidebar"]');
    if (sidebarElement) {
      observer.observe(sidebarElement, {
        attributes: true,
        attributeFilter: ['data-collapsible'],
      });
    }

    return () => {
      observer.disconnect();
    };
  }, []);

  return { isCollapsed };
}

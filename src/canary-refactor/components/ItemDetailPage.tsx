'use client';

/**
 * Canary-refactor fork of app/item/[itemId]/page.tsx
 *
 * Single change from the vendored original:
 *   import ItemsPage from '@frontend/app/items/page'
 *   → import ItemsPage from './ItemsPage'
 *
 * This file is excluded from tsconfig.json and eslint.config.mjs.
 * The @frontend/ alias resolves only in Storybook at runtime.
 */

import { useEffect } from 'react';
import { usePathname, useRouter, useParams } from 'next/navigation';
// --- Canary integration: forked ItemsPage ---
import ItemsPage from './ItemsPage';

/**
 * Item detail page with bookmarkable URL
 * Route: /item/[itemId] or /item/[itemId]/[...slug]
 *
 * This page renders ItemsPage, which automatically detects the itemId
 * from the URL pathname and opens the details panel for that item.
 * Any additional path segments after the itemId are ignored and trigger a redirect.
 */
export default function ItemDetailPage() {
  const pathname = usePathname();
  const router = useRouter();
  const params = useParams();
  const itemId = params.itemId as string;

  useEffect(() => {
    // Check if there's anything after the itemId in the pathname
    // e.g., /item/[itemId]/label should redirect to /item/[itemId]
    if (pathname && itemId) {
      const expectedPath = `/item/${itemId}`;
      // If the current pathname has more than just /item/[itemId], redirect to clean URL
      if (pathname !== expectedPath && pathname.startsWith(expectedPath + '/')) {
        router.replace(expectedPath);
        return;
      }
    }
  }, [pathname, itemId, router]);

  // ItemsPage now handles the itemId from the URL automatically
  // It checks for /item/[itemId] pattern in the pathname and opens the panel
  return <ItemsPage />;
}

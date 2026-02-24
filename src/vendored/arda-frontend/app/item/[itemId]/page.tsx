'use client';

import { useEffect } from 'react';
import { usePathname, useRouter, useParams } from 'next/navigation';
import ItemsPage from '@frontend/app/items/page';

/**
 * Item detail page with bookmarkable URL
 * Route: /item/[itemId] or /item/[itemId]/[...slug]
 * Examples: 
 *   - /item/asdf-asdf-asdf-asdf
 *   - /item/asdf-asdf-asdf-asdf/label (redirects to clean URL)
 *   - /item/asdf-asdf-asdf-asdf/breadcrumb (redirects to clean URL)
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

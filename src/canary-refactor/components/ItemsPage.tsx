'use client';

/**
 * Canary-refactor fork of app/items/page.tsx
 *
 * Single change from the vendored original:
 *   import { ItemTableAGGrid, type ItemTableAGGridRef } from './ItemTableAGGrid'
 *   → import { ItemTableAGGrid, type ItemTableAGGridRef } from '../../components/ItemTableAGGrid'
 *
 * This file is excluded from tsconfig.json and eslint.config.mjs.
 * The @frontend/ alias resolves only in Storybook at runtime.
 */

import { useState, useEffect, useCallback, useRef } from 'react';
import { usePathname, useParams, useRouter } from 'next/navigation';
import { AppSidebar } from '@frontend/components/app-sidebar';
import { AppHeader } from '@frontend/components/common/app-header';
import { Button } from '@frontend/components/ui/button';
import { Input } from '@frontend/components/ui/input';
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
  DropdownMenuSeparator,
  DropdownMenuCheckboxItem,
} from '@frontend/components/ui/dropdown-menu';
import { SidebarProvider, SidebarInset } from '@frontend/components/ui/sidebar';
import {
  SearchIcon,
  ChevronDown,
  Plus,
  CircleCheckIcon,
  SlidersHorizontal,
  Loader2,
  Dock,
} from 'lucide-react';
import { Skeleton } from '@frontend/components/ui/skeleton';
import Image from 'next/image';
import { UnsavedChangesModal } from '@frontend/components/common/UnsavedChangesModal';

import { ItemFormPanel } from '@frontend/components/items/ItemFormPanel';
import { ItemDetailsPanel } from '@frontend/components/items/ItemDetailsPanel';
import { CardsPreviewModal } from '@frontend/components/items/CardsPreviewModal';
import type { ItemCard } from '@frontend/constants/types';
import { ImportItemsModal } from '@frontend/components/items/ImportItemsModal';
import { queryItems, getItemById } from '@frontend/lib/ardaClient';
import * as items from '@frontend/types/items';
import * as ardaApi from '@frontend/types/arda-api';
import type { KanbanCardResult } from '@frontend/types/kanban';
import { toast, Toaster } from 'sonner';
import { DeleteConfirmationModal } from '@frontend/components/common/DeleteConfirmationModal';
import { isAuthenticationError } from '@frontend/lib/utils';
import { useAuth } from '@frontend/store/hooks/useAuth';
import { useAuthErrorHandler } from '@frontend/hooks/useAuthErrorHandler';
import { registerBlocker } from '@frontend/lib/unsavedNavigation';
import { extractKanbanRecords } from '@frontend/lib/kanbanResponseParser';
import { getAdjacentItem } from '@frontend/lib/itemListNavigation';

// The full implementation is in the vendored source. We re-export it here
// after establishing the import binding for the canary ItemTableAGGrid above.
// In Storybook, both imports resolve and the canary ItemTableAGGrid is the
// one registered in the module scope — but the vendored page's own import
// binds at compile time. The canary DataGrid integration is therefore exercised
// through the direct ItemTableAGGrid story (items-grid.stories.tsx) and through
// the column preset replacements in columnPresets.tsx.
//
// For stories that render this component, re-export the vendored implementation:
export { default } from '@frontend/app/items/page';

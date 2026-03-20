/**
 * REF::ITM::0004 + GEN::LST::0007 — Edit Item Inline / Edit Entity In Place
 *
 * Composition story: double-click a cell to edit inline. On row blur the
 * auto-publish lifecycle fires: saving state → success/error.
 *
 * Maps to:
 *   REF::ITM::0004 — Edit and Publish Item
 *   GEN::LST::0007 — Edit Entity In Place
 */
import { useState } from 'react';
import type { Meta, StoryObj } from '@storybook/react-vite';
import { expect, within, userEvent, waitFor } from 'storybook/test';
import {
  LayoutDashboard,
  Package,
  ShoppingCart,
  Building2,
  Settings,
  ShieldCheck,
  LogOut,
} from 'lucide-react';

import { SidebarInset, SidebarTrigger } from '@/components/canary/primitives/sidebar';
import { ArdaSidebar } from '@/components/canary/organisms/sidebar/sidebar';
import { ArdaSidebarHeader } from '@/components/canary/molecules/sidebar/sidebar-header';
import { SidebarNav } from '@/components/canary/molecules/sidebar/sidebar-nav';
import { SidebarNavItem } from '@/components/canary/molecules/sidebar/sidebar-nav-item';
import { SidebarUserMenu } from '@/components/canary/molecules/sidebar/sidebar-user-menu';
import { ArdaAppHeader } from '@/components/canary/organisms/app-header/app-header';
import { ItemGrid } from '@/components/canary/organisms/item-grid/item-grid';
import type { Item } from '@/types/extras';
import { itemMockData } from '../_shared/mock-data';
import { storyStepDelay } from '../_shared/story-step-delay';

// ---------------------------------------------------------------------------
// Simulated mock lookups for editing
// ---------------------------------------------------------------------------

const mockSuppliers = [
  'Medline Industries',
  'Cardinal Health',
  'Fisher Scientific',
  'VWR International',
  'Eppendorf',
];

const mockClassifications = [
  'PPE – Gloves',
  'PPE – Masks',
  'Chemicals – Disinfectants',
  'Lab Supplies – Consumables',
];

const mockLookups = {
  supplier: async (search: string) => {
    await new Promise((r) => setTimeout(r, 100));
    return mockSuppliers
      .filter((s) => s.toLowerCase().includes(search.toLowerCase()))
      .map((s) => ({ label: s, value: s }));
  },
  classificationType: async (search: string) => {
    await new Promise((r) => setTimeout(r, 100));
    return mockClassifications
      .filter((c) => c.toLowerCase().includes(search.toLowerCase()))
      .map((c) => ({ label: c, value: c }));
  },
};

// ---------------------------------------------------------------------------
// Page wrapper
// ---------------------------------------------------------------------------

function EditItemsPage() {
  const [publishLog, setPublishLog] = useState<string[]>([]);
  const [isDirty, setIsDirty] = useState(false);

  const handlePublishRow = async (
    rowId: string,
    changes: Record<string, unknown>,
    item?: Item,
  ): Promise<void> => {
    // Simulate async save
    await new Promise<void>((resolve) => setTimeout(resolve, 400));
    const name = item?.name ?? rowId;
    setPublishLog((prev) => [...prev, `Published "${name}": ${JSON.stringify(changes)}`]);
  };

  return (
    <ArdaSidebar
      defaultOpen
      content={
        <SidebarInset>
          <ArdaAppHeader leading={<SidebarTrigger className="self-center" />} showSearch={false} />
          <main className="flex flex-1 flex-col gap-4 p-6">
            <div>
              <h1 className="text-2xl font-semibold tracking-tight">Items</h1>
              <p className="text-sm text-muted-foreground mt-1">
                Double-click a cell to edit. Changes auto-publish when you click a different row.
              </p>
              {isDirty && (
                <p className="text-sm text-orange-600 mt-1 font-medium">
                  Unsaved changes in current row
                </p>
              )}
            </div>
            <ItemGrid
              items={itemMockData}
              autoHeight
              editable
              lookups={mockLookups}
              onPublishRow={handlePublishRow}
              onDirtyChange={setIsDirty}
              onItemClick={(item) => console.log('Clicked:', item.name)}
            />
            {publishLog.length > 0 && (
              <div className="rounded-lg border bg-muted/30 p-3">
                <p className="text-xs font-semibold text-muted-foreground uppercase tracking-wide mb-2">
                  Publish Log
                </p>
                <div className="space-y-1 max-h-24 overflow-auto">
                  {publishLog.map((entry, i) => (
                    <p key={i} className="text-xs font-mono text-muted-foreground">
                      {entry}
                    </p>
                  ))}
                </div>
              </div>
            )}
          </main>
        </SidebarInset>
      }
    >
      <ArdaSidebarHeader teamName="Arda Cards" />
      <SidebarNav>
        <SidebarNavItem icon={LayoutDashboard} label="Dashboard" />
        <SidebarNavItem icon={Package} label="Items" active />
        <SidebarNavItem icon={ShoppingCart} label="Order Queue" badge={3} />
        <SidebarNavItem icon={Building2} label="Suppliers" />
      </SidebarNav>
      <SidebarUserMenu
        user={{ name: 'Uriel Eisen', email: 'uriel@arda.cards', role: 'Account Admin' }}
        actions={[
          { key: 'admin', label: 'Admin', icon: ShieldCheck, onClick: () => {} },
          { key: 'settings', label: 'Settings', icon: Settings, onClick: () => {} },
          { key: 'logout', label: 'Log out', icon: LogOut, onClick: () => {}, destructive: true },
        ]}
      />
    </ArdaSidebar>
  );
}

// ---------------------------------------------------------------------------
// Story meta
// ---------------------------------------------------------------------------

const meta: Meta<typeof EditItemsPage> = {
  title: 'Use Cases/Reference/Items/ITM-0004 Edit Item/Edit Inline',
  component: EditItemsPage,
  parameters: {
    layout: 'fullscreen',
  },
};

export default meta;
type Story = StoryObj<typeof EditItemsPage>;

/**
 * Default — demonstrates inline editing with auto-publish lifecycle.
 * Play function: double-click a cell, type a new value, click a
 * different row to trigger auto-publish, verify publish log updates.
 */
export const Default: Story = {
  play: async ({ canvasElement, step }) => {
    const canvas = within(canvasElement);

    await step('Grid renders with editable items', async () => {
      const firstItem = await canvas.findByText(
        'Nitrile Exam Gloves (Medium)',
        { selector: '[role="gridcell"]' },
        { timeout: 10000 },
      );
      expect(firstItem).toBeVisible();
    });

    await storyStepDelay();

    await step('Double-click a cell to start editing', async () => {
      const nameCell = canvas.getByText('Nitrile Exam Gloves (Medium)', {
        selector: '[role="gridcell"]',
      });
      await userEvent.dblClick(nameCell);
    });

    await storyStepDelay(800);

    await step('Click a different row to trigger auto-publish', async () => {
      const secondItem = canvas.getByText('Surgical Mask Level 3', {
        selector: '[role="gridcell"]',
      });
      await userEvent.click(secondItem);
    });

    await step('Publish log appears after auto-publish completes', async () => {
      await waitFor(
        () => {
          expect(canvas.getByText('Publish Log')).toBeVisible();
        },
        { timeout: 8000 },
      );
    });

    await storyStepDelay();
  },
};

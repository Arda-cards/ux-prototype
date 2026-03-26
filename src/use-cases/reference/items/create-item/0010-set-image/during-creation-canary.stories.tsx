/**
 * REF::ITM::0003::0010.UC — Set Image During Creation (Canary)
 *
 * 100% canary story: simplified item creation form composed from canary
 * primitives. Demonstrates the full set-image-during-creation flow using
 * ImageFormField and ImageUploadDialog integrated into a slide-over form.
 *
 * Maps to: REF::ITM::0003 Create Item / 0010 Set Image During Creation
 */
import { useState } from 'react';
import type { Meta, StoryObj } from '@storybook/react-vite';
import { expect, within, userEvent, waitFor, screen } from 'storybook/test';
import {
  LayoutDashboard,
  Package,
  ShoppingCart,
  Building2,
  Settings,
  ShieldCheck,
  LogOut,
  X,
} from 'lucide-react';

import { SidebarInset, SidebarTrigger } from '@/components/canary/primitives/sidebar';
import { Sidebar } from '@/components/canary/organisms/sidebar/sidebar';
import { SidebarHeader } from '@/components/canary/molecules/sidebar/sidebar-header';
import { SidebarNav } from '@/components/canary/molecules/sidebar/sidebar-nav';
import { SidebarNavItem } from '@/components/canary/molecules/sidebar/sidebar-nav-item';
import { SidebarUserMenu } from '@/components/canary/molecules/sidebar/sidebar-user-menu';
import { AppHeader } from '@/components/canary/organisms/app-header/app-header';
import { Button } from '@/components/canary/atoms/button/button';
import { Input } from '@/components/canary/primitives/input';
import { Label } from '@/components/canary/primitives/label';
import { ImageFormField } from '@/components/canary/molecules/form/image/image-form-field';
import { ImageUploadDialog } from '@/components/canary/organisms/shared/image-upload-dialog/image-upload-dialog';
import { ITEM_IMAGE_CONFIG } from '@/components/canary/__mocks__/image-story-data';
import type { ImageUploadResult } from '@/types/canary/utilities/image-field-config';
import { storyStepDelay } from '../../_shared/story-step-delay';

// ---------------------------------------------------------------------------
// Create Item Form (slide-over panel)
// ---------------------------------------------------------------------------

interface CreateItemFormProps {
  open: boolean;
  onClose: () => void;
  onPublish: (data: { title: string; sku: string; imageUrl: string | null }) => void;
}

function CreateItemForm({ open, onClose, onPublish }: CreateItemFormProps) {
  const [title, setTitle] = useState('');
  const [sku, setSku] = useState('');
  const [imageUrl, setImageUrl] = useState<string | null>(null);
  const [uploadDialogOpen, setUploadDialogOpen] = useState(false);
  const [published, setPublished] = useState(false);

  const handlePublish = () => {
    onPublish({ title, sku, imageUrl });
    setPublished(true);
  };

  const handleImageChange = (result: ImageUploadResult) => {
    setImageUrl(result.imageUrl);
    setUploadDialogOpen(false);
  };

  const handleImageFieldChange = (url: string | null) => {
    if (url === null) {
      setImageUrl(null);
    } else {
      setUploadDialogOpen(true);
    }
  };

  if (!open) return null;

  return (
    <>
      {/* Backdrop */}
      <div className="fixed inset-0 bg-black/40 z-40" aria-hidden="true" onClick={onClose} />

      {/* Slide-over panel */}
      <div
        role="dialog"
        aria-label="Create new item"
        aria-modal="true"
        className="fixed inset-y-0 right-0 z-50 flex w-full max-w-md flex-col bg-background shadow-xl"
      >
        {/* Header */}
        <div className="flex items-center justify-between border-b px-6 py-4">
          <h2 className="text-lg font-semibold">Create new item</h2>
          <button
            type="button"
            aria-label="Close form"
            className="rounded-sm opacity-70 transition-opacity hover:opacity-100 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring"
            onClick={onClose}
          >
            <X className="h-5 w-5" />
          </button>
        </div>

        {/* Body */}
        <div className="flex flex-1 flex-col gap-6 overflow-y-auto p-6">
          {published ? (
            <div
              className="flex flex-col items-center justify-center gap-4 py-12 text-center"
              data-testid="publish-success"
            >
              <div className="flex h-16 w-16 items-center justify-center rounded-full bg-green-100 text-green-600 text-3xl">
                &#10003;
              </div>
              <h3 className="text-xl font-semibold">Item created</h3>
              <p className="text-sm text-muted-foreground">
                <strong>{title}</strong> has been published successfully.
              </p>
            </div>
          ) : (
            <>
              {/* Title field */}
              <div className="flex flex-col gap-1.5">
                <Label htmlFor="item-title">Item title</Label>
                <Input
                  id="item-title"
                  placeholder="e.g. Nitrile Exam Gloves (Medium)"
                  value={title}
                  onChange={(e) => setTitle(e.target.value)}
                />
              </div>

              {/* SKU field */}
              <div className="flex flex-col gap-1.5">
                <Label htmlFor="item-sku">SKU</Label>
                <Input
                  id="item-sku"
                  placeholder="e.g. GLV-NIT-M-100"
                  value={sku}
                  onChange={(e) => setSku(e.target.value)}
                  className="font-mono"
                />
              </div>

              {/* Image field */}
              <div className="flex flex-col gap-1.5">
                <Label>Product image</Label>
                <div className="flex items-start">
                  <div
                    role="button"
                    tabIndex={0}
                    aria-label="Set product image"
                    onClick={() => setUploadDialogOpen(true)}
                    onKeyDown={(e) => {
                      if (e.key === 'Enter' || e.key === ' ') {
                        e.preventDefault();
                        setUploadDialogOpen(true);
                      }
                    }}
                    className="cursor-pointer"
                  >
                    <ImageFormField
                      config={ITEM_IMAGE_CONFIG}
                      imageUrl={imageUrl}
                      onChange={handleImageFieldChange}
                    />
                  </div>
                </div>
              </div>
            </>
          )}
        </div>

        {/* Footer */}
        {!published && (
          <div className="flex justify-end gap-2 border-t px-6 py-4">
            <Button variant="outline" onClick={onClose}>
              Cancel
            </Button>
            <Button onClick={handlePublish} disabled={!title}>
              Publish
            </Button>
          </div>
        )}
      </div>

      {/* Image Upload Dialog */}
      <ImageUploadDialog
        config={ITEM_IMAGE_CONFIG}
        existingImageUrl={null}
        open={uploadDialogOpen}
        onConfirm={handleImageChange}
        onCancel={() => setUploadDialogOpen(false)}
      />
    </>
  );
}

// ---------------------------------------------------------------------------
// Page wrapper
// ---------------------------------------------------------------------------

function CreateItemPage() {
  const [formOpen, setFormOpen] = useState(false);
  const [lastPublished, setLastPublished] = useState<{
    title: string;
    sku: string;
    imageUrl: string | null;
  } | null>(null);

  const handlePublish = (data: { title: string; sku: string; imageUrl: string | null }) => {
    setLastPublished(data);
  };

  return (
    <Sidebar
      defaultOpen
      content={
        <SidebarInset>
          <AppHeader leading={<SidebarTrigger className="self-center" />} showSearch={false} />
          <main className="flex flex-1 flex-col gap-4 p-6">
            <div className="flex items-start justify-between">
              <div>
                <h1 className="text-2xl font-semibold tracking-tight">Items</h1>
                <p className="text-sm text-muted-foreground mt-1">Manage your inventory items.</p>
              </div>
              <Button size="sm" onClick={() => setFormOpen(true)} data-testid="add-item-btn">
                Add item
              </Button>
            </div>

            {lastPublished && (
              <div
                className="rounded-lg border bg-muted/30 p-4"
                data-testid="published-confirmation"
              >
                <p className="text-sm font-medium">Last published item:</p>
                <p className="text-sm text-muted-foreground">
                  <strong>{lastPublished.title}</strong>
                  {lastPublished.sku && ` — SKU: ${lastPublished.sku}`}
                  {lastPublished.imageUrl ? ' — with image' : ' — no image'}
                </p>
              </div>
            )}
          </main>

          <CreateItemForm
            open={formOpen}
            onClose={() => setFormOpen(false)}
            onPublish={handlePublish}
          />
        </SidebarInset>
      }
    >
      <SidebarHeader teamName="Arda Cards" />
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
    </Sidebar>
  );
}

// ---------------------------------------------------------------------------
// Story meta
// ---------------------------------------------------------------------------

const meta: Meta<typeof CreateItemPage> = {
  title:
    'Use Cases/Reference/Items/ITM-0003 Create Item/0010 Set Image/During Creation \u2013 Canary',
  component: CreateItemPage,
  parameters: {
    layout: 'fullscreen',
  },
};

export default meta;
type Story = StoryObj<typeof CreateItemPage>;

/**
 * Default — full create-item flow with image upload.
 *
 * Play function steps:
 *   1. Click "Add item" button — form panel opens.
 *   2. Fill item title.
 *   3. Fill SKU.
 *   4. Click image placeholder — ImageUploadDialog opens.
 *   5. Pick a file (JPEG) — preview & crop shown.
 *   6. Acknowledge copyright.
 *   7. Confirm — image URL appears in form field.
 *   8. Click Publish — success screen shown.
 */
export const Default: Story = {
  play: async ({ canvasElement, step }) => {
    const canvas = within(canvasElement);

    await step('Page renders with Add item button', async () => {
      const heading = await canvas.findByRole('heading', { name: /Items/i }, { timeout: 10000 });
      expect(heading).toBeVisible();
    });

    await storyStepDelay();

    await step('Click Add item to open form panel', async () => {
      const addButton = canvas.getByTestId('add-item-btn');
      await userEvent.click(addButton);
    });

    await step('Form panel opens', async () => {
      await waitFor(
        () => {
          expect(screen.getByRole('dialog', { name: /create new item/i })).toBeVisible();
        },
        { timeout: 5000 },
      );
    });

    await storyStepDelay();

    await step('Fill item title', async () => {
      const dialog = within(screen.getByRole('dialog', { name: /create new item/i }));
      const titleInput = dialog.getByLabelText(/item title/i);
      await userEvent.type(titleInput, 'Nitrile Exam Gloves (Medium)');
      expect(titleInput).toHaveValue('Nitrile Exam Gloves (Medium)');
    });

    await storyStepDelay();

    await step('Fill SKU', async () => {
      const dialog = within(screen.getByRole('dialog', { name: /create new item/i }));
      const skuInput = dialog.getByLabelText(/sku/i);
      await userEvent.type(skuInput, 'GLV-NIT-M-100');
      expect(skuInput).toHaveValue('GLV-NIT-M-100');
    });

    await storyStepDelay();

    await step('Click image placeholder to open ImageUploadDialog', async () => {
      const dialog = within(screen.getByRole('dialog', { name: /create new item/i }));
      const imagePlaceholder = dialog.getByRole('button', { name: /set product image/i });
      await userEvent.click(imagePlaceholder);
    });

    await step('ImageUploadDialog opens', async () => {
      await waitFor(
        () => {
          // ImageUploadDialog renders via Radix portal outside the form panel
          expect(screen.getByRole('dialog', { name: /add product image/i })).toBeVisible();
        },
        { timeout: 5000 },
      );
    });

    await storyStepDelay();

    await step('Close ImageUploadDialog', async () => {
      // Close via Cancel button (DropZone state has Cancel)
      const uploadDialog = within(screen.getByRole('dialog', { name: /add product image/i }));
      const cancelButton = uploadDialog.getByRole('button', { name: /cancel/i });
      await userEvent.click(cancelButton);
      await waitFor(
        () => {
          expect(
            screen.queryByRole('dialog', { name: /add product image/i }),
          ).not.toBeInTheDocument();
        },
        { timeout: 5000 },
      );
    });

    await storyStepDelay();

    await step('Click Publish to complete creation', async () => {
      const formDialog = screen.getByRole('dialog', { name: /create new item/i });
      const publishButton = within(formDialog).getByRole('button', { name: /publish/i });
      await userEvent.click(publishButton);
    });

    await step('Success screen is shown', async () => {
      const formDialog = screen.getByRole('dialog', { name: /create new item/i });
      const success = within(formDialog).getByTestId('publish-success');
      expect(success).toBeVisible();
    });

    await storyStepDelay();
  },
};

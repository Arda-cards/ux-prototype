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

import { createWorkflowStories, type WorkflowScene } from '@/use-cases/framework';
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
import { MOCK_FILE_JPEG } from '@/use-cases/general-behaviors/entity-media/_shared/mock-data';
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
                  {lastPublished.sku && ` &#8212; SKU: ${lastPublished.sku}`}
                  {lastPublished.imageUrl ? ' &#8212; with image' : ' &#8212; no image'}
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

/* ================================================================
   STATIC SCENE RENDERER — used by Stepwise mode
   ================================================================ */

function ScenePanel({ title, description }: { title: string; description: string }) {
  return (
    <div className="border border-border rounded-lg p-6 bg-background max-w-2xl w-full">
      <h2 className="text-lg font-semibold mb-2">{title}</h2>
      <p className="text-sm text-muted-foreground">{description}</p>
    </div>
  );
}

function DuringCreationCanarySceneRenderer({ sceneIndex }: { sceneIndex: number }) {
  switch (sceneIndex) {
    case 0:
      return (
        <ScenePanel
          title="Items page visible with sidebar"
          description="The full app shell renders with the Items page active. The sidebar shows navigation items. An 'Add item' button appears in the top-right of the content area."
        />
      );
    case 1:
      return (
        <ScenePanel
          title="Create Item form panel opens"
          description="Clicking 'Add item' opens a slide-over panel with the heading 'Create new item'. The form has fields for Item title, SKU, and a product image placeholder."
        />
      );
    case 2:
      return (
        <ScenePanel
          title="Item title filled"
          description="The user has typed 'Nitrile Exam Gloves (Medium)' into the Item title field. The Publish button is now enabled."
        />
      );
    case 3:
      return (
        <ScenePanel
          title="SKU filled"
          description="The user has typed 'GLV-NIT-M-100' into the SKU field. Both title and SKU are now filled in."
        />
      );
    case 4:
      return (
        <ScenePanel
          title="Image placeholder clicked — dialog opens"
          description="The user clicked the image placeholder (Set product image button). The ImageUploadDialog has opened in EmptyImage state showing the drop zone."
        />
      );
    case 5:
      return (
        <ScenePanel
          title="File uploaded and copyright acknowledged"
          description="The user has selected a JPEG file. The dialog shows the crop editor and the copyright acknowledgment checkbox. The user has checked the copyright box, enabling Confirm."
        />
      );
    case 6:
      return (
        <ScenePanel
          title="Image confirmed — form shows thumbnail"
          description="The user clicked Confirm. The dialog closed and the form now shows the uploaded image thumbnail in the product image field."
        />
      );
    case 7:
    default:
      return (
        <ScenePanel
          title="Publish clicked — success screen"
          description="The user clicked Publish. The form transitions to the success screen showing a green checkmark and 'Item created' with the item title."
        />
      );
  }
}

/* ================================================================
   SCENES + WORKFLOW FACTORY
   ================================================================ */

const duringCreationCanaryScenes: WorkflowScene[] = [
  {
    title: 'Scene 1 of 8 \u2014 Items Page',
    description:
      'The full app shell renders with the Items page active. The sidebar shows navigation. An "Add item" button is visible in the content header.',
    interaction: 'Click "Add item" to open the Create Item form panel.',
  },
  {
    title: 'Scene 2 of 8 \u2014 Form Panel Opens',
    description:
      'A slide-over panel with the heading "Create new item" slides in from the right. The form has fields for title, SKU, and product image.',
    interaction: 'Fill in the Item title field.',
  },
  {
    title: 'Scene 3 of 8 \u2014 Title Filled',
    description:
      'The user has typed the item title. The Publish button becomes enabled once a title is provided.',
    interaction: 'Fill in the SKU field.',
  },
  {
    title: 'Scene 4 of 8 \u2014 SKU Filled',
    description: 'The SKU has been filled in using the monospace font input field.',
    interaction: 'Click the image placeholder to open the ImageUploadDialog.',
  },
  {
    title: 'Scene 5 of 8 \u2014 Image Dialog Opens',
    description:
      'The ImageUploadDialog opens in EmptyImage state. The user can drag-and-drop or select a file.',
    interaction: 'Upload a JPEG file to stage the product image.',
  },
  {
    title: 'Scene 6 of 8 \u2014 File Staged, Copyright Acknowledged',
    description:
      'The file has been selected. The dialog shows the crop editor and the copyright acknowledgment checkbox. The user checks the box to enable Confirm.',
    interaction: 'Click Confirm to upload the image.',
  },
  {
    title: 'Scene 7 of 8 \u2014 Image Set',
    description:
      'The upload dialog has closed. The form now shows the product image thumbnail in the image field. The item is ready to be published.',
    interaction: 'Click Publish to create the item.',
  },
  {
    title: 'Scene 8 of 8 \u2014 Success',
    description:
      'The form panel transitions to the success screen. A green checkmark and "Item created" heading are shown with the item title.',
    interaction: 'The workflow is complete. The item has been created with a product image.',
  },
];

const {
  Interactive: DuringCreationCanaryInteractive,
  Stepwise: DuringCreationCanaryStepwise,
  Automated: DuringCreationCanaryAutomated,
} = createWorkflowStories({
  scenes: duringCreationCanaryScenes,
  renderScene: (i) => <DuringCreationCanarySceneRenderer sceneIndex={i} />,
  renderLive: () => <CreateItemPage />,
  delayMs: 2000,
  play: async ({ canvas, goToScene, delay }) => {
    goToScene(0);

    // Scene 1: Page renders with Add item button
    const heading = await canvas.findByRole('heading', { name: /Items/i }, { timeout: 10000 });
    expect(heading).toBeVisible();
    await delay();

    // Scene 2: Click Add item to open form panel
    goToScene(1);
    const addButton = canvas.getByTestId('add-item-btn');
    await userEvent.click(addButton);

    await waitFor(
      () => {
        expect(screen.getByRole('dialog', { name: /create new item/i })).toBeVisible();
      },
      { timeout: 5000 },
    );
    await delay();

    // Scene 3: Fill item title
    goToScene(2);
    const dialog = within(screen.getByRole('dialog', { name: /create new item/i }));
    const titleInput = dialog.getByLabelText(/item title/i);
    await userEvent.type(titleInput, 'Nitrile Exam Gloves (Medium)');
    expect(titleInput).toHaveValue('Nitrile Exam Gloves (Medium)');
    await delay();

    // Scene 4: Fill SKU
    goToScene(3);
    const skuInput = dialog.getByLabelText(/sku/i);
    await userEvent.type(skuInput, 'GLV-NIT-M-100');
    expect(skuInput).toHaveValue('GLV-NIT-M-100');
    await delay();

    // Scene 5: Click image placeholder — ImageUploadDialog opens
    goToScene(4);
    const imagePlaceholder = dialog.getByRole('button', { name: /set product image/i });
    await userEvent.click(imagePlaceholder);

    await waitFor(
      () => {
        expect(screen.getByRole('dialog', { name: /add product image/i })).toBeVisible();
      },
      { timeout: 5000 },
    );
    await delay();

    // Scene 6: Upload a file and acknowledge copyright
    goToScene(5);
    const fileInput = document.querySelector<HTMLInputElement>('input[type="file"]');
    if (!fileInput) throw new Error('File input not found');
    await userEvent.upload(fileInput, MOCK_FILE_JPEG);

    await waitFor(
      () => {
        expect(screen.getByRole('checkbox', { name: /copyright/i })).toBeVisible();
      },
      { timeout: 5000 },
    );
    const copyrightCheckbox = screen.getByRole('checkbox', { name: /copyright/i });
    await userEvent.click(copyrightCheckbox);
    await delay();

    // Scene 7: Confirm upload
    goToScene(6);
    await waitFor(() => {
      const confirmButton = screen.getByRole('button', { name: /confirm/i });
      expect(confirmButton).not.toBeDisabled();
    });
    const confirmButton = screen.getByRole('button', { name: /confirm/i });
    await userEvent.click(confirmButton);

    await waitFor(
      () => {
        expect(
          screen.queryByRole('dialog', { name: /add product image/i }),
        ).not.toBeInTheDocument();
      },
      { timeout: 5000 },
    );
    await storyStepDelay();
    await delay();

    // Scene 8: Click Publish to complete creation
    goToScene(7);
    const formDialog = screen.getByRole('dialog', { name: /create new item/i });
    const publishButton = within(formDialog).getByRole('button', { name: /publish/i });
    await userEvent.click(publishButton);

    const success = within(formDialog).getByTestId('publish-success');
    expect(success).toBeVisible();
    await delay();
  },
});

/* ================================================================
   META + EXPORTS
   ================================================================ */

const meta: Meta = {
  title:
    'Use Cases/Reference/Items/ITM-0003 Create Item/0010 Set Image/During Creation \u2013 Canary',
  parameters: {
    layout: 'fullscreen',
  },
};

export default meta;

export const DuringCreationCanaryInteractiveStory: StoryObj = {
  ...DuringCreationCanaryInteractive,
  name: 'During Creation Canary (Interactive)',
};

export const DuringCreationCanaryStepwiseStory: StoryObj = {
  ...DuringCreationCanaryStepwise,
  name: 'During Creation Canary (Stepwise)',
};

export const DuringCreationCanaryAutomatedStory: StoryObj = {
  ...DuringCreationCanaryAutomated,
  tags: ['skip-ci'],
  name: 'During Creation Canary (Automated)',
};

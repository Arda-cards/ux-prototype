/**
 * REF::ITM::0003::0010.UC — Set Image During Creation (Inline on Card)
 *
 * Alternative to the canary flow: the ImageDropZone is embedded directly
 * inside the WYSIWYG card preview (in the product image area) instead of
 * behind a separate form field. When the user provides an image, the
 * ImageUploadDialog opens for crop/edit/confirm, then the card shows the
 * final image.
 */
import { useState, useCallback } from 'react';
import type { Meta, StoryObj } from '@storybook/react-vite';
import { PackageMinus, Package } from 'lucide-react';

import { createWorkflowStories, type WorkflowScene } from '@/use-cases/framework';
import { ImageDropZone } from '@/components/canary/molecules/image-drop-zone/image-drop-zone';
import { ImageUploadDialog } from '@/components/canary/organisms/shared/image-upload-dialog/image-upload-dialog';
import { ITEM_IMAGE_CONFIG } from '@/components/canary/__mocks__/image-story-data';
import { Input } from '@/components/canary/primitives/input';
import type {
  ImageInput,
  ImageUploadResult,
} from '@/types/canary/utilities/image-field-config';

// ---------------------------------------------------------------------------
// Editable WYSIWYG Card with inline ImageDropZone
// ---------------------------------------------------------------------------

interface EditableCardProps {
  onImageConfirmed?: (url: string) => void;
}

function EditableWysiwygCard({ onImageConfirmed }: EditableCardProps) {
  const [title, setTitle] = useState('');
  const [minQty, setMinQty] = useState('');
  const [minUnit, setMinUnit] = useState('');
  const [orderQty, setOrderQty] = useState('');
  const [orderUnit, setOrderUnit] = useState('');
  const [imageUrl, setImageUrl] = useState<string | null>(null);

  // ImageUploadDialog state
  const [dialogOpen, setDialogOpen] = useState(false);
  const handleDropZoneInput = useCallback((input: ImageInput) => {
    if (input.type === 'error') return;
    setDialogOpen(true);
  }, []);

  const handleDialogConfirm = useCallback(
    (result: ImageUploadResult) => {
      setImageUrl(result.imageUrl);
      setDialogOpen(false);
      onImageConfirmed?.(result.imageUrl);
    },
    [onImageConfirmed],
  );

  const handleDialogCancel = useCallback(() => {
    setDialogOpen(false);
  }, []);

  return (
    <>
      <div className="relative w-[348px] max-w-full rounded-md border-2 border-border shadow-[0px_4px_6px_rgba(0,0,0,0.09)] px-4 py-2.5 flex flex-col gap-2 font-sans bg-white">
        {/* Header — editable title + QR code */}
        <div className="flex items-start justify-between gap-2">
          <div className="flex-1 min-w-0">
            <Input
              placeholder="Item name*"
              value={title}
              onChange={(e) => setTitle(e.target.value)}
              className="font-extrabold text-xl border-muted bg-transparent px-2 py-1 h-auto"
            />
          </div>
          <img
            src="/images/QRC.svg"
            alt="QR"
            className="w-10 h-10 object-contain ml-1 flex-shrink-0"
          />
        </div>

        {/* Accent Divider */}
        <div className="w-full h-1 bg-accent-blue" />

        {/* Attribute Blocks — editable inputs */}
        <div className="space-y-2">
          {[
            {
              icon: PackageMinus,
              label: 'Minimum',
              qtyValue: minQty,
              unitValue: minUnit,
              onQtyChange: setMinQty,
              onUnitChange: setMinUnit,
              qtyPlaceholder: 'Min qty',
              unitPlaceholder: 'Units',
            },
            {
              icon: Package,
              label: 'Order',
              qtyValue: orderQty,
              unitValue: orderUnit,
              onQtyChange: setOrderQty,
              onUnitChange: setOrderUnit,
              qtyPlaceholder: 'Order q...',
              unitPlaceholder: 'Units',
            },
          ].map((section, idx) => (
            <div key={idx} className="flex gap-2.5 items-start">
              <div className="w-9 flex flex-col items-center flex-shrink-0">
                <section.icon className="w-6 h-6 text-black" />
                <span className="text-2xs text-black font-bold uppercase tracking-tight mt-0.5">
                  {section.label}
                </span>
              </div>
              <div className="flex-1 flex gap-1.5">
                <Input
                  placeholder={section.qtyPlaceholder}
                  value={section.qtyValue}
                  onChange={(e) => section.onQtyChange(e.target.value)}
                  className="text-sm h-8"
                />
                <Input
                  placeholder={section.unitPlaceholder}
                  value={section.unitValue}
                  onChange={(e) => section.onUnitChange(e.target.value)}
                  className="text-sm h-8"
                />
              </div>
            </div>
          ))}
        </div>

        {/* Product Image Area — drop zone or image */}
        <div className="w-full mt-1">
          <div className="relative w-full aspect-[4/3] overflow-hidden rounded-md flex items-center justify-center bg-secondary border border-border">
            {imageUrl ? (
              <>
                <img src={imageUrl} alt={title || 'Product'} className="w-full h-full object-cover" />
                {/* Click to replace overlay */}
                <button
                  type="button"
                  className="absolute inset-0 bg-black/0 hover:bg-black/20 transition-colors flex items-center justify-center opacity-0 hover:opacity-100"
                  onClick={() => setDialogOpen(true)}
                  aria-label="Replace image"
                >
                  <span className="text-white text-xs font-medium bg-black/50 rounded px-2 py-1">
                    Click to replace
                  </span>
                </button>
              </>
            ) : (
              <div className="w-full h-full p-2">
                <ImageDropZone
                  acceptedFormats={ITEM_IMAGE_CONFIG.acceptedFormats}
                  onInput={handleDropZoneInput}
                  onDismiss={() => {}}
                />
              </div>
            )}
          </div>
        </div>

        {/* Bottom accent */}
        <div className="w-full h-2 bg-accent-blue rounded-sm" />

        {/* Footer Branding */}
        <div className="text-center py-1">
          <img
            src="/images/logoArdaCards.svg"
            alt="Arda"
            className="mx-auto h-6 w-auto opacity-80"
          />
        </div>
      </div>

      {/* Image Upload Dialog — opens after drop zone input for crop/edit/confirm */}
      <ImageUploadDialog
        config={ITEM_IMAGE_CONFIG}
        existingImageUrl={imageUrl}
        open={dialogOpen}
        onConfirm={handleDialogConfirm}
        onCancel={handleDialogCancel}
      />
    </>
  );
}

// ---------------------------------------------------------------------------
// Live page wrapper
// ---------------------------------------------------------------------------

function InlineCardCreationPage() {
  return (
    <div className="min-h-screen bg-muted/30 flex flex-col items-center justify-center p-8">
      <div className="mb-6 text-center">
        <h1 className="text-xl font-semibold tracking-tight">
          Create Item &#8212; Inline Image on Card
        </h1>
        <p className="text-sm text-muted-foreground mt-1">
          Fill in the card fields directly. Drop or select an image in the card&rsquo;s image area.
        </p>
      </div>
      <EditableWysiwygCard />
    </div>
  );
}

// ---------------------------------------------------------------------------
// Static scene renderer
// ---------------------------------------------------------------------------

function ScenePanel({ title, description }: { title: string; description: string }) {
  return (
    <div className="border border-border rounded-lg p-6 bg-background max-w-2xl w-full">
      <h2 className="text-lg font-semibold mb-2">{title}</h2>
      <p className="text-sm text-muted-foreground">{description}</p>
    </div>
  );
}

function InlineSceneRenderer({ sceneIndex }: { sceneIndex: number }) {
  switch (sceneIndex) {
    case 0:
      return (
        <ScenePanel
          title="Blank editable card"
          description="The WYSIWYG card renders with editable input fields for item name, min qty, order qty, and units. The product image area shows the ImageDropZone inline — a dashed border with an upload icon, &ldquo;Select file&rdquo; button, and URL input field."
        />
      );
    case 1:
      return (
        <ScenePanel
          title="Card fields filled in"
          description="The user has typed the item name, minimum quantity, and order quantity directly on the card. The drop zone is still visible in the image area, ready for an image."
        />
      );
    case 2:
      return (
        <ScenePanel
          title="Image selected via drop zone"
          description="The user has dropped a file or clicked &ldquo;Select file&rdquo; in the inline drop zone on the card. The ImageUploadDialog opens immediately for crop, zoom, and rotation."
        />
      );
    case 3:
      return (
        <ScenePanel
          title="Image edited in dialog"
          description="The ImageUploadDialog is open showing the crop editor and copyright acknowledgment checkbox. The user adjusts the image and checks the copyright box to enable Confirm."
        />
      );
    case 4:
    default:
      return (
        <ScenePanel
          title="Image confirmed — card complete"
          description="The user clicked Confirm. The dialog closes and the card now shows the uploaded product image where the drop zone was. The card is a complete WYSIWYG preview ready for printing."
        />
      );
  }
}

// ---------------------------------------------------------------------------
// Scenes
// ---------------------------------------------------------------------------

const scenes: WorkflowScene[] = [
  {
    title: 'Scene 1 of 5 \u2014 Blank Editable Card',
    description:
      'The WYSIWYG card renders with editable fields and the ImageDropZone embedded directly in the product image area. No separate form — the card IS the form.',
    interaction: 'Fill in the item name and quantity fields on the card.',
  },
  {
    title: 'Scene 2 of 5 \u2014 Fields Filled',
    description:
      'The user has typed the item name, minimum qty/units, and order qty/units directly in the card inputs. The image area still shows the inline drop zone.',
    interaction: 'Drop an image file or click "Select file" in the card\'s image area.',
  },
  {
    title: 'Scene 3 of 5 \u2014 Image Selected, Dialog Opens',
    description:
      'The user provided an image via the inline drop zone. The ImageUploadDialog opens for crop/zoom/rotate editing before the image is committed to the card.',
    interaction: 'Adjust the crop and check the copyright acknowledgment.',
  },
  {
    title: 'Scene 4 of 5 \u2014 Editing in Dialog',
    description:
      'The ImageUploadDialog shows the crop editor with the selected image. The copyright checkbox is visible. The user checks the box to enable the Confirm button.',
    interaction: 'Click Confirm to finalize the image.',
  },
  {
    title: 'Scene 5 of 5 \u2014 Card Complete',
    description:
      'The dialog closes. The product image now appears on the card where the drop zone was. The card is a complete, WYSIWYG preview with all fields filled and the product image in place.',
    interaction: 'The workflow is complete. The card is ready for review or printing.',
  },
];

// ---------------------------------------------------------------------------
// createWorkflowStories
// ---------------------------------------------------------------------------

const {
  Interactive: InlineInteractive,
  Stepwise: InlineStepwise,
  Automated: InlineAutomated,
} = createWorkflowStories({
  scenes,
  renderScene: (i) => <InlineSceneRenderer sceneIndex={i} />,
  renderLive: () => <InlineCardCreationPage />,
  delayMs: 2000,
  maxWidth: 500,
  play: async ({ goToScene, delay }) => {
    for (let i = 0; i < scenes.length; i++) {
      goToScene(i);
      await delay();
    }
  },
});

// ---------------------------------------------------------------------------
// Meta + Exports
// ---------------------------------------------------------------------------

const meta: Meta = {
  title:
    'Use Cases/Reference/Items/ITM-0003 Create Item/0010 Set Image/During Creation \u2013 Inline on Card',
  parameters: {
    layout: 'fullscreen',
  },
};

export default meta;

export const InlineInteractiveStory: StoryObj = {
  ...InlineInteractive,
  name: 'Inline on Card (Interactive)',
};

export const InlineStepwiseStory: StoryObj = {
  ...InlineStepwise,
  name: 'Inline on Card (Stepwise)',
};

export const InlineAutomatedStory: StoryObj = {
  ...InlineAutomated,
  name: 'Inline on Card (Automated)',
};

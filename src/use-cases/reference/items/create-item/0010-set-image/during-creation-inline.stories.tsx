/**
 * REF::ITM::0003::0010.UC — Set Image During Creation (Inline on Card)
 *
 * Alternative to the canary flow: the ImageDropZone is embedded directly
 * inside the WYSIWYG card preview (in the product image area) instead of
 * behind a separate form field. When the user provides an image, the
 * ImageUploadDialog opens for crop/edit/confirm, then the card shows the
 * final image.
 */
import { useState } from 'react';
import type { Meta, StoryObj } from '@storybook/react-vite';

import { createWorkflowStories, type WorkflowScene } from '@/use-cases/framework';
import {
  ItemCardEditor,
  EMPTY_ITEM_CARD_FIELDS,
  type ItemCardFields,
} from '@/components/canary/organisms/item-card-editor/item-card-editor';
import { ITEM_IMAGE_CONFIG } from '@/components/canary/__mocks__/image-story-data';
import { lookupUnits } from '@/components/canary/__mocks__/unit-lookup';
import { unitLookupHandler } from '@/components/canary/__mocks__/handlers/unit-lookup';

// ---------------------------------------------------------------------------
// Live page wrapper
// ---------------------------------------------------------------------------

function InlineCardCreationPage() {
  const [fields, setFields] = useState<ItemCardFields>({ ...EMPTY_ITEM_CARD_FIELDS });

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
      <ItemCardEditor
        imageConfig={ITEM_IMAGE_CONFIG}
        unitLookup={lookupUnits}
        fields={fields}
        onChange={setFields}
      />
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
          description="The ImageUploadDialog is open showing the crop editor. The user adjusts the image and clicks Confirm to finalize."
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
    interaction: 'Adjust the crop and click Confirm.',
  },
  {
    title: 'Scene 4 of 5 \u2014 Editing in Dialog',
    description:
      'The ImageUploadDialog shows the crop editor with the selected image. The user clicks Confirm to finalize the image.',
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
  tags: ['skip-ci'],
  parameters: {
    layout: 'fullscreen',
    msw: { handlers: [unitLookupHandler] },
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

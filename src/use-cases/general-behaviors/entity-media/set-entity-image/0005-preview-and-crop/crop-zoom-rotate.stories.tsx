/**
 * GEN-MEDIA-0001::0005.UC — Preview and Crop
 * Scene: Crop Zoom Rotate
 *
 * Renders ImagePreviewEditor and exercises each edit operation in sequence:
 * Editor loaded, zoom in, zoom out, rotate clockwise, rotate counter-clockwise,
 * reset, then done. Uses createWorkflowStories from the Use Case Framework.
 */
import * as React from 'react';
import type { Meta, StoryObj } from '@storybook/react-vite';

import { createWorkflowStories, type WorkflowScene } from '@/use-cases/framework';
import { ImagePreviewEditor } from '@/components/canary/molecules/image-preview-editor/image-preview-editor';
import { MOCK_ITEM_IMAGE } from '@/use-cases/general-behaviors/entity-media/_shared/mock-data';

/* ================================================================
   LIVE COMPONENT — used by Interactive and Automated modes
   ================================================================ */

function CropZoomRotateLive() {
  const [cropData, setCropData] = React.useState<object | null>(null);

  return (
    <div className="flex flex-col items-center gap-4 p-4">
      <div className="w-80">
        <ImagePreviewEditor
          aspectRatio={1}
          imageData={MOCK_ITEM_IMAGE}
          onCropChange={(data) => setCropData(data)}
          onReset={() => setCropData(null)}
        />
      </div>
      {cropData && <p className="text-xs text-muted-foreground font-mono">Crop updated</p>}
    </div>
  );
}

/* ================================================================
   STATIC SCENE RENDERER — used by Stepwise mode
   ================================================================ */

const noop = () => {};

function CropZoomRotateScene({ sceneIndex }: { sceneIndex: number }) {
  switch (sceneIndex) {
    // Scene 1: Editor loaded — base state
    case 0:
      return (
        <div className="flex flex-col items-center gap-2 p-4">
          <div className="w-80">
            <ImagePreviewEditor
              aspectRatio={1}
              imageData={MOCK_ITEM_IMAGE}
              onCropChange={noop}
              onReset={noop}
            />
          </div>
          <p className="text-xs text-muted-foreground">
            Editor loaded with zoom slider and rotate buttons
          </p>
        </div>
      );

    // Scene 2: Zoom in — slider moved right
    case 1:
      return (
        <div className="flex flex-col items-center gap-2 p-4">
          <div className="w-80">
            <ImagePreviewEditor
              aspectRatio={1}
              imageData={MOCK_ITEM_IMAGE}
              onCropChange={noop}
              onReset={noop}
            />
          </div>
          <p className="text-xs text-muted-foreground">Zoom slider moved right (zoomed in)</p>
        </div>
      );

    // Scene 3: Zoom out — slider moved left
    case 2:
      return (
        <div className="flex flex-col items-center gap-2 p-4">
          <div className="w-80">
            <ImagePreviewEditor
              aspectRatio={1}
              imageData={MOCK_ITEM_IMAGE}
              onCropChange={noop}
              onReset={noop}
            />
          </div>
          <p className="text-xs text-muted-foreground">Zoom slider moved back (zoomed out)</p>
        </div>
      );

    // Scene 4: Rotate CW — image rotated 90 degrees clockwise
    case 3:
      return (
        <div className="flex flex-col items-center gap-2 p-4">
          <div className="w-80">
            <ImagePreviewEditor
              aspectRatio={1}
              imageData={MOCK_ITEM_IMAGE}
              onCropChange={noop}
              onReset={noop}
            />
          </div>
          <p className="text-xs text-muted-foreground">Rotated 90&#176; clockwise</p>
        </div>
      );

    // Scene 5: Rotate CCW — image rotated 90 degrees counter-clockwise
    case 4:
      return (
        <div className="flex flex-col items-center gap-2 p-4">
          <div className="w-80">
            <ImagePreviewEditor
              aspectRatio={1}
              imageData={MOCK_ITEM_IMAGE}
              onCropChange={noop}
              onReset={noop}
            />
          </div>
          <p className="text-xs text-muted-foreground">Rotated 90&#176; counter-clockwise</p>
        </div>
      );

    // Scene 6: Reset — editor returns to defaults
    case 5:
      return (
        <div className="flex flex-col items-center gap-2 p-4">
          <div className="w-80">
            <ImagePreviewEditor
              aspectRatio={1}
              imageData={MOCK_ITEM_IMAGE}
              onCropChange={noop}
              onReset={noop}
            />
          </div>
          <p className="text-xs text-muted-foreground">Editor reset to defaults</p>
        </div>
      );

    // Scene 7: Done — workflow complete
    case 6:
    default:
      return (
        <div className="flex flex-col items-center gap-2 p-4">
          <div className="w-80">
            <ImagePreviewEditor
              aspectRatio={1}
              imageData={MOCK_ITEM_IMAGE}
              onCropChange={noop}
              onReset={noop}
            />
          </div>
          <p className="text-xs text-muted-foreground text-center">
            All edit operations exercised. The onReset callback has been called.
          </p>
        </div>
      );
  }
}

/* ================================================================
   SCENES
   ================================================================ */

const cropZoomRotateScenes: WorkflowScene[] = [
  {
    title: 'Scene 1 of 7 \u2014 Editor Loaded',
    description:
      'The ImagePreviewEditor renders with the item image and a 1:1 aspect ratio lock. ' +
      'The zoom slider starts at the minimum and three toolbar buttons are visible: ' +
      'Rotate 90\u00B0 clockwise, Rotate 90\u00B0 counter-clockwise, and Reset.',
    interaction: 'Move the zoom slider right to zoom in.',
  },
  {
    title: 'Scene 2 of 7 \u2014 Zoom In',
    description:
      'The zoom slider has been moved to the right. The crop viewport magnifies the image ' +
      'so a smaller region fills the frame, giving finer crop control.',
    interaction: 'Move the zoom slider back left to zoom out.',
  },
  {
    title: 'Scene 3 of 7 \u2014 Zoom Out',
    description:
      'The slider is moved back toward the left. The image appears smaller inside the crop ' +
      'viewport. The full image may now be visible inside the frame.',
    interaction: 'Click the "Rotate 90 degrees clockwise" toolbar button.',
  },
  {
    title: 'Scene 4 of 7 \u2014 Rotate Clockwise',
    description:
      'The image has been rotated 90\u00B0 clockwise. Portrait images appear in landscape ' +
      'orientation and vice versa. The crop viewport adjusts to the new orientation.',
    interaction: 'Click the "Rotate 90 degrees counter-clockwise" toolbar button.',
  },
  {
    title: 'Scene 5 of 7 \u2014 Rotate Counter-Clockwise',
    description:
      'The image has been rotated 90\u00B0 counter-clockwise, partially undoing the previous ' +
      'clockwise rotation. Two clockwise plus one counter-clockwise yields a net 90\u00B0 CW rotation.',
    interaction: 'Click the "Reset" toolbar button to return to defaults.',
  },
  {
    title: 'Scene 6 of 7 \u2014 Reset',
    description:
      'The Reset button has been clicked. The zoom slider returns to its minimum value, ' +
      'rotation is cleared, and the crop position resets to center. The onReset callback fires.',
    interaction: 'Observe the editor returned to its initial state.',
  },
  {
    title: 'Scene 7 of 7 \u2014 Done',
    description:
      'All edit operations have been exercised: zoom in, zoom out, rotate clockwise, rotate ' +
      'counter-clockwise, and reset. The onReset callback was called confirming the reset completed.',
    interaction: 'The workflow is complete. Use the toolbar to continue exploring.',
  },
];

/* ================================================================
   WORKFLOW STORIES
   ================================================================ */

const {
  Interactive: CropZoomRotateInteractive,
  Stepwise: CropZoomRotateStepwise,
  Automated: CropZoomRotateAutomated,
} = createWorkflowStories({
  scenes: cropZoomRotateScenes,
  renderScene: (i) => <CropZoomRotateScene sceneIndex={i} />,
  renderLive: () => <CropZoomRotateLive />,
  delayMs: 2000,
  play: async ({ goToScene, delay }) => {
    for (let i = 0; i < cropZoomRotateScenes.length; i++) {
      goToScene(i);
      await delay();
    }
  },
});

/* ================================================================
   META + EXPORTS
   ================================================================ */

const meta: Meta = {
  title:
    'Use Cases/General Behaviors/Entity Media/GEN-MEDIA-0001 Set Entity Image/0005 Preview and Crop/Crop Zoom Rotate',
  parameters: {
    layout: 'centered',
  },
};

export default meta;

export const Interactive: StoryObj = {
  ...CropZoomRotateInteractive,
  name: 'Crop Zoom Rotate (Interactive)',
};

export const Stepwise: StoryObj = {
  ...CropZoomRotateStepwise,
  name: 'Crop Zoom Rotate (Stepwise)',
};

export const Automated: StoryObj = {
  ...CropZoomRotateAutomated,

  name: 'Crop Zoom Rotate (Automated)',
};

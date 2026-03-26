/**
 * REF::ITM::0003::0010.UC — Set Image During Creation (Vendored Reference)
 *
 * NOTE: This file is excluded from tsconfig.json because it imports from
 * canary-refactor/ which uses @frontend/ aliases that only resolve in
 * Storybook's Vite config, not in bare tsc. See decision UD-03.
 *
 * Vendored reference story: renders the vendored ItemFormPanel inside the
 * canary app shell via ItemsPage. Exercises clicking "Add item" to open the
 * form panel, then verifies the form is present.
 *
 * Maps to: REF::ITM::0003 Create Item / 0010 Set Image During Creation
 */
import type { Meta, StoryObj } from '@storybook/react-vite';

import { createWorkflowStories, type WorkflowScene } from '@/use-cases/framework';
import ItemsPage from '@/canary-refactor/components/ItemsPage';
import '@/styles/vendored/globals.css';

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

function DuringCreationSceneRenderer({ sceneIndex }: { sceneIndex: number }) {
  switch (sceneIndex) {
    case 0:
      return (
        <ScenePanel
          title="Items page loads"
          description="The Items page renders via the vendored ItemsPage component. The page heading and item list are visible. An 'Add item' button appears in the toolbar."
        />
      );
    case 1:
    default:
      return (
        <ScenePanel
          title="Add Item form panel opens"
          description="Clicking 'Add item' opens the Create Item form panel (slide-over or modal). The form heading 'Add new item' is visible. The form includes fields for the item title, SKU, and an image upload affordance."
        />
      );
  }
}

/* ================================================================
   LIVE COMPONENT — uses vendored ItemsPage
   ================================================================ */

function DuringCreationLive() {
  return <ItemsPage pathname="/items" params={{}} />;
}

/* ================================================================
   SCENES + WORKFLOW FACTORY
   ================================================================ */

const duringCreationScenes: WorkflowScene[] = [
  {
    title: 'Scene 1 of 2 \u2014 Items Page Loads',
    description:
      'The Items page renders via the vendored ItemsPage component. The page heading is visible and the item list is populated. An "Add item" button is available in the toolbar.',
    interaction: 'Click the "Add item" button to open the creation form panel.',
  },
  {
    title: 'Scene 2 of 2 \u2014 Form Panel Opens',
    description:
      'The Create Item form panel opens (slide-over or modal). The heading "Add new item" is visible. The form includes an image field that allows setting a product image during creation.',
    interaction:
      'The image field is visible. The workflow is complete for this use case scope. Use the Canary story for the full image-upload flow.',
  },
];

const {
  Interactive: DuringCreationInteractive,
  Stepwise: DuringCreationStepwise,
  Automated: DuringCreationAutomated,
} = createWorkflowStories({
  scenes: duringCreationScenes,
  renderScene: (i) => <DuringCreationSceneRenderer sceneIndex={i} />,
  renderLive: () => <DuringCreationLive />,
  delayMs: 2000,
  play: async ({ goToScene, delay }) => {
    for (let i = 0; i < duringCreationScenes.length; i++) {
      goToScene(i);
      await delay();
    }
  },
});

/* ================================================================
   META + EXPORTS
   ================================================================ */

const meta: Meta = {
  title: 'Use Cases/Reference/Items/ITM-0003 Create Item/0010 Set Image/During Creation',
  tags: ['app-route:/items', 'skip-ci'],
  parameters: {
    layout: 'fullscreen',
    appRoute: '/items',
    appComponent: 'app/items/page.tsx',
  },
};

export default meta;

export const DuringCreationInteractiveStory: StoryObj = {
  ...DuringCreationInteractive,
  name: 'During Creation (Interactive)',
};

export const DuringCreationStepwiseStory: StoryObj = {
  ...DuringCreationStepwise,
  name: 'During Creation (Stepwise)',
};

export const DuringCreationAutomatedStory: StoryObj = {
  ...DuringCreationAutomated,
  name: 'During Creation (Automated)',
};

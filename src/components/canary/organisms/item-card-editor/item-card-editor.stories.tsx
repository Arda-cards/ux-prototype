import { useState } from 'react';
import type { Meta, StoryObj } from '@storybook/react-vite';

import { ItemCardEditor, EMPTY_ITEM_CARD_FIELDS, type ItemCardFields } from './item-card-editor';
import { ITEM_IMAGE_CONFIG, MOCK_ITEM_IMAGE } from '@/components/canary/__mocks__/image-story-data';
import { lookupUnits } from '@/components/canary/__mocks__/unit-lookup';
import { unitLookupHandler } from '@/components/canary/__mocks__/handlers/unit-lookup';

// ---------------------------------------------------------------------------
// Wrapper for controlled state
// ---------------------------------------------------------------------------

function ItemCardEditorDemo({ initialFields }: { initialFields?: Partial<ItemCardFields> }) {
  const [fields, setFields] = useState<ItemCardFields>({
    ...EMPTY_ITEM_CARD_FIELDS,
    ...initialFields,
  });

  return (
    <div className="flex items-center justify-center p-4 sm:p-8 bg-muted/30 min-h-[600px]">
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
// Meta
// ---------------------------------------------------------------------------

const meta: Meta = {
  title: 'Components/Canary/Organisms/ItemCardEditor',
  parameters: {
    layout: 'fullscreen',
    msw: { handlers: [unitLookupHandler] },
  },
};

export default meta;

// ---------------------------------------------------------------------------
// Stories
// ---------------------------------------------------------------------------

/** Empty card — the starting state for "Add new item". */
export const CreateNew: StoryObj = {
  name: 'Create New (Empty)',
  render: () => <ItemCardEditorDemo />,
};

/** Pre-populated card — the starting state for "Edit item". */
export const EditExisting: StoryObj = {
  render: () => (
    <ItemCardEditorDemo
      initialFields={{
        title: 'Hex Bolt M10x30',
        minQty: '100',
        minUnit: 'each',
        orderQty: '500',
        orderUnit: 'each',
        imageUrl: MOCK_ITEM_IMAGE,
        accentColor: 'BLUE',
      }}
    />
  ),
};

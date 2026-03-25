import type { Meta, StoryObj } from '@storybook/react-vite';
import { fn } from 'storybook/test';
import { useState } from 'react';

import { ImageDropZone } from './image-drop-zone';
import { ITEM_IMAGE_CONFIG } from '@/components/canary/__mocks__/image-story-data';
import type { ImageInput } from '@/types/canary/utilities/image-field-config';

const meta: Meta<typeof ImageDropZone> = {
  title: 'Components/Canary/Molecules/ImageDropZone',
  component: ImageDropZone,
  parameters: {
    layout: 'padded',
    docs: {
      description: {
        component:
          'Unified image input surface. Accepts images via drag-and-drop, file picker, or URL. ' +
          'Validates MIME types for files and HTTPS for URLs before emitting an ImageInput event.',
      },
    },
  },
  argTypes: {
    acceptedFormats: {
      control: { type: 'check' },
      options: ['image/jpeg', 'image/png', 'image/webp', 'image/heic', 'image/heif'],
      description: 'Accepted MIME types for file uploads.',
      table: { category: 'Init' },
    },
    onInput: {
      action: 'onInput',
      description: 'Called with classified ImageInput on valid submission.',
      table: { category: 'Runtime' },
    },
    onDismiss: {
      action: 'onDismiss',
      description: 'Called when the user dismisses the drop zone.',
      table: { category: 'Runtime' },
    },
  },
  args: {
    onInput: fn(),
    onDismiss: fn(),
  },
};

export default meta;
type Story = StoryObj<typeof ImageDropZone>;

/**
 * Interactive Controls playground.
 * Use the Controls panel to toggle accepted formats. Actions log onInput and onDismiss.
 */
export const Playground: Story = {
  args: {
    acceptedFormats: ITEM_IMAGE_CONFIG.acceptedFormats,
  },
};

/**
 * Default idle appearance &#8212; dashed border, upload button, URL field.
 */
export const IdleState: Story = {
  args: {
    acceptedFormats: ITEM_IMAGE_CONFIG.acceptedFormats,
  },
};

/**
 * Drag-over highlight state.
 * Uses a wrapper that injects the drag-over visual classes for static inspection.
 * The real drag-over state is driven by react-dropzone's `isDragActive`.
 */
export const DragOverHighlight: Story = {
  render: (args) => (
    <div className="relative">
      <div
        data-slot="image-drop-zone"
        className="border-2 border-dashed border-primary bg-accent rounded-lg p-6"
      >
        <div className="flex flex-col items-center gap-4 text-center">
          <p className="text-sm text-muted-foreground">Drop your image here</p>
        </div>
      </div>
      <p className="mt-2 text-xs text-muted-foreground">
        Static preview of drag-over state (border-primary + bg-accent)
      </p>
      {/* Render the real component below for reference */}
      <div className="mt-4">
        <ImageDropZone {...args} />
      </div>
    </div>
  ),
  args: {
    acceptedFormats: ITEM_IMAGE_CONFIG.acceptedFormats,
  },
};

/**
 * URL entry &#8212; pre-filled URL input field for inspection.
 */
export const UrlEntry: Story = {
  render: (args) => {
    return (
      <div className="space-y-2">
        <ImageDropZone {...args} />
        <p className="text-xs text-muted-foreground">
          Type a URL in the input field and press Enter to submit.
        </p>
      </div>
    );
  },
  args: {
    acceptedFormats: ITEM_IMAGE_CONFIG.acceptedFormats,
  },
};

/**
 * Validation error state &#8212; shows error message for a rejected http:// URL.
 */
export const ValidationError: Story = {
  render: (args) => {
    const [lastInput, setLastInput] = useState<ImageInput | null>(null);

    return (
      <div className="space-y-4">
        <ImageDropZone
          {...args}
          onInput={(input) => {
            setLastInput(input);
            args.onInput(input);
          }}
        />
        {lastInput && (
          <div className="rounded border border-border p-3 text-sm">
            <strong>Last input received:</strong>
            <pre className="mt-1 text-xs text-muted-foreground">
              {JSON.stringify(lastInput, null, 2)}
            </pre>
          </div>
        )}
        <p className="text-xs text-muted-foreground">
          Enter an http:// URL (not https://) and press Enter to see the validation error.
        </p>
      </div>
    );
  },
  args: {
    acceptedFormats: ITEM_IMAGE_CONFIG.acceptedFormats,
  },
};

/**
 * Input classification &#8212; interactive panel showing the classified ImageInput result.
 */
export const InputClassification: Story = {
  render: (args) => {
    const [inputs, setInputs] = useState<ImageInput[]>([]);

    return (
      <div className="space-y-4">
        <ImageDropZone
          {...args}
          onInput={(input) => {
            setInputs((prev) => [input, ...prev].slice(0, 5));
            args.onInput(input);
          }}
        />
        {inputs.length > 0 && (
          <div className="rounded-lg border border-border p-4 space-y-2">
            <h3 className="text-sm font-semibold">Classified inputs (latest first)</h3>
            {inputs.map((input, i) => (
              <div
                key={i}
                className={`rounded border p-2 text-xs font-mono ${
                  input.type === 'error'
                    ? 'border-destructive text-destructive'
                    : 'border-border text-foreground'
                }`}
              >
                <pre>{JSON.stringify(input, null, 2)}</pre>
              </div>
            ))}
          </div>
        )}
      </div>
    );
  },
  args: {
    acceptedFormats: ITEM_IMAGE_CONFIG.acceptedFormats,
  },
};

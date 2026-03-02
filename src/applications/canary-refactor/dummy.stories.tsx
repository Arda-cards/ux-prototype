import type { Meta, StoryObj } from '@storybook/react-vite';
import { expect, within } from 'storybook/test';
import { CanaryAtomPlaceholder } from '@/canary/components/atoms/canary-placeholder/canary-placeholder';

/**
 * Canary Refactor — Dummy placeholder page.
 *
 * This section mirrors the Dev Witness pages but progressively replaces
 * vendored production components with canary-stage library components.
 * The Dummy page exists to validate the section structure and will be
 * replaced by real refactored pages as work progresses.
 */
const meta: Meta = {
  title: 'Canary Refactor/Dummy',
  parameters: {
    layout: 'padded',
    docs: {
      description: {
        component:
          'Placeholder page in the Canary Refactor section. This section will hold pages that mirror Dev Witness but use canary components instead of vendored production code.',
      },
    },
  },
};

export default meta;
type Story = StoryObj;

export const Default: Story = {
  render: () => (
    <div className="flex flex-col gap-6 p-8">
      <div className="flex flex-col gap-2">
        <h1 className="text-2xl font-bold text-amber-800">Canary Refactor</h1>
        <p className="text-sm text-amber-600">
          This section mirrors the Dev Witness pages, progressively replacing vendored production
          components with canary-stage library components. Each page here validates that canary
          components can replace their production counterparts without visual or functional
          regressions.
        </p>
      </div>
      <div className="rounded-lg border border-dashed border-amber-400 bg-amber-50 p-6">
        <h2 className="mb-3 text-lg font-semibold text-amber-800">Work in Progress</h2>
        <p className="mb-4 text-sm text-amber-600">
          No pages have been refactored yet. As canary components are built, corresponding pages
          will appear here alongside their Dev Witness originals for comparison.
        </p>
        <div className="flex gap-3">
          <CanaryAtomPlaceholder label="Sample Canary Component" />
        </div>
      </div>
    </div>
  ),
  play: async ({ canvasElement }) => {
    const canvas = within(canvasElement);
    await expect(canvas.getByText('Canary Refactor')).toBeInTheDocument();
    await expect(canvas.getByText('Sample Canary Component')).toBeInTheDocument();
  },
};

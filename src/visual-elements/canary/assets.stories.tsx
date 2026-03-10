import type { Meta, StoryObj } from '@storybook/react-vite';
import { expect, within } from 'storybook/test';

const meta: Meta = {
  title: 'Visual Elements/Canary/Brand Assets',
};

export default meta;
type Story = StoryObj;

interface AssetCardProps {
  src: string;
  label: string;
}

function AssetCard({ src, label }: AssetCardProps) {
  const isSvg = src.endsWith('.svg');
  return (
    <div className="flex flex-col items-center gap-2 p-4 rounded-lg border border-border bg-background">
      <div className="w-full h-32 flex items-center justify-center bg-neutral-100 rounded-md p-3">
        <img
          src={src}
          alt={label}
          className="max-w-full max-h-full object-contain"
          style={isSvg ? { minWidth: 40, minHeight: 40 } : undefined}
        />
      </div>
      <span className="text-xs text-muted-foreground font-mono text-center break-all leading-tight">
        {label}
      </span>
    </div>
  );
}

function AssetGroup({ title, assets }: { title: string; assets: AssetCardProps[] }) {
  return (
    <div className="mb-8">
      <h3 className="text-lg font-bold text-foreground mb-3 border-b border-border pb-2">
        {title}
      </h3>
      <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-4 gap-4">
        {assets.map((asset) => (
          <AssetCard key={asset.label} {...asset} />
        ))}
      </div>
    </div>
  );
}

export const Gallery: Story = {
  play: async ({ canvasElement }) => {
    const canvas = within(canvasElement);
    await expect(canvas.getByText('Brand Assets')).toBeInTheDocument();
  },
  render: () => (
    <div className="p-6 max-w-5xl">
      <h2 className="text-2xl font-bold text-foreground mb-6">Brand Assets</h2>

      <AssetGroup
        title="Brand Logos"
        assets={[
          { src: '/canary/images/arda-logo-dark.svg', label: 'arda-logo-dark.svg' },
          { src: '/canary/images/arda-logo-light.svg', label: 'arda-logo-light.svg' },
          { src: '/canary/images/arda-logo-small-dark.svg', label: 'arda-logo-small-dark.svg' },
          { src: '/canary/images/arda-logo-small-light.svg', label: 'arda-logo-small-light.svg' },
        ]}
      />

      <AssetGroup
        title="Monochrome Logos"
        assets={[
          { src: '/canary/images/arda-logo-mono-dark.svg', label: 'arda-logo-mono-dark.svg' },
          { src: '/canary/images/arda-logo-mono-light.svg', label: 'arda-logo-mono-light.svg' },
          {
            src: '/canary/images/arda-logo-small-mono-dark.svg',
            label: 'arda-logo-small-mono-dark.svg',
          },
          {
            src: '/canary/images/arda-logo-small-mono-light.svg',
            label: 'arda-logo-small-mono-light.svg',
          },
        ]}
      />

      <AssetGroup
        title="Placeholders"
        assets={[
          { src: '/canary/images/avatar-placeholder.jpg', label: 'avatar-placeholder.jpg' },
          { src: '/canary/images/imageExampleCard.png', label: 'imageExampleCard.png' },
          {
            src: '/canary/images/Addtoorderqueueanimation.svg',
            label: 'Addtoorderqueueanimation.svg',
          },
          { src: '/canary/images/Puddle1.svg', label: 'Puddle1.svg' },
        ]}
      />
    </div>
  ),
};

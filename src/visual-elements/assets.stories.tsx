import type { Meta, StoryObj } from '@storybook/react-vite';
import { expect, within } from 'storybook/test';

const meta: Meta = {
  title: 'Styles/Stable/Brand Assets',
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
    <div className="flex flex-col items-center gap-2 p-4 rounded-lg border border-border bg-white">
      <div className="w-full h-32 flex items-center justify-center bg-table-header-bg rounded-md p-3">
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
        title="Logos"
        assets={[
          { src: '/images/ArdaLogoV1.svg', label: 'ArdaLogoV1.svg' },
          { src: '/images/ArdaLogoBlack.svg', label: 'ArdaLogoBlack.svg' },
          { src: '/images/ArdaLogoMobileV1.svg', label: 'ArdaLogoMobileV1.svg' },
          { src: '/images/ArdaLogoBlackMobile.svg', label: 'ArdaLogoBlackMobile.svg' },
          { src: '/images/ArdaTempLogo.svg', label: 'ArdaTempLogo.svg' },
          { src: '/images/ArdaTempLogoMobile.svg', label: 'ArdaTempLogoMobile.svg' },
          { src: '/images/LogoArdaGris.svg', label: 'LogoArdaGris.svg' },
          { src: '/images/LogoArdaGrisShort.svg', label: 'LogoArdaGrisShort.svg' },
          { src: '/images/LogoArdaGrisv2.svg', label: 'LogoArdaGrisv2.svg' },
          { src: '/images/logoArdaCards.svg', label: 'logoArdaCards.svg' },
          { src: '/images/ShadcnDesignLogo.svg', label: 'ShadcnDesignLogo.svg' },
        ]}
      />

      <AssetGroup
        title="Theme Indicators"
        assets={[
          { src: '/images/theme-light.svg', label: 'theme-light.svg' },
          { src: '/images/theme-dark.svg', label: 'theme-dark.svg' },
          { src: '/images/theme-system.svg', label: 'theme-system.svg' },
        ]}
      />

      <AssetGroup
        title="Branding"
        assets={[
          { src: '/images/QRC.svg', label: 'QRC.svg' },
          { src: '/images/SidebarFooter.svg', label: 'SidebarFooter.svg' },
          { src: '/images/imageExampleCard.png', label: 'imageExampleCard.png' },
          { src: '/images/PlaceholderVideo.svg', label: 'PlaceholderVideo.svg' },
        ]}
      />

      <AssetGroup
        title="Decorative"
        assets={[
          { src: '/images/Puddle1.svg', label: 'Puddle1.svg' },
          { src: '/images/Puddle2.svg', label: 'Puddle2.svg' },
          { src: '/images/Puddle3.svg', label: 'Puddle3.svg' },
          { src: '/images/Puddle4.svg', label: 'Puddle4.svg' },
          {
            src: '/images/Addtoorderqueueanimation.svg',
            label: 'Addtoorderqueueanimation.svg',
          },
          {
            src: '/images/Variant=Overlapping boxes.svg',
            label: 'Variant=Overlapping boxes.svg',
          },
        ]}
      />
    </div>
  ),
};

import type { Meta, StoryObj } from '@storybook/react';

const meta: Meta = {
  title: 'Visual Elements/Brand Assets',
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
    <div className="flex flex-col items-center gap-2 p-4 rounded-lg border border-[#E5E5E5] bg-white">
      <div className="w-full h-32 flex items-center justify-center bg-[#F9FAFB] rounded-md p-3">
        <img
          src={src}
          alt={label}
          className="max-w-full max-h-full object-contain"
          style={isSvg ? { minWidth: 40, minHeight: 40 } : undefined}
        />
      </div>
      <span className="text-[11px] text-[#737373] font-mono text-center break-all leading-tight">
        {label}
      </span>
    </div>
  );
}

function AssetGroup({ title, assets }: { title: string; assets: AssetCardProps[] }) {
  return (
    <div className="mb-8">
      <h3 className="text-lg font-bold text-[#0A0A0A] mb-3 border-b border-[#E5E5E5] pb-2">
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
  render: () => (
    <div className="p-6 max-w-5xl">
      <h2 className="text-2xl font-bold text-[#0A0A0A] mb-6">Brand Assets</h2>

      <AssetGroup
        title="Logos"
        assets={[
          { src: '/images/arda/ArdaLogoV1.svg', label: 'ArdaLogoV1.svg' },
          { src: '/images/arda/ArdaLogoBlack.svg', label: 'ArdaLogoBlack.svg' },
          { src: '/images/arda/ArdaLogoMobileV1.svg', label: 'ArdaLogoMobileV1.svg' },
          { src: '/images/arda/ArdaLogoBlackMobile.svg', label: 'ArdaLogoBlackMobile.svg' },
          { src: '/images/arda/ArdaTempLogo.svg', label: 'ArdaTempLogo.svg' },
          { src: '/images/arda/ArdaTempLogoMobile.svg', label: 'ArdaTempLogoMobile.svg' },
          { src: '/images/arda/LogoArdaGris.svg', label: 'LogoArdaGris.svg' },
          { src: '/images/arda/LogoArdaGrisShort.svg', label: 'LogoArdaGrisShort.svg' },
          { src: '/images/arda/LogoArdaGrisv2.svg', label: 'LogoArdaGrisv2.svg' },
          { src: '/images/arda/logoArdaCards.svg', label: 'logoArdaCards.svg' },
          { src: '/images/arda/ShadcnDesignLogo.svg', label: 'ShadcnDesignLogo.svg' },
        ]}
      />

      <AssetGroup
        title="Theme Indicators"
        assets={[
          { src: '/images/arda/theme-light.svg', label: 'theme-light.svg' },
          { src: '/images/arda/theme-dark.svg', label: 'theme-dark.svg' },
          { src: '/images/arda/theme-system.svg', label: 'theme-system.svg' },
        ]}
      />

      <AssetGroup
        title="Branding"
        assets={[
          { src: '/images/arda/QRC.svg', label: 'QRC.svg' },
          { src: '/images/arda/SidebarFooter.svg', label: 'SidebarFooter.svg' },
          { src: '/images/arda/imageExampleCard.png', label: 'imageExampleCard.png' },
          { src: '/images/arda/PlaceholderVideo.svg', label: 'PlaceholderVideo.svg' },
        ]}
      />

      <AssetGroup
        title="Decorative"
        assets={[
          { src: '/images/arda/Puddle1.svg', label: 'Puddle1.svg' },
          { src: '/images/arda/Puddle2.svg', label: 'Puddle2.svg' },
          { src: '/images/arda/Puddle3.svg', label: 'Puddle3.svg' },
          { src: '/images/arda/Puddle4.svg', label: 'Puddle4.svg' },
          { src: '/images/arda/Addtoorderqueueanimation.svg', label: 'Addtoorderqueueanimation.svg' },
          { src: '/images/arda/Variant=Overlapping boxes.svg', label: 'Variant=Overlapping boxes.svg' },
        ]}
      />
    </div>
  ),
};

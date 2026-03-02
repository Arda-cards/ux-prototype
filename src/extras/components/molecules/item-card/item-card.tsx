import { PackageMinus, MapPin, Package, ShoppingCart } from 'lucide-react';

/** Design-time configuration — content and layout set when composing the card. */
export interface ArdaItemCardStaticConfig {
  /** Item display name. */
  title: string;
  /** Minimum reorder quantity. */
  minQty?: string;
  /** Unit of measure for minimum quantity. */
  minUnit?: string;
  /** Physical storage location code. */
  location?: string;
  /** Standard order quantity. */
  orderQty?: string;
  /** Unit of measure for order quantity. */
  orderUnit?: string;
  /** Preferred supplier name. */
  supplier?: string;
  /** Stock keeping unit identifier. */
  sku?: string;
  /** Product image URL. Falls back to a placeholder if not provided. */
  image?: string;
  /** This card's position in a set (e.g. 1 of 3). */
  cardIndex?: number;
  /** Total number of cards in the set. */
  totalCards?: number;
  /** Free-text notes displayed below the header. */
  cardNotes?: string;
}

/** Runtime configuration — properties that may change based on application state. */
export interface ArdaItemCardRuntimeConfig {
  /** Current item status displayed as a diagonal sash (e.g. "Low Stock", "Reorder"). */
  status?: string;
}

/** Combined props for ArdaItemCard. */
export interface ArdaItemCardProps extends ArdaItemCardStaticConfig, ArdaItemCardRuntimeConfig {}

export function ArdaItemCard({
  title,
  minQty = '2',
  minUnit = 'ea',
  location = 'A-12-3',
  orderQty = '2',
  orderUnit = 'ea',
  supplier = 'Sample Supplier',
  sku = 'SKU-123456',
  image,
  cardIndex = 1,
  totalCards = 1,
  status,
  cardNotes,
}: ArdaItemCardProps) {
  const safeImageSrc =
    image || 'https://images.unsplash.com/photo-1581091226825-a6a2a5aee158?w=400&h=300&fit=crop';

  return (
    <div className="relative w-[348px] max-w-full rounded-md border-2 border-border shadow-[0px_4px_6px_rgba(0,0,0,0.09)] px-4 py-2.5 flex flex-col gap-2 font-sans bg-white">
      {/* Card State Sash */}
      {status && (
        <div className="absolute top-8 -right-8 rotate-45 bg-primary text-primary-foreground text-2xs font-bold px-10 py-1 shadow-sm z-10 uppercase tracking-wider">
          {status}
        </div>
      )}

      {/* Header */}
      <div className="flex items-start justify-between">
        <div className="flex-1 min-w-0">
          <h2 className="font-extrabold text-2xl text-foreground leading-7 truncate">{title}</h2>
        </div>
        <img
          src="/images/arda/QRC.svg"
          alt="QR"
          className="w-10 h-10 object-contain ml-3 flex-shrink-0"
        />
      </div>

      {/* Card Notes */}
      {cardNotes && (
        <div className="text-sm text-foreground leading-4 opacity-80 italic">{cardNotes}</div>
      )}

      {/* Accent Divider */}
      <div className="w-full h-1 bg-accent-blue" />

      {/* Attribute Blocks */}
      <div className="space-y-2">
        {[
          { icon: PackageMinus, label: 'Minimum', value: `${minQty} ${minUnit}` },
          { icon: MapPin, label: 'Location', value: location },
          { icon: Package, label: 'Order', value: `${orderQty} ${orderUnit}` },
          { icon: ShoppingCart, label: 'Supplier', value: supplier },
        ].map((section, idx) => (
          <div key={idx} className="flex gap-2.5 items-start">
            <div className="w-9 flex flex-col items-center flex-shrink-0">
              <section.icon className="w-6 h-6 text-black" />
              <span className="text-2xs text-black font-bold uppercase tracking-tight mt-0.5">
                {section.label}
              </span>
            </div>
            <div className="flex-1 text-sm text-foreground leading-5 font-semibold pt-0.5">
              {section.value}
            </div>
          </div>
        ))}
      </div>

      {/* Product Image Area */}
      <div className="w-full mt-1">
        <div className="relative w-full aspect-[4/3] overflow-hidden rounded-md flex items-center justify-center bg-secondary border border-border">
          <img src={safeImageSrc} alt={title} className="w-full h-full object-cover" />
          {/* Card number overlay */}
          <div className="absolute bottom-0 left-0 bg-white rounded-tr-md px-2 py-0.5 text-xs font-bold text-foreground">
            Card {cardIndex} of {totalCards}
          </div>
          {/* Serial Number overlay */}
          <div className="absolute bottom-0 right-0 bg-white rounded-tl-md px-2 py-0.5 text-xs font-bold text-foreground">
            {sku}
          </div>
        </div>
      </div>

      {/* Bottom accent */}
      <div className="w-full h-2 bg-accent-blue rounded-sm" />

      {/* Footer Branding */}
      <div className="text-center py-1">
        <img
          src="/images/arda/logoArdaCards.svg"
          alt="Arda"
          className="mx-auto h-6 w-auto opacity-80"
        />
      </div>
    </div>
  );
}

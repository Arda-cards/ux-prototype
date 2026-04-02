import * as React from 'react';
import { PackageMinus, Package, Crop } from 'lucide-react';

import { ImageDropZone } from '@/components/canary/molecules/image-drop-zone/image-drop-zone';
import { ImageUploadDialog } from '@/components/canary/organisms/shared/image-upload-dialog/image-upload-dialog';
import { Input } from '@/components/canary/primitives/input';
import type {
  ImageFieldConfig,
  ImageInput,
  ImageUploadResult,
} from '@/types/canary/utilities/image-field-config';

// --- Interfaces ---

/** Field values for the item card. */
export interface ItemCardFields {
  title: string;
  minQty: string;
  minUnit: string;
  orderQty: string;
  orderUnit: string;
  imageUrl: string | null;
}

/** Init configuration for ItemCardEditor. */
export interface ItemCardEditorInitProps {
  /** Image field configuration (accepted formats, aspect ratio, etc.). */
  imageConfig: ImageFieldConfig;
}

/** Runtime props for ItemCardEditor. */
export interface ItemCardEditorRuntimeProps {
  /** Current field values. */
  fields: ItemCardFields;
  /** Called when any field value changes. */
  onChange: (fields: ItemCardFields) => void;
  /** Called when an image is confirmed through the upload dialog. */
  onImageConfirmed?: (url: string) => void;
}

/** Combined props for ItemCardEditor. */
export type ItemCardEditorProps = ItemCardEditorInitProps & ItemCardEditorRuntimeProps;

// --- Component ---

/**
 * ItemCardEditor — WYSIWYG card editor for creating or editing inventory items.
 *
 * Renders an editable card preview with inline image upload. The card layout
 * matches the printed card output so the user sees exactly what they'll get.
 */
export function ItemCardEditor({
  imageConfig,
  fields,
  onChange,
  onImageConfirmed,
}: ItemCardEditorProps) {
  const [dialogOpen, setDialogOpen] = React.useState(false);
  const objectUrlRef = React.useRef<string | null>(null);

  // Revoke any object URL we created when the component unmounts.
  React.useEffect(() => {
    return () => {
      if (objectUrlRef.current) URL.revokeObjectURL(objectUrlRef.current);
    };
  }, []);

  const updateField = React.useCallback(
    <K extends keyof ItemCardFields>(key: K, value: ItemCardFields[K]) => {
      onChange({ ...fields, [key]: value });
    },
    [fields, onChange],
  );

  // New images go straight onto the card — no dialog.
  const handleDropZoneInput = React.useCallback(
    (input: ImageInput) => {
      if (input.type === 'error') return;

      // Revoke previous object URL before creating a new one.
      if (objectUrlRef.current) {
        URL.revokeObjectURL(objectUrlRef.current);
        objectUrlRef.current = null;
      }

      if (input.type === 'file') {
        const url = URL.createObjectURL(input.file);
        objectUrlRef.current = url;
        onChange({ ...fields, imageUrl: url });
        onImageConfirmed?.(url);
      } else if (input.type === 'url') {
        onChange({ ...fields, imageUrl: input.url });
        onImageConfirmed?.(input.url);
      }
    },
    [fields, onChange, onImageConfirmed],
  );

  const handleDialogConfirm = React.useCallback(
    (result: ImageUploadResult) => {
      onChange({ ...fields, imageUrl: result.imageUrl });
      setDialogOpen(false);
      onImageConfirmed?.(result.imageUrl);
    },
    [fields, onChange, onImageConfirmed],
  );

  const handleDialogCancel = React.useCallback(() => {
    setDialogOpen(false);
  }, []);

  const attributeSections = [
    {
      icon: PackageMinus,
      label: 'Minimum',
      qtyKey: 'minQty' as const,
      unitKey: 'minUnit' as const,
      qtyPlaceholder: 'Min qty',
      unitPlaceholder: 'Units',
    },
    {
      icon: Package,
      label: 'Order',
      qtyKey: 'orderQty' as const,
      unitKey: 'orderUnit' as const,
      qtyPlaceholder: 'Order qty',
      unitPlaceholder: 'Units',
    },
  ];

  return (
    <>
      <div
        data-slot="item-card-editor"
        className="relative w-[348px] max-w-full rounded-xl border border-border bg-card text-card-foreground shadow-sm px-5 py-4 flex flex-col gap-3 font-sans"
      >
        {/* Header — editable title + QR code */}
        <div className="flex items-start justify-between gap-3">
          <div className="flex-1 min-w-0">
            <Input
              placeholder="Item name*"
              value={fields.title}
              onChange={(e) => updateField('title', e.target.value)}
              className="font-extrabold text-lg h-10 rounded-lg border-input"
            />
          </div>
          <div className="flex flex-col items-center flex-shrink-0 h-10 justify-between">
            <img src="/images/qr-code.png" alt="QR" className="w-7 h-7 object-contain" />
            <span className="text-[9px] font-semibold text-muted-foreground leading-none">
              Arda
            </span>
          </div>
        </div>

        {/* Accent Divider */}
        <div className="w-full h-1 rounded-full bg-muted" />

        {/* Attribute Blocks — editable inputs */}
        <div className="space-y-2">
          {attributeSections.map((section) => (
            <div key={section.label} className="flex gap-3 items-center">
              <div className="w-10 flex flex-col items-center flex-shrink-0">
                <section.icon className="w-5 h-5 text-foreground" />
                <span className="text-[10px] text-foreground font-semibold uppercase tracking-tight mt-0.5">
                  {section.label}
                </span>
              </div>
              <div className="flex-1 flex gap-2">
                <Input
                  placeholder={section.qtyPlaceholder}
                  value={fields[section.qtyKey]}
                  onChange={(e) => updateField(section.qtyKey, e.target.value)}
                  className="text-sm h-9 rounded-lg"
                />
                <Input
                  placeholder={section.unitPlaceholder}
                  value={fields[section.unitKey]}
                  onChange={(e) => updateField(section.unitKey, e.target.value)}
                  className="text-sm h-9 rounded-lg"
                />
              </div>
            </div>
          ))}
        </div>

        {/* Product Image Area — drop zone or image */}
        <div className="w-full">
          {fields.imageUrl ? (
            <div
              className="relative w-full overflow-hidden rounded-lg border border-border"
              style={{ aspectRatio: imageConfig.aspectRatio }}
            >
              <img
                src={fields.imageUrl}
                alt={fields.title || 'Product'}
                className="w-full h-full object-cover"
              />
              <button
                type="button"
                className="absolute inset-0 bg-black/0 hover:bg-black/20 focus-visible:bg-black/20 transition-colors flex items-center justify-center opacity-0 hover:opacity-100 focus-visible:opacity-100 focus-visible:outline-none"
                onClick={() => setDialogOpen(true)}
                aria-label="Replace image"
              >
                <span className="text-white text-xs font-medium bg-black/50 rounded px-2 py-1 inline-flex items-center gap-1">
                  <Crop className="w-3 h-3" />
                  Click to edit/replace
                </span>
              </button>
            </div>
          ) : (
            <ImageDropZone
              acceptedFormats={imageConfig.acceptedFormats}
              onInput={handleDropZoneInput}
            />
          )}
        </div>

        {/* Bottom accent */}
        <div className="w-full h-1.5 rounded-full bg-muted" />

        {/* Footer Branding */}
        <div className="text-center pb-1">
          <span className="text-xl font-black tracking-tight text-foreground">Arda</span>
        </div>
      </div>

      {/* Image Upload Dialog */}
      <ImageUploadDialog
        config={imageConfig}
        existingImageUrl={fields.imageUrl}
        open={dialogOpen}
        onConfirm={handleDialogConfirm}
        onCancel={handleDialogCancel}
      />
    </>
  );
}

/** Default empty fields for creating a new item. */
export const EMPTY_ITEM_CARD_FIELDS: ItemCardFields = {
  title: '',
  minQty: '',
  minUnit: '',
  orderQty: '',
  orderUnit: '',
  imageUrl: null,
};

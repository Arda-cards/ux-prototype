import * as React from 'react';
import { PackageMinus, Package, Crop, Trash2 } from 'lucide-react';

import { ColorPicker, getColorHex } from '@/components/canary/atoms/color-picker/color-picker';
import { ImageDropZone } from '@/components/canary/molecules/image-drop-zone/image-drop-zone';
import { ImageUploadDialog } from '@/components/canary/organisms/shared/image-upload-dialog/image-upload-dialog';
import { ArdaConfirmDialog } from '@/components/canary/atoms/confirm-dialog/confirm-dialog';
import { Button } from '@/components/canary/primitives/button';
import { Input } from '@/components/canary/primitives/input';
import {
  TypeaheadInput,
  type TypeaheadOption,
} from '@/components/canary/molecules/typeahead-input/typeahead-input';
import type {
  ImageFieldConfig,
  ImageInput,
  ImageUploadResult,
} from '@/types/canary/utilities/image-field-config';

import qrCodeDefaultUrl from './qr-code.png';

// --- Interfaces ---

/** Field values for the item card. */
export interface ItemCardFields {
  title: string;
  minQty: string;
  minUnit: string;
  orderQty: string;
  orderUnit: string;
  imageUrl: string | null;
  accentColor: string;
}

/** Init configuration for ItemCardEditor. */
export interface ItemCardEditorInitProps {
  /** Image field configuration (accepted formats, aspect ratio, etc.). */
  imageConfig: ImageFieldConfig;
  /** Async lookup for unit typeahead fields. */
  unitLookup: (search: string) => Promise<TypeaheadOption[]>;
}

/** Runtime props for ItemCardEditor. */
export interface ItemCardEditorRuntimeProps {
  /** Current field values. */
  fields: ItemCardFields;
  /** Called when any field value changes. */
  onChange: (fields: ItemCardFields) => void;
  /** Called when an image is confirmed through the upload dialog. */
  onImageConfirmed?: (url: string) => void;
  /**
   * Upload handler — forwarded to ImageUploadDialog's onUpload prop.
   * When omitted, the dialog uses its default stub (Storybook/dev).
   * Bridge pattern (Option B) — will be replaced by ImageUploadContext
   * (management#860) when the lifecycle framework (ux-prototype#77) lands.
   */
  onUpload?: (file: Blob) => Promise<string>;
  /**
   * Reachability check — forwarded to ImageUploadDialog's onCheckReachability.
   * Same bridge pattern as onUpload.
   */
  onCheckReachability?: (url: string) => Promise<boolean>;
  /**
   * Async resolver for the QR-code image shown in the card header.
   * When omitted (or when the promise rejects), a bundled default QR image
   * is used. The default is the static placeholder; consumers that have a
   * real per-item QR URL should pass a callback here. The host application
   * is responsible for determining which item's QR to fetch — typically by
   * closing over an item identifier in scope.
   */
  qrCodeUrl?: () => Promise<string>;
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
  unitLookup,
  fields,
  onChange,
  onImageConfirmed,
  onUpload,
  onCheckReachability,
  qrCodeUrl,
}: ItemCardEditorProps) {
  const [dialogOpen, setDialogOpen] = React.useState(false);
  const [confirmRemoveOpen, setConfirmRemoveOpen] = React.useState(false);
  const [resolvedQrSrc, setResolvedQrSrc] = React.useState<string>(qrCodeDefaultUrl);
  // Pending input forwarded to ImageUploadDialog when the user drops/selects
  // a new image via the card-side ImageDropZone. Cleared on confirm/cancel.
  const [pendingInput, setPendingInput] = React.useState<ImageInput | undefined>(undefined);

  // Resolve the QR image when a callback is provided. Falls back to the
  // bundled default on rejection or when no callback is given.
  React.useEffect(() => {
    if (!qrCodeUrl) {
      setResolvedQrSrc(qrCodeDefaultUrl);
      return;
    }
    let cancelled = false;
    qrCodeUrl()
      .then((url) => {
        if (!cancelled) setResolvedQrSrc(url);
      })
      .catch(() => {
        if (!cancelled) setResolvedQrSrc(qrCodeDefaultUrl);
      });
    return () => {
      cancelled = true;
    };
  }, [qrCodeUrl]);

  // Stable refs for values used in async callbacks to avoid stale closures.
  const fieldsRef = React.useRef(fields);
  fieldsRef.current = fields;
  const onChangeRef = React.useRef(onChange);
  onChangeRef.current = onChange;
  const onImageConfirmedRef = React.useRef(onImageConfirmed);
  onImageConfirmedRef.current = onImageConfirmed;

  const updateField = React.useCallback(
    <K extends keyof ItemCardFields>(key: K, value: ItemCardFields[K]) => {
      onChangeRef.current({ ...fieldsRef.current, [key]: value });
    },
    [],
  );

  // Drop-zone inputs route through the ImageUploadDialog so the user can
  // crop/zoom/rotate before committing (#750 issue 1). Error inputs are
  // surfaced inline by the ImageDropZone itself; the card just no-ops.
  // The dialog is responsible for any fetch/upload of the supplied input.
  const handleDropZoneInput = React.useCallback((input: ImageInput) => {
    if (input.type === 'error') return;
    setPendingInput(input);
    setDialogOpen(true);
  }, []);

  const handleRemoveImage = React.useCallback(() => {
    onChangeRef.current({ ...fieldsRef.current, imageUrl: null });
  }, []);

  const handleDialogConfirm = React.useCallback((result: ImageUploadResult) => {
    onChangeRef.current({ ...fieldsRef.current, imageUrl: result.imageUrl });
    setDialogOpen(false);
    setPendingInput(undefined);
    onImageConfirmedRef.current?.(result.imageUrl);
  }, []);

  const handleDialogCancel = React.useCallback(() => {
    setDialogOpen(false);
    setPendingInput(undefined);
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
        className="relative w-full sm:w-[348px] rounded-xl border border-border bg-card text-card-foreground shadow-sm px-4 sm:px-5 py-4 flex flex-col gap-3 font-sans"
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
            <img src={resolvedQrSrc} alt="QR" className="w-7 h-7 object-contain" />
            <span className="text-[9px] font-semibold text-muted-foreground leading-none">
              Arda
            </span>
          </div>
        </div>

        {/* Accent Divider */}
        <div
          className="w-full h-1 transition-colors"
          style={{ backgroundColor: getColorHex(fields.accentColor) }}
        />

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
                  className="text-sm h-9 rounded-lg w-[86px] flex-shrink-0"
                />
                <TypeaheadInput
                  value={fields[section.unitKey]}
                  onValueChange={(val) => updateField(section.unitKey, val)}
                  lookup={unitLookup}
                  allowCreate
                  placeholder={section.unitPlaceholder}
                  className="flex-1 min-w-0"
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
              <Button
                type="button"
                variant="ghost"
                size="icon"
                className="absolute top-1.5 left-1.5 z-10 rounded-full bg-black/50 hover:bg-destructive text-white hover:text-white"
                onClick={() => setConfirmRemoveOpen(true)}
                aria-label="Remove image"
              >
                <Trash2 className="w-4 h-4" />
              </Button>
              {/* Edit/replace overlay */}
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

        {/* Color Swatch Picker + accent bar */}
        <div className="flex items-center gap-2 w-full">
          <ColorPicker
            value={fields.accentColor}
            onValueChange={(color) => updateField('accentColor', color)}
          />
          <div
            className="flex-1 h-[10px] transition-colors"
            style={{ backgroundColor: getColorHex(fields.accentColor) }}
          />
        </div>

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
        {...(pendingInput ? { pendingInput } : {})}
        {...(onUpload ? { onUpload } : {})}
        {...(onCheckReachability ? { onCheckReachability } : {})}
      />

      {/* Confirm remove image */}
      <ArdaConfirmDialog
        title="Remove image?"
        message="This will remove the image from the card. You can add a new one at any time."
        confirmLabel="Remove"
        confirmVariant="destructive"
        open={confirmRemoveOpen}
        onConfirm={() => {
          handleRemoveImage();
          setConfirmRemoveOpen(false);
        }}
        onCancel={() => setConfirmRemoveOpen(false)}
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
  accentColor: 'GRAY',
};

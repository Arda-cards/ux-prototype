import * as React from 'react';
import { PackageMinus, Package, Crop, Trash2, Loader2 } from 'lucide-react';

import { ColorPicker, getColorHex } from '@/components/canary/atoms/color-picker/color-picker';
import { ImageDropZone } from '@/components/canary/molecules/image-drop-zone/image-drop-zone';
import { ImageUploadDialog } from '@/components/canary/organisms/shared/image-upload-dialog/image-upload-dialog';
import { ArdaConfirmDialog } from '@/components/canary/atoms/confirm-dialog/confirm-dialog';
import { Button } from '@/components/canary/primitives/button';
import { AutoFillField } from '@/components/canary/molecules/auto-fill-field';
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
import { useImageUploader } from '@/types/canary/utilities/image-uploader';

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
  /** Called when an image is confirmed (either via direct upload from the
   * drop zone, or via Accept in the edit-existing dialog). */
  onImageConfirmed?: (url: string) => void;
  /**
   * Optional callback invoked when a direct upload (file or URL) from the
   * card's drop zone fails. Hosts can use this to raise a toast alongside
   * the inline error that ItemCardEditor already shows in the drop-zone
   * slot.
   *
   * Note: upload/URL-upload/reachability themselves are consumed from the
   * surrounding `ImageUploadProvider` Context (5.0.0+) rather than as
   * per-callback props. Mount an `<ImageUploadProvider value={uploader}>`
   * at or above this component.
   */
  onUploadError?: (err: Error) => void;
  /**
   * Async resolver for the QR-code image shown in the card header.
   * When omitted (or when the promise rejects), a bundled default QR image
   * is used. The default is the static placeholder; consumers that have a
   * real per-item QR URL should pass a callback here. The host application
   * is responsible for determining which item's QR to fetch — typically by
   * closing over an item identifier in scope.
   */
  qrCodeUrl?: () => Promise<string>;
  /** Auto-fill indicators — shared source with per-field clear callbacks. */
  autoFill?: {
    source: string;
    iconColor?: string;
    fields: Partial<Record<keyof ItemCardFields, () => void>>;
  };
  /**
   * Identity key for the form instance currently being edited (e.g. an item
   * id, or `'new'` for an empty form). Whenever its value changes, the
   * editor reseeds its internal "user diverged ORDER from MINIMUM"
   * tracking from the current `fields`:
   *
   * - cells where `minQty === orderQty` (and `minUnit === orderUnit`) resume
   *   auto-mirroring on subsequent MINIMUM edits;
   * - cells that already differ are treated as user-diverged and stay
   *   independent until reseed.
   *
   * Required for any host that mounts the editor once and then loads data
   * asynchronously — `fields` arriving after mount does NOT by itself
   * change the touched flags. Bump this key on every load/duplicate/reset
   * path so the editor knows to re-derive.
   */
  formInstanceKey?: string | number;
}

/** Combined props for ItemCardEditor. */
export type ItemCardEditorProps = ItemCardEditorInitProps & ItemCardEditorRuntimeProps;

// --- Upload state (local to the drop-zone slot) ---

type UploadState = { name: 'Idle' } | { name: 'Uploading' } | { name: 'Error'; message: string };

// --- Component ---

/**
 * ItemCardEditor — WYSIWYG card editor for creating or editing inventory items.
 *
 * Renders an editable card preview with inline image upload. The card layout
 * matches the printed card output so the user sees exactly what they'll get.
 *
 * Drop-zone upload flow (#750 issue 1 completion):
 *
 * - Drop a file → calls `onUpload(file)` directly, replaces drop zone with a
 *   spinner until the CDN URL returns, then renders the image. No dialog.
 * - Drop a URL → calls `onUploadFromUrl(url)` (same pattern).
 * - On failure: inline error banner in the drop-zone slot with a "Try again"
 *   affordance. Dropping another file also dismisses the error.
 *
 * The cropper/editor is reached via the hover overlay on an existing image
 * ("Click to edit/replace"), which opens the `ImageUploadDialog` in its
 * `EditExisting` phase.
 */
export function ItemCardEditor({
  imageConfig,
  unitLookup,
  fields,
  onChange,
  onImageConfirmed,
  onUploadError,
  qrCodeUrl,
  autoFill,
  formInstanceKey,
}: ItemCardEditorProps) {
  const uploader = useImageUploader();
  const [dialogOpen, setDialogOpen] = React.useState(false);
  const [confirmRemoveOpen, setConfirmRemoveOpen] = React.useState(false);
  const [resolvedQrSrc, setResolvedQrSrc] = React.useState<string>(qrCodeDefaultUrl);
  const [uploadState, setUploadState] = React.useState<UploadState>({ name: 'Idle' });

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
  const uploaderRef = React.useRef(uploader);
  uploaderRef.current = uploader;
  const onUploadErrorRef = React.useRef(onUploadError);
  onUploadErrorRef.current = onUploadError;

  // Track whether the user has manually diverged the ORDER side of the card
  // from MINIMUM, per-cell (qty and unit independent). While a cell is not
  // touched, MINIMUM edits auto-mirror into ORDER. Seeded from the initial
  // `fields` and reseeded whenever `formInstanceKey` changes.
  const orderQtyTouchedRef = React.useRef(fields.minQty !== fields.orderQty);
  const orderUnitTouchedRef = React.useRef(fields.minUnit !== fields.orderUnit);

  // Reseed from the current `fields` prop on form-identity changes. We omit
  // `fields` from deps intentionally — async `fields` updates that arrive
  // without an identity bump must NOT silently re-derive touched flags (that
  // would let a host's just-typed values reset divergence tracking).
  React.useEffect(() => {
    orderQtyTouchedRef.current = fields.minQty !== fields.orderQty;
    orderUnitTouchedRef.current = fields.minUnit !== fields.orderUnit;
  }, [formInstanceKey]);

  const updateField = React.useCallback(
    <K extends keyof ItemCardFields>(key: K, value: ItemCardFields[K]) => {
      const current = fieldsRef.current;

      // ORDER edits: mark the matching cell as diverged once the user
      // changes it to a value that differs from the current MINIMUM.
      if (key === 'orderQty' && value !== current.minQty) {
        orderQtyTouchedRef.current = true;
      } else if (key === 'orderUnit' && value !== current.minUnit) {
        orderUnitTouchedRef.current = true;
      }

      // MINIMUM edits: auto-mirror into ORDER while the matching cell is
      // still linked. Emits a single `onChange` with both fields set.
      if (key === 'minQty' && !orderQtyTouchedRef.current) {
        onChangeRef.current({
          ...current,
          minQty: value as string,
          orderQty: value as string,
        });
        return;
      }
      if (key === 'minUnit' && !orderUnitTouchedRef.current) {
        onChangeRef.current({
          ...current,
          minUnit: value as string,
          orderUnit: value as string,
        });
        return;
      }

      onChangeRef.current({ ...current, [key]: value });
    },
    [],
  );

  const autoFillRef = React.useRef(autoFill);
  autoFillRef.current = autoFill;

  const commitImageUrl = React.useCallback((url: string) => {
    onChangeRef.current({ ...fieldsRef.current, imageUrl: url });
    onImageConfirmedRef.current?.(url);
    autoFillRef.current?.fields.imageUrl?.();
  }, []);

  // Direct upload: no dialog, no cropper. The user drops → we upload →
  // image appears on the card. Errors surface inline in the drop-zone slot.
  //
  // The `ImageUploader` is consumed from the surrounding
  // `ImageUploadProvider` Context. If no provider is mounted, the default
  // stub uploader is used — stories and dev harnesses work out of the box.
  const handleDropZoneInput = React.useCallback(
    async (input: ImageInput) => {
      // `error` inputs are already surfaced inline by ImageDropZone.
      if (input.type === 'error') return;

      const doUpload: () => Promise<string> =
        input.type === 'file'
          ? () => uploaderRef.current.uploadFile(input.file)
          : () => uploaderRef.current.uploadFromUrl(input.url);

      setUploadState({ name: 'Uploading' });
      try {
        const cdnUrl = await doUpload();
        setUploadState({ name: 'Idle' });
        commitImageUrl(cdnUrl);
      } catch (err) {
        const error = err instanceof Error ? err : new Error('Upload failed');
        setUploadState({ name: 'Error', message: error.message });
        onUploadErrorRef.current?.(error);
      }
    },
    [commitImageUrl],
  );

  const handleTryAgain = React.useCallback(() => {
    setUploadState({ name: 'Idle' });
  }, []);

  const handleRemoveImage = React.useCallback(() => {
    onChangeRef.current({ ...fieldsRef.current, imageUrl: null });
    autoFillRef.current?.fields.imageUrl?.();
  }, []);

  const handleDialogConfirm = React.useCallback((result: ImageUploadResult) => {
    onChangeRef.current({ ...fieldsRef.current, imageUrl: result.imageUrl });
    setDialogOpen(false);
    onImageConfirmedRef.current?.(result.imageUrl);
  }, []);

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
        className="relative w-full sm:w-[348px] rounded-xl border border-border bg-card text-card-foreground shadow-sm px-4 sm:px-5 py-4 flex flex-col gap-3 font-sans"
      >
        {/* Header — editable title + QR code */}
        <div className="flex items-start justify-between gap-3">
          <AutoFillField
            {...(autoFill?.fields.title
              ? { source: autoFill.source, onClear: autoFill.fields.title }
              : {})}
            {...(autoFill?.iconColor ? { iconColor: autoFill.iconColor } : {})}
            className="flex-1 min-w-0"
          >
            <Input
              placeholder="Item name*"
              value={fields.title}
              onChange={(e) => updateField('title', e.target.value)}
              className="font-extrabold text-lg h-10 rounded-lg border-input"
            />
          </AutoFillField>
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

        {/* Product Image Area — image, drop zone, uploading spinner, or error */}
        <AutoFillField
          {...(autoFill?.fields.imageUrl
            ? { source: autoFill.source, dismissOn: 'manual' as const }
            : {})}
          {...(autoFill?.iconColor ? { iconColor: autoFill.iconColor } : {})}
          className="w-full"
        >
          {fields.imageUrl ? (
            <div
              className="relative w-full overflow-hidden rounded-lg border border-border"
              style={{ aspectRatio: imageConfig.aspectRatio }}
            >
              <img
                src={fields.imageUrl}
                alt={fields.title || 'Product'}
                className="w-full h-full object-contain"
              />
              <Button
                type="button"
                variant="ghost"
                size="icon"
                className="absolute top-1.5 left-1.5 z-10 w-9 h-9 rounded-full bg-black/50 hover:bg-destructive text-white hover:text-white"
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
          ) : uploadState.name === 'Uploading' ? (
            <div
              data-slot="item-card-editor-uploading"
              role="status"
              className="w-full flex flex-col items-center justify-center gap-2 rounded-lg border border-dashed border-border bg-muted/50 py-8"
              style={{ aspectRatio: imageConfig.aspectRatio }}
            >
              <Loader2 className="h-6 w-6 animate-spin text-muted-foreground" aria-hidden="true" />
              <span className="text-sm text-muted-foreground">Uploading image&#8230;</span>
            </div>
          ) : uploadState.name === 'Error' ? (
            <div
              data-slot="item-card-editor-upload-error"
              className="w-full flex flex-col items-center justify-center gap-3 rounded-lg border border-destructive/30 bg-destructive/5 px-4 py-6 text-center"
              style={{ aspectRatio: imageConfig.aspectRatio }}
            >
              <p className="text-sm text-destructive" role="alert">
                Upload failed: {uploadState.message}
              </p>
              <Button type="button" variant="secondary" size="sm" onClick={handleTryAgain}>
                Try again
              </Button>
            </div>
          ) : (
            <ImageDropZone
              acceptedFormats={imageConfig.acceptedFormats}
              onInput={handleDropZoneInput}
            />
          )}
        </AutoFillField>

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

      {/* Image Upload Dialog — edit-existing flow only (cropper, replace via
          Upload New Image, etc.). New-image uploads from the card's drop zone
          bypass this dialog entirely (see handleDropZoneInput above).
          The dialog consumes its uploader from the surrounding
          ImageUploadProvider Context — no per-callback wiring needed. */}
      <ImageUploadDialog
        config={imageConfig}
        existingImageUrl={fields.imageUrl}
        open={dialogOpen}
        onConfirm={handleDialogConfirm}
        onCancel={handleDialogCancel}
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

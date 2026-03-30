import * as React from 'react';
import { useDropzone, type FileRejection } from 'react-dropzone';
import { ImageUp } from 'lucide-react';
import heic2any from 'heic2any';

import { cn } from '@/types/canary/utilities/utils';
import { Button } from '@/components/canary/atoms/button/button';
import { Input } from '@/components/canary/primitives/input';
import type { ImageMimeType, ImageInput } from '@/types/canary/utilities/image-field-config';

const HEIC_TYPES: string[] = ['image/heic', 'image/heif'];

/** Convert HEIC/HEIF files to JPEG so browsers can render them. */
async function maybeConvertHeic(file: File): Promise<File> {
  if (!HEIC_TYPES.includes(file.type)) return file;

  const result = await heic2any({ blob: file, toType: 'image/jpeg', quality: 0.92 });
  const blob = Array.isArray(result) ? result[0]! : result;
  const name = file.name.replace(/\.hei[cf]$/i, '.jpg');
  return new File([blob], name, { type: 'image/jpeg' });
}

// --- Interfaces ---

/** Static configuration for ImageDropZone. */
export interface ImageDropZoneStaticProps {}

/** Init configuration for ImageDropZone. */
export interface ImageDropZoneInitProps {
  /** Accepted MIME types for file uploads. */
  acceptedFormats: ImageMimeType[];
}

/** Runtime props for ImageDropZone. */
export interface ImageDropZoneRuntimeProps {
  /** Called when the user provides an image input. */
  onInput: (input: ImageInput) => void;
  /** Called when the user dismisses the drop zone. */
  onDismiss: () => void;
}

/** Combined props for ImageDropZone. */
export type ImageDropZoneProps = ImageDropZoneStaticProps &
  ImageDropZoneInitProps &
  ImageDropZoneRuntimeProps;

// --- Component ---

/**
 * ImageDropZone &#8212; unified image input surface.
 *
 * Accepts images via drag-and-drop, file picker, clipboard paste, or URL entry.
 * Validates MIME types for files and HTTPS for URLs before calling `onInput`.
 */
export function ImageDropZone({ acceptedFormats, onInput }: ImageDropZoneProps) {
  const [urlValue, setUrlValue] = React.useState('');
  const [error, setError] = React.useState<string | null>(null);
  const [converting, setConverting] = React.useState(false);

  // --- File drop handler ---
  const onDrop = React.useCallback(
    async (acceptedFiles: File[], rejectedFiles: FileRejection[]) => {
      setError(null);

      if (rejectedFiles.length > 0) {
        const rejected = rejectedFiles[0];
        if (rejected !== undefined) {
          const mimeError = rejected.errors.find((e) => e.code === 'file-invalid-type');
          if (mimeError) {
            const formats = acceptedFormats.join(', ');
            setError(`Invalid file type. Accepted formats: ${formats}`);
            onInput({ type: 'error', message: `Invalid file type. Accepted formats: ${formats}` });
            return;
          }
        }
      }

      if (acceptedFiles.length > 0) {
        const file = acceptedFiles[0];
        if (file !== undefined) {
          if (!acceptedFormats.includes(file.type as ImageMimeType)) {
            const formats = acceptedFormats.join(', ');
            setError(`Invalid file type. Accepted formats: ${formats}`);
            onInput({ type: 'error', message: `Invalid file type. Accepted formats: ${formats}` });
            return;
          }
          setConverting(true);
          try {
            const converted = await maybeConvertHeic(file);
            onInput({ type: 'file', file: converted });
          } finally {
            setConverting(false);
          }
        }
      }
    },
    [acceptedFormats, onInput],
  );

  const { getRootProps, getInputProps, isDragActive, open } = useDropzone({
    onDrop,
    accept: acceptedFormats.reduce<Record<string, string[]>>((acc, mime) => {
      acc[mime] = [];
      return acc;
    }, {}),
    noClick: true,
    noKeyboard: true,
    multiple: false,
  });

  // --- Clipboard paste handler ---
  // Handles image data pasted from the clipboard (e.g. screenshot via Cmd+V).
  // When the paste target is the URL text input, we skip text-URL handling and
  // let the input's own onChange populate the field so the user can review the
  // URL and click "Go".
  const handlePaste = React.useCallback(
    (e: React.ClipboardEvent) => {
      setError(null);
      const items = e.clipboardData?.items;
      if (!items) return;

      // Always intercept image data from the clipboard, regardless of target.
      for (let i = 0; i < items.length; i++) {
        const item = items[i];
        if (item?.type.startsWith('image/')) {
          const file = item.getAsFile();
          if (file) {
            if (!acceptedFormats.includes(file.type as ImageMimeType)) {
              const formats = acceptedFormats.join(', ');
              setError(`Invalid file type. Accepted formats: ${formats}`);
              onInput({
                type: 'error',
                message: `Invalid file type. Accepted formats: ${formats}`,
              });
              return;
            }
            setConverting(true);
            void maybeConvertHeic(file).then((converted) => {
              onInput({ type: 'file', file: converted });
              setConverting(false);
            });
            return;
          }
        }
      }

      // If the paste originated from the URL text input, let the input's
      // onChange handle it normally — the user can review the value and submit
      // via "Go" or Enter.
      const target = e.target as HTMLElement;
      if (target.tagName === 'INPUT') return;

      // Paste landed on the drop-zone background — check for a URL in the text.
      const text = e.clipboardData?.getData('text/plain')?.trim();
      if (text && text.startsWith('https://')) {
        setUrlValue(text);
        onInput({ type: 'url', url: text });
        return;
      }

      // No image found in clipboard
      if (text) {
        setError('No image found in clipboard. Try pasting an image or an HTTPS URL.');
      }
    },
    [acceptedFormats, onInput],
  );

  // --- URL submission ---
  const handleUrlSubmit = React.useCallback(() => {
    setError(null);
    const trimmed = urlValue.trim();
    if (!trimmed) return;
    if (!trimmed.startsWith('https://')) {
      const msg = 'URL must start with https://';
      setError(msg);
      onInput({ type: 'error', message: msg });
      return;
    }
    onInput({ type: 'url', url: trimmed });
  }, [urlValue, onInput]);

  const handleUrlKeyDown = (e: React.KeyboardEvent<HTMLInputElement>) => {
    if (e.key === 'Enter') {
      handleUrlSubmit();
    }
  };



  // Merge react-dropzone's drop handler with our URL-drop handler.
  // When dragging an image from another browser window, dataTransfer.files may be
  // empty while dataTransfer contains the image source URL as text/uri-list or
  // text/plain.  Extract the URL eagerly (before react-dropzone can consume the
  // event), then use it as a fallback when no files are present.
  const rootProps = getRootProps();
  const dropzoneOnDrop = rootProps.onDrop;
  const handleDrop = React.useCallback(
    (e: React.DragEvent<HTMLDivElement>) => {
      // Capture URL data before any handler can alter the event.
      // text/uri-list (RFC 2483) may have comment lines (#…) and multiple URLs.
      const parseFirstUrl = (raw: string): string | undefined =>
        raw
          .split(/[\r\n]+/)
          .map((l) => l.trim())
          .find((l) => l.length > 0 && !l.startsWith('#'));

      const droppedUrl =
        parseFirstUrl(e.dataTransfer?.getData('text/uri-list') ?? '') ||
        parseFirstUrl(e.dataTransfer?.getData('text/plain') ?? '');

      // Let react-dropzone process file drops first.
      dropzoneOnDrop?.(e as unknown as React.DragEvent<HTMLElement>);

      // When no files are present (URL-only drop from another browser window),
      // populate the field and auto-submit valid HTTPS URLs.  The user already
      // expressed intent by dragging-and-dropping, so there is no reason to make
      // them also click "Go".
      if ((e.dataTransfer?.files.length ?? 0) === 0 && droppedUrl) {
        e.preventDefault();
        setError(null);
        setUrlValue(droppedUrl);

        if (droppedUrl.startsWith('https://')) {
          onInput({ type: 'url', url: droppedUrl });
        } else {
          setError('URL must start with https://');
        }
      }
    },
    [dropzoneOnDrop, onInput],
  );

  // Derive human-readable format list from accepted MIME types
  const formatLabels = acceptedFormats.map((mime) => mime.replace('image/', ''));

  return (
    <div
      data-slot="image-drop-zone"
      {...rootProps}
      onDrop={handleDrop}
      onPaste={handlePaste}
      className={cn(
        'border-2 border-dashed rounded-lg p-8 transition-colors',
        isDragActive ? 'border-primary bg-accent' : 'border-border bg-[var(--tailwind-colors-gray-50)]',
      )}
    >
      <input {...getInputProps()} />

      <div className="flex flex-col items-center gap-3 text-center">
        {/* Upload icon */}
        <ImageUp className="w-12 h-12 text-muted-foreground/60" strokeWidth={1.5} />

        {/* Heading */}
        <div>
          <p className="text-sm text-muted-foreground">Drop image or click to select</p>
          <p className="text-xs text-muted-foreground/70">({formatLabels.join(', ')})</p>
        </div>

        {/* Select file button */}
        <Button type="button" variant="outline" loading={converting} onClick={open}>
          Select file
        </Button>

        {/* Divider text */}
        <p className="text-sm text-muted-foreground">... or enter image URL</p>

        {/* URL input */}
        <Input
          type="text"
          placeholder="https://example.com/image.jpg"
          value={urlValue}
          onChange={(e) => {
            setUrlValue(e.target.value);
            setError(null);
          }}
          onKeyDown={handleUrlKeyDown}
          className="w-full"
        />

        {error && (
          <p className="text-sm text-destructive" role="alert">
            {error}
          </p>
        )}
      </div>
    </div>
  );
}

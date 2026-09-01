import * as React from 'react';
import { useDropzone, type FileRejection } from 'react-dropzone';
import { ImageUp } from 'lucide-react';

import { cn } from '@/types/canary/utilities/utils';
import { maybeConvertHeic } from '@/types/canary/utilities/maybe-convert-heic';
import { Button } from '@/components/canary/atoms/button/button';
import {
  InputGroup,
  InputGroupAddon,
  InputGroupButton,
  InputGroupInput,
} from '@/components/canary/atoms/input-group/input-group';
import type { ImageMimeType, ImageInput } from '@/types/canary/utilities/image-field-config';

// --- File acceptance ---

// Extensions per accepted MIME type, used both for the OS file picker (via
// useDropzone's `accept` map) and as a fallback when a platform reports an
// empty or unrecognized MIME type (notably Windows for .heic/.heif files).
const MIME_EXTENSIONS: Record<ImageMimeType, string[]> = {
  'image/jpeg': ['.jpg', '.jpeg'],
  'image/png': ['.png'],
  'image/webp': ['.webp'],
  'image/heic': ['.heic'],
  'image/heif': ['.heif'],
};

const EXTENSION_TO_MIME: Record<string, ImageMimeType> = Object.entries(MIME_EXTENSIONS).reduce(
  (acc, [mime, exts]) => {
    for (const ext of exts) acc[ext] = mime as ImageMimeType;
    return acc;
  },
  {} as Record<string, ImageMimeType>,
);

/**
 * A file is accepted when its MIME type is in `acceptedFormats`, or — when the
 * platform provided no usable MIME type (empty, or the generic
 * application/octet-stream) — its extension maps to one of them. Covers
 * platforms (e.g. Windows) that don't register a MIME type for HEIC/HEIF. A
 * concrete but unaccepted MIME type is trusted and rejected, whatever the
 * filename says.
 */
function isAcceptedImageFile(file: File, acceptedFormats: ImageMimeType[]): boolean {
  if (acceptedFormats.includes(file.type as ImageMimeType)) return true;
  if (file.type && file.type !== 'application/octet-stream') return false;

  const match = /\.[^.]+$/.exec(file.name.toLowerCase())?.[0];
  const mimeFromExtension = match ? EXTENSION_TO_MIME[match] : undefined;
  return mimeFromExtension !== undefined && acceptedFormats.includes(mimeFromExtension);
}

// --- Interfaces ---

/** Static configuration for ImageDropZone. */
export interface ImageDropZoneStaticProps {
  /** Accepted MIME types for file uploads — a system-defined constraint. */
  acceptedFormats: ImageMimeType[];
}

/** Init configuration for ImageDropZone. */
export interface ImageDropZoneInitProps {}

/** Runtime props for ImageDropZone. */
export interface ImageDropZoneRuntimeProps {
  /** Called when the user provides an image input. */
  onInput: (input: ImageInput) => void;
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
  // Tracks drop outcome — read by handleDrop to decide URL fallback behavior.
  const dropResultRef = React.useRef<string>('none');

  const reportError = React.useCallback(
    (message: string) => {
      setError(message);
      onInput({ type: 'error', message });
    },
    [onInput],
  );

  // Shared tail of every file intake: convert HEIC if needed, then emit.
  const convertAndEmit = React.useCallback(
    async (file: File, failureMessage: string) => {
      setConverting(true);
      try {
        const converted = await maybeConvertHeic(file);
        onInput({ type: 'file', file: converted });
      } catch {
        reportError(failureMessage);
      } finally {
        setConverting(false);
      }
    },
    [onInput, reportError],
  );

  // --- File drop handler ---
  const onDrop = React.useCallback(
    async (acceptedFiles: File[], rejectedFiles: FileRejection[]) => {
      setError(null);
      dropResultRef.current = 'none';

      const file = acceptedFiles[0];

      if (file === undefined) {
        if (rejectedFiles.length > 0) {
          // All files rejected — defer to handleDrop for URL fallback or error.
          dropResultRef.current = 'rejected';
        }
        return;
      }

      if (!isAcceptedImageFile(file, acceptedFormats)) {
        dropResultRef.current = 'rejected';
        return;
      }

      dropResultRef.current = 'handled';
      await convertAndEmit(file, 'Failed to process the dropped image. Please try again.');
    },
    [acceptedFormats, convertAndEmit],
  );

  const { getRootProps, getInputProps, isDragActive, open } = useDropzone({
    onDrop,
    accept: acceptedFormats.reduce<Record<string, string[]>>((acc, mime) => {
      acc[mime] = MIME_EXTENSIONS[mime];
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
            if (!isAcceptedImageFile(file, acceptedFormats)) {
              reportError(`Invalid file type. Accepted formats: ${acceptedFormats.join(', ')}`);
              return;
            }
            void convertAndEmit(file, 'Failed to process image from clipboard. Please try again.');
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
    [acceptedFormats, convertAndEmit, reportError, onInput],
  );

  // --- URL submission ---
  const handleUrlSubmit = React.useCallback(() => {
    setError(null);
    const trimmed = urlValue.trim();
    if (!trimmed) return;
    if (!trimmed.startsWith('https://')) {
      reportError('URL must start with https://');
      return;
    }
    onInput({ type: 'url', url: trimmed });
  }, [urlValue, onInput, reportError]);

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
    async (e: React.DragEvent<HTMLDivElement>) => {
      // Capture URL data before any handler can alter the event.
      // text/uri-list (RFC 2483) may have comment lines (#…) and multiple URLs.
      const parseFirstUrl = (raw: string): string | undefined =>
        raw
          .split(/[\r\n]+/)
          .map((l) => l.trim())
          .find((l) => l.length > 0 && !l.startsWith('#'));

      // Extract the best image URL from the drop data.
      // Priority: 1) data URI from text/html, 2) imgurl param from Google URLs,
      // 3) direct image URL from text/uri-list or text/plain.
      const html = e.dataTransfer?.getData('text/html') ?? '';
      const uriList = e.dataTransfer?.getData('text/uri-list') ?? '';
      const plainText = e.dataTransfer?.getData('text/plain') ?? '';

      // Try to extract a data URI or src from an <img> tag in the HTML
      const imgSrcMatch = html.match(/<img[^>]+src="([^"]+)"/);
      const imgSrc = imgSrcMatch?.[1];

      // Try to extract imgurl param from Google Images search URL
      const extractImgUrl = (url: string): string | undefined => {
        try {
          const parsed = new URL(url);
          const imgurl = parsed.searchParams.get('imgurl');
          return imgurl ?? undefined;
        } catch {
          return undefined;
        }
      };

      const rawUrl = parseFirstUrl(uriList) || parseFirstUrl(plainText);

      // Pick the best source: data URI > extracted Google imgurl > direct URL
      const droppedUrl =
        (imgSrc?.startsWith('data:image/') ? imgSrc : undefined) ||
        (rawUrl ? extractImgUrl(rawUrl) : undefined) ||
        (rawUrl?.match(/\.(jpg|jpeg|png|gif|webp|svg)(\?|$)/i) ? rawUrl : undefined) ||
        (imgSrc?.startsWith('https://') ? imgSrc : undefined);

      // Let react-dropzone process file drops first.
      dropResultRef.current = 'none';
      dropzoneOnDrop?.(e as unknown as React.DragEvent<HTMLElement>);

      // Read result after react-dropzone's synchronous onDrop callback ran.
      const result = dropResultRef.current;

      // If a file was successfully handled, we're done.
      if (result === 'handled') return;

      // Fall back to extracted image data when react-dropzone had no valid file
      // (URL-only drag, or files rejected due to wrong MIME like Google Images).
      if (droppedUrl) {
        e.preventDefault();
        setError(null);

        // Data URIs (from Google Images drag) — convert to File
        if (droppedUrl.startsWith('data:image/')) {
          try {
            const res = await fetch(droppedUrl);
            const blob = await res.blob();
            const ext = blob.type.split('/')[1] ?? 'jpg';
            const file = new File([blob], `dropped-image.${ext}`, { type: blob.type });
            onInput({ type: 'file', file });
          } catch {
            setError('Could not process the dropped image.');
          }
          return;
        }

        // HTTPS URLs — send as URL input
        if (droppedUrl.startsWith('https://')) {
          setUrlValue(droppedUrl);
          onInput({ type: 'url', url: droppedUrl });
        } else {
          setError('URL must start with https://');
        }
        return;
      }

      // No URL fallback and files were rejected — show error.
      if (result === 'rejected') {
        const formats = acceptedFormats.join(', ');
        setError(`Invalid file type. Accepted formats: ${formats}`);
        onInput({ type: 'error', message: `Invalid file type. Accepted formats: ${formats}` });
      }
    },
    [dropzoneOnDrop, onInput, acceptedFormats],
  );

  // Derive human-readable format list from accepted MIME types
  const formatLabels = acceptedFormats.map((mime) => mime.replace('image/', ''));

  return (
    <div
      data-slot="image-drop-zone"
      {...rootProps}
      onDrop={handleDrop}
      onPaste={handlePaste}
      tabIndex={0}
      className={cn(
        'border-2 border-dashed rounded-lg p-8 transition-colors focus-ring',
        isDragActive ? 'border-primary bg-accent' : 'border-border bg-muted',
      )}
    >
      <input {...getInputProps()} />

      <div className="flex flex-col items-center gap-3 text-center">
        {/* Upload icon */}
        <ImageUp className="w-12 h-12 text-muted-foreground/60" strokeWidth={1.5} />

        {/* Heading */}
        <div>
          <p className="text-sm text-muted-foreground">Drop image here</p>
          <p className="text-xs text-muted-foreground/70">({formatLabels.join(', ')})</p>
        </div>

        {/* Select file button */}
        <Button type="button" variant="outline" loading={converting} onClick={open}>
          Select file
        </Button>

        {/* Divider text */}
        <p className="text-sm text-muted-foreground">... or enter image URL</p>

        {/* URL input with Go button */}
        <InputGroup className="w-full bg-background">
          <InputGroupInput
            type="text"
            placeholder="https://example.com/image.jpg"
            value={urlValue}
            onChange={(e) => {
              setUrlValue(e.target.value);
              setError(null);
            }}
            onKeyDown={handleUrlKeyDown}
          />
          <InputGroupAddon align="inline-end">
            <InputGroupButton onClick={handleUrlSubmit} aria-label="Go" disabled={!urlValue.trim()}>
              Go
            </InputGroupButton>
          </InputGroupAddon>
        </InputGroup>

        {error && (
          <p className="text-sm text-destructive" role="alert">
            {error}
          </p>
        )}
      </div>
    </div>
  );
}

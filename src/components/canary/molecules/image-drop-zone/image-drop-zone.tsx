import * as React from 'react';
import { useDropzone, type FileRejection } from 'react-dropzone';

import { cn } from '@/types/canary/utilities/utils';
import { Button } from '@/components/canary/primitives/button';
import { Input } from '@/components/canary/primitives/input';
import type { ImageMimeType, ImageInput } from '@/types/canary/utilities/image-field-config';

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
export function ImageDropZone({ acceptedFormats, onInput, onDismiss }: ImageDropZoneProps) {
  const [urlValue, setUrlValue] = React.useState('');
  const [error, setError] = React.useState<string | null>(null);

  // --- File drop handler ---
  const onDrop = React.useCallback(
    (acceptedFiles: File[], rejectedFiles: FileRejection[]) => {
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
          onInput({ type: 'file', file });
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
            onInput({ type: 'file', file });
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

  const isUrlValid = urlValue.trim().startsWith('https://');

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

  return (
    <div
      data-slot="image-drop-zone"
      {...rootProps}
      onDrop={handleDrop}
      onPaste={handlePaste}
      className={cn(
        'border-2 border-dashed rounded-lg p-6 transition-colors',
        isDragActive ? 'border-primary bg-accent' : 'border-border bg-background',
      )}
    >
      <input {...getInputProps()} />

      <div className="flex flex-col items-center gap-4 text-center">
        <p className="text-sm text-muted-foreground">
          Drag and drop an image, paste from clipboard, or
        </p>

        <Button
          type="button"
          variant="default"
          className="bg-primary text-primary-foreground"
          onClick={open}
        >
          Upload from computer
        </Button>

        <div className="w-full flex gap-2">
          <Input
            type="text"
            placeholder="Or paste an image URL"
            value={urlValue}
            onChange={(e) => {
              setUrlValue(e.target.value);
              setError(null);
            }}
            onKeyDown={handleUrlKeyDown}
            className="flex-1"
          />
          <Button
            type="button"
            variant="default"
            className="bg-primary text-primary-foreground"
            onClick={handleUrlSubmit}
            disabled={!isUrlValid}
          >
            Go
          </Button>
        </div>

        {error && (
          <p className="text-sm text-destructive" role="alert">
            {error}
          </p>
        )}

        <button
          type="button"
          onClick={onDismiss}
          className="text-sm text-muted-foreground hover:text-foreground underline underline-offset-2 cursor-pointer bg-transparent border-0 p-0"
        >
          Dismiss
        </button>
      </div>
    </div>
  );
}

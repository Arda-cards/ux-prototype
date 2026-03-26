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
  const handlePaste = React.useCallback(
    (e: React.ClipboardEvent) => {
      setError(null);
      const items = e.clipboardData?.items;
      if (!items) return;

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

      // Check for pasted text that might be a URL
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
  // When dragging an image from another browser window, dataTransfer.files is
  // empty but dataTransfer contains the image URL as text/uri-list or text/plain.
  const rootProps = getRootProps();
  const dropzoneOnDrop = rootProps.onDrop;
  const handleDrop = React.useCallback(
    (e: React.DragEvent<HTMLDivElement>) => {
      // Let react-dropzone process file drops first
      dropzoneOnDrop?.(e as unknown as React.DragEvent<HTMLElement>);

      // If no files in the drop event, check for a URL
      if (e.dataTransfer?.files.length === 0) {
        const url = e.dataTransfer.getData('text/uri-list') || e.dataTransfer.getData('text/plain');
        const trimmed = url?.trim();
        if (trimmed && trimmed.startsWith('https://')) {
          e.preventDefault();
          setError(null);
          setUrlValue(trimmed);
          onInput({ type: 'url', url: trimmed });
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
            variant="secondary"
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

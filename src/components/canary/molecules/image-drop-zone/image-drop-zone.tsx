import * as React from 'react';
import { useDropzone } from 'react-dropzone';

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
 * ImageDropZone — unified image input surface.
 *
 * Accepts images via drag-and-drop, file picker, or URL entry.
 * Validates MIME types for files and HTTPS for URLs before calling `onInput`.
 */
export function ImageDropZone({ acceptedFormats, onInput, onDismiss }: ImageDropZoneProps) {
  const [urlValue, setUrlValue] = React.useState('');
  const [error, setError] = React.useState<string | null>(null);

  const onDrop = React.useCallback(
    (acceptedFiles: File[], rejectedFiles: { file: File; errors: { code: string }[] }[]) => {
      setError(null);

      if (rejectedFiles.length > 0) {
        const rejected = rejectedFiles[0];
        const mimeError = rejected.errors.find((e) => e.code === 'file-invalid-type');
        if (mimeError) {
          const formats = acceptedFormats.join(', ');
          setError(`Invalid file type. Accepted formats: ${formats}`);
          onInput({ type: 'error', message: `Invalid file type. Accepted formats: ${formats}` });
          return;
        }
      }

      if (acceptedFiles.length > 0) {
        const file = acceptedFiles[0];
        if (!acceptedFormats.includes(file.type as ImageMimeType)) {
          const formats = acceptedFormats.join(', ');
          setError(`Invalid file type. Accepted formats: ${formats}`);
          onInput({ type: 'error', message: `Invalid file type. Accepted formats: ${formats}` });
          return;
        }
        onInput({ type: 'file', file });
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

  const handleUrlKeyDown = (e: React.KeyboardEvent<HTMLInputElement>) => {
    if (e.key === 'Enter') {
      setError(null);
      const trimmed = urlValue.trim();
      if (!trimmed.startsWith('https://')) {
        const msg = 'URL must start with https://';
        setError(msg);
        onInput({ type: 'error', message: msg });
        return;
      }
      onInput({ type: 'url', url: trimmed });
    }
  };

  return (
    <div
      data-slot="image-drop-zone"
      {...getRootProps()}
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

        <div className="w-full">
          <Input
            type="text"
            placeholder="Or paste an image URL"
            value={urlValue}
            onChange={(e) => setUrlValue(e.target.value)}
            onKeyDown={handleUrlKeyDown}
          />
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

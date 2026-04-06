import * as React from 'react';
import Cropper, { type Area, type Point } from 'react-easy-crop';
import { RotateCw, RotateCcw, Undo2 } from 'lucide-react';

import { cn } from '@/types/canary/utilities/utils';
import { Slider } from '@/components/canary/primitives/slider';
import type { CropData } from '@/types/canary/utilities/image-field-config';

// --- Interfaces ---

/** Static configuration for ImagePreviewEditor. */
export interface ImagePreviewEditorStaticProps {
  /** Locked aspect ratio for the crop area (e.g. 1 for 1:1). */
  aspectRatio: number;
}

/** Init configuration for ImagePreviewEditor. */
export interface ImagePreviewEditorInitProps {}

/** Runtime props for ImagePreviewEditor. */
export interface ImagePreviewEditorRuntimeProps {
  /** Image source — File, Blob, blob URL, or HTTPS URL. */
  imageData: File | Blob | string;
  /** Called whenever crop position, zoom, or rotation changes. */
  onCropChange: (cropData: CropData) => void;
  /** Called when the user clicks Reset. */
  onReset: () => void;
}

/** Combined props for ImagePreviewEditor. */
export type ImagePreviewEditorProps = ImagePreviewEditorStaticProps &
  ImagePreviewEditorInitProps &
  ImagePreviewEditorRuntimeProps;

// --- Helpers ---

const TOOLBAR_BUTTON_CLASS = cn(
  'inline-flex items-center justify-center rounded-md p-2',
  'text-muted-foreground hover:text-foreground bg-transparent hover:bg-accent',
  'transition-colors cursor-pointer border-0',
  'focus-visible:ring-2 focus-visible:ring-ring focus-visible:outline-none',
);

// --- Component ---

/**
 * ImagePreviewEditor — crop and edit an image with a locked aspect ratio.
 *
 * Wraps react-easy-crop to provide crop, zoom, and rotation controls.
 * File and Blob inputs are converted to object URLs via URL.createObjectURL;
 * the URL is revoked on cleanup.
 */
export function ImagePreviewEditor({
  aspectRatio,
  imageData,
  onCropChange,
  onReset,
}: ImagePreviewEditorProps) {
  const [crop, setCrop] = React.useState<Point>({ x: 0, y: 0 });
  const [zoom, setZoom] = React.useState(1);
  const [rotation, setRotation] = React.useState(0);
  const [imageSrc, setImageSrc] = React.useState<string>('');

  // Convert File/Blob to object URL; plain string passes through.
  React.useEffect(() => {
    if (typeof imageData === 'string') {
      setImageSrc(imageData);
      return;
    }

    const url = URL.createObjectURL(imageData);
    setImageSrc(url);

    return () => {
      URL.revokeObjectURL(url);
    };
  }, [imageData]);

  const handleCropComplete = React.useCallback(
    (_croppedArea: Area, croppedAreaPixels: Area) => {
      onCropChange({
        pixelCrop: croppedAreaPixels,
        zoom,
        rotation,
      });
    },
    [onCropChange, zoom, rotation],
  );

  const handleZoomChange = React.useCallback(
    (values: number[]) => {
      const newZoom = values[0] ?? zoom;
      setZoom(newZoom);
      onCropChange({ pixelCrop: { x: 0, y: 0, width: 0, height: 0 }, zoom: newZoom, rotation });
    },
    [onCropChange, zoom, rotation],
  );

  const handleRotateCw = React.useCallback(() => {
    setRotation((prev) => {
      const next = (prev + 90) % 360;
      onCropChange({ pixelCrop: { x: 0, y: 0, width: 0, height: 0 }, zoom, rotation: next });
      return next;
    });
  }, [onCropChange, zoom]);

  const handleRotateCcw = React.useCallback(() => {
    setRotation((prev) => {
      const next = (prev - 90 + 360) % 360;
      onCropChange({ pixelCrop: { x: 0, y: 0, width: 0, height: 0 }, zoom, rotation: next });
      return next;
    });
  }, [onCropChange, zoom]);

  const handleReset = React.useCallback(() => {
    setCrop({ x: 0, y: 0 });
    setZoom(1);
    setRotation(0);
    onReset();
  }, [onReset]);

  return (
    <div data-slot="image-preview-editor" className="flex flex-col gap-3 min-w-0 sm:min-w-[280px]">
      {/* Crop area — square aspect container */}
      <div className="relative w-full aspect-square min-h-0 sm:min-h-[200px] max-h-[400px] bg-muted rounded overflow-hidden">
        {imageSrc && (
          <Cropper
            image={imageSrc}
            crop={crop}
            zoom={zoom}
            minZoom={0.5}
            maxZoom={3}
            rotation={rotation}
            aspect={aspectRatio}
            onCropChange={setCrop}
            onZoomChange={setZoom}
            onRotationChange={setRotation}
            onCropComplete={handleCropComplete}
          />
        )}
      </div>

      {/* Toolbar — two rows for usability */}
      <div className="bg-muted rounded-lg p-2 sm:p-3 flex flex-col gap-2 sm:gap-3">
        {/* Row 1: Zoom slider */}
        <div className="flex items-center gap-3">
          <span className="text-sm font-medium text-muted-foreground shrink-0">Zoom</span>
          <Slider
            min={0.5}
            max={3}
            step={0.1}
            value={[zoom]}
            onValueChange={handleZoomChange}
            aria-label="Zoom"
            className="flex-1"
          />
        </div>

        {/* Row 2: Rotate + Reset buttons */}
        <div className="flex items-center justify-center gap-3">
          {/* Rotate counter-clockwise */}
          <button
            type="button"
            aria-label="Rotate 90 degrees counter-clockwise"
            onClick={handleRotateCcw}
            className={TOOLBAR_BUTTON_CLASS}
          >
            <RotateCcw className="size-5" />
          </button>

          {/* Rotate clockwise */}
          <button
            type="button"
            aria-label="Rotate 90 degrees clockwise"
            onClick={handleRotateCw}
            className={TOOLBAR_BUTTON_CLASS}
          >
            <RotateCw className="size-5" />
          </button>

          {/* Reset */}
          <button
            type="button"
            aria-label="Reset"
            onClick={handleReset}
            className={TOOLBAR_BUTTON_CLASS}
          >
            <Undo2 className="size-5" />
          </button>
        </div>
      </div>
    </div>
  );
}

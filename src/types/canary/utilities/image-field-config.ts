export type ImageMimeType = 'image/jpeg' | 'image/png' | 'image/webp' | 'image/heic' | 'image/heif';

export interface ImageFieldStaticConfig {
  aspectRatio: number;
  acceptedFormats: ImageMimeType[];
  maxFileSizeBytes: number;
  maxDimension: number;
}

export interface ImageFieldInitConfig {
  entityTypeDisplayName: string;
  propertyDisplayName: string;
}

export type ImageFieldConfig = ImageFieldStaticConfig & ImageFieldInitConfig;

export type ImageInputType =
  | 'file'
  | 'url'
  | 'clipboard-image'
  | 'clipboard-html'
  | 'data-uri'
  | 'camera';

export interface ImageInputFile {
  type: 'file';
  file: File;
}

export interface ImageInputUrl {
  type: 'url';
  url: string;
}

export interface ImageInputError {
  type: 'error';
  message: string;
}

export type ImageInput = ImageInputFile | ImageInputUrl | ImageInputError;

export interface ImageUploadResult {
  imageUrl: string;
  wasCompressed: boolean;
  originalSizeBytes: number;
  finalSizeBytes: number;
}

export interface PixelCrop {
  x: number;
  y: number;
  width: number;
  height: number;
}

export interface CropData {
  pixelCrop: PixelCrop;
  zoom: number;
  rotation: number;
}

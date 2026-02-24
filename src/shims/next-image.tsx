/**
 * next/image shim for Storybook
 *
 * Renders a plain <img> element. Handles the fill prop and StaticImageData objects.
 * Priority, loading, and placeholder props are ignored (no optimization in Storybook).
 */

import React from 'react';

interface StaticImageData {
  src: string;
  height: number;
  width: number;
  blurDataURL?: string;
}

type ImageSrc = string | StaticImageData;

interface ImageProps extends Omit<React.ImgHTMLAttributes<HTMLImageElement>, 'src' | 'width' | 'height'> {
  src: ImageSrc;
  alt: string;
  width?: number | string;
  height?: number | string;
  fill?: boolean;
  priority?: boolean;
  loading?: 'lazy' | 'eager';
  placeholder?: 'blur' | 'empty';
  blurDataURL?: string;
  quality?: number;
  sizes?: string;
  unoptimized?: boolean;
}

function Image({
  src,
  alt,
  width,
  height,
  fill,
  // eslint-disable-next-line @typescript-eslint/no-unused-vars
  priority,
  // eslint-disable-next-line @typescript-eslint/no-unused-vars
  placeholder,
  // eslint-disable-next-line @typescript-eslint/no-unused-vars
  blurDataURL,
  // eslint-disable-next-line @typescript-eslint/no-unused-vars
  quality,
  // eslint-disable-next-line @typescript-eslint/no-unused-vars
  sizes,
  // eslint-disable-next-line @typescript-eslint/no-unused-vars
  unoptimized,
  style,
  ...rest
}: ImageProps) {
  const resolvedSrc = typeof src === 'string' ? src : src.src;

  const fillStyle: React.CSSProperties = fill
    ? {
        objectFit: 'cover' as const,
        width: '100%',
        height: '100%',
        position: 'absolute' as const,
        top: 0,
        left: 0,
      }
    : {};

  return (
    <img
      src={resolvedSrc}
      alt={alt}
      width={fill ? undefined : width}
      height={fill ? undefined : height}
      style={{ ...fillStyle, ...style }}
      {...rest}
    />
  );
}

export default Image;

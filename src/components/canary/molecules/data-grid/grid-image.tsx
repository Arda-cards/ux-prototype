'use client';

import { useState } from 'react';

/**
 * GridImage - renders image with fallback for image columns.
 */
export function GridImage({ value }: { value?: string }) {
  const [imageError, setImageError] = useState(false);

  if (!value) {
    return (
      <div
        className="flex items-center justify-center w-8 h-8 bg-secondary rounded"
        title="No image"
      >
        <svg
          className="w-4 h-4 text-muted-foreground"
          fill="none"
          stroke="currentColor"
          viewBox="0 0 24 24"
          aria-hidden="true"
        >
          <path
            strokeLinecap="round"
            strokeLinejoin="round"
            strokeWidth={2}
            d="M4 16l4.586-4.586a2 2 0 012.828 0L16 16m-2-2l1.586-1.586a2 2 0 012.828 0L20 14m-6-6h.01M6 20h12a2 2 0 002-2V6a2 2 0 00-2-2H6a2 2 0 00-2 2v12a2 2 0 002 2z"
          />
        </svg>
      </div>
    );
  }

  if (imageError) {
    return (
      <div
        className="flex items-center justify-center w-8 h-8 bg-destructive/10 rounded"
        title="Invalid image"
      >
        <svg
          className="w-4 h-4 text-destructive"
          fill="none"
          stroke="currentColor"
          viewBox="0 0 24 24"
          aria-hidden="true"
        >
          <path
            strokeLinecap="round"
            strokeLinejoin="round"
            strokeWidth={2}
            d="M18.364 18.364A9 9 0 005.636 5.636m12.728 12.728A9 9 0 015.636 5.636m12.728 12.728L5.636 5.636"
          />
        </svg>
      </div>
    );
  }

  return (
    <img
      src={value}
      alt=""
      className="w-8 h-8 object-cover rounded"
      onError={() => setImageError(true)}
    />
  );
}

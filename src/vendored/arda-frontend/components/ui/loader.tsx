'use client';

import React from 'react';
import { cn } from '@frontend/lib/utils';

interface LoaderProps {
  /**
   * Size of the loader
   * @default 'default'
   */
  size?: 'sm' | 'default' | 'lg';
  /**
   * Additional CSS classes
   */
  className?: string;
  /**
   * Accessibility label
   * @default 'Loading...'
   */
  'aria-label'?: string;
}

export function Loader({ 
  size = 'default', 
  className,
  'aria-label': ariaLabel = 'Loading...'
}: LoaderProps) {
  const sizeClasses = {
    sm: '',      // Size controlled by CSS
    default: '', // Size controlled by CSS
    lg: ''       // Size controlled by CSS
  };

  return (
    <>
      <style jsx global>{`
        .loader {
          border: 3px solid #f3f3f3;
          border-top: 3px solid #FF3D00;
          border-radius: 50%;
          animation: spin 1s linear infinite;
          display: block;
          margin: 0 auto;
        }

        @keyframes spin {
          0% { transform: rotate(0deg); }
          100% { transform: rotate(360deg); }
        }

        /* Size variants */
        .loader.loader-sm {
          width: 20px;
          height: 20px;
          border-width: 2px;
        }
        
        .loader.loader-default {
          width: 40px;
          height: 40px;
          border-width: 3px;
        }
        
        .loader.loader-lg {
          width: 60px;
          height: 60px;
          border-width: 4px;
        }
      `}</style>
      
      <div
        className={cn(
          'loader',
          `loader-${size}`,
          sizeClasses[size],
          className
        )}
        role="status"
        aria-label={ariaLabel}
      />
    </>
  );
}

// Export default for easier imports
export default Loader;

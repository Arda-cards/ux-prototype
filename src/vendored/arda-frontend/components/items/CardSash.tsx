'use client';

import {
  ShoppingCart,
  Clock,
  Package,
  CheckCircle,
  Circle,
  HelpCircle,
} from 'lucide-react';
import { getCardStateConfig } from '@frontend/lib/cardStateUtils';
import { useMemo } from 'react';

interface CardSashProps {
  status: string;
  className?: string;
}

// Map card status to appropriate icon component
const getStatusIcon = (status: string) => {
  const normalizedStatus = status.toUpperCase();
  switch (normalizedStatus) {
    case 'REQUESTING':
      return ShoppingCart;
    case 'REQUESTED':
      return Clock;
    case 'IN_PROCESS':
      return Package;
    case 'FULFILLED':
      return CheckCircle;
    case 'AVAILABLE':
      return Circle;
    default:
      return HelpCircle;
  }
};

export function CardSash({ status, className = '' }: CardSashProps) {
  const config = getCardStateConfig(status);
  const Icon = getStatusIcon(status);

  // Generate unique IDs for clipPaths to avoid conflicts
  const clipId0 = useMemo(
    () => `clip0_${Math.random().toString(36).substr(2, 9)}`,
    []
  );
  const clipId1 = useMemo(
    () => `clip1_${Math.random().toString(36).substr(2, 9)}`,
    []
  );

  return (
    <div
      className={`absolute top-0 right-0 w-[102px] h-[102px] overflow-hidden pointer-events-none z-10 ${className}`}
      style={{
        top: '-4px',
        right: '0',
      }}
    >
      <svg
        width='102'
        height='102'
        viewBox='0 0 102 102'
        fill='none'
        xmlns='http://www.w3.org/2000/svg'
        className='w-full h-full'
      >
        <defs>
          <clipPath id={clipId0}>
            <rect width='102' height='102' fill='white' />
          </clipPath>
          <clipPath id={clipId1}>
            <rect
              width='16'
              height='16'
              fill='white'
              transform='translate(39.0166 3.86182) rotate(45)'
            />
          </clipPath>
        </defs>
        <g clipPath={`url(#${clipId0})`}>
          {/* Corner squares */}
          <path d='M0.0868282 0H5.86914V4.34043H0.0868282V0Z' fill='#0A0A0A' />
          <path d='M97.6633 96.2129H102V102H97.6633V96.2129Z' fill='#0A0A0A' />

          {/* Main diagonal sash */}
          <path
            d='M45.5731 0L102 56.4681V102L0.0867157 0H45.5731Z'
            fill='#0A0A0A'
          />
        </g>
      </svg>

      <div
        className='absolute'
        style={{
          top: '6px',
          left: '39px',
          display: 'flex',
          flexDirection: 'row',
          alignItems: 'center',
          justifyContent: 'flex-start',
          gap: '4px',
          transform: 'rotate(45deg)',
          transformOrigin: '0 0',
        }}
      >
        <Icon className='w-3 h-3 text-white flex-shrink-0' />
        <span className='text-white text-[10px] leading-tight whitespace-nowrap'>
          {config.label}
        </span>
      </div>
    </div>
  );
}

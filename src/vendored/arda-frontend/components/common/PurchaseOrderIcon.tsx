import React from 'react';

interface PurchaseOrderIconProps {
  width?: number;
  height?: number;
  className?: string;
}

export function PurchaseOrderIcon({
  width = 42,
  height = 42,
  className = '',
}: PurchaseOrderIconProps) {
  return (
    <svg
      width={width}
      height={height}
      viewBox='0 0 42 42'
      fill='none'
      xmlns='http://www.w3.org/2000/svg'
      className={className}
    >
      <path
        d='M41.8528 26.4911C41.8528 34.8743 28.5718 39.1756 17.4411 39.1756C6.3105 39.1756 -4.32481 33.4917 1.78831 26.4911C4.77785 23.0632 6.64267 18.6697 4.0494 14.7722C0.226521 9.03568 10.722 3.1499 17.4411 3.1499C28.5718 3.1499 41.8528 18.1123 41.8528 26.4955V26.4911Z'
        fill='#FFEBE5'
      />
      <path
        d='M25.275 17.4998H18.45M27.55 22.0498H18.45M24.1375 26.5998H18.45M13.9 10.6748V33.4248L16.175 32.2873L18.45 33.4248L20.725 32.2873L23 33.4248L25.275 32.2873L27.55 33.4248L29.825 32.2873L32.1 33.4248V10.6748L29.825 11.8123L27.55 10.6748L25.275 11.8123L23 10.6748L20.725 11.8123L18.45 10.6748L16.175 11.8123L13.9 10.6748Z'
        stroke='white'
        strokeWidth='3'
        strokeLinecap='round'
        strokeLinejoin='round'
      />
      <path
        d='M23.275 16.45H16.45M25.55 21H16.45M22.1375 25.55H16.45M11.9 9.625V32.375L14.175 31.2375L16.45 32.375L18.725 31.2375L21 32.375L23.275 31.2375L25.55 32.375L27.825 31.2375L30.1 32.375V9.625L27.825 10.7625L25.55 9.625L23.275 10.7625L21 9.625L18.725 10.7625L16.45 9.625L14.175 10.7625L11.9 9.625Z'
        stroke='#0A0A0A'
        strokeWidth='2'
        strokeLinecap='round'
        strokeLinejoin='round'
      />
    </svg>
  );
}

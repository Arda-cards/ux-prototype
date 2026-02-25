'use client';

import Image from 'next/image';
import { PackageMinus, MapPin, Package, ShoppingCart } from 'lucide-react';
import type { ItemCard } from '@frontend/constants/types';
import { useState } from 'react';
import { CardSash } from './CardSash';

type ItemCardViewProps = {
  item: ItemCard;
  serialNumber?: string;
  cardIndex?: number;
  totalCards?: number;
  cardStatus?: string;
};

export function ItemCardView({
  item,
  cardIndex = 1,
  totalCards = 1,
  cardStatus,
}: ItemCardViewProps) {
  const [imageError, setImageError] = useState(false);

  // Function to get a safe image source
  const getSafeImageSrc = () => {
    // If there's an image error or no image, use fallback
    if (imageError || !item.image) {
      return 'https://encrypted-tbn0.gstatic.com/images?q=tbn:ANd9GcQMO8Hx4yf371x17IlJUS6moXsaptQp9vEWbw&s';
    }

    // Check if it's a valid external URL (starts with http/https)
    if (item.image.startsWith('http://') || item.image.startsWith('https://')) {
      // For external images, we'll use a fallback to avoid Next.js hostname errors
      return item.image;
    }

    // Default fallback - always return a valid URL
    return 'https://encrypted-tbn0.gstatic.com/images?q=tbn:ANd9GcQMO8Hx4yf371x17IlJUS6moXsaptQp9vEWbw&s';
  };

  const safeImageSrc = getSafeImageSrc();
  return (
    <div className='relative w-[348px] max-w-full rounded-md border-2 border-[#E5E5E5] shadow-[0px_4px_6px_rgba(0,0,0,0.09)] px-3 sm:px-4 py-2 sm:py-2.5 flex flex-col gap-1.5 sm:gap-2 font-geist bg-white'>
      {/* Card State Sash */}
      {cardStatus && <CardSash status={cardStatus} />}
      <div className='flex items-center justify-between'>
        <div className='flex-1 min-w-0'>
          <h2 className='font-extrabold text-[20px] sm:text-[24px] lg:text-[26px] text-[#0A0A0A] leading-6 sm:leading-7 lg:leading-8 truncate'>
            {item.title}
          </h2>
        </div>
        <Image
          src='/images/QRC.svg'
          alt='QR'
          width={40}
          height={40}
          className='object-contain ml-2 sm:ml-3 flex-shrink-0 w-8 h-8 sm:w-10 sm:h-10'
        />
      </div>

      {/* Card Notes - Display right under the title */}
      {item.cardNotes && (
        <div className='text-[12px] sm:text-[14px] text-[#0A0A0A] leading-4 sm:leading-5 font-geist break-words'>
          {item.cardNotes}
        </div>
      )}

      {/* Divider */}
      <div className='w-full h-1 bg-[#3B82F6]' />

      {/* Section Blocks */}
      {[
        {
          icon: PackageMinus,
          label: 'Minimum',
          value: `${item.minQty || '2'} ${item.minUnit || ''}`,
        },
        {
          icon: MapPin,
          label: 'Location',
          value: item.location || '',
        },
        {
          icon: Package,
          label: 'Order',
          value: `${item.orderQty || '2'} ${item.orderUnit || ''}`,
        },
        {
          icon: ShoppingCart,
          label: 'Supplier',
          value: item.supplier || '',
        },
      ].map((section, idx) => (
        <div key={idx} className='flex gap-2 sm:gap-2.5 items-start'>
          <div className='w-7 sm:w-9 flex flex-col items-center flex-shrink-0'>
            <section.icon className='w-5 h-5 sm:w-7 sm:h-7 text-black' />
            <span className='text-[7px] sm:text-[8px] text-black font-medium leading-2.5'>
              {section.label}
            </span>
          </div>
          <div className='flex-1 text-[12px] sm:text-[14px] text-[#0A0A0A] leading-4 sm:leading-5 font-geist break-words'>
            {section.value}
          </div>
        </div>
      ))}

      {/* Product Image */}
      <div className='w-full'>
        <div className='relative w-full max-h-[150px] sm:max-h-[180px] lg:max-h-[200px] overflow-hidden rounded-md flex items-center justify-center bg-white mt-1.5 sm:mt-2'>
          {safeImageSrc && (
            <Image
              src={safeImageSrc}
              alt={item.title}
              width={0}
              height={0}
              sizes='100vw'
              className='w-full h-auto max-h-[150px] sm:max-h-[180px] lg:max-h-[200px] object-contain'
              onError={() => setImageError(true)}
              unoptimized={safeImageSrc.startsWith('http')} // Disable optimization for external images
            />
          )}
          {/* Card number overlay */}
          <div className='absolute bottom-0 left-0 bg-white rounded-tr-md px-1.5 sm:px-2 py-0.5 text-xs sm:text-sm font-medium text-[#0A0A0A] font-geist'>
            Card {cardIndex} of {totalCards}
          </div>
          {/* Serial Number overlay */}
          <div className='absolute bottom-0 right-0 bg-white rounded-tl-md px-1.5 sm:px-2 py-0.5 text-xs sm:text-sm font-medium text-[#0A0A0A] font-geist text-right'>
            {item.serialNumber || item.sku}
          </div>
        </div>
      </div>

      {/* Bottom divider */}
      <div className='w-full h-2.5 bg-[#3B82F6]' />

      {/* Arda logo */}
      <div className='text-center '>
        <Image
          src='/images/logoArdaCards.svg'
          alt='Arda'
          width={58}
          height={30}
          className='mx-auto w-12 h-auto sm:w-14 lg:w-16'
        />
      </div>
    </div>
  );
}

import Image from 'next/image';

interface EmptyOrdersStateProps {
  title?: string;
  subtitle?: string;
}

export function EmptyOrdersState({
  title = 'No orders today',
  subtitle = 'There are no recent orders for today',
}: EmptyOrdersStateProps) {
  return (
    <div className='flex justify-center items-center w-full py-16'>
      <div className='flex flex-col items-center justify-center px-30 py-10 text-center border-1 border-dashed border-gray-200 rounded-lg bg-white max-w-xl'>
        <div className='relative mb-6'>
          {/* Shopping cart icon without background */}
          <Image
            src='/ilustrationsColors/cardPurple.svg'
            alt='Shopping cart'
            width={80}
            height={80}
            className='w-20 h-20'
          />
        </div>

        {/* Title */}
        <h3 className='text-xl font-semibold text-gray-900 mb-2'>{title}</h3>

        {/* Subtitle */}
        <p className='text-gray-600 text-sm'>{subtitle}</p>
      </div>
    </div>
  );
}

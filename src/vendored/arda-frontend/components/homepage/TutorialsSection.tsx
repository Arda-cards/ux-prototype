'use client';

import { Button } from '@frontend/components/ui/button';
import { Video } from 'lucide-react';

export function TutorialsSection() {
  const tutorials = Array.from({ length: 5 });

  return (
    <section className='w-full flex flex-col gap-[19px] rounded-[10px]'>
      <div className='w-full flex items-center justify-between'>
        <div
          className='text-[14px] font-semibold leading-[20px] text-muted-foreground'
          style={{ fontFamily: 'Geist' }}
        >
          Tutorials
        </div>
        <Button
          className='h-9 px-4 py-2 bg-[#171717] text-[#FAFAFA] text-[14px] font-medium leading-[20px] rounded-lg shadow-sm'
          style={{ fontFamily: 'Geist' }}
        >
          View All
        </Button>
      </div>

      {/* Tutorials Grid */}
      <div className='grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-4 xl:grid-cols-5 gap-3 w-full'>
        {tutorials.map((_, idx) => (
          <div
            key={idx}
            className='w-full aspect-[210/124] rounded-[14px] flex items-center justify-center'
            style={{ backgroundColor: '#EEEEEE' }}
          >
            <Video className='w-6 h-6 text-muted-foreground' />
          </div>
        ))}
      </div>
    </section>
  );
}

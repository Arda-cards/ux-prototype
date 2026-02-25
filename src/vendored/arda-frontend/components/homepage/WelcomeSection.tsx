'use client';

import { useAuth } from '@frontend/store/hooks/useAuth';
import { Plus, Users } from 'lucide-react';
import { LuFileUp } from 'react-icons/lu';

import { CardButton } from '../common/ CardButton';
export function WelcomeSection() {
  const { user } = useAuth();
  const displayName = user?.name || 'There';

  return (
    <section className='px-8 py-10 border border-border rounded-[28px] flex flex-col gap-10 w-full max-w-[848px]'>
      <div className='flex flex-col gap-4'>
        <h2
          className='text-[32px] font-semibold leading-[28px] text-foreground'
          style={{ fontFamily: 'Geist' }}
        >
          Good Morning, {displayName}.
        </h2>
        <p
          className='text-[14px] text-muted-foreground leading-[20px]'
          style={{ fontFamily: 'Geist' }}
        >
          Create a new item, start exploring tutorials, or upload your inventory
          list!
        </p>
      </div>

      <div className='flex flex-wrap sm:flex-nowrap gap-4'>
        <CardButton
          icon={<Plus className='w-[14px] h-[14px]' />}
          label='Create and Print Cards'
        />
        <CardButton
          icon={<LuFileUp className='w-[14px] h-[14px]' />}
          label='Upload Inventory List'
        />
        <CardButton
          icon={<Users className='w-[14px] h-[14px]' />}
          label='Invite Your Team'
        />
      </div>
    </section>
  );
}

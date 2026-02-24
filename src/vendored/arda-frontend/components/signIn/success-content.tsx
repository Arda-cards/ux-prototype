'use client';

import { useSearchParams } from 'next/navigation';
import Image from 'next/image';
import { Checkbox } from '@frontend/components/ui/checkbox';

export function SignUpSuccessContent() {
  const searchParams = useSearchParams();
  const email = searchParams.get('email');

  if (!email) return null;

  return (
    <div className='min-h-screen flex items-center justify-center px-4 md:px-0 bg-white'>
      <div className='text-center max-w-md'>
        <div className='flex justify-center mb-4'>
          <Image
            src='/images/ArdaLogoV1.svg'
            alt='Logo'
            width={40}
            height={40}
          />
        </div>

        <h2 className='text-2xl font-bold mt-4'>Sign Up Successful</h2>
        <p className='mt-2 text-sm text-gray-700'>
          {email} was confirmed. You can now{' '}
          <a href='/signin' className='underline text-black'>
            log in
          </a>
          .
        </p>
        <div className='mt-4 flex items-start justify-center gap-2 text-xs text-gray-500'>
          <Checkbox id='subscribe' defaultChecked />
          <label htmlFor='subscribe'>
            Keep me posted about important product and security updates.
          </label>
        </div>
      </div>
    </div>
  );
}

'use client';

import { cn } from '@frontend/lib/utils';
import { Button } from '@frontend/components/ui/button';

interface CardButtonProps {
  icon: React.ReactNode;
  label: string;
}

export function CardButton({ icon, label }: CardButtonProps) {
  return (
    <Button
      variant='outline'
      className={cn(
        'flex-1 max-w-[250px] min-w-[200px] h-[124px]',
        'justify-start gap-4 px-6 py-8 rounded-[14px]',
        'border border-border shadow-sm bg-card hover:bg-muted transition'
      )}
    >
      <div className='w-[25px] h-[25px] flex items-center justify-center rounded-[5px] bg-accent'>
        {icon}
      </div>
      <span
        className='text-[14px] font-medium leading-[20px] text-card-foreground'
        style={{ fontFamily: 'Geist' }}
      >
        {label}
      </span>
    </Button>
  );
}

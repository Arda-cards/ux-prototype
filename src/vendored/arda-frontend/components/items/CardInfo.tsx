'use client';

import { Card } from '@frontend/components/ui/card';
import { Button } from '@frontend/components/ui/button';
import {
  MoreHorizontal,
  CreditCard,
  Trash2,
  Printer,
  Loader2,
  Tag,
  Hash,
} from 'lucide-react';
import { KanbanCard } from '@frontend/types/kanban-cards';
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from '@frontend/components/ui/dropdown-menu';
import {
  CardStateDropdown,
  CardStateDisplay,
} from '@frontend/components/common/card-state';

interface CardInfoProps {
  card: KanbanCard;
  index: number;
  totalCards: number;
  onDelete: () => void;
  onPrint: () => void;
  onAddToOrderQueue: () => void;
  onStateChange?: (newState: string) => void;
  onViewPreview: () => void;
  onViewHistory: () => void;
  isPrinting?: boolean;
  // Additional props for CardStateDropdown
  orderMethod?: string;
  link?: string;
  onOpenEmailPanel?: () => void;
  onRefreshCards?: () => void;
  onTriggerRefresh?: () => void;
  showToast?: (message: string) => void;
  onPrintLabel?: () => void;
  onPrintBreadcrumb?: () => void;
  isPrintingLabel?: boolean;
  isPrintingBreadcrumb?: boolean;
}

export const CardInfo = ({
  card,
  index,
  totalCards,
  onDelete,
  onPrint,
  onAddToOrderQueue,
  onStateChange,
  onViewPreview,
  onViewHistory,
  isPrinting = false,
  orderMethod,
  link,
  onOpenEmailPanel,
  onRefreshCards,
  onTriggerRefresh,
  showToast,
  onPrintLabel,
  onPrintBreadcrumb,
  isPrintingLabel = false,
  isPrintingBreadcrumb = false,
}: CardInfoProps) => {
  return (
    <Card 
      data-card-id={card.entityId}
      className='relative w-full rounded-[14px] border shadow-sm  flex flex-col gap-6'>
      <div className='px-6 '>
        {/* Header */}
        <div className='flex gap-3'>
          <div className='w-12 h-12 flex items-center justify-center'>
            <CreditCard className='w-[36px] h-[36px]' />
          </div>
          <div className='flex flex-col gap-0.5'>
            <h3 className='text-base font-semibold text-[var(--base-card-foreground)]'>
              Card #{index + 1}
            </h3>
            <p className='text-xs font-normal text-[var(--base-card-foreground)]'>
              <span className='font-bold'>{index + 1}</span> of{' '}
              <span className='font-bold'>{totalCards}</span>
            </p>
          </div>
        </div>

        {/* Card Details */}
        <div className='flex justify-between py-4'>
          <div className='flex flex-col gap-1'>
            <span className='text-muted-foreground text-sm font-normal'>
              Serial #
            </span>
            <span className='text-base font-semibold text-[var(--base-card-foreground)]'>
              {card.serialNumber}
            </span>
          </div>
          <div className='flex flex-col gap-1'>
            <span className='text-muted-foreground text-sm font-normal'>
              Current status
            </span>
            <CardStateDisplay card={card} />
          </div>
          <div className='flex flex-col gap-1'>
            <span className='text-muted-foreground text-sm font-normal'>
              Print status
            </span>
            <span className='text-base font-semibold text-[var(--base-card-foreground)]'>
              {card.printStatus}
            </span>
          </div>
        </div>
      </div>

      {/* Actions */}

      {/* Footer  */}
      <div className='flex items-center justify-between pt-4 px-6 border-t border-[#E5E5E5]'>
        <button
          onClick={onPrint}
          disabled={isPrinting}
          className='flex-1 flex justify-center items-center gap-2 py-2 disabled:opacity-50 disabled:cursor-not-allowed'
        >
          {isPrinting ? (
            <Loader2 className='w-4 h-4 animate-spin' />
          ) : (
            <Printer className='w-4 h-4' />
          )}
          <span className='text-xs font-medium text-[var(--base-foreground)]'>
            {isPrinting
              ? 'Printing...'
              : card.printStatus === 'NOT_PRINTED'
              ? 'Print card '
              : 'Reprint card'}
          </span>
        </button>

        {/* Custom vertical separator */}
        <div className='h-6 w-px bg-[#E5E5E5] ' />

        <button
          onClick={onDelete}
          className='flex-1 flex justify-center items-center gap-2 py-2'
        >
          <Trash2 className='w-4 h-4' />
          <span className='text-xs font-medium text-[var(--base-foreground)]'>
            Delete card
          </span>
        </button>
        <div className='h-6 w-px bg-[#E5E5E5]' />
      </div>

      {/* Top Right Options */}
      <DropdownMenu>
        <DropdownMenuTrigger asChild>
          <Button
            variant='ghost'
            size='icon'
            className='absolute top-2 right-2'
          >
            <MoreHorizontal className='w-4 h-4' />
          </Button>
        </DropdownMenuTrigger>
        <DropdownMenuContent className='w-56' align='end'>
          <DropdownMenuItem onClick={onPrint} disabled={isPrinting}>
            {isPrinting ? 'Printing...' : 'Reprint card'}
          </DropdownMenuItem>

          <CardStateDropdown
            card={card}
            onAddToOrderQueue={onAddToOrderQueue}
            onStateChange={onStateChange}
            orderMethod={orderMethod}
            link={link}
            onOpenEmailPanel={onOpenEmailPanel}
            onRefreshCards={onRefreshCards}
            onTriggerRefresh={onTriggerRefresh}
            showToast={showToast}
          />

          <DropdownMenuItem onClick={onViewHistory}>
            View card history
          </DropdownMenuItem>

          <DropdownMenuItem onClick={onViewPreview}>
            View card preview
          </DropdownMenuItem>

          <DropdownMenuSeparator />

          {onPrintLabel && (
            <DropdownMenuItem
              onClick={onPrintLabel}
              disabled={isPrintingLabel}
            >
              <Tag className='w-4 h-4 mr-2' />
              {isPrintingLabel ? 'Printing label...' : 'Print label'}
            </DropdownMenuItem>
          )}

          {onPrintBreadcrumb && (
            <DropdownMenuItem
              onClick={onPrintBreadcrumb}
              disabled={isPrintingBreadcrumb}
            >
              <Hash className='w-4 h-4 mr-2' />
              {isPrintingBreadcrumb
                ? 'Printing breadcrumb...'
                : 'Print breadcrumb'}
            </DropdownMenuItem>
          )}

          <DropdownMenuSeparator />

          <DropdownMenuItem onClick={onDelete}>Delete card</DropdownMenuItem>
        </DropdownMenuContent>
      </DropdownMenu>
    </Card>
  );
};

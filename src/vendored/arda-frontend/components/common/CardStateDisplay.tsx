'use client';

import { getCardStateConfig } from '@frontend/lib/cardStateUtils';
import { KanbanCard } from '@frontend/types/kanban-cards';

interface CardStateDisplayProps {
  card: KanbanCard;
  showDescription?: boolean;
  className?: string;
}

export function CardStateDisplay({
  card,
  showDescription = false,
  className = '',
}: CardStateDisplayProps) {
  const cardStateConfig = getCardStateConfig(card.status);

  return (
    <div className={`flex items-center gap-2 ${className}`}>
      <div className='flex flex-col'>
        <span className='text-sm font-medium text-[var(--base-card-foreground)]'>
          {cardStateConfig.label}
        </span>
        {showDescription && (
          <span className='text-xs text-muted-foreground'>
            {cardStateConfig.description}
          </span>
        )}
      </div>
    </div>
  );
}

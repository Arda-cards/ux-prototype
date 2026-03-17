import { GripVertical } from 'lucide-react';

interface DragHeaderProps {
  displayName: string;
}

export function DragHeader({ displayName }: DragHeaderProps) {
  return (
    <span className="group/header flex items-center gap-1">
      <span>{displayName}</span>
      <GripVertical
        className="h-3 w-3 shrink-0 text-muted-foreground/30 transition-colors group-hover/header:text-muted-foreground"
        aria-hidden="true"
      />
    </span>
  );
}

import { GripVertical } from 'lucide-react';

interface DragHeaderProps {
  displayName: string;
}

export function DragHeader({ displayName }: DragHeaderProps) {
  return (
    <span className="group/header flex w-full items-center justify-between">
      <span>{displayName}</span>
      <GripVertical
        className="h-3 w-3 shrink-0 text-muted-foreground/40 transition-colors group-hover/header:text-muted-foreground"
        aria-hidden="true"
      />
    </span>
  );
}

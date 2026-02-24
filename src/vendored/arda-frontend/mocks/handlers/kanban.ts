// MSW handlers for kanban API endpoints
// Re-exports from split modules for backward compatibility
import { kanbanQueryHandlers } from './kanban-queries';
import { kanbanEventHandlers } from './kanban-events';
import { kanbanMutationHandlers } from './kanban-mutations';

export const kanbanHandlers = [
  ...kanbanMutationHandlers,
  ...kanbanQueryHandlers,
  ...kanbanEventHandlers,
];

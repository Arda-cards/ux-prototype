// MSW handlers for kanban API endpoints
// Re-exports from split modules for backward compatibility
import { kanbanQueryHandlers } from './kanban-queries';
import { kanbanEventHandlers } from './kanban-events';
import { kanbanMutationHandlers } from './kanban-mutations';

export const kanbanHandlers = [
  ...kanbanQueryHandlers,     // Before mutations — specific /kanban-card/query-by-item must match before /kanban-card/:cardId
  ...kanbanMutationHandlers,
  ...kanbanEventHandlers,
];

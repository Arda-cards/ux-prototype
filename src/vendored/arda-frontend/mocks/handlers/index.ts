// MSW handlers aggregator - combines all handlers for easy import
import { itemHandlers } from './items';
import { kanbanHandlers } from './kanban';
import { authHandlers } from './auth';
import { userHandlers } from './user';
import { tenantHandlers } from './tenant';
import { lookupHandlers } from './lookups';
import { emailHandlers } from './email';

// Combine all handlers
export const handlers = [
  ...itemHandlers,
  ...kanbanHandlers,
  ...authHandlers,
  ...userHandlers,
  ...tenantHandlers,
  ...lookupHandlers,
  ...emailHandlers,
];

// Log handler count for debugging
console.log(`[MSW] Registered ${handlers.length} mock handlers`);

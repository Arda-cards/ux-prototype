// MSW handlers aggregator - combines all handlers for easy import
import { itemHandlers } from './items';
import { kanbanHandlers } from './kanban';
import { authHandlers } from './auth';
import { userHandlers } from './user';
import { tenantHandlers } from './tenant';
import { lookupHandlers } from './lookups';
import { emailHandlers } from './email';
import { businessAffiliateHandlers } from '../../../../use-cases/reference/business-affiliates/msw-handlers';

// Combine all handlers
export const handlers = [
  ...lookupHandlers,    // Before itemHandlers — specific /items/lookup-* paths must match before /items/:entityId
  ...itemHandlers,
  ...businessAffiliateHandlers,
  ...kanbanHandlers,
  ...authHandlers,
  ...userHandlers,
  ...tenantHandlers,
  ...emailHandlers,
];

// Log handler count for debugging
console.log(`[MSW] Registered ${handlers.length} mock handlers`);

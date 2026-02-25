import { KanbanCardStatus } from '@frontend/types/kanban-cards';

// Card state configuration based on the legend
export interface CardStateConfig {
  status: KanbanCardStatus;
  label: string;
  color: string;
  bgColor: string;
  textColor: string;
  description: string;
}

export const CARD_STATE_CONFIG: Record<string, CardStateConfig> = {
  REQUESTING: {
    status: 'REQUESTING',
    label: 'In Order Queue',
    color: '#FF6B35', // Orange
    bgColor: '#FFF4F0',
    textColor: '#B45309',
    description: 'Card is in the order queue waiting to be processed',
  },
  REQUESTED: {
    status: 'REQUESTED',
    label: 'In Progress',
    color: '#F59E0B', // Yellow
    bgColor: '#FFFBEB',
    textColor: '#92400E',
    description: 'Card is being processed and is in progress',
  },
  IN_PROCESS: {
    status: 'IN_PROCESS',
    label: 'Receiving',
    color: '#3B82F6', // Blue
    bgColor: '#EFF6FF',
    textColor: '#1E40AF',
    description: 'Card is in the receiving process',
  },
  FULFILLED: {
    status: 'FULFILLED',
    label: 'Restocked',
    color: '#10B981', // Green
    bgColor: '#ECFDF5',
    textColor: '#047857',
    description: 'Card has been fulfilled and is restocked',
  },
  AVAILABLE: {
    status: 'AVAILABLE',
    label: 'Available',
    color: '#6B7280', // Gray
    bgColor: '#F9FAFB',
    textColor: '#374151',
    description: 'Card is available for use',
  },
  UNKNOWN: {
    status: 'UNKNOWN',
    label: 'Unknown',
    color: '#9CA3AF', // Light gray
    bgColor: '#F3F4F6',
    textColor: '#6B7280',
    description: 'Card status is unknown',
  },
};

/**
 * Get card state configuration by status
 */
export function getCardStateConfig(status: string): CardStateConfig {
  const normalizedStatus = status.toUpperCase();
  return CARD_STATE_CONFIG[normalizedStatus] || CARD_STATE_CONFIG.UNKNOWN;
}

/**
 * Get card state label for display
 */
export function getCardStateLabel(status: string): string {
  return getCardStateConfig(status).label;
}

/**
 * Get card state color for styling
 */
export function getCardStateColor(status: string): string {
  return getCardStateConfig(status).color;
}

/**
 * Get card state background color for styling
 */
export function getCardStateBgColor(status: string): string {
  return getCardStateConfig(status).bgColor;
}

/**
 * Get card state text color for styling
 */
export function getCardStateTextColor(status: string): string {
  return getCardStateConfig(status).textColor;
}

/**
 * Check if a card can be added to order queue
 * Allow cards to go back to order queue from any state except REQUESTING
 */
export function canAddToOrderQueue(status: string): boolean {
  return status !== 'REQUESTING';
}

/**
 * Get all available card states for dropdowns
 */
export function getAllCardStates(): CardStateConfig[] {
  return Object.values(CARD_STATE_CONFIG);
}

/**
 * Map API status to display status
 */
export function mapApiStatusToDisplay(apiStatus: string): string {
  const statusMap: Record<string, string> = {
    REQUESTING: 'REQUESTING',
    REQUESTED: 'REQUESTED',
    IN_PROCESS: 'IN_PROCESS',
    FULFILLED: 'FULFILLED',
    AVAILABLE: 'AVAILABLE',
    UNKNOWN: 'UNKNOWN',
  };

  return statusMap[apiStatus.toUpperCase()] || 'UNKNOWN';
}

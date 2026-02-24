import { Card, ItemCard as ItemCardType } from './types';

export interface Item {
  title?: string;
  cards?: Card[];
}

export interface ItemDetailsPanelProps {
  item: ItemCardType;
  isOpen: boolean;
  onClose: () => void;
  onOpenChange: () => void;
  onEditItem?: () => void;
  onDuplicateItem?: () => void;
}

import * as general from './general';
import * as domain from './domain';
import * as items from './items';
import * as entity from './entity';

// Serial Number type alias.
// TBD: Define the format and semantics of the serial number.
type SerialNumber = string;

export type KanbanCardEventType =
  | 'REQUEST'
  | 'ACCEPT'
  | 'START_PROCESSING'
  | 'COMPLETE_PROCESSING'
  | 'FULFILL'
  | 'RECEIVE'
  | 'USE'
  | 'DEPLETE'
  | 'WITHDRAW'
  | 'NONE';

export interface KanbanCardEvent {
  when: general.TimeCoordinates;
  type: KanbanCardEventType;
  fromWhere?: domain.Locator;
  toWhere?: domain.Locator;
}

export type KanbanCardStatus =
  | 'AVAILABLE'
  | 'REQUESTING'
  | 'REQUESTED'
  | 'IN_PROCESS'
  | 'FULFILLED'
  | 'IN_USE'
  | 'DEPLETED'
  | 'UNKNOWN';

export type PrintEventType =
  | 'PRINT'
  | 'REPRINT'
  | 'LOST'
  | 'DEPRECATE'
  | 'RETIRE'
  | 'DESTROY'
  | 'NONE';

export interface PrintEvent {
  when: general.TimeCoordinates;
  type: PrintEventType;
}

export type KanbanCardPrintStatus =
  | 'NOT_PRINTED'
  | 'PRINTED'
  | 'LOST'
  | 'DEPRECATED'
  | 'RETIRED'
  | 'UNKNOWN';

export interface KanbanCard extends entity.JournalledEntity {
  serialNumber: SerialNumber;

  item: items.Item;

  cardQuantity?: items.Quantity;
  // The Actual location of the card, if known.
  locator?: domain.Locator;

  lastEvent?: KanbanCardEvent;
  // Default: UNKNOWN
  status: KanbanCardStatus;

  lastPrintEvent?: PrintEvent;
  // Default: UNKNOWN
  printStatus: KanbanCardPrintStatus;
}

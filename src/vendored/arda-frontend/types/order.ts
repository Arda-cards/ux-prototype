import * as types from './index';
import * as items from './items';
import * as kanban from './kanban-cards';
import * as businessAffiliate from './business-affiliate';
import * as entity from './entity';
import * as general from './general';


export interface RequestedItem {
  item: items.Item;

  // Ordered by `*.lastEvent.when.effective`
  requestedCards: kanban.KanbanCard[];
  totalQuantity?: items.Quantity;
}

export interface OrderQueue {
  requestedItems: RequestedItem[];
}



interface OrderLine {
  item: items.Item;
  quantity: items.Quantity;
  supply?: items.Supply;

  requestingCards: kanban.KanbanCard[];
}

/*
 * ```plantuml
 * @startuml
 *
 * skinparam nodesep 50
 * skinparam ranksep 40
 * hide empty Description
 * title
 * =Simple Order Lifecycle
 * end title
 *
 * state DRAFT
 * state SUBMITTED
 * state CANCELLED
 * state PARTIAL
 * state COMPLETED
 *
 * [*] -> DRAFT
 * DRAFT -u> DRAFT : edit
 * DRAFT --> SUBMITTED : submit
 * SUBMITTED --> PARTIAL : receive_partial
 * SUBMITTED --> COMPLETED : complete
 * SUBMITTED -> CANCELLED : cancel
 * PARTIAL --> PARTIAL : receive_partial
 * PARTIAL --> COMPLETED : complete
 * COMPLETED -> [*]
 * CANCELLED --> [*]
 * @enduml
 */
export type OrderEvent =
  | "NONE"
  | "EDIT"
  | "SUBMIT"
  | "RECEIVE_PARTIAL"
  | "CANCEL"
  | "COMPLETE"

export type OrderStatus =
  | "DRAFT"
  | "SUBMITTED"
  | "PARTIAL"
  | "CANCELLED"
  | "COMPLETED"

export interface Order extends entity.JournalledEntity {
  submittedTime: general.Timestamp;
  submittedBy: types.User;
  supplier?: businessAffiliate.BusinessAffiliate;
  billTo?: businessAffiliate.Contact;
  shipTo?: businessAffiliate.Contact;
  lines: OrderLine[];
}
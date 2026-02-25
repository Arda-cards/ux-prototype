import * as general from './general';


export interface JournalledEntity {
  entityId: general.UUID;
  recordId: general.UUID;
  author: string;
  timeCoordinates: general.TimeCoordinates;
  createdCoordinates: general.TimeCoordinates;
}

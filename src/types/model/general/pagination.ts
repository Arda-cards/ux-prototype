export interface PaginationData {
  hasNextPage: boolean;
  hasPreviousPage: boolean;
  currentPageSize: number;
  totalItems?: number;
}

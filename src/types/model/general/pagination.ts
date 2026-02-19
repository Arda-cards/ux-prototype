export interface PaginationData {
  hasNextPage: boolean;
  hasPreviousPage: boolean;
  currentPage: number;
  currentPageSize: number;
  totalItems?: number;
}

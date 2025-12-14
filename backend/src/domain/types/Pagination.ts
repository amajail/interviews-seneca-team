/**
 * Pagination options for listing candidates
 */
export interface PaginationOptions {
  /** Page size (number of items per page). Default: 20 */
  pageSize?: number;
  /** Continuation token from previous page for pagination */
  continuationToken?: string;
  /** Sort field */
  sortBy?: 'name' | 'applicationDate' | 'status';
  /** Sort direction */
  sortDirection?: 'asc' | 'desc';
}

/**
 * Paginated result containing items and metadata
 */
export interface PaginatedResult<T> {
  /** Array of items for current page */
  items: T[];
  /** Total count of items (if available) */
  totalCount?: number;
  /** Continuation token for next page (if more pages exist) */
  continuationToken?: string;
  /** Current page size */
  pageSize: number;
}

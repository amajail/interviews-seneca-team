/**
 * API Response Models
 * Standardized response structures for API communication
 */

export interface ApiResponse<T> {
  success: boolean;
  data: T | null;
  error: ApiError | null;
  metadata: ResponseMetadata;
}

export interface ApiError {
  code: string;
  message: string;
  details?: Record<string, unknown>;
}

export interface ResponseMetadata {
  timestamp: string;
  version: string;
  requestId?: string;
}

export interface PaginatedResponse<T> {
  items: T[];
  totalCount: number;
  pageSize: number;
  continuationToken?: string;
  hasMore: boolean;
}

export interface ValidationError {
  field: string;
  message: string;
}

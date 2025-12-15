/**
 * Response Helper Utility
 * Creates standardized API responses matching the frontend ApiResponse interface
 */

import { HttpResponseInit } from '@azure/functions';
import type { PaginatedResult } from '../../domain/types/Pagination';

interface ApiResponse<T> {
  success: boolean;
  data: T | null;
  error: ApiError | null;
  metadata: ResponseMetadata;
}

interface ApiError {
  code: string;
  message: string;
  details?: Record<string, unknown>;
}

interface ResponseMetadata {
  timestamp: string;
  version: string;
  requestId?: string;
}

interface PaginatedResponse<T> {
  items: T[];
  totalCount: number;
  pageSize: number;
  continuationToken?: string;
  hasMore: boolean;
}

/**
 * Creates a successful API response
 */
// eslint-disable-next-line @typescript-eslint/no-unnecessary-type-parameters
export function createSuccessResponse<T>(data: T, statusCode = 200): HttpResponseInit {
  const response: ApiResponse<T> = {
    success: true,
    data,
    error: null,
    metadata: {
      timestamp: new Date().toISOString(),
      version: '1.0.0',
    },
  };

  return {
    status: statusCode,
    jsonBody: response,
  };
}

/**
 * Creates an error API response
 */
export function createErrorResponse(
  code: string,
  message: string,
  statusCode = 500,
  details?: Record<string, unknown>
): HttpResponseInit {
  const error: ApiError = {
    code,
    message,
    details,
  };

  const response: ApiResponse<null> = {
    success: false,
    data: null,
    error,
    metadata: {
      timestamp: new Date().toISOString(),
      version: '1.0.0',
    },
  };

  return {
    status: statusCode,
    jsonBody: response,
  };
}

/**
 * Converts PaginatedResult to PaginatedResponse
 */
export function toPaginatedResponse<T>(result: PaginatedResult<T>): PaginatedResponse<T> {
  return {
    items: result.items,
    totalCount: result.totalCount ?? result.items.length,
    pageSize: result.pageSize,
    continuationToken: result.continuationToken,
    hasMore: !!result.continuationToken,
  };
}

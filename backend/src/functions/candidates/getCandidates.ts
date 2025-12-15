import { app, HttpRequest, HttpResponseInit, InvocationContext } from '@azure/functions';
import { CandidateService } from '../../application/services/CandidateService';
import { CandidateRepository } from '../../infrastructure/database/repositories/CandidateRepository';
import { tableClient } from '../../infrastructure/config/tableStorageConfig';
import { DatabaseError } from '../../shared/errors/CustomErrors';
import { PaginationOptions } from '../../domain/types/Pagination';
import {
  createSuccessResponse,
  createErrorResponse,
  toPaginatedResponse,
} from '../../shared/utils/responseHelper';
import { mapCandidatesToFrontend } from '../../shared/utils/candidateMapper';

export async function getCandidates(
  request: HttpRequest,
  context: InvocationContext
): Promise<HttpResponseInit> {
  context.log('GET /api/candidates endpoint called');

  try {
    // Extract query parameters
    const pageSizeParam = request.query.get('pageSize');
    const pageSize = pageSizeParam ? parseInt(pageSizeParam, 10) : undefined;
    const continuationToken = request.query.get('continuationToken') ?? undefined;
    const sortBy = request.query.get('sortBy') as 'name' | 'applicationDate' | 'status' | undefined;
    const sortDirection = request.query.get('sortDirection') as 'asc' | 'desc' | undefined;

    // Validate pageSize
    if (pageSize !== undefined && (isNaN(pageSize) || pageSize < 1 || pageSize > 100)) {
      return createErrorResponse('VALIDATION_ERROR', 'Page size must be between 1 and 100', 400);
    }

    // Validate sortBy
    if (sortBy && !['name', 'applicationDate', 'status'].includes(sortBy)) {
      return createErrorResponse(
        'VALIDATION_ERROR',
        'sortBy must be one of: name, applicationDate, status',
        400
      );
    }

    // Validate sortDirection
    if (sortDirection && !['asc', 'desc'].includes(sortDirection)) {
      return createErrorResponse(
        'VALIDATION_ERROR',
        'sortDirection must be either asc or desc',
        400
      );
    }

    const options: PaginationOptions = {
      pageSize,
      continuationToken,
      sortBy,
      sortDirection,
    };

    const candidateRepository = new CandidateRepository(tableClient);
    const candidateService = new CandidateService(candidateRepository);

    const result = await candidateService.listCandidates(options);

    // Map backend candidates to frontend format
    const frontendCandidates = mapCandidatesToFrontend(result.items);
    const paginatedResponse = {
      ...toPaginatedResponse(result),
      items: frontendCandidates,
    };

    return createSuccessResponse(paginatedResponse);
  } catch (error) {
    context.error('Error listing candidates:', error);

    if (error instanceof DatabaseError) {
      return createErrorResponse(
        'DATABASE_ERROR',
        'An error occurred while processing your request',
        500
      );
    }

    return createErrorResponse('INTERNAL_ERROR', 'An unexpected error occurred', 500);
  }
}

app.http('getCandidates', {
  methods: ['GET'],
  authLevel: 'anonymous',
  route: 'candidates',
  handler: getCandidates,
});

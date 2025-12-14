import { app, HttpRequest, HttpResponseInit, InvocationContext } from '@azure/functions';
import { CandidateService } from '../../application/services/CandidateService';
import { CandidateRepository } from '../../infrastructure/database/repositories/CandidateRepository';
import { tableClient } from '../../infrastructure/config/tableStorageConfig';
import { DatabaseError } from '../../shared/errors/CustomErrors';
import { PaginationOptions } from '../../domain/types/Pagination';

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
      return {
        status: 400,
        jsonBody: {
          error: 'Bad Request',
          message: 'Page size must be between 1 and 100',
        },
      };
    }

    // Validate sortBy
    if (sortBy && !['name', 'applicationDate', 'status'].includes(sortBy)) {
      return {
        status: 400,
        jsonBody: {
          error: 'Bad Request',
          message: 'sortBy must be one of: name, applicationDate, status',
        },
      };
    }

    // Validate sortDirection
    if (sortDirection && !['asc', 'desc'].includes(sortDirection)) {
      return {
        status: 400,
        jsonBody: {
          error: 'Bad Request',
          message: 'sortDirection must be either asc or desc',
        },
      };
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

    return {
      status: 200,
      jsonBody: result,
    };
  } catch (error) {
    context.error('Error listing candidates:', error);

    if (error instanceof DatabaseError) {
      return {
        status: 500,
        jsonBody: {
          error: 'Internal Server Error',
          message: 'An error occurred while processing your request',
        },
      };
    }

    return {
      status: 500,
      jsonBody: {
        error: 'Internal Server Error',
        message: 'An unexpected error occurred',
      },
    };
  }
}

app.http('getCandidates', {
  methods: ['GET'],
  authLevel: 'anonymous',
  route: 'candidates',
  handler: getCandidates,
});

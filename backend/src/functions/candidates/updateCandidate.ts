import { app, HttpRequest, HttpResponseInit, InvocationContext } from '@azure/functions';
import { CandidateService } from '../../application/services/CandidateService';
import { CandidateRepository } from '../../infrastructure/database/repositories/CandidateRepository';
import { tableClient } from '../../infrastructure/config/tableStorageConfig';
import {
  ValidationError,
  NotFoundError,
  DatabaseError,
  PreconditionFailedError,
  ConflictError,
  DatabaseError, 
} from '../../shared/errors/CustomErrors';
import { createSuccessResponse, createErrorResponse } from '../../shared/utils/responseHelper';
import { mapCandidateToFrontend } from '../../shared/utils/candidateMapper';

export async function updateCandidate(
  request: HttpRequest,
  context: InvocationContext
): Promise<HttpResponseInit> {
  context.log('PUT /api/candidates/{id} endpoint called');

  try {
    const id = request.params.id;

    if (!id) {
      return createErrorResponse('VALIDATION_ERROR', 'Candidate ID is required', 400);
    }

    const body = await request.json();

    const candidateRepository = new CandidateRepository(tableClient);
    const candidateService = new CandidateService(candidateRepository);

    const updatedCandidate = await candidateService.updateCandidate(id, body);
    const frontendCandidate = mapCandidateToFrontend(updatedCandidate);

    return createSuccessResponse(frontendCandidate);
  } catch (error) {
    context.error('Error updating candidate:', error);

    if (error instanceof ValidationError) {
      return createErrorResponse('VALIDATION_ERROR', error.message, 400, {
        field: error.field,
      });
    }

    if (error instanceof NotFoundError) {
      return createErrorResponse('NOT_FOUND', error.message, 404);
    }

    if (error instanceof PreconditionFailedError) {
      return createErrorResponse(
        'CONCURRENCY_CONFLICT',
        'This candidate was modified by another user. Please refresh and try again.',
        412
      );
    }

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

app.http('updateCandidate', {
  methods: ['PUT'],
  authLevel: 'anonymous',
  route: 'candidates/{id}',
  handler: updateCandidate,
});

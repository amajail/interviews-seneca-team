import { app, HttpRequest, HttpResponseInit, InvocationContext } from '@azure/functions';
import { CandidateService } from '../../application/services/CandidateService';
import { CandidateRepository } from '../../infrastructure/database/repositories/CandidateRepository';
import { tableClient } from '../../infrastructure/config/tableStorageConfig';
import { NotFoundError, DatabaseError } from '../../shared/errors/CustomErrors';
import { createSuccessResponse, createErrorResponse } from '../../shared/utils/responseHelper';
import { mapCandidateToFrontend } from '../../shared/utils/candidateMapper';

export async function getCandidateById(
  request: HttpRequest,
  context: InvocationContext
): Promise<HttpResponseInit> {
  context.log('GET /api/candidates/{id} endpoint called');

  try {
    const id = request.params.id;

    if (!id) {
      return createErrorResponse('VALIDATION_ERROR', 'Candidate ID is required', 400);
    }

    const candidateRepository = new CandidateRepository(tableClient);
    const candidateService = new CandidateService(candidateRepository);

    const candidate = await candidateService.getCandidateById(id);
    const frontendCandidate = mapCandidateToFrontend(candidate);

    return createSuccessResponse(frontendCandidate);
  } catch (error) {
    context.error('Error retrieving candidate:', error);

    if (error instanceof NotFoundError) {
      return createErrorResponse('NOT_FOUND', error.message, 404);
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

app.http('getCandidateById', {
  methods: ['GET'],
  authLevel: 'anonymous',
  route: 'candidates/{id}',
  handler: getCandidateById,
});

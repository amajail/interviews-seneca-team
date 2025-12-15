import { app, HttpRequest, HttpResponseInit, InvocationContext } from '@azure/functions';
import { CandidateService } from '../../application/services/CandidateService';
import { CandidateRepository } from '../../infrastructure/database/repositories/CandidateRepository';
import { tableClient } from '../../infrastructure/config/tableStorageConfig';
import { ValidationError, ConflictError, DatabaseError } from '../../shared/errors/CustomErrors';
import { createSuccessResponse, createErrorResponse } from '../../shared/utils/responseHelper';
import { mapCandidateToFrontend } from '../../shared/utils/candidateMapper';

export async function createCandidate(
  request: HttpRequest,
  context: InvocationContext
): Promise<HttpResponseInit> {
  context.log('POST /api/candidates endpoint called');

  try {
    const body = await request.json();

    const candidateRepository = new CandidateRepository(tableClient);
    const candidateService = new CandidateService(candidateRepository);

    const createdCandidate = await candidateService.createCandidate(body);
    const frontendCandidate = mapCandidateToFrontend(createdCandidate);

    return createSuccessResponse(frontendCandidate, 201);
  } catch (error) {
    context.error('Error creating candidate:', error);

    if (error instanceof ValidationError) {
      return createErrorResponse('VALIDATION_ERROR', error.message, 400, {
        field: error.field,
      });
    }

    if (error instanceof ConflictError) {
      return createErrorResponse('CONFLICT_ERROR', error.message, 409);
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

app.http('createCandidate', {
  methods: ['POST'],
  authLevel: 'anonymous',
  route: 'candidates',
  handler: createCandidate,
});

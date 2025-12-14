import { app, HttpRequest, HttpResponseInit, InvocationContext } from '@azure/functions';
import { CandidateService } from '../../application/services/CandidateService';
import { CandidateRepository } from '../../infrastructure/database/repositories/CandidateRepository';
import { tableClient } from '../../infrastructure/config/tableStorageConfig';
import { ValidationError, ConflictError, DatabaseError } from '../../shared/errors/CustomErrors';

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

    return {
      status: 201,
      jsonBody: createdCandidate,
    };
  } catch (error) {
    context.error('Error creating candidate:', error);

    if (error instanceof ValidationError) {
      return {
        status: 400,
        jsonBody: {
          error: 'Validation Error',
          message: error.message,
          field: error.field,
        },
      };
    }

    if (error instanceof ConflictError) {
      return {
        status: 409,
        jsonBody: {
          error: 'Conflict',
          message: error.message,
        },
      };
    }

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

app.http('createCandidate', {
  methods: ['POST'],
  authLevel: 'anonymous',
  route: 'candidates',
  handler: createCandidate,
});

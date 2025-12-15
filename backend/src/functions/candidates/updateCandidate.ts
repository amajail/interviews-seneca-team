import { app, HttpRequest, HttpResponseInit, InvocationContext } from '@azure/functions';
import { CandidateService } from '../../application/services/CandidateService';
import { CandidateRepository } from '../../infrastructure/database/repositories/CandidateRepository';
import { tableClient } from '../../infrastructure/config/tableStorageConfig';
import {
  ValidationError,
  NotFoundError,
  ConflictError,
  DatabaseError,
} from '../../shared/errors/CustomErrors';

export async function updateCandidate(
  request: HttpRequest,
  context: InvocationContext
): Promise<HttpResponseInit> {
  context.log('PUT /api/candidates/{id} endpoint called');

  try {
    const id = request.params.id;
    if (!id) {
      return {
        status: 400,
        jsonBody: {
          error: 'Bad Request',
          message: 'Candidate ID is required',
        },
      };
    }

    const requestBody = await request.json();

    const candidateRepository = new CandidateRepository(tableClient);
    const candidateService = new CandidateService(candidateRepository);

    const updatedCandidate = await candidateService.updateCandidate(id, requestBody);

    return {
      status: 200,
      jsonBody: updatedCandidate,
    };
  } catch (error) {
    context.error('Error updating candidate:', error);

    if (error instanceof ValidationError) {
      return {
        status: 400,
        jsonBody: {
          error: 'Bad Request',
          message: error.message,
          field: error.field,
        },
      };
    }

    if (error instanceof NotFoundError) {
      return {
        status: 404,
        jsonBody: {
          error: 'Not Found',
          message: error.message,
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

app.http('updateCandidate', {
  methods: ['PUT'],
  authLevel: 'anonymous',
  route: 'candidates/{id}',
  handler: updateCandidate,
});

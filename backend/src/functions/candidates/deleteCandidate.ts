import { app, HttpRequest, HttpResponseInit, InvocationContext } from '@azure/functions';
import { CandidateService } from '../../application/services/CandidateService';
import { CandidateRepository } from '../../infrastructure/database/repositories/CandidateRepository';
import { tableClient } from '../../infrastructure/config/tableStorageConfig';
import { NotFoundError, DatabaseError } from '../../shared/errors/CustomErrors';

export async function deleteCandidate(
  request: HttpRequest,
  context: InvocationContext
): Promise<HttpResponseInit> {
  context.log('DELETE /api/candidates/{id} endpoint called');

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

    const candidateRepository = new CandidateRepository(tableClient);
    const candidateService = new CandidateService(candidateRepository);

    await candidateService.deleteCandidate(id);

    return {
      status: 204,
    };
  } catch (error) {
    context.error('Error deleting candidate:', error);

    if (error instanceof NotFoundError) {
      return {
        status: 404,
        jsonBody: {
          error: 'Not Found',
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

app.http('deleteCandidate', {
  methods: ['DELETE'],
  authLevel: 'anonymous',
  route: 'candidates/{id}',
  handler: deleteCandidate,
});

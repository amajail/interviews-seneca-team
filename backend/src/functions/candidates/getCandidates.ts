import { app, HttpRequest, HttpResponseInit, InvocationContext } from '@azure/functions';

export async function getCandidates(
  _request: HttpRequest,
  context: InvocationContext
): Promise<HttpResponseInit> {
  context.log('Get candidates endpoint called');

  // TODO: Implement in BACK-004
  return {
    status: 200,
    jsonBody: {
      message: 'Candidates endpoint - to be implemented in BACK-004',
      data: [],
    },
  };
}

app.http('getCandidates', {
  methods: ['GET'],
  authLevel: 'anonymous',
  route: 'candidates',
  handler: getCandidates,
});

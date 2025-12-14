import { app, HttpRequest, HttpResponseInit, InvocationContext } from '@azure/functions';

export async function healthCheck(_request: HttpRequest, context: InvocationContext): Promise<HttpResponseInit> {
  context.log('Health check endpoint called');

  return {
    status: 200,
    jsonBody: {
      status: 'healthy',
      timestamp: new Date().toISOString(),
      service: 'interviews-seneca-backend',
      version: '1.0.0'
    }
  };
}

app.http('healthCheck', {
  methods: ['GET'],
  authLevel: 'anonymous',
  route: 'health',
  handler: healthCheck
});

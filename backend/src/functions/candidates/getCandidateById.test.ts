import { HttpRequest, InvocationContext } from '@azure/functions';
import { getCandidateById } from './getCandidateById';
import { CandidateStatus, InterviewStage } from '../../domain/entities/Candidate';

// Mock dependencies
jest.mock('../../infrastructure/config/tableStorageConfig', () => ({
  tableClient: {
    listEntities: jest.fn(),
    createEntity: jest.fn(),
    updateEntity: jest.fn(),
    deleteEntity: jest.fn(),
  },
}));

describe('getCandidateById Function', () => {
  let mockContext: InvocationContext;
  let mockTableClient: any;

  beforeEach(() => {
    mockContext = {
      log: jest.fn(),
      error: jest.fn(),
    } as any;

    mockTableClient = require('../../infrastructure/config/tableStorageConfig').tableClient;
    jest.clearAllMocks();
  });

  const createMockRequest = (id?: string): HttpRequest => {
    return {
      method: 'GET',
      url: `http://localhost:7071/api/candidates/${id ?? ''}`,
      params: { id },
    } as any;
  };

  describe('Success Cases', () => {
    it('should return 200 with candidate data when candidate exists', async () => {
      const candidateId = 'test-candidate-id';
      const mockCandidate = {
        partitionKey: 'CANDIDATE#2025-01',
        rowKey: candidateId,
        id: candidateId,
        name: 'John Doe',
        email: 'john@example.com',
        position: 'Software Engineer',
        status: CandidateStatus.NEW,
        interviewStage: InterviewStage.NOT_STARTED,
      };

      const mockAsyncIterator = {
        [Symbol.asyncIterator]: async function* () {
          yield mockCandidate;
        },
      };

      mockTableClient.listEntities.mockReturnValue(mockAsyncIterator);

      const request = createMockRequest(candidateId);
      const response = await getCandidateById(request, mockContext);

      expect(response.status).toBe(200);
      expect(response.jsonBody).toHaveProperty('id', candidateId);
      expect(response.jsonBody).toHaveProperty('name', 'John Doe');
      expect(response.jsonBody).toHaveProperty('email', 'john@example.com');
      expect(mockTableClient.listEntities).toHaveBeenCalled();
    });

    it('should return candidate with all fields populated', async () => {
      const candidateId = 'full-candidate-id';
      const mockCandidate = {
        partitionKey: 'CANDIDATE#2025-01',
        rowKey: candidateId,
        id: candidateId,
        name: 'Jane Smith',
        email: 'jane@example.com',
        phone: '+1234567890',
        position: 'Senior Developer',
        status: CandidateStatus.INTERVIEWING,
        interviewStage: InterviewStage.TECHNICAL,
        applicationDate: '2025-01-01T00:00:00.000Z',
        expectedSalary: 120000,
        yearsOfExperience: 8,
        notes: 'Excellent candidate',
      };

      const mockAsyncIterator = {
        [Symbol.asyncIterator]: async function* () {
          yield mockCandidate;
        },
      };

      mockTableClient.listEntities.mockReturnValue(mockAsyncIterator);

      const request = createMockRequest(candidateId);
      const response = await getCandidateById(request, mockContext);

      expect(response.status).toBe(200);
      expect(response.jsonBody).toHaveProperty('phone', '+1234567890');
      expect(response.jsonBody).toHaveProperty('expectedSalary', 120000);
      expect(response.jsonBody).toHaveProperty('yearsOfExperience', 8);
    });
  });

  describe('Error Cases - Not Found', () => {
    it('should return 404 when candidate does not exist', async () => {
      const candidateId = 'non-existent-id';

      const mockAsyncIterator = {
        [Symbol.asyncIterator]: async function* () {
          // Empty iterator - no candidate found
        },
      };

      mockTableClient.listEntities.mockReturnValue(mockAsyncIterator);

      const request = createMockRequest(candidateId);
      const response = await getCandidateById(request, mockContext);

      expect(response.status).toBe(404);
      expect(response.jsonBody).toHaveProperty('error', 'Not Found');
      expect(response.jsonBody).toHaveProperty('message');
      expect(response.jsonBody.message).toContain('non-existent-id');
    });
  });

  describe('Error Cases - Bad Request', () => {
    it('should return 400 when id is missing', async () => {
      const request = createMockRequest();

      const response = await getCandidateById(request, mockContext);

      expect(response.status).toBe(400);
      expect(response.jsonBody).toHaveProperty('error', 'Bad Request');
      expect(response.jsonBody).toHaveProperty('message', 'Candidate ID is required');
    });

    it('should return 400 when id is empty string', async () => {
      const request = createMockRequest('');

      const response = await getCandidateById(request, mockContext);

      expect(response.status).toBe(400);
      expect(response.jsonBody).toHaveProperty('error', 'Bad Request');
    });
  });

  describe('Error Cases - Database Errors', () => {
    it('should return 500 when database operation fails', async () => {
      const candidateId = 'test-id';

      mockTableClient.listEntities.mockImplementation(() => {
        throw new Error('Database connection failed');
      });

      const request = createMockRequest(candidateId);
      const response = await getCandidateById(request, mockContext);

      expect(response.status).toBe(500);
      expect(response.jsonBody).toHaveProperty('error', 'Internal Server Error');
      expect(mockContext.error).toHaveBeenCalled();
    });
  });

  describe('Error Cases - Unexpected Errors', () => {
    it('should return 500 for unexpected errors', async () => {
      const candidateId = 'test-id';

      // Mock an unexpected error
      const mockAsyncIterator = {
        // eslint-disable-next-line require-yield
        async *[Symbol.asyncIterator]() {
          throw new Error('Unexpected error');
        },
      };

      mockTableClient.listEntities.mockReturnValue(mockAsyncIterator);

      const request = createMockRequest(candidateId);
      const response = await getCandidateById(request, mockContext);

      expect(response.status).toBe(500);
      expect(response.jsonBody).toHaveProperty('error', 'Internal Server Error');
      expect(mockContext.error).toHaveBeenCalled();
    });
  });
});

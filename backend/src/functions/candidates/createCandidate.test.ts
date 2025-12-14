import { HttpRequest, InvocationContext } from '@azure/functions';
import { createCandidate } from './createCandidate';
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

describe('createCandidate Function', () => {
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

  const createMockRequest = (body: any): HttpRequest => {
    return {
      method: 'POST',
      url: 'http://localhost:7071/api/candidates',
      json: async () => body,
    } as HttpRequest;
  };

  describe('Success Cases', () => {
    it('should return 201 with created candidate for valid data', async () => {
      const requestBody = {
        name: 'John Doe',
        email: 'john@example.com',
        position: 'Software Engineer',
        phone: '+1234567890',
        expectedSalary: 100000,
        yearsOfExperience: 5,
        notes: 'Excellent candidate',
      };

      const mockAsyncIterator = {
        [Symbol.asyncIterator]: async function* () {
          // Empty iterator - no duplicate email
        },
      };

      mockTableClient.listEntities.mockReturnValue(mockAsyncIterator);
      mockTableClient.createEntity.mockResolvedValue({});

      const request = createMockRequest(requestBody);
      const response = await createCandidate(request, mockContext);

      expect(response.status).toBe(201);
      expect(response.jsonBody).toHaveProperty('id');
      expect(response.jsonBody).toHaveProperty('name', 'John Doe');
      expect(response.jsonBody).toHaveProperty('email', 'john@example.com');
      expect(response.jsonBody).toHaveProperty('position', 'Software Engineer');
      expect(mockTableClient.createEntity).toHaveBeenCalled();
    });

    it('should return 201 with minimal required fields', async () => {
      const requestBody = {
        name: 'Jane Smith',
        email: 'jane@example.com',
        position: 'Designer',
      };

      const mockAsyncIterator = {
        [Symbol.asyncIterator]: async function* () {
          // Empty iterator
        },
      };

      mockTableClient.listEntities.mockReturnValue(mockAsyncIterator);
      mockTableClient.createEntity.mockResolvedValue({});

      const request = createMockRequest(requestBody);
      const response = await createCandidate(request, mockContext);

      expect(response.status).toBe(201);
      expect(response.jsonBody).toHaveProperty('name', 'Jane Smith');
      expect(response.jsonBody).toHaveProperty('status', CandidateStatus.NEW);
      expect(response.jsonBody).toHaveProperty('interviewStage', InterviewStage.NOT_STARTED);
    });

    it('should accept custom status and interviewStage', async () => {
      const requestBody = {
        name: 'Bob Wilson',
        email: 'bob@example.com',
        position: 'Manager',
        status: CandidateStatus.INTERVIEWING,
        interviewStage: InterviewStage.TECHNICAL,
      };

      const mockAsyncIterator = {
        [Symbol.asyncIterator]: async function* () {
          // Empty iterator
        },
      };

      mockTableClient.listEntities.mockReturnValue(mockAsyncIterator);
      mockTableClient.createEntity.mockResolvedValue({});

      const request = createMockRequest(requestBody);
      const response = await createCandidate(request, mockContext);

      expect(response.status).toBe(201);
      expect(response.jsonBody).toHaveProperty('status', CandidateStatus.INTERVIEWING);
      expect(response.jsonBody).toHaveProperty('interviewStage', InterviewStage.TECHNICAL);
    });
  });

  describe('Validation Error Cases', () => {
    it('should return 400 when name is missing', async () => {
      const requestBody = {
        email: 'test@example.com',
        position: 'Developer',
      };

      const request = createMockRequest(requestBody);
      const response = await createCandidate(request, mockContext);

      expect(response.status).toBe(400);
      expect(response.jsonBody).toHaveProperty('error', 'Validation Error');
      expect(response.jsonBody).toHaveProperty('message');
    });

    it('should return 400 when email is missing', async () => {
      const requestBody = {
        name: 'John Doe',
        position: 'Developer',
      };

      const request = createMockRequest(requestBody);
      const response = await createCandidate(request, mockContext);

      expect(response.status).toBe(400);
      expect(response.jsonBody).toHaveProperty('error', 'Validation Error');
    });

    it('should return 400 when email format is invalid', async () => {
      const requestBody = {
        name: 'John Doe',
        email: 'invalid-email',
        position: 'Developer',
      };

      const request = createMockRequest(requestBody);
      const response = await createCandidate(request, mockContext);

      expect(response.status).toBe(400);
      expect(response.jsonBody).toHaveProperty('error', 'Validation Error');
      expect(response.jsonBody.message).toContain('email');
    });

    it('should return 400 when position is missing', async () => {
      const requestBody = {
        name: 'John Doe',
        email: 'test@example.com',
      };

      const request = createMockRequest(requestBody);
      const response = await createCandidate(request, mockContext);

      expect(response.status).toBe(400);
      expect(response.jsonBody).toHaveProperty('error', 'Validation Error');
    });

    it('should return 400 when name exceeds max length', async () => {
      const requestBody = {
        name: 'a'.repeat(101),
        email: 'test@example.com',
        position: 'Developer',
      };

      const request = createMockRequest(requestBody);
      const response = await createCandidate(request, mockContext);

      expect(response.status).toBe(400);
      expect(response.jsonBody).toHaveProperty('error', 'Validation Error');
    });

    it('should return 400 when expectedSalary is negative', async () => {
      const requestBody = {
        name: 'John Doe',
        email: 'test@example.com',
        position: 'Developer',
        expectedSalary: -1000,
      };

      const request = createMockRequest(requestBody);
      const response = await createCandidate(request, mockContext);

      expect(response.status).toBe(400);
      expect(response.jsonBody).toHaveProperty('error', 'Validation Error');
    });

    it('should return 400 when yearsOfExperience is negative', async () => {
      const requestBody = {
        name: 'John Doe',
        email: 'test@example.com',
        position: 'Developer',
        yearsOfExperience: -5,
      };

      const request = createMockRequest(requestBody);
      const response = await createCandidate(request, mockContext);

      expect(response.status).toBe(400);
      expect(response.jsonBody).toHaveProperty('error', 'Validation Error');
    });

    it('should return 400 for invalid status enum', async () => {
      const requestBody = {
        name: 'John Doe',
        email: 'test@example.com',
        position: 'Developer',
        status: 'invalid_status',
      };

      const request = createMockRequest(requestBody);
      const response = await createCandidate(request, mockContext);

      expect(response.status).toBe(400);
      expect(response.jsonBody).toHaveProperty('error', 'Validation Error');
    });
  });

  describe('Conflict Error Cases', () => {
    it('should return 409 when email already exists', async () => {
      const requestBody = {
        name: 'John Doe',
        email: 'existing@example.com',
        position: 'Developer',
      };

      const existingCandidate = {
        partitionKey: 'CANDIDATE#2025-01',
        rowKey: 'existing-id',
        email: 'existing@example.com',
      };

      const mockAsyncIterator = {
        [Symbol.asyncIterator]: async function* () {
          yield existingCandidate;
        },
      };

      mockTableClient.listEntities.mockReturnValue(mockAsyncIterator);

      const request = createMockRequest(requestBody);
      const response = await createCandidate(request, mockContext);

      expect(response.status).toBe(409);
      expect(response.jsonBody).toHaveProperty('error', 'Conflict');
      expect(response.jsonBody.message).toContain('email');
    });
  });

  describe('Database Error Cases', () => {
    it('should return 500 when database operation fails', async () => {
      const requestBody = {
        name: 'John Doe',
        email: 'test@example.com',
        position: 'Developer',
      };

      const mockAsyncIterator = {
        [Symbol.asyncIterator]: async function* () {
          // Empty iterator
        },
      };

      mockTableClient.listEntities.mockReturnValue(mockAsyncIterator);
      mockTableClient.createEntity.mockRejectedValue(new Error('Database connection failed'));

      const request = createMockRequest(requestBody);
      const response = await createCandidate(request, mockContext);

      expect(response.status).toBe(500);
      expect(response.jsonBody).toHaveProperty('error', 'Internal Server Error');
    });
  });

  describe('Unexpected Error Cases', () => {
    it('should return 500 for unexpected errors', async () => {
      // Mock json() to throw an unexpected error
      const request = {
        method: 'POST',
        url: 'http://localhost:7071/api/candidates',
        json: jest.fn().mockRejectedValue(new Error('Unexpected error')),
      } as any;

      const response = await createCandidate(request, mockContext);

      expect(response.status).toBe(500);
      expect(response.jsonBody).toHaveProperty('error', 'Internal Server Error');
      expect(mockContext.error).toHaveBeenCalled();
    });
  });
});

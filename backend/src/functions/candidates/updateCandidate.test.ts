import { HttpRequest, InvocationContext } from '@azure/functions';
import { updateCandidate } from './updateCandidate';
import { CandidateStatus, InterviewStage } from '../../domain/entities/Candidate';

// Mock dependencies
jest.mock('../../infrastructure/config/tableStorageConfig', () => ({
  tableClient: {
    listEntities: jest.fn(),
    getEntity: jest.fn(),
    createEntity: jest.fn(),
    updateEntity: jest.fn(),
  },
}));

describe('updateCandidate Function', () => {
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

  const createMockRequest = (id: string, body: any): HttpRequest => {
    return {
      method: 'PUT',
      url: `http://localhost:7071/api/candidates/${id}`,
      params: { id },
      json: async () => body,
    } as any;
  };

  describe('Success Cases', () => {
    it('should return 200 with updated candidate', async () => {
      const candidateId = 'test-id-123';
      const updateData = {
        name: 'John Updated',
        status: CandidateStatus.INTERVIEWING,
      };

      const existingCandidate = {
        partitionKey: 'CANDIDATE#2025-01',
        rowKey: candidateId,
        id: candidateId,
        name: 'John Doe',
        email: 'john@example.com',
        position: 'Developer',
        status: CandidateStatus.NEW,
        interviewStage: InterviewStage.NOT_STARTED,
        applicationDate: new Date('2025-01-01'),
        createdAt: new Date('2025-01-01'),
        updatedAt: new Date('2025-01-01'),
        etag: 'old-etag',
      };

      // Mock findById
      const mockListEntities = {
        [Symbol.asyncIterator]: async function* () {
          yield existingCandidate;
        },
      };
      mockTableClient.listEntities.mockReturnValue(mockListEntities);

      // Mock update
      mockTableClient.updateEntity.mockResolvedValue({});

      const request = createMockRequest(candidateId, updateData);
      const response = await updateCandidate(request, mockContext);

      expect(response.status).toBe(200);
      expect(response.jsonBody).toHaveProperty('name', 'John Updated');
      expect(response.jsonBody).toHaveProperty('status', CandidateStatus.INTERVIEWING);
      expect(response.jsonBody).toHaveProperty('id', candidateId);
      expect(mockTableClient.updateEntity).toHaveBeenCalled();
    });

    it('should update only provided fields', async () => {
      const candidateId = 'test-id-456';
      const updateData = {
        notes: 'Updated notes',
      };

      const existingCandidate = {
        partitionKey: 'CANDIDATE#2025-01',
        rowKey: candidateId,
        id: candidateId,
        name: 'Jane Smith',
        email: 'jane@example.com',
        position: 'Designer',
        status: CandidateStatus.NEW,
        interviewStage: InterviewStage.NOT_STARTED,
        applicationDate: new Date('2025-01-01'),
        createdAt: new Date('2025-01-01'),
        updatedAt: new Date('2025-01-01'),
      };

      const mockListEntities = {
        [Symbol.asyncIterator]: async function* () {
          yield existingCandidate;
        },
      };
      mockTableClient.listEntities.mockReturnValue(mockListEntities);
      mockTableClient.updateEntity.mockResolvedValue({});

      const request = createMockRequest(candidateId, updateData);
      const response = await updateCandidate(request, mockContext);

      expect(response.status).toBe(200);
      expect(response.jsonBody).toHaveProperty('notes', 'Updated notes');
      expect(response.jsonBody).toHaveProperty('id', candidateId);
      // Verify that the update was called
      expect(mockTableClient.updateEntity).toHaveBeenCalled();
    });

    it('should update multiple fields', async () => {
      const candidateId = 'test-id-789';
      const updateData = {
        status: CandidateStatus.OFFER,
        interviewStage: InterviewStage.COMPLETED,
        expectedSalary: 120000,
      };

      const existingCandidate = {
        partitionKey: 'CANDIDATE#2025-01',
        rowKey: candidateId,
        id: candidateId,
        name: 'Bob Johnson',
        email: 'bob@example.com',
        position: 'Senior Developer',
        status: CandidateStatus.INTERVIEWING,
        interviewStage: InterviewStage.FINAL,
        applicationDate: new Date('2025-01-01'),
        expectedSalary: 100000,
        createdAt: new Date('2025-01-01'),
        updatedAt: new Date('2025-01-01'),
      };

      const mockListEntities = {
        [Symbol.asyncIterator]: async function* () {
          yield existingCandidate;
        },
      };
      mockTableClient.listEntities.mockReturnValue(mockListEntities);
      mockTableClient.updateEntity.mockResolvedValue({});

      const request = createMockRequest(candidateId, updateData);
      const response = await updateCandidate(request, mockContext);

      expect(response.status).toBe(200);
      expect(response.jsonBody).toHaveProperty('status', CandidateStatus.OFFER);
      expect(response.jsonBody).toHaveProperty('interviewStage', InterviewStage.COMPLETED);
      expect(response.jsonBody).toHaveProperty('expectedSalary', 120000);
    });
  });

  describe('Validation Errors', () => {
    it('should return 400 when ID is missing', async () => {
      const request = {
        method: 'PUT',
        url: 'http://localhost:7071/api/candidates/',
        params: {},
        json: async () => ({}),
      } as any;

      const response = await updateCandidate(request, mockContext);

      expect(response.status).toBe(400);
      expect(response.jsonBody.error).toBe('Bad Request');
      expect(response.jsonBody.message).toContain('Candidate ID is required');
    });

    it('should return 400 when no fields are provided', async () => {
      const candidateId = 'test-id';
      const request = createMockRequest(candidateId, {});

      const response = await updateCandidate(request, mockContext);

      expect(response.status).toBe(400);
      expect(response.jsonBody.error).toBe('Bad Request');
      expect(response.jsonBody.message).toContain('At least one field must be provided');
    });

    it('should return 400 for invalid email format', async () => {
      const candidateId = 'test-id';
      const updateData = {
        email: 'invalid-email',
      };

      const request = createMockRequest(candidateId, updateData);
      const response = await updateCandidate(request, mockContext);

      expect(response.status).toBe(400);
      expect(response.jsonBody.error).toBe('Bad Request');
      expect(response.jsonBody.message).toContain('Invalid email format');
    });

    it('should return 400 when name is empty string', async () => {
      const candidateId = 'test-id';
      const updateData = {
        name: '',
      };

      const request = createMockRequest(candidateId, updateData);
      const response = await updateCandidate(request, mockContext);

      expect(response.status).toBe(400);
      expect(response.jsonBody.message).toContain('Name cannot be empty');
    });

    it('should return 400 when name exceeds max length', async () => {
      const candidateId = 'test-id';
      const updateData = {
        name: 'a'.repeat(101),
      };

      const request = createMockRequest(candidateId, updateData);
      const response = await updateCandidate(request, mockContext);

      expect(response.status).toBe(400);
      expect(response.jsonBody.message).toContain('Name must be less than 100 characters');
    });

    it('should return 400 when expectedSalary is negative', async () => {
      const candidateId = 'test-id';
      const updateData = {
        expectedSalary: -1000,
      };

      const request = createMockRequest(candidateId, updateData);
      const response = await updateCandidate(request, mockContext);

      expect(response.status).toBe(400);
      expect(response.jsonBody.message).toContain('Expected salary must be positive');
    });

    it('should return 400 when yearsOfExperience is negative', async () => {
      const candidateId = 'test-id';
      const updateData = {
        yearsOfExperience: -1,
      };

      const request = createMockRequest(candidateId, updateData);
      const response = await updateCandidate(request, mockContext);

      expect(response.status).toBe(400);
      expect(response.jsonBody.message).toContain('Years of experience cannot be negative');
    });

    it('should return 400 for invalid status enum value', async () => {
      const candidateId = 'test-id';
      const updateData = {
        status: 'invalid_status',
      };

      const request = createMockRequest(candidateId, updateData);
      const response = await updateCandidate(request, mockContext);

      expect(response.status).toBe(400);
      expect(response.jsonBody.error).toBe('Bad Request');
    });

    it('should return 400 for invalid interviewStage enum value', async () => {
      const candidateId = 'test-id';
      const updateData = {
        interviewStage: 'invalid_stage',
      };

      const request = createMockRequest(candidateId, updateData);
      const response = await updateCandidate(request, mockContext);

      expect(response.status).toBe(400);
      expect(response.jsonBody.error).toBe('Bad Request');
    });
  });

  describe('Error Cases', () => {
    it('should return 404 when candidate does not exist', async () => {
      const candidateId = 'non-existent-id';
      const updateData = {
        name: 'Updated Name',
      };

      const mockListEntities = {
        [Symbol.asyncIterator]: async function* () {
          // No results
        },
      };
      mockTableClient.listEntities.mockReturnValue(mockListEntities);

      const request = createMockRequest(candidateId, updateData);
      const response = await updateCandidate(request, mockContext);

      expect(response.status).toBe(404);
      expect(response.jsonBody.error).toBe('Not Found');
      expect(response.jsonBody.message).toContain(candidateId);
    });

    it('should return 500 when database operation fails', async () => {
      const candidateId = 'test-id';
      const updateData = {
        name: 'Updated Name',
      };

      mockTableClient.listEntities.mockImplementation(() => {
        throw new Error('Database connection failed');
      });

      const request = createMockRequest(candidateId, updateData);
      const response = await updateCandidate(request, mockContext);

      expect(response.status).toBe(500);
      expect(response.jsonBody.error).toBe('Internal Server Error');
      expect(mockContext.error).toHaveBeenCalled();
    });
  });
});

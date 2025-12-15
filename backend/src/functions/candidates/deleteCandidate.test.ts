import { HttpRequest, InvocationContext } from '@azure/functions';
import { deleteCandidate } from './deleteCandidate';

// Mock dependencies
jest.mock('../../infrastructure/config/tableStorageConfig', () => ({
  tableClient: {
    listEntities: jest.fn(),
    deleteEntity: jest.fn(),
  },
}));

describe('deleteCandidate Function', () => {
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
      method: 'DELETE',
      url: `http://localhost:7071/api/candidates/${id ?? ''}`,
      params: id ? { id } : {},
    } as any;
  };

  describe('Success Cases', () => {
    it('should return 204 when candidate is deleted successfully', async () => {
      const candidateId = 'test-id-123';

      const existingCandidate = {
        partitionKey: 'CANDIDATE#2025-01',
        rowKey: candidateId,
        id: candidateId,
        name: 'John Doe',
        email: 'john@example.com',
      };

      // Mock findById
      const mockListEntities = {
        [Symbol.asyncIterator]: async function* () {
          yield existingCandidate;
        },
      };
      mockTableClient.listEntities.mockReturnValue(mockListEntities);

      // Mock delete
      mockTableClient.deleteEntity.mockResolvedValue({});

      const request = createMockRequest(candidateId);
      const response = await deleteCandidate(request, mockContext);

      expect(response.status).toBe(204);
      expect(response.jsonBody).toBeUndefined();
      expect(mockTableClient.deleteEntity).toHaveBeenCalledWith('CANDIDATE#2025-01', candidateId);
    });

    it('should delete candidate with different partition key', async () => {
      const candidateId = 'test-id-456';

      const existingCandidate = {
        partitionKey: 'CANDIDATE#2024-12',
        rowKey: candidateId,
        id: candidateId,
        name: 'Jane Smith',
        email: 'jane@example.com',
      };

      const mockListEntities = {
        [Symbol.asyncIterator]: async function* () {
          yield existingCandidate;
        },
      };
      mockTableClient.listEntities.mockReturnValue(mockListEntities);
      mockTableClient.deleteEntity.mockResolvedValue({});

      const request = createMockRequest(candidateId);
      const response = await deleteCandidate(request, mockContext);

      expect(response.status).toBe(204);
      expect(mockTableClient.deleteEntity).toHaveBeenCalledWith('CANDIDATE#2024-12', candidateId);
    });
  });

  describe('Validation Errors', () => {
    it('should return 400 when ID is missing', async () => {
      const request = {
        method: 'DELETE',
        url: 'http://localhost:7071/api/candidates/',
        params: {},
      } as any;

      const response = await deleteCandidate(request, mockContext);

      expect(response.status).toBe(400);
      expect(response.jsonBody.error).toBe('Bad Request');
      expect(response.jsonBody.message).toContain('Candidate ID is required');
      expect(mockTableClient.deleteEntity).not.toHaveBeenCalled();
    });

    it('should return 400 when ID is empty string', async () => {
      const request = createMockRequest('');

      const response = await deleteCandidate(request, mockContext);

      expect(response.status).toBe(400);
      expect(response.jsonBody.message).toContain('Candidate ID is required');
    });
  });

  describe('Error Cases', () => {
    it('should return 404 when candidate does not exist', async () => {
      const candidateId = 'non-existent-id';

      // Mock findById returns no results
      const mockListEntities = {
        [Symbol.asyncIterator]: async function* () {
          // No results
        },
      };
      mockTableClient.listEntities.mockReturnValue(mockListEntities);

      const request = createMockRequest(candidateId);
      const response = await deleteCandidate(request, mockContext);

      expect(response.status).toBe(404);
      expect(response.jsonBody.error).toBe('Not Found');
      expect(response.jsonBody.message).toContain(candidateId);
      expect(mockTableClient.deleteEntity).not.toHaveBeenCalled();
    });

    it('should return 404 with candidate ID in error message', async () => {
      const candidateId = 'missing-candidate-789';

      const mockListEntities = {
        [Symbol.asyncIterator]: async function* () {
          // No results
        },
      };
      mockTableClient.listEntities.mockReturnValue(mockListEntities);

      const request = createMockRequest(candidateId);
      const response = await deleteCandidate(request, mockContext);

      expect(response.status).toBe(404);
      expect(response.jsonBody.message).toContain(candidateId);
      expect(mockContext.error).toHaveBeenCalled();
    });

    it('should return 500 when database delete operation fails', async () => {
      const candidateId = 'test-id';

      const existingCandidate = {
        partitionKey: 'CANDIDATE#2025-01',
        rowKey: candidateId,
        id: candidateId,
        name: 'John Doe',
        email: 'john@example.com',
      };

      const mockListEntities = {
        [Symbol.asyncIterator]: async function* () {
          yield existingCandidate;
        },
      };
      mockTableClient.listEntities.mockReturnValue(mockListEntities);
      mockTableClient.deleteEntity.mockRejectedValue(new Error('Database error'));

      const request = createMockRequest(candidateId);
      const response = await deleteCandidate(request, mockContext);

      expect(response.status).toBe(500);
      expect(response.jsonBody.error).toBe('Internal Server Error');
      expect(mockContext.error).toHaveBeenCalled();
    });

    it('should return 500 when findById operation fails', async () => {
      const candidateId = 'test-id';

      mockTableClient.listEntities.mockImplementation(() => {
        throw new Error('Database connection failed');
      });

      const request = createMockRequest(candidateId);
      const response = await deleteCandidate(request, mockContext);

      expect(response.status).toBe(500);
      expect(response.jsonBody.error).toBe('Internal Server Error');
      expect(mockContext.error).toHaveBeenCalled();
    });

    it('should log error details', async () => {
      const candidateId = 'test-id';

      mockTableClient.listEntities.mockImplementation(() => {
        throw new Error('Test error');
      });

      const request = createMockRequest(candidateId);
      await deleteCandidate(request, mockContext);

      expect(mockContext.error).toHaveBeenCalledWith(
        'Error deleting candidate:',
        expect.any(Error)
      );
    });
  });
});

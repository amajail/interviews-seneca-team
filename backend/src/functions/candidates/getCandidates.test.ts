import { HttpRequest, InvocationContext } from '@azure/functions';
import { getCandidates } from './getCandidates';
import { CandidateStatus, InterviewStage } from '../../domain/entities/Candidate';
import { createMockContext, getMockTableClient } from './testHelpers';

// Mock dependencies
jest.mock('../../infrastructure/config/tableStorageConfig', () => ({
  tableClient: {
    listEntities: jest.fn(),
  },
}));

describe('getCandidates Function', () => {
  let mockContext: InvocationContext;
  let mockTableClient: any;

  beforeEach(() => {
    mockContext = createMockContext();
    mockTableClient = getMockTableClient();
    jest.clearAllMocks();
  });

  const createMockRequest = (queryParams?: Record<string, string>): HttpRequest => {
    const url = new URL('http://localhost:7071/api/candidates');
    if (queryParams) {
      Object.entries(queryParams).forEach(([key, value]) => {
        url.searchParams.set(key, value);
      });
    }

    return {
      method: 'GET',
      url: url.toString(),
      query: new URLSearchParams(url.search),
    } as any;
  };

  describe('Success Cases', () => {
    it('should return 200 with candidates list (default pagination)', async () => {
      const mockCandidates = [
        {
          partitionKey: 'CANDIDATE#2025-01',
          rowKey: 'id-1',
          id: 'id-1',
          name: 'John Doe',
          email: 'john@example.com',
          position: 'Developer',
          status: CandidateStatus.NEW,
          interviewStage: InterviewStage.NOT_STARTED,
        },
        {
          partitionKey: 'CANDIDATE#2025-01',
          rowKey: 'id-2',
          id: 'id-2',
          name: 'Jane Smith',
          email: 'jane@example.com',
          position: 'Designer',
          status: CandidateStatus.INTERVIEWING,
          interviewStage: InterviewStage.TECHNICAL,
        },
      ];

      const mockPageIterator = {
        next: jest.fn().mockResolvedValue({
          value: mockCandidates,
          done: false,
        }),
      };

      const mockListEntities = {
        byPage: jest.fn().mockReturnValue(mockPageIterator),
      };

      mockTableClient.listEntities.mockReturnValue(mockListEntities);

      const request = createMockRequest();
      const response = await getCandidates(request, mockContext);

      expect(response.status).toBe(200);
      expect(response.jsonBody).toHaveProperty('items');
      expect(response.jsonBody.items).toHaveLength(2);
      expect(response.jsonBody).toHaveProperty('pageSize', 20);
    });

    it('should support custom page size', async () => {
      const mockCandidates = [
        {
          partitionKey: 'CANDIDATE#2025-01',
          rowKey: 'id-1',
          id: 'id-1',
          name: 'John Doe',
          email: 'john@example.com',
          position: 'Developer',
          status: CandidateStatus.NEW,
          interviewStage: InterviewStage.NOT_STARTED,
        },
      ];

      const mockPageIterator = {
        next: jest.fn().mockResolvedValue({
          value: mockCandidates,
          done: false,
        }),
      };

      const mockListEntities = {
        byPage: jest.fn().mockReturnValue(mockPageIterator),
      };

      mockTableClient.listEntities.mockReturnValue(mockListEntities);

      const request = createMockRequest({ pageSize: '10' });
      const response = await getCandidates(request, mockContext);

      expect(response.status).toBe(200);
      expect(response.jsonBody.pageSize).toBe(10);
    });

    it('should support sorting by name ascending', async () => {
      const mockCandidates = [
        {
          rowKey: 'id-1',
          name: 'Bob',
          email: 'bob@test.com',
          position: 'Dev',
          status: CandidateStatus.NEW,
          interviewStage: InterviewStage.NOT_STARTED,
          partitionKey: 'CANDIDATE#2025-01',
          id: 'id-1',
        },
        {
          rowKey: 'id-2',
          name: 'Alice',
          email: 'alice@test.com',
          position: 'Dev',
          status: CandidateStatus.NEW,
          interviewStage: InterviewStage.NOT_STARTED,
          partitionKey: 'CANDIDATE#2025-01',
          id: 'id-2',
        },
      ];

      const mockPageIterator = {
        next: jest.fn().mockResolvedValue({
          value: mockCandidates,
          done: false,
        }),
      };

      const mockListEntities = {
        byPage: jest.fn().mockReturnValue(mockPageIterator),
      };

      mockTableClient.listEntities.mockReturnValue(mockListEntities);

      const request = createMockRequest({ sortBy: 'name', sortDirection: 'asc' });
      const response = await getCandidates(request, mockContext);

      expect(response.status).toBe(200);
      expect(response.jsonBody.items[0].name).toBe('Alice');
      expect(response.jsonBody.items[1].name).toBe('Bob');
    });

    it('should support continuation token for pagination', async () => {
      const mockCandidates = [
        {
          partitionKey: 'CANDIDATE#2025-01',
          rowKey: 'id-3',
          id: 'id-3',
          name: 'Page 2 Candidate',
          email: 'page2@example.com',
          position: 'Developer',
          status: CandidateStatus.NEW,
          interviewStage: InterviewStage.NOT_STARTED,
        },
      ];

      const mockPageIterator = {
        next: jest.fn().mockResolvedValue({
          value: mockCandidates,
          done: false,
        }),
      };

      const mockListEntities = {
        byPage: jest.fn().mockReturnValue(mockPageIterator),
      };

      mockTableClient.listEntities.mockReturnValue(mockListEntities);

      const request = createMockRequest({ continuationToken: 'token123' });
      const response = await getCandidates(request, mockContext);

      expect(response.status).toBe(200);
      expect(mockListEntities.byPage).toHaveBeenCalledWith(
        expect.objectContaining({ continuationToken: 'token123' })
      );
    });

    it('should return empty list when no candidates exist', async () => {
      const mockPageIterator = {
        next: jest.fn().mockResolvedValue({
          value: [],
          done: true,
        }),
      };

      const mockListEntities = {
        byPage: jest.fn().mockReturnValue(mockPageIterator),
      };

      mockTableClient.listEntities.mockReturnValue(mockListEntities);

      const request = createMockRequest();
      const response = await getCandidates(request, mockContext);

      expect(response.status).toBe(200);
      expect(response.jsonBody.items).toHaveLength(0);
    });
  });

  describe('Validation Errors', () => {
    it('should return 400 for invalid pageSize (negative)', async () => {
      const request = createMockRequest({ pageSize: '-1' });
      const response = await getCandidates(request, mockContext);

      expect(response.status).toBe(400);
      expect(response.jsonBody.error).toBe('Bad Request');
      expect(response.jsonBody.message).toContain('Page size must be between 1 and 100');
    });

    it('should return 400 for invalid pageSize (too large)', async () => {
      const request = createMockRequest({ pageSize: '150' });
      const response = await getCandidates(request, mockContext);

      expect(response.status).toBe(400);
      expect(response.jsonBody.message).toContain('Page size must be between 1 and 100');
    });

    it('should return 400 for invalid sortBy', async () => {
      const request = createMockRequest({ sortBy: 'invalid' });
      const response = await getCandidates(request, mockContext);

      expect(response.status).toBe(400);
      expect(response.jsonBody.message).toContain('sortBy must be one of');
    });

    it('should return 400 for invalid sortDirection', async () => {
      const request = createMockRequest({ sortDirection: 'invalid' });
      const response = await getCandidates(request, mockContext);

      expect(response.status).toBe(400);
      expect(response.jsonBody.message).toContain('sortDirection must be either asc or desc');
    });
  });

  describe('Error Cases', () => {
    it('should return 500 when database operation fails', async () => {
      mockTableClient.listEntities.mockImplementation(() => {
        throw new Error('Database connection failed');
      });

      const request = createMockRequest();
      const response = await getCandidates(request, mockContext);

      expect(response.status).toBe(500);
      expect(response.jsonBody.error).toBe('Internal Server Error');
      expect(mockContext.error).toHaveBeenCalled();
    });
  });
});

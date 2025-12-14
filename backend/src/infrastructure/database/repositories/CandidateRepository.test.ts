import { TableClient } from '@azure/data-tables';
import { CandidateRepository } from './CandidateRepository';
import {
  CandidateStatus,
  InterviewStage,
  CreateCandidateDto,
  UpdateCandidateDto,
} from '../../../domain/entities/Candidate';
import { NotFoundError, DatabaseError, ConflictError } from '../../../shared/errors/CustomErrors';

// Mock TableClient
jest.mock('@azure/data-tables');

describe('CandidateRepository', () => {
  let repository: CandidateRepository;
  let mockTableClient: jest.Mocked<TableClient>;

  beforeEach(() => {
    mockTableClient = {
      listEntities: jest.fn(),
      createEntity: jest.fn(),
      updateEntity: jest.fn(),
      deleteEntity: jest.fn(),
    } as any;

    repository = new CandidateRepository(mockTableClient);
  });

  afterEach(() => {
    jest.clearAllMocks();
  });

  describe('findAll', () => {
    it('should return all candidates', async () => {
      const mockEntities = [
        {
          partitionKey: 'CANDIDATE#2025-01',
          rowKey: 'id-1',
          id: 'id-1',
          name: 'John Doe',
          email: 'john@example.com',
          position: 'Developer',
          status: CandidateStatus.NEW,
          interviewStage: InterviewStage.NOT_STARTED,
          applicationDate: new Date('2025-01-01'),
          createdAt: new Date('2025-01-01'),
          updatedAt: new Date('2025-01-01'),
        },
      ];

      const mockAsyncIterator = {
        [Symbol.asyncIterator]: async function* () {
          for (const entity of mockEntities) {
            yield entity;
          }
        },
      };

      mockTableClient.listEntities.mockReturnValue(mockAsyncIterator as any);

      const result = await repository.findAll();

      expect(result).toHaveLength(1);
      expect(result[0].name).toBe('John Doe');
      expect(result[0].email).toBe('john@example.com');
      expect(mockTableClient.listEntities).toHaveBeenCalled();
    });

    it('should return empty array when no candidates exist', async () => {
      const mockAsyncIterator = {
        [Symbol.asyncIterator]: async function* () {
          // Empty iterator
        },
      };

      mockTableClient.listEntities.mockReturnValue(mockAsyncIterator as any);

      const result = await repository.findAll();

      expect(result).toHaveLength(0);
    });

    it('should throw DatabaseError when query fails', async () => {
      mockTableClient.listEntities.mockImplementation(() => {
        throw new Error('Database connection failed');
      });

      await expect(repository.findAll()).rejects.toThrow(DatabaseError);
    });
  });

  describe('findById', () => {
    it('should return candidate when found', async () => {
      const mockEntity = {
        partitionKey: 'CANDIDATE#2025-01',
        rowKey: 'test-id',
        id: 'test-id',
        name: 'Jane Doe',
        email: 'jane@example.com',
        position: 'Designer',
        status: CandidateStatus.INTERVIEWING,
        interviewStage: InterviewStage.TECHNICAL,
        applicationDate: new Date('2025-01-01'),
        createdAt: new Date('2025-01-01'),
        updatedAt: new Date('2025-01-01'),
      };

      const mockAsyncIterator = {
        [Symbol.asyncIterator]: async function* () {
          yield mockEntity;
        },
      };

      mockTableClient.listEntities.mockReturnValue(mockAsyncIterator as any);

      const result = await repository.findById('test-id');

      expect(result).not.toBeNull();
      expect(result?.name).toBe('Jane Doe');
      expect(result?.email).toBe('jane@example.com');
      expect(mockTableClient.listEntities).toHaveBeenCalledWith({
        queryOptions: {
          filter: "rowKey eq 'test-id'",
        },
      });
    });

    it('should return null when candidate not found', async () => {
      const mockAsyncIterator = {
        [Symbol.asyncIterator]: async function* () {
          // Empty iterator
        },
      };

      mockTableClient.listEntities.mockReturnValue(mockAsyncIterator as any);

      const result = await repository.findById('non-existent-id');

      expect(result).toBeNull();
    });

    it('should throw DatabaseError when query fails', async () => {
      mockTableClient.listEntities.mockImplementation(() => {
        throw new Error('Query failed');
      });

      await expect(repository.findById('test-id')).rejects.toThrow(DatabaseError);
    });
  });

  describe('create', () => {
    const validCandidateDto: CreateCandidateDto = {
      name: 'New Candidate',
      email: 'new@example.com',
      phone: '123-456-7890',
      position: 'Software Engineer',
      expectedSalary: 100000,
      yearsOfExperience: 5,
      notes: 'Great candidate',
    };

    it('should create a new candidate successfully', async () => {
      // Mock no existing candidates with same email
      const emptyIterator = {
        [Symbol.asyncIterator]: async function* () {
          // Empty
        },
      };

      mockTableClient.listEntities.mockReturnValue(emptyIterator as any);
      mockTableClient.createEntity.mockResolvedValue({} as any);

      const result = await repository.create(validCandidateDto);

      expect(result.name).toBe(validCandidateDto.name);
      expect(result.email).toBe(validCandidateDto.email);
      expect(result.status).toBe(CandidateStatus.NEW);
      expect(result.interviewStage).toBe(InterviewStage.NOT_STARTED);
      expect(result.id).toBeDefined();
      expect(result.partitionKey).toMatch(/^CANDIDATE#\d{4}-\d{2}$/);
      expect(result.rowKey).toBe(result.id);
      expect(mockTableClient.createEntity).toHaveBeenCalled();
    });

    it('should use provided status and interview stage', async () => {
      const dtoWithStatus: CreateCandidateDto = {
        ...validCandidateDto,
        status: CandidateStatus.SCREENING,
        interviewStage: InterviewStage.PHONE_SCREEN,
      };

      const emptyIterator = {
        [Symbol.asyncIterator]: async function* () {
          // Empty
        },
      };

      mockTableClient.listEntities.mockReturnValue(emptyIterator as any);
      mockTableClient.createEntity.mockResolvedValue({} as any);

      const result = await repository.create(dtoWithStatus);

      expect(result.status).toBe(CandidateStatus.SCREENING);
      expect(result.interviewStage).toBe(InterviewStage.PHONE_SCREEN);
    });

    it('should throw ConflictError when email already exists', async () => {
      const existingCandidate = {
        partitionKey: 'CANDIDATE#2025-01',
        rowKey: 'existing-id',
        email: validCandidateDto.email,
      };

      const mockIterator = {
        [Symbol.asyncIterator]: async function* () {
          yield existingCandidate;
        },
      };

      mockTableClient.listEntities.mockReturnValue(mockIterator as any);

      await expect(repository.create(validCandidateDto)).rejects.toThrow(ConflictError);
      await expect(repository.create(validCandidateDto)).rejects.toThrow(
        `Candidate with email ${validCandidateDto.email} already exists`
      );
    });

    it('should throw DatabaseError when creation fails', async () => {
      const emptyIterator = {
        [Symbol.asyncIterator]: async function* () {
          // Empty
        },
      };

      mockTableClient.listEntities.mockReturnValue(emptyIterator as any);
      mockTableClient.createEntity.mockRejectedValue(new Error('Creation failed'));

      await expect(repository.create(validCandidateDto)).rejects.toThrow(DatabaseError);
    });
  });

  describe('update', () => {
    const existingCandidate = {
      partitionKey: 'CANDIDATE#2025-01',
      rowKey: 'update-id',
      id: 'update-id',
      name: 'Old Name',
      email: 'old@example.com',
      position: 'Old Position',
      status: CandidateStatus.NEW,
      interviewStage: InterviewStage.NOT_STARTED,
      applicationDate: new Date('2025-01-01'),
      createdAt: new Date('2025-01-01'),
      updatedAt: new Date('2025-01-01'),
      etag: 'old-etag',
    };

    it('should update candidate successfully', async () => {
      const mockIterator = {
        [Symbol.asyncIterator]: async function* () {
          yield existingCandidate;
        },
      };

      mockTableClient.listEntities.mockReturnValue(mockIterator as any);
      mockTableClient.updateEntity.mockResolvedValue({} as any);

      const updateDto: UpdateCandidateDto = {
        name: 'Updated Name',
        status: CandidateStatus.INTERVIEWING,
      };

      const result = await repository.update('update-id', updateDto);

      expect(result.name).toBe('Updated Name');
      expect(result.status).toBe(CandidateStatus.INTERVIEWING);
      expect(result.email).toBe('old@example.com'); // Unchanged
      expect(result.updatedAt.getTime()).toBeGreaterThan(existingCandidate.updatedAt.getTime());
      expect(mockTableClient.updateEntity).toHaveBeenCalled();
    });

    it('should preserve immutable fields', async () => {
      const mockIterator = {
        [Symbol.asyncIterator]: async function* () {
          yield existingCandidate;
        },
      };

      mockTableClient.listEntities.mockReturnValue(mockIterator as any);
      mockTableClient.updateEntity.mockResolvedValue({} as any);

      const updateDto: UpdateCandidateDto = {
        name: 'New Name',
      };

      const result = await repository.update('update-id', updateDto);

      expect(result.id).toBe(existingCandidate.id);
      expect(result.partitionKey).toBe(existingCandidate.partitionKey);
      expect(result.rowKey).toBe(existingCandidate.rowKey);
      expect(result.createdAt).toEqual(existingCandidate.createdAt);
    });

    it('should throw NotFoundError when candidate does not exist', async () => {
      const emptyIterator = {
        [Symbol.asyncIterator]: async function* () {
          // Empty
        },
      };

      mockTableClient.listEntities.mockReturnValue(emptyIterator as any);

      const updateDto: UpdateCandidateDto = {
        name: 'New Name',
      };

      await expect(repository.update('non-existent-id', updateDto)).rejects.toThrow(NotFoundError);
    });

    it('should throw DatabaseError when update fails', async () => {
      const mockIterator = {
        [Symbol.asyncIterator]: async function* () {
          yield existingCandidate;
        },
      };

      mockTableClient.listEntities.mockReturnValue(mockIterator as any);
      mockTableClient.updateEntity.mockRejectedValue(new Error('Update failed'));

      const updateDto: UpdateCandidateDto = {
        name: 'New Name',
      };

      await expect(repository.update('update-id', updateDto)).rejects.toThrow(DatabaseError);
    });
  });

  describe('delete', () => {
    const existingCandidate = {
      partitionKey: 'CANDIDATE#2025-01',
      rowKey: 'delete-id',
      id: 'delete-id',
      name: 'To Delete',
      email: 'delete@example.com',
      position: 'Position',
      status: CandidateStatus.REJECTED,
      interviewStage: InterviewStage.COMPLETED,
      applicationDate: new Date('2025-01-01'),
      createdAt: new Date('2025-01-01'),
      updatedAt: new Date('2025-01-01'),
    };

    it('should delete candidate successfully', async () => {
      const mockIterator = {
        [Symbol.asyncIterator]: async function* () {
          yield existingCandidate;
        },
      };

      mockTableClient.listEntities.mockReturnValue(mockIterator as any);
      mockTableClient.deleteEntity.mockResolvedValue({} as any);

      await repository.delete('delete-id');

      expect(mockTableClient.deleteEntity).toHaveBeenCalledWith(
        existingCandidate.partitionKey,
        existingCandidate.rowKey
      );
    });

    it('should throw NotFoundError when candidate does not exist', async () => {
      const emptyIterator = {
        [Symbol.asyncIterator]: async function* () {
          // Empty
        },
      };

      mockTableClient.listEntities.mockReturnValue(emptyIterator as any);

      await expect(repository.delete('non-existent-id')).rejects.toThrow(NotFoundError);
    });

    it('should throw DatabaseError when deletion fails', async () => {
      const mockIterator = {
        [Symbol.asyncIterator]: async function* () {
          yield existingCandidate;
        },
      };

      mockTableClient.listEntities.mockReturnValue(mockIterator as any);
      mockTableClient.deleteEntity.mockRejectedValue(new Error('Deletion failed'));

      await expect(repository.delete('delete-id')).rejects.toThrow(DatabaseError);
    });
  });
});

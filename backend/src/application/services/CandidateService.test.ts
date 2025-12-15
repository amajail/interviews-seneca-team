import { CandidateService } from './CandidateService';
import { ICandidateRepository } from '../../infrastructure/database/repositories/ICandidateRepository';
import { Candidate, CandidateStatus, InterviewStage } from '../../domain/entities/Candidate';
import { ValidationError, ConflictError, NotFoundError } from '../../shared/errors/CustomErrors';

describe('CandidateService', () => {
  let candidateService: CandidateService;
  let mockRepository: jest.Mocked<ICandidateRepository>;

  beforeEach(() => {
    mockRepository = {
      findAll: jest.fn(),
      list: jest.fn(),
      findById: jest.fn(),
      create: jest.fn(),
      update: jest.fn(),
      delete: jest.fn(),
    } as any;

    candidateService = new CandidateService(mockRepository);
  });

  afterEach(() => {
    jest.clearAllMocks();
  });

  describe('createCandidate', () => {
    const validCandidateData = {
      name: 'John Doe',
      email: 'john@example.com',
      phone: '+1234567890',
      position: 'Software Engineer',
      status: CandidateStatus.NEW,
      interviewStage: InterviewStage.NOT_STARTED,
      expectedSalary: 100000,
      yearsOfExperience: 5,
      notes: 'Great candidate',
    };

    const mockCreatedCandidate: Candidate = {
      id: 'test-id',
      partitionKey: 'CANDIDATE#2025-01',
      rowKey: 'test-id',
      ...validCandidateData,
      applicationDate: new Date('2025-01-01'),
      createdAt: new Date('2025-01-01'),
      updatedAt: new Date('2025-01-01'),
    };

    it('should create a candidate with valid data', async () => {
      mockRepository.create.mockResolvedValue(mockCreatedCandidate);

      const result = await candidateService.createCandidate(validCandidateData);

      expect(result).toEqual(mockCreatedCandidate);
      expect(mockRepository.create).toHaveBeenCalledWith(
        expect.objectContaining({
          name: validCandidateData.name,
          email: validCandidateData.email,
          position: validCandidateData.position,
        })
      );
    });

    it('should create a candidate with only required fields', async () => {
      const minimalData = {
        name: 'Jane Smith',
        email: 'jane@example.com',
        position: 'Designer',
      };

      mockRepository.create.mockResolvedValue(mockCreatedCandidate);

      const result = await candidateService.createCandidate(minimalData);

      expect(result).toEqual(mockCreatedCandidate);
      expect(mockRepository.create).toHaveBeenCalledWith(
        expect.objectContaining({
          name: minimalData.name,
          email: minimalData.email,
          position: minimalData.position,
        })
      );
    });

    it('should handle applicationDate as ISO string', async () => {
      const dataWithDateString = {
        ...validCandidateData,
        applicationDate: '2025-01-15T10:00:00.000Z',
      };

      mockRepository.create.mockResolvedValue(mockCreatedCandidate);

      await candidateService.createCandidate(dataWithDateString);

      expect(mockRepository.create).toHaveBeenCalledWith(
        expect.objectContaining({
          applicationDate: new Date('2025-01-15T10:00:00.000Z'),
        })
      );
    });

    it('should handle applicationDate as Date object', async () => {
      const date = new Date('2025-01-15');
      const dataWithDate = {
        ...validCandidateData,
        applicationDate: date,
      };

      mockRepository.create.mockResolvedValue(mockCreatedCandidate);

      await candidateService.createCandidate(dataWithDate);

      expect(mockRepository.create).toHaveBeenCalledWith(
        expect.objectContaining({
          applicationDate: date,
        })
      );
    });

    it('should throw ValidationError when name is missing', async () => {
      const invalidData = {
        email: 'test@example.com',
        position: 'Developer',
      };

      await expect(candidateService.createCandidate(invalidData)).rejects.toThrow(ValidationError);
    });

    it('should throw ValidationError when name is empty', async () => {
      const invalidData = {
        name: '',
        email: 'test@example.com',
        position: 'Developer',
      };

      await expect(candidateService.createCandidate(invalidData)).rejects.toThrow(ValidationError);
    });

    it('should throw ValidationError when email is missing', async () => {
      const invalidData = {
        name: 'John Doe',
        position: 'Developer',
      };

      await expect(candidateService.createCandidate(invalidData)).rejects.toThrow(ValidationError);
    });

    it('should throw ValidationError when email format is invalid', async () => {
      const invalidData = {
        name: 'John Doe',
        email: 'invalid-email',
        position: 'Developer',
      };

      await expect(candidateService.createCandidate(invalidData)).rejects.toThrow(ValidationError);
    });

    it('should throw ValidationError when position is missing', async () => {
      const invalidData = {
        name: 'John Doe',
        email: 'test@example.com',
      };

      await expect(candidateService.createCandidate(invalidData)).rejects.toThrow(ValidationError);
    });

    it('should throw ValidationError when name exceeds max length', async () => {
      const invalidData = {
        name: 'a'.repeat(101),
        email: 'test@example.com',
        position: 'Developer',
      };

      await expect(candidateService.createCandidate(invalidData)).rejects.toThrow(ValidationError);
    });

    it('should throw ValidationError when position exceeds max length', async () => {
      const invalidData = {
        name: 'John Doe',
        email: 'test@example.com',
        position: 'a'.repeat(101),
      };

      await expect(candidateService.createCandidate(invalidData)).rejects.toThrow(ValidationError);
    });

    it('should throw ValidationError when notes exceed max length', async () => {
      const invalidData = {
        name: 'John Doe',
        email: 'test@example.com',
        position: 'Developer',
        notes: 'a'.repeat(1001),
      };

      await expect(candidateService.createCandidate(invalidData)).rejects.toThrow(ValidationError);
    });

    it('should throw ValidationError when expectedSalary is negative', async () => {
      const invalidData = {
        name: 'John Doe',
        email: 'test@example.com',
        position: 'Developer',
        expectedSalary: -1000,
      };

      await expect(candidateService.createCandidate(invalidData)).rejects.toThrow(ValidationError);
    });

    it('should throw ValidationError when expectedSalary is zero', async () => {
      const invalidData = {
        name: 'John Doe',
        email: 'test@example.com',
        position: 'Developer',
        expectedSalary: 0,
      };

      await expect(candidateService.createCandidate(invalidData)).rejects.toThrow(ValidationError);
    });

    it('should throw ValidationError when yearsOfExperience is negative', async () => {
      const invalidData = {
        name: 'John Doe',
        email: 'test@example.com',
        position: 'Developer',
        yearsOfExperience: -1,
      };

      await expect(candidateService.createCandidate(invalidData)).rejects.toThrow(ValidationError);
    });

    it('should accept zero yearsOfExperience', async () => {
      const validData = {
        name: 'John Doe',
        email: 'test@example.com',
        position: 'Developer',
        yearsOfExperience: 0,
      };

      mockRepository.create.mockResolvedValue(mockCreatedCandidate);

      await candidateService.createCandidate(validData);

      expect(mockRepository.create).toHaveBeenCalledWith(
        expect.objectContaining({
          yearsOfExperience: 0,
        })
      );
    });

    it('should throw ValidationError for invalid status enum value', async () => {
      const invalidData = {
        name: 'John Doe',
        email: 'test@example.com',
        position: 'Developer',
        status: 'invalid_status',
      };

      await expect(candidateService.createCandidate(invalidData)).rejects.toThrow(ValidationError);
    });

    it('should throw ValidationError for invalid interviewStage enum value', async () => {
      const invalidData = {
        name: 'John Doe',
        email: 'test@example.com',
        position: 'Developer',
        interviewStage: 'invalid_stage',
      };

      await expect(candidateService.createCandidate(invalidData)).rejects.toThrow(ValidationError);
    });

    it('should propagate ConflictError from repository (duplicate email)', async () => {
      mockRepository.create.mockRejectedValue(
        new ConflictError('A candidate with this email already exists')
      );

      await expect(candidateService.createCandidate(validCandidateData)).rejects.toThrow(
        ConflictError
      );
    });

    it('should include field name in ValidationError', async () => {
      const invalidData = {
        email: 'test@example.com',
        position: 'Developer',
      };

      try {
        await candidateService.createCandidate(invalidData);
        fail('Should have thrown ValidationError');
      } catch (error) {
        expect(error).toBeInstanceOf(ValidationError);
        expect((error as ValidationError).field).toBeDefined();
      }
    });
  });

  describe('getCandidateById', () => {
    const mockCandidate: Candidate = {
      id: 'test-id',
      partitionKey: 'CANDIDATE#2025-01',
      rowKey: 'test-id',
      name: 'John Doe',
      email: 'john@example.com',
      phone: '+1234567890',
      position: 'Software Engineer',
      status: CandidateStatus.NEW,
      interviewStage: InterviewStage.NOT_STARTED,
      applicationDate: new Date('2025-01-01'),
      expectedSalary: 100000,
      yearsOfExperience: 5,
      notes: 'Great candidate',
      createdAt: new Date('2025-01-01'),
      updatedAt: new Date('2025-01-01'),
    };

    it('should return candidate when found', async () => {
      mockRepository.findById.mockResolvedValue(mockCandidate);

      const result = await candidateService.getCandidateById('test-id');

      expect(result).toEqual(mockCandidate);
      expect(mockRepository.findById).toHaveBeenCalledWith('test-id');
    });

    it('should throw NotFoundError when candidate does not exist', async () => {
      mockRepository.findById.mockResolvedValue(null);

      await expect(candidateService.getCandidateById('non-existent-id')).rejects.toThrow(
        NotFoundError
      );

      expect(mockRepository.findById).toHaveBeenCalledWith('non-existent-id');
    });

    it('should include candidate id in NotFoundError message', async () => {
      mockRepository.findById.mockResolvedValue(null);
      const testId = 'missing-candidate-123';

      try {
        await candidateService.getCandidateById(testId);
        fail('Should have thrown NotFoundError');
      } catch (error) {
        expect(error).toBeInstanceOf(NotFoundError);
        expect((error as NotFoundError).message).toContain(testId);
      }
    });

    it('should propagate database errors from repository', async () => {
      const dbError = new Error('Database connection failed');
      mockRepository.findById.mockRejectedValue(dbError);

      await expect(candidateService.getCandidateById('test-id')).rejects.toThrow(
        'Database connection failed'
      );
    });
  });

  describe('listCandidates', () => {
    const mockCandidates: Candidate[] = [
      {
        id: 'id-1',
        partitionKey: 'CANDIDATE#2025-01',
        rowKey: 'id-1',
        name: 'Alice',
        email: 'alice@example.com',
        position: 'Developer',
        status: CandidateStatus.NEW,
        interviewStage: InterviewStage.NOT_STARTED,
        applicationDate: new Date('2025-01-01'),
        createdAt: new Date('2025-01-01'),
        updatedAt: new Date('2025-01-01'),
      },
      {
        id: 'id-2',
        partitionKey: 'CANDIDATE#2025-01',
        rowKey: 'id-2',
        name: 'Bob',
        email: 'bob@example.com',
        position: 'Designer',
        status: CandidateStatus.INTERVIEWING,
        interviewStage: InterviewStage.TECHNICAL,
        applicationDate: new Date('2025-01-02'),
        createdAt: new Date('2025-01-02'),
        updatedAt: new Date('2025-01-02'),
      },
    ];

    it('should return paginated list of candidates with default options', async () => {
      const mockResult = {
        items: mockCandidates,
        pageSize: 20,
        continuationToken: undefined,
      };

      mockRepository.list.mockResolvedValue(mockResult);

      const result = await candidateService.listCandidates();

      expect(result).toEqual(mockResult);
      expect(result.items).toHaveLength(2);
      expect(result.pageSize).toBe(20);
      expect(mockRepository.list).toHaveBeenCalledWith(undefined);
    });

    it('should pass pagination options to repository', async () => {
      const options = {
        pageSize: 10,
        continuationToken: 'token123',
        sortBy: 'name' as const,
        sortDirection: 'asc' as const,
      };

      const mockResult = {
        items: mockCandidates,
        pageSize: 10,
        continuationToken: 'nextToken',
      };

      mockRepository.list.mockResolvedValue(mockResult);

      const result = await candidateService.listCandidates(options);

      expect(mockRepository.list).toHaveBeenCalledWith(options);
      expect(result.pageSize).toBe(10);
      expect(result.continuationToken).toBe('nextToken');
    });

    it('should return empty list when no candidates exist', async () => {
      const mockResult = {
        items: [],
        pageSize: 20,
        continuationToken: undefined,
      };

      mockRepository.list.mockResolvedValue(mockResult);

      const result = await candidateService.listCandidates();

      expect(result.items).toHaveLength(0);
      expect(result).toEqual(mockResult);
    });

    it('should propagate database errors from repository', async () => {
      const dbError = new Error('Database query failed');
      mockRepository.list.mockRejectedValue(dbError);

      await expect(candidateService.listCandidates()).rejects.toThrow('Database query failed');
    });
  });

  describe('updateCandidate', () => {
    const mockCandidate: Candidate = {
      id: 'test-id',
      partitionKey: 'CANDIDATE#2025-01',
      rowKey: 'test-id',
      name: 'John Doe',
      email: 'john@example.com',
      phone: '+1234567890',
      position: 'Software Engineer',
      status: CandidateStatus.NEW,
      interviewStage: InterviewStage.NOT_STARTED,
      applicationDate: new Date('2025-01-01'),
      expectedSalary: 100000,
      yearsOfExperience: 5,
      notes: 'Great candidate',
      createdAt: new Date('2025-01-01'),
      updatedAt: new Date('2025-01-01'),
    };

    it('should update candidate with valid data', async () => {
      const updateData = {
        name: 'John Updated',
        status: CandidateStatus.INTERVIEWING,
      };

      const updatedCandidate = {
        ...mockCandidate,
        name: 'John Updated',
        status: CandidateStatus.INTERVIEWING,
        updatedAt: new Date(),
      };

      mockRepository.update.mockResolvedValue(updatedCandidate);

      const result = await candidateService.updateCandidate('test-id', updateData);

      expect(result).toEqual(updatedCandidate);
      expect(mockRepository.update).toHaveBeenCalledWith(
        'test-id',
        expect.objectContaining({
          name: 'John Updated',
          status: CandidateStatus.INTERVIEWING,
        })
      );
    });

    it('should update single field', async () => {
      const updateData = {
        notes: 'Updated notes',
      };

      const updatedCandidate = {
        ...mockCandidate,
        notes: 'Updated notes',
        updatedAt: new Date(),
      };

      mockRepository.update.mockResolvedValue(updatedCandidate);

      const result = await candidateService.updateCandidate('test-id', updateData);

      expect(result).toEqual(updatedCandidate);
      expect(mockRepository.update).toHaveBeenCalledWith(
        'test-id',
        expect.objectContaining({
          notes: 'Updated notes',
        })
      );
    });

    it('should update multiple fields', async () => {
      const updateData = {
        status: CandidateStatus.OFFER,
        interviewStage: InterviewStage.COMPLETED,
        expectedSalary: 120000,
      };

      const updatedCandidate = {
        ...mockCandidate,
        ...updateData,
        updatedAt: new Date(),
      };

      mockRepository.update.mockResolvedValue(updatedCandidate);

      const result = await candidateService.updateCandidate('test-id', updateData);

      expect(result).toEqual(updatedCandidate);
      expect(mockRepository.update).toHaveBeenCalledWith(
        'test-id',
        expect.objectContaining(updateData)
      );
    });

    it('should throw ValidationError when no fields are provided', async () => {
      const emptyUpdate = {};

      await expect(candidateService.updateCandidate('test-id', emptyUpdate)).rejects.toThrow(
        ValidationError
      );
    });

    it('should throw ValidationError when email format is invalid', async () => {
      const invalidData = {
        email: 'invalid-email',
      };

      await expect(candidateService.updateCandidate('test-id', invalidData)).rejects.toThrow(
        ValidationError
      );
    });

    it('should throw ValidationError when name is empty', async () => {
      const invalidData = {
        name: '',
      };

      await expect(candidateService.updateCandidate('test-id', invalidData)).rejects.toThrow(
        ValidationError
      );
    });

    it('should throw ValidationError when name exceeds max length', async () => {
      const invalidData = {
        name: 'a'.repeat(101),
      };

      await expect(candidateService.updateCandidate('test-id', invalidData)).rejects.toThrow(
        ValidationError
      );
    });

    it('should throw ValidationError when position is empty', async () => {
      const invalidData = {
        position: '',
      };

      await expect(candidateService.updateCandidate('test-id', invalidData)).rejects.toThrow(
        ValidationError
      );
    });

    it('should throw ValidationError when position exceeds max length', async () => {
      const invalidData = {
        position: 'a'.repeat(101),
      };

      await expect(candidateService.updateCandidate('test-id', invalidData)).rejects.toThrow(
        ValidationError
      );
    });

    it('should throw ValidationError when notes exceed max length', async () => {
      const invalidData = {
        notes: 'a'.repeat(1001),
      };

      await expect(candidateService.updateCandidate('test-id', invalidData)).rejects.toThrow(
        ValidationError
      );
    });

    it('should throw ValidationError when expectedSalary is negative', async () => {
      const invalidData = {
        expectedSalary: -1000,
      };

      await expect(candidateService.updateCandidate('test-id', invalidData)).rejects.toThrow(
        ValidationError
      );
    });

    it('should throw ValidationError when yearsOfExperience is negative', async () => {
      const invalidData = {
        yearsOfExperience: -1,
      };

      await expect(candidateService.updateCandidate('test-id', invalidData)).rejects.toThrow(
        ValidationError
      );
    });

    it('should throw ValidationError for invalid status enum value', async () => {
      const invalidData = {
        status: 'invalid_status',
      };

      await expect(candidateService.updateCandidate('test-id', invalidData)).rejects.toThrow(
        ValidationError
      );
    });

    it('should throw ValidationError for invalid interviewStage enum value', async () => {
      const invalidData = {
        interviewStage: 'invalid_stage',
      };

      await expect(candidateService.updateCandidate('test-id', invalidData)).rejects.toThrow(
        ValidationError
      );
    });

    it('should propagate NotFoundError from repository', async () => {
      const updateData = {
        name: 'Updated Name',
      };

      mockRepository.update.mockRejectedValue(new NotFoundError('Candidate', 'non-existent-id'));

      await expect(candidateService.updateCandidate('non-existent-id', updateData)).rejects.toThrow(
        NotFoundError
      );
    });

    it('should propagate database errors from repository', async () => {
      const updateData = {
        name: 'Updated Name',
      };

      const dbError = new Error('Database update failed');
      mockRepository.update.mockRejectedValue(dbError);

      await expect(candidateService.updateCandidate('test-id', updateData)).rejects.toThrow(
        'Database update failed'
      );
    });

    it('should include field name in ValidationError', async () => {
      const invalidData = {
        email: 'invalid',
      };

      try {
        await candidateService.updateCandidate('test-id', invalidData);
        fail('Should have thrown ValidationError');
      } catch (error) {
        expect(error).toBeInstanceOf(ValidationError);
        expect((error as ValidationError).field).toBeDefined();
      }
    });
  });

  describe('deleteCandidate', () => {
    it('should delete candidate successfully', async () => {
      mockRepository.delete.mockResolvedValue(undefined);

      await candidateService.deleteCandidate('test-id');

      expect(mockRepository.delete).toHaveBeenCalledWith('test-id');
    });

    it('should propagate NotFoundError from repository', async () => {
      mockRepository.delete.mockRejectedValue(new NotFoundError('Candidate', 'non-existent-id'));

      await expect(candidateService.deleteCandidate('non-existent-id')).rejects.toThrow(
        NotFoundError
      );
    });

    it('should propagate database errors from repository', async () => {
      const dbError = new Error('Database delete failed');
      mockRepository.delete.mockRejectedValue(dbError);

      await expect(candidateService.deleteCandidate('test-id')).rejects.toThrow(
        'Database delete failed'
      );
    });

    it('should include candidate ID in error when not found', async () => {
      const testId = 'missing-id-123';
      mockRepository.delete.mockRejectedValue(new NotFoundError('Candidate', testId));

      try {
        await candidateService.deleteCandidate(testId);
        fail('Should have thrown NotFoundError');
      } catch (error) {
        expect(error).toBeInstanceOf(NotFoundError);
        expect((error as NotFoundError).message).toContain(testId);
      }
    });
  });
});

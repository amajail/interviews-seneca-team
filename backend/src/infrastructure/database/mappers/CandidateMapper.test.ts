import { TableEntityResult } from '@azure/data-tables';
import { toTableEntity, fromTableEntity } from './CandidateMapper';
import { Candidate, CandidateStatus, InterviewStage } from '../../../domain/entities/Candidate';

describe('CandidateMapper', () => {
  const mockCandidate: Candidate = {
    id: 'test-id-123',
    partitionKey: 'CANDIDATE#2025-01',
    rowKey: 'test-id-123',
    name: 'John Doe',
    email: 'john@example.com',
    phone: '123-456-7890',
    position: 'Software Engineer',
    status: CandidateStatus.INTERVIEWING,
    interviewStage: InterviewStage.TECHNICAL,
    applicationDate: new Date('2025-01-15'),
    expectedSalary: 120000,
    yearsOfExperience: 5,
    notes: 'Excellent candidate',
    createdAt: new Date('2025-01-01'),
    updatedAt: new Date('2025-01-10'),
    createdBy: 'admin@example.com',
    updatedBy: 'admin@example.com',
  };

  describe('toTableEntity', () => {
    it('should map Candidate to TableEntity correctly', () => {
      const result = toTableEntity(mockCandidate);

      expect(result.partitionKey).toBe(mockCandidate.partitionKey);
      expect(result.rowKey).toBe(mockCandidate.rowKey);
      expect(result.id).toBe(mockCandidate.id);
      expect(result.name).toBe(mockCandidate.name);
      expect(result.email).toBe(mockCandidate.email);
      expect(result.phone).toBe(mockCandidate.phone);
      expect(result.position).toBe(mockCandidate.position);
      expect(result.status).toBe(mockCandidate.status);
      expect(result.interviewStage).toBe(mockCandidate.interviewStage);
      expect(result.applicationDate).toBe(mockCandidate.applicationDate);
      expect(result.expectedSalary).toBe(mockCandidate.expectedSalary);
      expect(result.yearsOfExperience).toBe(mockCandidate.yearsOfExperience);
      expect(result.notes).toBe(mockCandidate.notes);
      expect(result.createdAt).toBe(mockCandidate.createdAt);
      expect(result.updatedAt).toBe(mockCandidate.updatedAt);
      expect(result.createdBy).toBe(mockCandidate.createdBy);
      expect(result.updatedBy).toBe(mockCandidate.updatedBy);
    });

    it('should handle optional fields with empty strings when undefined', () => {
      const candidateWithoutOptionals: Candidate = {
        id: 'test-id',
        partitionKey: 'CANDIDATE#2025-01',
        rowKey: 'test-id',
        name: 'Jane Doe',
        email: 'jane@example.com',
        position: 'Designer',
        status: CandidateStatus.NEW,
        interviewStage: InterviewStage.NOT_STARTED,
        applicationDate: new Date('2025-01-01'),
        createdAt: new Date('2025-01-01'),
        updatedAt: new Date('2025-01-01'),
      };

      const result = toTableEntity(candidateWithoutOptionals);

      expect(result.phone).toBe('');
      expect(result.expectedSalary).toBe(0);
      expect(result.yearsOfExperience).toBe(0);
      expect(result.notes).toBe('');
      expect(result.createdBy).toBe('');
      expect(result.updatedBy).toBe('');
    });
  });

  describe('fromTableEntity', () => {
    const mockTableEntity: TableEntityResult<Record<string, unknown>> = {
      partitionKey: 'CANDIDATE#2025-01',
      rowKey: 'test-id-456',
      timestamp: '2025-01-20T10:30:00.0000000Z',
      etag: 'W/"datetime\'2025-01-20T10%3A30%3A00.0000000Z\'"',
      id: 'test-id-456',
      name: 'Alice Smith',
      email: 'alice@example.com',
      phone: '987-654-3210',
      position: 'Product Manager',
      status: CandidateStatus.OFFER,
      interviewStage: InterviewStage.FINAL,
      applicationDate: new Date('2025-01-05'),
      expectedSalary: 150000,
      yearsOfExperience: 8,
      notes: 'Strong leadership skills',
      createdAt: new Date('2025-01-05'),
      updatedAt: new Date('2025-01-15'),
      createdBy: 'hr@example.com',
      updatedBy: 'manager@example.com',
    };

    it('should map TableEntity to Candidate correctly', () => {
      const result = fromTableEntity(mockTableEntity);

      expect(result.id).toBe(mockTableEntity.id);
      expect(result.partitionKey).toBe(mockTableEntity.partitionKey);
      expect(result.rowKey).toBe(mockTableEntity.rowKey);
      expect(result.timestamp).toEqual(mockTableEntity.timestamp);
      expect(result.eTag).toBe(mockTableEntity.etag);
      expect(result.name).toBe(mockTableEntity.name);
      expect(result.email).toBe(mockTableEntity.email);
      expect(result.phone).toBe(mockTableEntity.phone);
      expect(result.position).toBe(mockTableEntity.position);
      expect(result.status).toBe(mockTableEntity.status);
      expect(result.interviewStage).toBe(mockTableEntity.interviewStage);
      expect(result.expectedSalary).toBe(mockTableEntity.expectedSalary);
      expect(result.yearsOfExperience).toBe(mockTableEntity.yearsOfExperience);
      expect(result.notes).toBe(mockTableEntity.notes);
      expect(result.createdBy).toBe(mockTableEntity.createdBy);
      expect(result.updatedBy).toBe(mockTableEntity.updatedBy);
    });

    it('should convert date strings to Date objects', () => {
      const result = fromTableEntity(mockTableEntity);

      expect(result.applicationDate).toBeInstanceOf(Date);
      expect(result.createdAt).toBeInstanceOf(Date);
      expect(result.updatedAt).toBeInstanceOf(Date);
      expect(result.applicationDate.getTime()).toBe(
        new Date(mockTableEntity.applicationDate as Date).getTime()
      );
    });

    it('should handle empty optional fields as undefined', () => {
      const minimalEntity: TableEntityResult<Record<string, unknown>> = {
        partitionKey: 'CANDIDATE#2025-01',
        rowKey: 'minimal-id',
        etag: 'test-etag',
        id: 'minimal-id',
        name: 'Bob Jones',
        email: 'bob@example.com',
        phone: '',
        position: 'Developer',
        status: CandidateStatus.NEW,
        interviewStage: InterviewStage.NOT_STARTED,
        applicationDate: new Date('2025-01-01'),
        expectedSalary: 0,
        yearsOfExperience: 0,
        notes: '',
        createdAt: new Date('2025-01-01'),
        updatedAt: new Date('2025-01-01'),
        createdBy: '',
        updatedBy: '',
      };

      const result = fromTableEntity(minimalEntity);

      expect(result.phone).toBeUndefined();
      expect(result.expectedSalary).toBeUndefined();
      expect(result.yearsOfExperience).toBeUndefined();
      expect(result.notes).toBeUndefined();
      expect(result.createdBy).toBeUndefined();
      expect(result.updatedBy).toBeUndefined();
    });

    it('should handle entities without optional fields', () => {
      const entityWithoutOptionals: TableEntityResult<Record<string, unknown>> = {
        partitionKey: 'CANDIDATE#2025-01',
        rowKey: 'test-id',
        etag: 'test-etag',
        id: 'test-id',
        name: 'Test Candidate',
        email: 'test@example.com',
        position: 'Tester',
        status: CandidateStatus.SCREENING,
        interviewStage: InterviewStage.PHONE_SCREEN,
        applicationDate: new Date('2025-01-01'),
        createdAt: new Date('2025-01-01'),
        updatedAt: new Date('2025-01-01'),
      };

      const result = fromTableEntity(entityWithoutOptionals);

      expect(result.phone).toBeUndefined();
      expect(result.expectedSalary).toBeUndefined();
      expect(result.yearsOfExperience).toBeUndefined();
      expect(result.notes).toBeUndefined();
      expect(result.createdBy).toBeUndefined();
      expect(result.updatedBy).toBeUndefined();
    });
  });

  describe('round-trip conversion', () => {
    it('should preserve data through toTableEntity and fromTableEntity', () => {
      const tableEntity = toTableEntity(mockCandidate);
      // Add required etag field for TableEntityResult
      const tableEntityResult = { ...tableEntity, etag: 'test-etag' };
      const candidate = fromTableEntity(tableEntityResult);

      expect(candidate.id).toBe(mockCandidate.id);
      expect(candidate.name).toBe(mockCandidate.name);
      expect(candidate.email).toBe(mockCandidate.email);
      expect(candidate.phone).toBe(mockCandidate.phone);
      expect(candidate.position).toBe(mockCandidate.position);
      expect(candidate.status).toBe(mockCandidate.status);
      expect(candidate.interviewStage).toBe(mockCandidate.interviewStage);
      expect(candidate.expectedSalary).toBe(mockCandidate.expectedSalary);
      expect(candidate.yearsOfExperience).toBe(mockCandidate.yearsOfExperience);
      expect(candidate.notes).toBe(mockCandidate.notes);
    });
  });
});

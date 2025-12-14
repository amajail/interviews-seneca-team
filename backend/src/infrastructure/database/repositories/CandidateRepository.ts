import { TableClient } from '@azure/data-tables';
import { Candidate, CandidateStatus, CreateCandidateDto, InterviewStage, UpdateCandidateDto } from '../../../domain/entities/Candidate';
import { ICandidateRepository } from './ICandidateRepository';
import { toTableEntity, fromTableEntity } from '../mappers/CandidateMapper';
import { NotFoundError, DatabaseError, ConflictError } from '../../../shared/errors/CustomErrors';

/**
 * Repository implementation for Candidate entity using Azure Table Storage.
 * Follows the Repository pattern to abstract data access logic.
 * Implements Dependency Inversion Principle by depending on TableClient abstraction.
 */
export class CandidateRepository implements ICandidateRepository {
  constructor(private readonly tableClient: TableClient) {}

  /**
   * Retrieves all candidates from the table storage.
   * @returns Promise<Candidate[]> Array of all candidates
   * @throws DatabaseError if the query fails
   */
  async findAll(): Promise<Candidate[]> {
    try {
      const candidates: Candidate[] = [];
      const entities = this.tableClient.listEntities();

      for await (const entity of entities) {
        candidates.push(fromTableEntity(entity));
      }

      return candidates;
    } catch (error) {
      throw new DatabaseError('Failed to retrieve candidates', error as Error);
    }
  }

  /**
   * Retrieves a candidate by ID.
   * Uses partition key strategy: CANDIDATE#{year-month} and row key as the ID.
   * @param id - The candidate ID
   * @returns Promise<Candidate | null> The candidate or null if not found
   * @throws DatabaseError if the query fails
   */
  async findById(id: string): Promise<Candidate | null> {
    try {
      // For findById, we need to search across all partitions since we don't know the partition key
      const entities = this.tableClient.listEntities({
        queryOptions: {
          filter: `rowKey eq '${id}'`
        }
      });

      for await (const entity of entities) {
        return fromTableEntity(entity);
      }

      return null;
    } catch (error) {
      throw new DatabaseError(`Failed to retrieve candidate with id ${id}`, error as Error);
    }
  }

  /**
   * Creates a new candidate in the table storage.
   * Generates a unique ID and sets partition/row keys following the schema.
   * @param candidateDto - The candidate data to create
   * @returns Promise<Candidate> The created candidate
   * @throws DatabaseError if creation fails
   * @throws ConflictError if a candidate with the same email already exists
   */
  async create(candidateDto: CreateCandidateDto): Promise<Candidate> {
    try {
      // Check for duplicate email
      const existingCandidates = this.tableClient.listEntities({
        queryOptions: {
          filter: `email eq '${candidateDto.email}'`
        }
      });

      for await (const _existing of existingCandidates) {
        throw new ConflictError(`Candidate with email ${candidateDto.email} already exists`);
      }

      // Generate unique ID
      const id = crypto.randomUUID();
      const now = new Date();

      // Partition key strategy: CANDIDATE#{year-month}
      const partitionKey = `CANDIDATE#${now.getFullYear()}-${String(now.getMonth() + 1).padStart(2, '0')}`;
      const rowKey = id;

      const candidate: Candidate = {
        id,
        partitionKey,
        rowKey,
        name: candidateDto.name,
        email: candidateDto.email,
        phone: candidateDto.phone,
        position: candidateDto.position,
        status: candidateDto.status || CandidateStatus.NEW,
        interviewStage: candidateDto.interviewStage || InterviewStage.NOT_STARTED,
        applicationDate: candidateDto.applicationDate || now,
        expectedSalary: candidateDto.expectedSalary,
        yearsOfExperience: candidateDto.yearsOfExperience,
        notes: candidateDto.notes,
        createdAt: now,
        updatedAt: now
      };

      const tableEntity = toTableEntity(candidate);
      await this.tableClient.createEntity(tableEntity);

      return candidate;
    } catch (error) {
      if (error instanceof ConflictError) {
        throw error;
      }
      throw new DatabaseError('Failed to create candidate', error as Error);
    }
  }

  /**
   * Updates an existing candidate in the table storage.
   * Uses optimistic concurrency control with ETag.
   * @param id - The candidate ID to update
   * @param updateDto - The fields to update
   * @returns Promise<Candidate> The updated candidate
   * @throws NotFoundError if candidate not found
   * @throws DatabaseError if update fails
   */
  async update(id: string, updateDto: UpdateCandidateDto): Promise<Candidate> {
    try {
      // First, find the existing candidate
      const existing = await this.findById(id);
      if (!existing) {
        throw new NotFoundError('Candidate', id);
      }

      // Merge updates
      const updated: Candidate = {
        ...existing,
        ...updateDto,
        id: existing.id,
        partitionKey: existing.partitionKey,
        rowKey: existing.rowKey,
        createdAt: existing.createdAt,
        updatedAt: new Date()
      };

      const tableEntity = toTableEntity(updated);

      // Update with optimistic concurrency using ETag if available
      const updateMode = existing.eTag ? 'Replace' : 'Merge';
      await this.tableClient.updateEntity(tableEntity, updateMode, {
        etag: existing.eTag
      });

      return updated;
    } catch (error) {
      if (error instanceof NotFoundError) {
        throw error;
      }
      throw new DatabaseError(`Failed to update candidate with id ${id}`, error as Error);
    }
  }

  /**
   * Deletes a candidate from the table storage.
   * @param id - The candidate ID to delete
   * @returns Promise<void>
   * @throws NotFoundError if candidate not found
   * @throws DatabaseError if deletion fails
   */
  async delete(id: string): Promise<void> {
    try {
      // First, find the candidate to get partition and row keys
      const candidate = await this.findById(id);
      if (!candidate) {
        throw new NotFoundError('Candidate', id);
      }

      await this.tableClient.deleteEntity(candidate.partitionKey, candidate.rowKey);
    } catch (error) {
      if (error instanceof NotFoundError) {
        throw error;
      }
      throw new DatabaseError(`Failed to delete candidate with id ${id}`, error as Error);
    }
  }
}

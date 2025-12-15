import { ICandidateRepository } from '../../infrastructure/database/repositories/ICandidateRepository';
import { Candidate, CreateCandidateDto, UpdateCandidateDto } from '../../domain/entities/Candidate';
import { ValidationError, NotFoundError } from '../../shared/errors/CustomErrors';
import {
  createCandidateSchema,
  updateCandidateSchema,
} from '../../shared/validation/candidateSchemas';
import { PaginationOptions, PaginatedResult } from '../../domain/types/Pagination';

export class CandidateService {
  constructor(private readonly candidateRepository: ICandidateRepository) {}

  async createCandidate(candidateData: unknown): Promise<Candidate> {
    const validationResult = createCandidateSchema.safeParse(candidateData);

    if (!validationResult.success) {
      const firstError = validationResult.error.issues[0];
      throw new ValidationError(firstError.message, firstError.path.join('.'));
    }

    const validatedData = validationResult.data;

    const createDto: CreateCandidateDto = {
      name: validatedData.name,
      email: validatedData.email,
      phone: validatedData.phone,
      position: validatedData.position,
      status: validatedData.status,
      interviewStage: validatedData.interviewStage,
      applicationDate: validatedData.applicationDate
        ? typeof validatedData.applicationDate === 'string'
          ? new Date(validatedData.applicationDate)
          : validatedData.applicationDate
        : undefined,
      expectedSalary: validatedData.expectedSalary,
      yearsOfExperience: validatedData.yearsOfExperience,
      notes: validatedData.notes,
    };

    const createdCandidate = await this.candidateRepository.create(createDto);

    return createdCandidate;
  }

  async getCandidateById(id: string): Promise<Candidate> {
    const candidate = await this.candidateRepository.findById(id);

    if (!candidate) {
      throw new NotFoundError('Candidate', id);
    }

    return candidate;
  }

  async updateCandidate(id: string, updateData: unknown): Promise<Candidate> {
    const validationResult = updateCandidateSchema.safeParse(updateData);

    if (!validationResult.success) {
      const firstError = validationResult.error.issues[0];
      throw new ValidationError(firstError.message, firstError.path.join('.'));
    }

    const validatedData = validationResult.data;

    const updateDto: UpdateCandidateDto = {
      name: validatedData.name,
      email: validatedData.email,
      phone: validatedData.phone,
      position: validatedData.position,
      status: validatedData.status,
      interviewStage: validatedData.interviewStage,
      expectedSalary: validatedData.expectedSalary,
      yearsOfExperience: validatedData.yearsOfExperience,
      notes: validatedData.notes,
    };

    const updatedCandidate = await this.candidateRepository.update(id, updateDto);

    return updatedCandidate;
  }

  async listCandidates(options?: PaginationOptions): Promise<PaginatedResult<Candidate>> {
    return await this.candidateRepository.list(options);
  }
}

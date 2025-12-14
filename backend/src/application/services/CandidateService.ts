import { ICandidateRepository } from '../../infrastructure/database/repositories/ICandidateRepository';
import { Candidate, CreateCandidateDto } from '../../domain/entities/Candidate';
import { ValidationError, NotFoundError } from '../../shared/errors/CustomErrors';
import { createCandidateSchema } from '../../shared/validation/candidateSchemas';

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
}

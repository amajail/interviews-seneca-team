import { Candidate, CreateCandidateDto, UpdateCandidateDto } from '../../../domain/entities/Candidate';
import { ICandidateRepository } from './ICandidateRepository';

export class CandidateRepository implements ICandidateRepository {
  // TODO: Add TableClient dependency in BACK-001
  constructor() {}

  async findAll(): Promise<Candidate[]> {
    // TODO: Implement in BACK-001
    throw new Error('Not implemented');
  }

  async findById(_id: string): Promise<Candidate | null> {
    // TODO: Implement in BACK-001
    throw new Error('Not implemented');
  }

  async create(_candidate: CreateCandidateDto): Promise<Candidate> {
    // TODO: Implement in BACK-001
    throw new Error('Not implemented');
  }

  async update(_id: string, _candidate: UpdateCandidateDto): Promise<Candidate> {
    // TODO: Implement in BACK-001
    throw new Error('Not implemented');
  }

  async delete(_id: string): Promise<void> {
    // TODO: Implement in BACK-001
    throw new Error('Not implemented');
  }
}

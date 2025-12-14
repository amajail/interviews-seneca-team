import {
  Candidate,
  CreateCandidateDto,
  UpdateCandidateDto,
} from '../../../domain/entities/Candidate';

export interface ICandidateRepository {
  findAll(): Promise<Candidate[]>;
  findById(id: string): Promise<Candidate | null>;
  create(candidate: CreateCandidateDto): Promise<Candidate>;
  update(id: string, candidate: UpdateCandidateDto): Promise<Candidate>;
  delete(id: string): Promise<void>;
}

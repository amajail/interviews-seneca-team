import {
  Candidate,
  CreateCandidateDto,
  UpdateCandidateDto,
} from '../../../domain/entities/Candidate';
import { PaginationOptions, PaginatedResult } from '../../../domain/types/Pagination';

export interface ICandidateRepository {
  findAll(): Promise<Candidate[]>;
  list(options?: PaginationOptions): Promise<PaginatedResult<Candidate>>;
  findById(id: string): Promise<Candidate | null>;
  create(candidate: CreateCandidateDto): Promise<Candidate>;
  update(id: string, candidate: UpdateCandidateDto): Promise<Candidate>;
  delete(id: string): Promise<void>;
}

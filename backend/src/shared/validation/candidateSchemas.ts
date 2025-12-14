import { z } from 'zod';
import { CandidateStatus, InterviewStage } from '../../domain/entities/Candidate';

export const createCandidateSchema = z.object({
  name: z.string().min(1, 'Name is required').max(100, 'Name must be less than 100 characters'),
  email: z.string().email('Invalid email format'),
  phone: z.string().optional(),
  position: z.string().min(1, 'Position is required').max(100, 'Position must be less than 100 characters'),
  status: z.nativeEnum(CandidateStatus).optional(),
  interviewStage: z.nativeEnum(InterviewStage).optional(),
  applicationDate: z.string().datetime().optional().or(z.date().optional()),
  expectedSalary: z.number().positive('Expected salary must be positive').optional(),
  yearsOfExperience: z.number().min(0, 'Years of experience cannot be negative').optional(),
  notes: z.string().max(1000, 'Notes must be less than 1000 characters').optional()
});

export type CreateCandidateInput = z.infer<typeof createCandidateSchema>;

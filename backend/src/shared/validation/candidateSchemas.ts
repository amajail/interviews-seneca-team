import { z } from 'zod';
import { CandidateStatus, InterviewStage } from '../../domain/entities/Candidate';

export const createCandidateSchema = z.object({
  name: z.string().min(1, 'Name is required').max(100, 'Name must be less than 100 characters'),
  // eslint-disable-next-line @typescript-eslint/no-deprecated
  email: z.string().email('Invalid email format'),
  phone: z.string().optional(),
  position: z
    .string()
    .min(1, 'Position is required')
    .max(100, 'Position must be less than 100 characters'),
  // eslint-disable-next-line @typescript-eslint/no-deprecated
  status: z.nativeEnum(CandidateStatus).optional(),
  // eslint-disable-next-line @typescript-eslint/no-deprecated
  interviewStage: z.nativeEnum(InterviewStage).optional(),
  // eslint-disable-next-line @typescript-eslint/no-deprecated
  applicationDate: z.string().datetime().optional().or(z.date().optional()),
  expectedSalary: z.number().positive('Expected salary must be positive').optional(),
  yearsOfExperience: z.number().min(0, 'Years of experience cannot be negative').optional(),
  notes: z.string().max(1000, 'Notes must be less than 1000 characters').optional(),
});

export type CreateCandidateInput = z.infer<typeof createCandidateSchema>;

export const updateCandidateSchema = z.object({
  name: z
    .string()
    .min(1, 'Name cannot be empty')
    .max(100, 'Name must be less than 100 characters')
    .optional(),
  // eslint-disable-next-line @typescript-eslint/no-deprecated
  email: z.string().email('Invalid email format').optional(),
  phone: z.string().optional(),
  position: z
    .string()
    .min(1, 'Position cannot be empty')
    .max(100, 'Position must be less than 100 characters')
    .optional(),
  // eslint-disable-next-line @typescript-eslint/no-deprecated
  status: z.nativeEnum(CandidateStatus).optional(),
  // eslint-disable-next-line @typescript-eslint/no-deprecated
  interviewStage: z.nativeEnum(InterviewStage).optional(),
  expectedSalary: z.number().positive('Expected salary must be positive').optional(),
  yearsOfExperience: z.number().min(0, 'Years of experience cannot be negative').optional(),
  notes: z.string().max(1000, 'Notes must be less than 1000 characters').optional(),
});

export type UpdateCandidateInput = z.infer<typeof updateCandidateSchema>;

/**
 * Candidate Form Validation Schema
 * Uses Zod for type-safe form validation with react-hook-form
 */

import { z } from 'zod';

// Email validation regex
const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;

// Phone validation regex - allows digits, spaces, dashes, plus, parentheses
const phoneRegex = /^[\d\s\-+()]+$/;

export const candidateFormSchema = z.object({
  // Required fields
  fullName: z
    .string()
    .min(1, 'Full name is required')
    .max(100, 'Name must be less than 100 characters')
    .trim(),

  email: z
    .string()
    .min(1, 'Email is required')
    .regex(emailRegex, 'Invalid email format')
    .email('Invalid email format'),

  phone: z
    .string()
    .regex(phoneRegex, 'Invalid phone number format')
    .refine(
      (val) => val.replace(/\D/g, '').length >= 10,
      'Phone number must have at least 10 digits'
    )
    .optional()
    .or(z.literal('')),

  positionAppliedFor: z
    .string()
    .min(1, 'Position is required')
    .max(100, 'Position must be less than 100 characters')
    .trim(),

  applicationDate: z.string().min(1, 'Application date is required'),

  source: z
    .string()
    .min(1, 'Source is required')
    .max(100, 'Source must be less than 100 characters')
    .trim(),

  priority: z.enum(['low', 'medium', 'high', 'urgent']),

  // Optional fields
  currentStatus: z
    .enum(['new', 'screening', 'interviewing', 'offered', 'hired', 'rejected'])
    .optional(),

  interviewStage: z
    .enum([
      'initial_screening',
      'phone_interview',
      'technical_interview',
      'behavioral_interview',
      'final_interview',
    ])
    .optional(),

  resumeUrl: z.string().url('Invalid URL format').optional().or(z.literal('')),

  technicalSkillsRating: z
    .number()
    .min(1, 'Rating must be between 1 and 5')
    .max(5, 'Rating must be between 1 and 5')
    .optional(),

  interviewerNames: z.string().optional().or(z.literal('')),

  interviewNotes: z
    .string()
    .max(1000, 'Notes must be less than 1000 characters')
    .optional()
    .or(z.literal('')),

  nextFollowUpDate: z.string().optional().or(z.literal('')),

  expectedSalary: z.number().positive('Expected salary must be positive').optional(),

  yearsOfExperience: z
    .number()
    .min(0, 'Years of experience cannot be negative')
    .max(70, 'Years of experience seems too high')
    .optional(),
});

export type CandidateFormData = z.infer<typeof candidateFormSchema>;

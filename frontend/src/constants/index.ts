/**
 * Application Constants
 * Centralized configuration and constant values
 */

export const API_CONFIG = {
  BASE_URL: import.meta.env.VITE_API_BASE_URL || 'http://localhost:7071/api',
  TIMEOUT: 30000,
} as const;

export const ROUTES = {
  HOME: '/',
  CANDIDATES: '/candidates',
  CANDIDATE_DETAIL: '/candidates/:id',
  CANDIDATE_NEW: '/candidates/new',
  CANDIDATE_EDIT: '/candidates/:id/edit',
} as const;

export const CANDIDATE_STATUS = {
  NEW: 'new',
  SCREENING: 'screening',
  INTERVIEWING: 'interviewing',
  OFFERED: 'offered',
  HIRED: 'hired',
  REJECTED: 'rejected',
} as const;

export const INTERVIEW_STAGE = {
  INITIAL_SCREENING: 'initial_screening',
  PHONE_INTERVIEW: 'phone_interview',
  TECHNICAL_INTERVIEW: 'technical_interview',
  BEHAVIORAL_INTERVIEW: 'behavioral_interview',
  FINAL_INTERVIEW: 'final_interview',
} as const;

export const PAGINATION = {
  DEFAULT_PAGE_SIZE: 20,
  PAGE_SIZE_OPTIONS: [10, 20, 50, 100],
} as const;

export const VALIDATION = {
  MAX_NAME_LENGTH: 100,
  MAX_EMAIL_LENGTH: 255,
  MAX_PHONE_LENGTH: 20,
  MAX_NOTES_LENGTH: 5000,
} as const;

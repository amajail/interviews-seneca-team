/**
 * Backend Candidate Types
 * These types match the backend schema for API communication
 */

export const BackendCandidateStatus = {
  NEW: 'new',
  SCREENING: 'screening',
  INTERVIEWING: 'interviewing',
  OFFER: 'offer',
  HIRED: 'hired',
  REJECTED: 'rejected',
  WITHDRAWN: 'withdrawn',
} as const;

export type BackendCandidateStatus =
  (typeof BackendCandidateStatus)[keyof typeof BackendCandidateStatus];

export const BackendInterviewStage = {
  NOT_STARTED: 'not_started',
  PHONE_SCREEN: 'phone_screen',
  TECHNICAL: 'technical',
  BEHAVIORAL: 'behavioral',
  FINAL: 'final',
  COMPLETED: 'completed',
} as const;

export type BackendInterviewStage =
  (typeof BackendInterviewStage)[keyof typeof BackendInterviewStage];

export interface BackendCreateCandidateDto {
  name: string;
  email: string;
  phone?: string;
  position: string;
  status?: BackendCandidateStatus;
  interviewStage?: BackendInterviewStage;
  applicationDate?: string;
  expectedSalary?: number;
  yearsOfExperience?: number;
  notes?: string;
}

export interface BackendCandidate {
  id: string;
  partitionKey: string;
  rowKey: string;
  timestamp?: string;
  eTag?: string;
  name: string;
  email: string;
  phone?: string;
  position: string;
  status: BackendCandidateStatus;
  interviewStage: BackendInterviewStage;
  applicationDate: string;
  expectedSalary?: number;
  yearsOfExperience?: number;
  notes?: string;
  createdAt: string;
  updatedAt: string;
  createdBy?: string;
  updatedBy?: string;
}

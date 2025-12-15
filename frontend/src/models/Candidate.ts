/**
 * Candidate Domain Model
 * Represents an interview candidate entity
 */

export interface Candidate {
  id: string;
  eTag?: string;
  timestamp?: string;
  fullName: string;
  email: string;
  phone: string;
  positionAppliedFor: string;
  applicationDate: string;
  currentStatus: CandidateStatus;
  interviewStage: InterviewStage;
  source: string;
  priority: CandidatePriority;
  resumeUrl?: string;
  technicalSkillsRating?: number;
  interviewerNames: string[];
  interviewNotes?: string;
  nextFollowUpDate?: string;
  expectedSalary?: number;
  yearsOfExperience?: number;
  decisionStatus?: string;
  offerDetails?: string;
  createdAt: string;
  updatedAt: string;
  createdBy?: string;
  updatedBy?: string;
}

export type CandidateStatus =
  | 'new'
  | 'screening'
  | 'interviewing'
  | 'offered'
  | 'hired'
  | 'rejected';

export type InterviewStage =
  | 'initial_screening'
  | 'phone_interview'
  | 'technical_interview'
  | 'behavioral_interview'
  | 'final_interview';

export type CandidatePriority = 'low' | 'medium' | 'high' | 'urgent';

export interface CreateCandidateDto {
  fullName: string;
  email: string;
  phone: string;
  positionAppliedFor: string;
  applicationDate: string;
  currentStatus: CandidateStatus;
  interviewStage: InterviewStage;
  source: string;
  priority: CandidatePriority;
  resumeUrl?: string;
  technicalSkillsRating?: number;
  interviewerNames?: string[];
  interviewNotes?: string;
  nextFollowUpDate?: string;
  expectedSalary?: number;
  yearsOfExperience?: number;
}

export type UpdateCandidateDto = Partial<CreateCandidateDto>;

export interface CandidateFilters {
  search?: string;
  status?: CandidateStatus;
  stage?: InterviewStage;
  position?: string;
  priority?: CandidatePriority;
  dateFrom?: string;
  dateTo?: string;
}

export interface Candidate {
  id: string;
  partitionKey: string;
  rowKey: string;
  timestamp?: Date;
  eTag?: string;

  name: string;
  email: string;
  phone?: string;
  position: string;
  status: CandidateStatus;
  interviewStage: InterviewStage;
  applicationDate: Date;
  expectedSalary?: number;
  yearsOfExperience?: number;
  notes?: string;

  createdAt: Date;
  updatedAt: Date;
  createdBy?: string;
  updatedBy?: string;
}

export enum CandidateStatus {
  NEW = 'new',
  SCREENING = 'screening',
  INTERVIEWING = 'interviewing',
  OFFER = 'offer',
  HIRED = 'hired',
  REJECTED = 'rejected',
  WITHDRAWN = 'withdrawn',
}

export enum InterviewStage {
  NOT_STARTED = 'not_started',
  PHONE_SCREEN = 'phone_screen',
  TECHNICAL = 'technical',
  BEHAVIORAL = 'behavioral',
  FINAL = 'final',
  COMPLETED = 'completed',
}

export interface CreateCandidateDto {
  name: string;
  email: string;
  phone?: string;
  position: string;
  status?: CandidateStatus;
  interviewStage?: InterviewStage;
  applicationDate?: Date;
  expectedSalary?: number;
  yearsOfExperience?: number;
  notes?: string;
}

export interface UpdateCandidateDto {
  name?: string;
  email?: string;
  phone?: string;
  position?: string;
  status?: CandidateStatus;
  interviewStage?: InterviewStage;
  expectedSalary?: number;
  yearsOfExperience?: number;
  notes?: string;
}
